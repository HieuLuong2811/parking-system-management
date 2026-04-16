import os
import cv2
import numpy as np
import pytesseract

from pathlib import Path
from ultralytics import YOLO


MODEL_ENV = "DETECT_MODEL_PATH"
DEFAULT_MODEL = (
    Path(__file__).resolve().parents[1]
    / "models"
    / "runs"
    / "detect"
    / "plate_detector_V2"
    / "weights"
    / "best.pt"
)

model_path = Path(os.getenv(MODEL_ENV, str(DEFAULT_MODEL)))
_model = None


def get_model():
    global _model

    if _model is None:
        if not model_path.exists():
            raise FileNotFoundError(f"Không tìm thấy model tại: {model_path}")

        _model = YOLO(str(model_path))

    return _model


class DetectService:
    @staticmethod
    def segment_image(plate_img) -> str:
        gray = cv2.cvtColor(plate_img, cv2.COLOR_BGR2GRAY)
        gray = cv2.bilateralFilter(gray, 11, 17, 17)
        _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

        text = pytesseract.image_to_string(
            thresh,
            lang="eng",
            config="--psm 7 -c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
        )
        return "".join(ch for ch in text if ch.isalnum())

    @staticmethod
    def detect_from_image_bytes(image_bytes: bytes):
        model = get_model()

        image = np.frombuffer(image_bytes, np.uint8)
        frame = cv2.imdecode(image, cv2.IMREAD_COLOR)

        if frame is None:
            raise ValueError("Không đọc được ảnh đầu vào")

        results = model(frame, conf=0.4)
        annotated = frame.copy()
        plates = []

        if len(results) > 0:
            boxes = results[0].boxes
            if boxes is not None and len(boxes) > 0:
                for box in boxes:
                    x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())

                    x1 = max(0, x1)
                    y1 = max(0, y1)
                    x2 = min(frame.shape[1], x2)
                    y2 = min(frame.shape[0], y2)

                    plate_crop = frame[y1:y2, x1:x2]
                    if plate_crop.size == 0:
                        continue

                    plate_text = DetectService.segment_image(plate_crop)

                    cv2.rectangle(annotated, (x1, y1), (x2, y2), (0, 255, 0), 2)

                    label = plate_text if plate_text else "plate"
                    cv2.putText(
                        annotated,
                        label,
                        (x1, max(20, y1 - 10)),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        0.8,
                        (0, 255, 0),
                        2
                    )

                    plates.append({
                        "text": plate_text,
                        "bbox": [x1, y1, x2, y2]
                    })

        ok, buffer = cv2.imencode(".jpg", annotated)
        if not ok:
            raise ValueError("Không encode được ảnh kết quả")

        return {
            "plates": plates,
            "message": "success"
        }

    @staticmethod
    def generate_stream(camera_index: int = 0):
        model = get_model()
        cap = cv2.VideoCapture(camera_index)

        if not cap.isOpened():
            raise RuntimeError("Không mở được webcam")

        while True:
            success, frame = cap.read()
            if not success:
                break

            results = model(frame, conf=0.4)
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

                        plate_crop = frame[y1:y2, x1:x2]
                        if plate_crop.size == 0:
                            continue

                        plate_text = DetectService.segment_image(plate_crop)

                        cv2.rectangle(annotated, (x1, y1), (x2, y2), (0, 255, 0), 2)
                        cv2.putText(
                            annotated,
                            plate_text if plate_text else "plate",
                            (x1, max(20, y1 - 10)),
                            cv2.FONT_HERSHEY_SIMPLEX,
                            0.8,
                            (0, 255, 0),
                            2
                        )

            ret, buffer = cv2.imencode(".jpg", annotated)
            if not ret:
                continue

            frame_bytes = buffer.tobytes()

            yield (
                b"--frame\r\n"
                b"Content-Type: image/jpeg\r\n\r\n" + frame_bytes + b"\r\n"
            )

        cap.release()