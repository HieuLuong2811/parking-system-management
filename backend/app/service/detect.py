import os
import re
import time
from pathlib import Path
from collections import Counter, deque

import cv2
import numpy as np
from ultralytics import YOLO


# =========================
# MODEL CONFIG
# =========================

PLATE_MODEL_ENV = "DETECT_MODEL_PATH"
CHAR_MODEL_ENV = "CHAR_MODEL_PATH"

DEFAULT_PLATE_MODEL = (
    Path(__file__).resolve().parents[1]
    / "models"
    / "runs"
    / "detect"
    / "plate_detector_V2"
    / "weights"
    / "best.pt"
)

DEFAULT_CHAR_MODEL = (
    Path(__file__).resolve().parents[1]
    / "models"
    / "runs"
    / "detect"
    / "plate_char_detector"
    / "weights"
    / "Charcter-LP.pt"
)

plate_model_path = Path(os.getenv(PLATE_MODEL_ENV, str(DEFAULT_PLATE_MODEL)))
char_model_path = Path(os.getenv(CHAR_MODEL_ENV, str(DEFAULT_CHAR_MODEL)))

_plate_model = None
_char_model = None


# =========================
# RUNTIME CONFIG
# =========================

def _debug_detect_enabled() -> bool:
    return os.getenv("DEBUG_DETECT", "").strip().lower() in {"1", "true", "yes", "on"}


def _debug_detect_dir() -> Path:
    # Always write under backend/debug_detect (independent of current working directory)
    # detect.py lives at backend/app/service/detect.py -> parents[2] == backend/
    return Path(__file__).resolve().parents[2] / "debug_detect"

PLATE_YOLO_CONF = 0.25

# Model pretrained này nên để thấp một chút để tránh mất ký tự như A/C/K
CHAR_YOLO_CONF = 0.15
CHAR_YOLO_IOU = 0.30
CHAR_IMAGE_SIZE = 640

# Realtime: không đọc ký tự mọi frame
READ_CHARS_EVERY_N_FRAMES = 8

# Cần đọc trùng vài lần mới chốt biển để tránh nhảy kết quả
STABLE_HISTORY_SIZE = 5
STABLE_MIN_COUNT = 2


# =========================
# PLATE REGEX
# =========================

PLATE_CLEAN_REGEX = re.compile(r"[^A-Z0-9]")

# 37A55555, 47A06546, 51F68784
PLATE_REGEX_CIVIL_8 = re.compile(r"^[0-9]{2}[A-Z][0-9]{5}$")

# 51AB12345 hoặc 61C106403
PLATE_REGEX_CIVIL_9 = re.compile(r"^[0-9]{2}[A-Z][0-9A-Z][0-9]{5}$")

# 590248758
PLATE_REGEX_NUMERIC_9 = re.compile(r"^[0-9]{9}$")

# KV-59-24 -> KV5924
PLATE_REGEX_MILITARY_6 = re.compile(r"^[A-Z]{2}[0-9]{4}$")

VALID_PROVINCE_CODES = {
    "11", "12", "14", "15", "16", "17", "18", "19",
    "20", "21", "22", "23", "24", "25", "26", "27",
    "28", "29", "30", "31", "32", "33", "34", "35",
    "36", "37", "38", "39", "40", "41", "43", "47",
    "48", "49", "50", "51", "52", "53", "54", "55",
    "56", "57", "58", "59", "60", "61", "62", "63",
    "64", "65", "66", "67", "68", "69", "70", "71",
    "72", "73", "74", "75", "76", "77", "78", "79",
    "80", "81", "82", "83", "84", "85", "86", "88",
    "89", "90", "92", "93", "94", "95", "97", "98",
    "99",
}


# =========================
# BASIC UTILS
# =========================

def normalize_plate_text(text: str) -> str:
    if not text:
        return ""

    return PLATE_CLEAN_REGEX.sub("", text.upper())


def is_valid_plate(text: str) -> bool:
    text = normalize_plate_text(text)

    if not text:
        return False

    # Biển quân sự: KV5924
    if len(text) == 6 and PLATE_REGEX_MILITARY_6.match(text):
        return True

    # Biển dân sự
    if len(text) not in {8, 9}:
        return False

    if text[:2] not in VALID_PROVINCE_CODES:
        return False

    if PLATE_REGEX_CIVIL_8.match(text):
        return True

    if PLATE_REGEX_CIVIL_9.match(text):
        return True

    if PLATE_REGEX_NUMERIC_9.match(text):
        return True

    return False


def extract_valid_plates(text: str) -> list[str]:
    text = normalize_plate_text(text)

    results = []

    if is_valid_plate(text):
        results.append(text)

    for size in [6, 8, 9]:
        if len(text) < size:
            continue

        for start in range(0, len(text) - size + 1):
            sub = text[start:start + size]

            if is_valid_plate(sub):
                results.append(sub)

    return list(dict.fromkeys(results))


def sort_valid_plates(plates: list[str]) -> list[str]:
    def score(plate: str):
        # Prefer 9-char civil plates (e.g. 12B116888) over 8-char (e.g. 37A55555)
        # because many VN motorbike plates include a 2-char series (B1/C1/...) and OCR
        # commonly drops/confuses that character.
        if PLATE_REGEX_CIVIL_9.match(plate):
            format_score = 4
        elif PLATE_REGEX_CIVIL_8.match(plate):
            format_score = 3
        elif PLATE_REGEX_NUMERIC_9.match(plate):
            format_score = 2
        elif PLATE_REGEX_MILITARY_6.match(plate):
            format_score = 1
        else:
            format_score = 0

        return format_score, -len(plate)

    return sorted(plates, key=score, reverse=True)


def save_debug_image(prefix: str, img) -> str | None:
    if not _debug_detect_enabled():
        return None

    if img is None or img.size == 0:
        return None

    debug_dir = _debug_detect_dir()
    debug_dir.mkdir(parents=True, exist_ok=True)

    path = debug_dir / f"{prefix}_{int(time.time() * 1000)}.jpg"
    ok = cv2.imwrite(str(path), img)
    if not ok:
        return None

    return str(path)


def _to_bgr(img):
    if img is None:
        return None
    if len(img.shape) == 2:
        return cv2.cvtColor(img, cv2.COLOR_GRAY2BGR)
    return img


def save_debug_gray(prefix: str, img) -> str | None:
    if not _debug_detect_enabled():
        return None
    if img is None or img.size == 0:
        return None
    try:
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY) if len(img.shape) == 3 else img
    except Exception:
        return None
    return save_debug_image(prefix, _to_bgr(gray))


def get_plate_model():
    global _plate_model

    if _plate_model is None:
        if not plate_model_path.exists():
            raise FileNotFoundError(f"Không tìm thấy model biển số tại: {plate_model_path}")

        _plate_model = YOLO(str(plate_model_path))

    return _plate_model


def get_char_model():
    global _char_model

    if _char_model is None:
        if not char_model_path.exists():
            raise FileNotFoundError(f"Không tìm thấy model ký tự tại: {char_model_path}")

        _char_model = YOLO(str(char_model_path))

    return _char_model


def crop_with_padding(frame, x1, y1, x2, y2, pad_ratio=0.06):
    frame_h, frame_w = frame.shape[:2]

    box_w = x2 - x1
    box_h = y2 - y1

    pad_x = int(box_w * pad_ratio)
    pad_y = int(box_h * pad_ratio * 0.80)

    x1 = max(0, x1 - pad_x)
    y1 = max(0, y1 - pad_y)
    x2 = min(frame_w, x2 + pad_x)
    y2 = min(frame_h, y2 + pad_y)

    crop = frame[y1:y2, x1:x2]

    if crop is None or crop.size == 0:
        return crop

    crop_h, crop_w = crop.shape[:2]

    if crop_w < 320:
        scale = 320 / max(crop_w, 1)
        crop = cv2.resize(
            crop,
            None,
            fx=scale,
            fy=scale,
            interpolation=cv2.INTER_CUBIC,
        )

    return crop


def box_iou(a, b) -> float:
    ax1, ay1, ax2, ay2 = a
    bx1, by1, bx2, by2 = b

    inter_x1 = max(ax1, bx1)
    inter_y1 = max(ay1, by1)
    inter_x2 = min(ax2, bx2)
    inter_y2 = min(ay2, by2)

    inter_w = max(0, inter_x2 - inter_x1)
    inter_h = max(0, inter_y2 - inter_y1)

    inter_area = inter_w * inter_h

    area_a = max(0, ax2 - ax1) * max(0, ay2 - ay1)
    area_b = max(0, bx2 - bx1) * max(0, by2 - by1)

    union = area_a + area_b - inter_area

    if union <= 0:
        return 0.0

    return inter_area / union


def remove_duplicate_char_boxes(items: list[dict], iou_threshold=0.45) -> list[dict]:
    if not items:
        return []

    items = sorted(items, key=lambda item: item["conf"], reverse=True)

    kept = []

    for item in items:
        duplicated = False

        for old in kept:
            if box_iou(item["bbox"], old["bbox"]) > iou_threshold:
                duplicated = True
                break

        if not duplicated:
            kept.append(item)

    return kept


def group_chars_by_line(items: list[dict]) -> list[list[dict]]:
    if not items:
        return []

    if len(items) <= 4:
        return [sorted(items, key=lambda item: item["cx"])]

    ys = np.array([item["cy"] for item in items], dtype=np.float32)
    hs = np.array([item["h"] for item in items], dtype=np.float32)

    min_y = float(np.min(ys))
    max_y = float(np.max(ys))
    median_h = float(np.median(hs))

    # Một dòng
    if max_y - min_y < median_h * 0.75:
        return [sorted(items, key=lambda item: item["cx"])]

    # Hai dòng
    mid_y = (min_y + max_y) / 2

    upper = [item for item in items if item["cy"] <= mid_y]
    lower = [item for item in items if item["cy"] > mid_y]

    lines = []

    if upper:
        lines.append(sorted(upper, key=lambda item: item["cx"]))

    if lower:
        lines.append(sorted(lower, key=lambda item: item["cx"]))

    return lines


def read_text_from_char_items(char_items: list[dict]) -> str:
    char_items = remove_duplicate_char_boxes(char_items)

    if not char_items:
        return ""

    debug_enabled = os.getenv("DEBUG_PLATE_OCR", "").strip().lower() in {"1", "true", "yes", "on"}

    lines = group_chars_by_line(char_items)

    raw_text = ""

    for line in lines:
        raw_text += "".join(item["char"] for item in line)

    raw_text = normalize_plate_text(raw_text)

    valid = extract_valid_plates(raw_text)

    if debug_enabled:
        print(f"[plate-ocr] raw_text={raw_text!r} valid_initial={valid}")

    if not valid:
        # Heuristic autocorrect for common OCR confusions on Vietnamese plates.
        # Aim: recover a valid plate from noisy reads like "12B116BBR".
        def _to_digit(ch: str) -> str:
            return {
                "O": "0",
                "D": "0",
                "Q": "0",
                "I": "1",
                "L": "1",
                "Z": "2",
                "S": "5",
                "G": "6",
                "B": "8",
                "R": "8",
            }.get(ch, ch)

        def _to_letter(ch: str) -> str:
            return {
                "0": "O",
                "1": "I",
                "2": "Z",
                "5": "S",
                "6": "G",
                "8": "B",
            }.get(ch, ch)

        def _try_patterns(sub: str) -> list[str]:
            # Try to coerce to known formats (6/8/9) then validate.
            candidates: list[str] = []

            if len(sub) == 6:
                # Military: AA9999
                coerced = "".join(_to_letter(c) if i < 2 else _to_digit(c) for i, c in enumerate(sub))
                if is_valid_plate(coerced):
                    candidates.append(coerced)

            if len(sub) == 8:
                # Civil 8: NN L NNNNN
                coerced = (
                    _to_digit(sub[0])
                    + _to_digit(sub[1])
                    + _to_letter(sub[2])
                    + "".join(_to_digit(c) for c in sub[3:])
                )
                if is_valid_plate(coerced):
                    candidates.append(coerced)

            if len(sub) == 9:
                # Civil 9: NN L (N|L) NNNNN  OR numeric 9
                coerced_numeric = "".join(_to_digit(c) for c in sub)
                if is_valid_plate(coerced_numeric):
                    candidates.append(coerced_numeric)

                coerced_civil = (
                    _to_digit(sub[0])
                    + _to_digit(sub[1])
                    + _to_letter(sub[2])
                    + sub[3]  # may be letter or digit
                    + "".join(_to_digit(c) for c in sub[4:])
                )
                if is_valid_plate(coerced_civil):
                    candidates.append(coerced_civil)

                # Also try coercing the 4th char to letter (some models confuse)
                coerced_civil2 = (
                    _to_digit(sub[0])
                    + _to_digit(sub[1])
                    + _to_letter(sub[2])
                    + _to_letter(sub[3])
                    + "".join(_to_digit(c) for c in sub[4:])
                )
                if is_valid_plate(coerced_civil2):
                    candidates.append(coerced_civil2)

            return list(dict.fromkeys(candidates))

        corrected: list[str] = []
        for size in [6, 8, 9]:
            if len(raw_text) < size:
                continue
            for start in range(0, len(raw_text) - size + 1):
                corrected.extend(_try_patterns(raw_text[start : start + size]))

        if corrected:
            valid = sort_valid_plates(list(dict.fromkeys(corrected)))
            if debug_enabled:
                print(f"[plate-ocr] corrected_candidates={valid}")

    if not valid:
        if debug_enabled:
            print("[plate-ocr] final=EMPTY (no valid plate after filtering)")
        return ""

    valid = sort_valid_plates(valid)

    if debug_enabled:
        print(f"[plate-ocr] final={valid[0]!r} ranked={valid}")

    return valid[0]


# =========================
# SERVICE
# =========================

class DetectService:
    @staticmethod
    def read_plate_text(plate_img) -> str:
        if plate_img is None or plate_img.size == 0:
            return ""

        save_debug_gray("plate_gray", plate_img)

        char_model = get_char_model()

        results = char_model(
            plate_img,
            conf=CHAR_YOLO_CONF,
            iou=CHAR_YOLO_IOU,
            imgsz=CHAR_IMAGE_SIZE,
            verbose=False,
        )

        if len(results) == 0:
            return ""

        boxes = results[0].boxes

        if boxes is None or len(boxes) == 0:
            return ""

        names = results[0].names
        img_h, img_w = plate_img.shape[:2]

        char_items = []
        char_annotated = plate_img.copy()

        for box in boxes:
            x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())

            x1 = max(0, x1)
            y1 = max(0, y1)
            x2 = min(img_w, x2)
            y2 = min(img_h, y2)

            if x2 <= x1 or y2 <= y1:
                continue

            conf = float(box.conf[0]) if box.conf is not None else 0.0
            cls_id = int(box.cls[0]) if box.cls is not None else -1

            label = str(names.get(cls_id, ""))
            label = normalize_plate_text(label)

            if len(label) != 1:
                continue

            w = x2 - x1
            h = y2 - y1

            # Lọc nhiễu nhẹ
            if h < img_h * 0.12:
                continue

            if w < img_w * 0.005:
                continue

            cv2.rectangle(char_annotated, (x1, y1), (x2, y2), (0, 255, 0), 2)
            if label:
                cv2.putText(
                    char_annotated,
                    label,
                    (x1, max(18, y1 - 6)),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.7,
                    (0, 255, 0),
                    2,
                )

            char_items.append(
                {
                    "char": label,
                    "conf": conf,
                    "bbox": [x1, y1, x2, y2],
                    "x": x1,
                    "y": y1,
                    "w": w,
                    "h": h,
                    "cx": x1 + w / 2,
                    "cy": y1 + h / 2,
                }
            )

        raw_text_debug = ""

        for line in group_chars_by_line(remove_duplicate_char_boxes(char_items)):
            raw_text_debug += "".join(item["char"] for item in line)

        plate_text = read_text_from_char_items(char_items)

        save_debug_image("char_annotated", char_annotated)

        if os.getenv("DEBUG_PLATE_OCR", "").strip().lower() in {"1", "true", "yes", "on"}:
            print("char_raw:", raw_text_debug)
            print("plate_text:", plate_text)

        return plate_text

    @staticmethod
    def detect_from_image_bytes(image_bytes: bytes):
        plate_model = get_plate_model()

        image = np.frombuffer(image_bytes, np.uint8)
        frame = cv2.imdecode(image, cv2.IMREAD_COLOR)

        save_debug_image("frame_input", frame)

        if frame is None:
            raise ValueError("Không đọc được ảnh đầu vào")

        original_h, original_w = frame.shape[:2]

        if original_w < 500 or original_w > 1000:
            scale = 700 / max(original_w, 1)

            frame = cv2.resize(
                frame,
                None,
                fx=scale,
                fy=scale,
                interpolation=cv2.INTER_CUBIC,
            )

            print(f"Resized input from {original_w}x{original_h} → 700px width")

        save_debug_image("frame_resized", frame)

        results = plate_model(
            frame,
            conf=PLATE_YOLO_CONF,
            verbose=False,
        )

        plates = []
        annotated = frame.copy()

        if len(results) > 0:
            boxes = results[0].boxes

            if boxes is not None and len(boxes) > 0:
                for box in boxes:
                    x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())

                    x1 = max(0, x1)
                    y1 = max(0, y1)
                    x2 = min(frame.shape[1], x2)
                    y2 = min(frame.shape[0], y2)

                    if x2 <= x1 or y2 <= y1:
                        continue

                    conf = float(box.conf[0]) if box.conf is not None else 0.0

                    plate_crop = crop_with_padding(frame, x1, y1, x2, y2)

                    if plate_crop is None or plate_crop.size == 0:
                        continue

                    debug_path = save_debug_image("crop_plate", plate_crop)

                    if debug_path:
                        print("debug_plate_crop:", debug_path)
                        print("plate_crop_shape:", plate_crop.shape)

                    plate_text = DetectService.read_plate_text(plate_crop)
                    plate_text = str(plate_text or "")

                    plates.append(
                        {
                            "text": plate_text,
                            "bbox": [x1, y1, x2, y2],
                            "conf": conf,
                        }
                    )

                    cv2.rectangle(
                        annotated,
                        (x1, y1),
                        (x2, y2),
                        (0, 255, 0),
                        2,
                    )

                    label = plate_text if plate_text else f"plate {conf:.2f}"

                    cv2.putText(
                        annotated,
                        label,
                        (x1, max(20, y1 - 10)),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        0.8,
                        (0, 255, 0),
                        2,
                    )

        valid_plates = [
            item for item in plates
            if item.get("text") and is_valid_plate(str(item.get("text")))
        ]

        valid_plates.sort(
            key=lambda item: (
                item.get("conf") or 0,
                1 if PLATE_REGEX_CIVIL_8.match(str(item.get("text") or "")) else 0,
            ),
            reverse=True,
        )

        best_plate = valid_plates[0]["text"] if valid_plates else None

        save_debug_image("frame_annotated", annotated)

        return {
            "plate": best_plate,
            "plates": plates,
            "raw_detected_count": len(plates),
            "valid_detected_count": len(valid_plates),
            "message": "success" if best_plate else "detected_plate_but_char_failed",
        }

    @staticmethod
    def generate_stream(camera_index: int = 0):
        plate_model = get_plate_model()

        cap = cv2.VideoCapture(camera_index)

        if not cap.isOpened():
            raise RuntimeError("Không mở được webcam")

        frame_index = 0
        last_bbox = None
        last_plate_text = ""

        stable_history = deque(maxlen=STABLE_HISTORY_SIZE)

        while True:
            success, frame = cap.read()

            if not success:
                break

            frame_index += 1
            annotated = frame.copy()

            should_read_chars = frame_index % READ_CHARS_EVERY_N_FRAMES == 0

            results = plate_model(
                frame,
                conf=PLATE_YOLO_CONF,
                verbose=False,
            )

            if len(results) > 0:
                boxes = results[0].boxes

                if boxes is not None and len(boxes) > 0:
                    best_box = max(
                        boxes,
                        key=lambda b: float(b.conf[0]) if b.conf is not None else 0.0,
                    )

                    x1, y1, x2, y2 = map(int, best_box.xyxy[0].tolist())

                    x1 = max(0, x1)
                    y1 = max(0, y1)
                    x2 = min(frame.shape[1], x2)
                    y2 = min(frame.shape[0], y2)

                    if x2 > x1 and y2 > y1:
                        last_bbox = [x1, y1, x2, y2]

                        if should_read_chars:
                            plate_crop = crop_with_padding(frame, x1, y1, x2, y2)

                            plate_text = DetectService.read_plate_text(plate_crop)
                            plate_text = str(plate_text or "")

                            if plate_text:
                                stable_history.append(plate_text)

                                counter = Counter(stable_history)
                                most_common_plate, count = counter.most_common(1)[0]

                                if count >= STABLE_MIN_COUNT:
                                    last_plate_text = most_common_plate

            if last_bbox:
                x1, y1, x2, y2 = last_bbox

                cv2.rectangle(
                    annotated,
                    (x1, y1),
                    (x2, y2),
                    (0, 255, 0),
                    2,
                )

                label = last_plate_text if last_plate_text else "plate"

                cv2.putText(
                    annotated,
                    label,
                    (x1, max(20, y1 - 10)),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.8,
                    (0, 255, 0),
                    2,
                )

            ret, buffer = cv2.imencode(".jpg", annotated)

            if not ret:
                continue

            frame_bytes = buffer.tobytes()

            yield (
                b"--frame\r\n"
                b"Content-Type: image/jpeg\r\n\r\n"
                + frame_bytes
                + b"\r\n"
            )

        cap.release()
