import os
import sys
import cv2
import time
import requests
import re
from datetime import datetime
from PyQt6 import QtCore, QtGui, QtWidgets, uic

from app.service.detect import PLATE_REGEX_CIVIL_8, PLATE_REGEX_CIVIL_9, PLATE_REGEX_MILITARY_6, PLATE_REGEX_NUMERIC_9, STABLE_HISTORY_SIZE, DetectService, get_plate_model
from app.core.config import settings
from collections import Counter, deque

DETECT_EVERY_N_FRAMES = 5
PLATE_CONFIRM_MIN_COUNT = 2
PLATE_DETECT_TIMEOUT_SECONDS = 4.0

def normalize_plate_text(text: str) -> str:
    if not text:
        return ""
    return re.sub(r"[^A-Z0-9]", "", text.strip().upper())

def is_valid_plate(text: str) -> bool:
    text = normalize_plate_text(text)

    if not text:
        return False

    if PLATE_REGEX_MILITARY_6.match(text):
        return True

    if PLATE_REGEX_CIVIL_8.match(text):
        return True

    if PLATE_REGEX_CIVIL_9.match(text):
        return True

    if PLATE_REGEX_NUMERIC_9.match(text):
        return True

    return False

def enhance_plate_roi(roi):
    if roi is None or roi.size == 0:
        return roi

    lab = cv2.cvtColor(roi, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)

    clahe = cv2.createCLAHE(
        clipLimit=2.0,
        tileGridSize=(8, 8)
    )

    l = clahe.apply(l)
    enhanced = cv2.merge((l, a, b))
    enhanced = cv2.cvtColor(enhanced, cv2.COLOR_LAB2BGR)

    return enhanced

class CameraWorker(QtCore.QThread):
    frame_ready = QtCore.pyqtSignal(QtGui.QImage)
    detection_ready = QtCore.pyqtSignal(str)
    status_changed = QtCore.pyqtSignal(str)
    error_occurred = QtCore.pyqtSignal(str)

    def __init__(self, camera_source=0, parent=None):
        super().__init__(parent)
        self.camera_source = camera_source
        self._running = False
        self._last_plate = None
        self._last_emit_time = 0
        self._plate_buffer = deque(maxlen=STABLE_HISTORY_SIZE)
        self._detection_enabled = False
        self._detect_started_at = 0
        self._latest_plate_crop = None

    def _build_capture(self):
        if isinstance(self.camera_source, str) and self.camera_source.startswith("rtsp://"):
            os.environ["OPENCV_FFMPEG_CAPTURE_OPTIONS"] = "rtsp_transport;tcp|max_delay;0"
            cap = cv2.VideoCapture(self.camera_source, cv2.CAP_FFMPEG)
        else:
            # Webcam local, nhất là Windows, dùng CAP_DSHOW thường mở nhanh và ổn hơn.
            cap = cv2.VideoCapture(self.camera_source, cv2.CAP_DSHOW)

        cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
        cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)

        try:
            # Để webcam tự cân sáng trước, tránh bị đen hình
            cap.set(cv2.CAP_PROP_AUTO_EXPOSURE, 0.75)

            # Không ép exposure quá thấp vì dễ làm camera đen
            # cap.set(cv2.CAP_PROP_EXPOSURE, -6)

            # Không ép gain = 0 vì nhiều webcam sẽ tối hẳn
            # cap.set(cv2.CAP_PROP_GAIN, 0)

            cap.set(cv2.CAP_PROP_BRIGHTNESS, 128)
            cap.set(cv2.CAP_PROP_CONTRAST, 32)

            # Autofocus có thể giữ auto trước cho dễ bắt nét
            cap.set(cv2.CAP_PROP_AUTOFOCUS, 1)
        except Exception:
            pass

        return cap
    
    def set_detection_enabled(self, enabled: bool) -> None:
        self._detection_enabled = enabled

        if enabled:
            self._latest_plate_crop = None
            self._detect_started_at = time.time()
            self._last_plate = None
            self._last_emit_time = 0
            self._plate_buffer.clear()
        else:
            self._detect_started_at = 0
            self._last_plate = None
            self._last_emit_time = 0
            self._plate_buffer.clear()

    def run(self):
        self._running = True

        try:
            self.status_changed.emit("Loading model...")
            model = get_plate_model()
        except Exception as e:
            self.error_occurred.emit(str(e))
            return

        cap = self._build_capture()
        if not cap.isOpened():
            self.error_occurred.emit("Không mở được camera")
            return

        self.status_changed.emit("Camera connected")

        frame_count = 0

        while self._running:
            try:
                # drop frame cũ
                for _ in range(2):
                    cap.grab()

                ret, frame = cap.retrieve()
                if not ret or frame is None:
                    QtCore.QThread.msleep(30)
                    continue

                frame_count += 1
                output = frame.copy()

                h, w = frame.shape[:2]
                x1, y1 = int(w * 0.08), int(h * 0.14)
                x2, y2 = int(w * 0.92), int(h * 0.90)

                roi = frame[y1:y2, x1:x2]
                detect_roi = enhance_plate_roi(roi)

                # vẽ ROI
                cv2.rectangle(output, (x1, y1), (x2, y2), (0, 255, 255), 2)

                plate_text = ""

                if self._detection_enabled and frame_count % DETECT_EVERY_N_FRAMES == 0:
                    try:
                        results = model(detect_roi, conf=0.25, verbose=False)
                        boxes = results[0].boxes if results else None

                        best_crop = None
                        best_conf = -1.0

                        if boxes is not None and len(boxes) > 0:
                            for box in boxes:
                                bx1, by1, bx2, by2 = map(int, box.xyxy[0].tolist())
                                bx1 = max(0, bx1)
                                by1 = max(0, by1)
                                bx2 = min(roi.shape[1], bx2)
                                by2 = min(roi.shape[0], by2)
                                if bx2 <= bx1 or by2 <= by1:
                                    continue

                                conf = float(getattr(box, "conf", [0.0])[0] if hasattr(box, "conf") else 0.0)
                                if conf > best_conf:
                                    best_conf = conf
                                    best_crop = detect_roi[by1:by2, bx1:bx2]

                                cv2.rectangle(
                                    output,
                                    (x1 + bx1, y1 + by1),
                                    (x1 + bx2, y1 + by2),
                                    (0, 255, 0),
                                    2,
                                )

                        if best_crop is not None and best_crop.size > 0:
                            self._latest_plate_crop = best_crop.copy()
                            plate_candidate_raw = DetectService.read_plate_text(best_crop)

                            plate_candidate = normalize_plate_text(plate_candidate_raw)

                            if is_valid_plate(plate_candidate):
                                self._plate_buffer.append(plate_candidate)

                                most_common, count = Counter(self._plate_buffer).most_common(1)[0]

                                if count >= PLATE_CONFIRM_MIN_COUNT:
                                    plate_text = most_common
                                    self._plate_buffer.clear()
                                                  
                    except Exception as e:
                        self.error_occurred.emit(str(e))

                if self._detection_enabled and self._detect_started_at:
                    if time.time() - self._detect_started_at > PLATE_DETECT_TIMEOUT_SECONDS:
                        self._plate_buffer.clear()
                        self._detect_started_at = time.time()
                        self.status_changed.emit(
                            "Chưa nhận diện được biển, vui lòng giữ xe trước camera..."
                        )

                # render
                rgb = cv2.cvtColor(output, cv2.COLOR_BGR2RGB)
                h, w, ch = rgb.shape

                qimg = QtGui.QImage(
                    rgb.data, w, h, ch*w,
                    QtGui.QImage.Format.Format_RGB888
                ).copy()

                self.frame_ready.emit(qimg)

                # debounce detection
                now = time.time()
                if plate_text:
                    if (
                        plate_text != self._last_plate
                        or now - self._last_emit_time > 1.5
                    ):
                        self._last_plate = plate_text
                        self._last_emit_time = now
                        self.set_detection_enabled(False)
                        self.detection_ready.emit(plate_text)

                QtCore.QThread.msleep(5)

            except Exception as e:
                self.error_occurred.emit(str(e))
                QtCore.QThread.msleep(50)

        cap.release()
        self.status_changed.emit("Camera stopped")

    def stop(self):
        self._running = False
        self.wait()

class SecurityConsoleUI(QtWidgets.QMainWindow):
    def __init__(self):
        super().__init__()

        base_dir = os.path.dirname(__file__)
        candidate_paths = [
            os.path.join(base_dir, "security_console.ui"),
            os.path.join(base_dir, "GUI_security", "security_console.ui"),
        ]

        ui_path = next((path for path in candidate_paths if os.path.exists(path)), None)
        if ui_path is None:
            raise FileNotFoundError(
                "Không tìm thấy file UI. Đã thử: " + ", ".join(candidate_paths)
            )

        uic.loadUi(ui_path, self)


        self.current_plate: str | None = None
        self.last_barcode: str | None = None
        self.last_barcode_time = 0.0
        self._submitting = False
        self.pending_barcode: str | None = None

        self.pending_access_payload: dict | None = None
        self.pending_preview_data: dict | None = None
        self.pending_gate_action_allowed = False

        self.current_plate_image_url: str | None = None

        self._setup_initial_ui()
        self._connect_events()

    def _setup_initial_ui(self) -> None:
        self._remove_label_borders()
        self._install_gate_status_banner()
        self._apply_modern_styles()

        self.lbl_camera_view.setText("Camera đang kết nối...")
        self.lbl_camera_view.setAlignment(QtCore.Qt.AlignmentFlag.AlignCenter)

        if hasattr(self, "lbl_camera_status"):
            self.lbl_camera_status.setText("Trạng thái camera")

        self._render_idle_state()

        self.lbl_last_payload.setText("Biển số gần nhất:")
        self.lbl_last_time.setText("Thời gian quét gần nhất: -")

        self.lbl_checkin_time_value.setText("Thời điểm vào:")
        self.lbl_checkout_time_value.setText("Thời điểm ra:")
        self.lbl_total_time_value.setText("Thời gian gửi:")

        self.lbl_user_name_value.setText("Người dùng:")
        self.lbl_user_code_value.setText("Mã người dùng:")
        self.lbl_subscription_value.setText("vé gửi xe hiện tại:")

        self.lbl_payment_value.setText("-")
        self.lbl_session_status_value.setText("Trạng thái: -")

        if hasattr(self, "txt_license_plate"):
            self.txt_license_plate.clear()
            self.txt_license_plate.setReadOnly(True)

        if hasattr(self, "lbl_plate_in_image"):
            self.lbl_plate_in_image.clear()
        if hasattr(self, "lbl_plate_out_image"):
            self.lbl_plate_out_image.clear()

        if hasattr(self, "btn_checkin"):
            self.btn_checkin.setVisible(False)
            self.btn_checkin.setEnabled(False)

        if hasattr(self, "txt_barcode"):
            self.txt_barcode.setPlaceholderText("Quét mã thẻ...")
            self.txt_barcode.clear()
            self.txt_barcode.setFocus()

        if hasattr(self, "txt_barcode_display"):
            self.txt_barcode_display.setPlaceholderText("Mã thẻ đã quét")
            self.txt_barcode_display.clear()
            self.txt_barcode_display.setReadOnly(True)

        self._lock_window_size()

    def _render_idle_state(self) -> None:
        self.lbl_status.setText("Sẵn sàng. Vui lòng quét barcode để bắt đầu.")
        self._set_gate_status("SẴN SÀNG - QUÉT THẺ", "info")

    def _render_waiting_plate_state(self) -> None:
        self.lbl_status.setText("Đã quét mã thẻ. Đang chờ camera nhận diện biển số...")
        self._set_gate_status("ĐANG NHẬN DIỆN BIỂN SỐ", "processing")

    def _refresh_gate_state_banner(self) -> None:
        if self._submitting:
            self._set_gate_status("ĐANG XỬ LÝ", "processing")
            return

        if self.pending_gate_action_allowed and self.pending_preview_data:
            action = str(self.pending_preview_data.get("action") or "").upper()
            message = str(self.pending_preview_data.get("message") or "").strip()
            if action == "CHECK_IN":
                self._set_gate_status("CHO PHÉP XE VÀO - NHẤN SPACE", "warning")
                if message:
                    self.lbl_status.setText(f"{message} - Nhấn SPACE để xác nhận.")
                return
            if action == "CHECK_OUT":
                total_amount = self._get_total_amount_from_data(self.pending_preview_data)
                payment_source = str(self.pending_preview_data.get("payment_source") or "").strip().upper()
                if payment_source == "CASH":
                    self._set_gate_status("THU TIỀN MẶT - NHẤN SPACE", "warning")
                elif total_amount > 0:
                    self._set_gate_status("THU PHÍ - NHẤN SPACE", "warning")
                else:
                    self._set_gate_status("CHO PHÉP XE RA - NHẤN SPACE", "warning")
                if message:
                    self.lbl_status.setText(f"{message} - Nhấn SPACE để xác nhận.")
                return

        if self.pending_barcode and not self.current_plate:
            self._render_waiting_plate_state()
            return

        if not self.pending_barcode:
            self._render_idle_state()
            return

    def _connect_events(self) -> None:
        self.txt_barcode.returnPressed.connect(self._on_barcode_scanned)

        self.txt_barcode.installEventFilter(self)

        if hasattr(self, "btn_checkin"):
            self.btn_checkin.setVisible(False)

        self.shortcut_confirm_gate = QtGui.QShortcut(
            QtGui.QKeySequence(QtCore.Qt.Key.Key_Space),
            self,
        )
        self.shortcut_confirm_gate.setContext(
            QtCore.Qt.ShortcutContext.ApplicationShortcut
        )
        self.shortcut_confirm_gate.activated.connect(
            self._confirm_pending_gate_action
        )
    
    def eventFilter(self, watched, event):
        if watched == getattr(self, "txt_barcode", None):
            if event.type() == QtCore.QEvent.Type.KeyPress:
                key = event.key()

                if key == QtCore.Qt.Key.Key_Space:
                    if self.pending_gate_action_allowed and self.pending_access_payload:
                        self._confirm_pending_gate_action()
                        return True

                    return True

        return super().eventFilter(watched, event)

    def _lock_window_size(self) -> None:
        # Cố định kích thước cửa sổ, không cho resize
        self.setFixedSize(self.size())
        self.setWindowFlags(
            self.windowFlags()
            & ~QtCore.Qt.WindowType.WindowMaximizeButtonHint
        )

    def _remove_label_borders(self) -> None:
        # Chỉ input được có border, label không được có border
        for label in self.findChildren(QtWidgets.QLabel):
            label.setFrameShape(QtWidgets.QFrame.Shape.NoFrame)
            label.setFrameShadow(QtWidgets.QFrame.Shadow.Plain)
            label.setLineWidth(0)
            label.setMidLineWidth(0)

    def _install_gate_status_banner(self) -> None:
        # UI mới đã có sẵn lbl_gate_status_banner trong file .ui.
        if hasattr(self, "lbl_gate_status_banner"):
            self.lbl_gate_status_banner.setAlignment(QtCore.Qt.AlignmentFlag.AlignCenter)
            return

    def _set_gate_status(self, text: str, level: str = "info") -> None:
        text = (text or "ĐANG CHỜ").strip()

        if not hasattr(self, "lbl_gate_status_banner"):
            return

        color_map = {
            "success": "#16821f",
            "warning": "#b45309",
            "error": "#dc2626",
            "info": "#16821f",
            "processing": "#16821f",
        }
        color = color_map.get(level, "#16821f")

        self.lbl_gate_status_banner.setText(text.upper())
        self.lbl_gate_status_banner.setStyleSheet(f"""
            QLabel#lbl_gate_status_banner {{
                background: #ffffff;
                color: {color};
                border: 1px solid #3f3f46;
                border-radius: 0px;
                font-size: 18px;
                font-weight: 900;
                padding: 6px 12px;
            }}
        """)

    def _status_level_from_text(self, text: str) -> str:
        value = (text or "").lower()

        if any(key in value for key in ["cho phép", "thành công", "ok"]):
            return "success"

        if any(key in value for key in ["lỗi", "thất bại", "không", "từ chối", "hết hạn"]):
            return "error"

        if any(key in value for key in ["đang", "chờ", "xử lý", "nhận diện"]):
            return "processing"

        return "info"

    def _apply_modern_styles(self) -> None:
        self.setStyleSheet("""
            QMainWindow {
                background: #fcfcfc;
            }

            QWidget {
                font-family: "Segoe UI", Arial, sans-serif;
                color: #111827;
                font-size: 14px;
                font-weight: 600;
            }

            QLabel {
                background: #ffffff;
                color: #111827;
                border: 1px solid #3f3f46;
                border-radius: 0px;
                font-size: 14px;
                font-weight: 700;
            }

            QFrame {
                background: #ffffff;
                border: 1px solid #3f3f46;
                border-radius: 0px;
            }

            QFrame QLabel {
                border: none;
                background: transparent;
            }

            QLineEdit {
                background: #ffffff;
                border: 1px solid #9ca3af;
                border-radius: 0px;
                padding: 4px 10px;
                color: #111827;
                font-size: 14px;
                font-weight: 700;
                selection-background-color: #bbf7d0;
            }

            QLineEdit:focus {
                border: 2px solid #16a34a;
                background: #ffffff;
            }

            #lbl_left_header,
            #lbl_screen_header {
                background: #ffffff;
                border: none;
                color: #111827;
                font-size: 15px;
                font-weight: 900;
            }

            #lbl_plate_in_title,
            #lbl_plate_out_title {
                color: #dc2626;
                background: #ffffff;
                font-size: 15px;
                font-weight: 900;
            }

            #lbl_plate_in_image,
            #lbl_plate_out_image,
            #lbl_camera_view {
                background: #6b6d78;
                color: #ffffff;
                border: 1px solid #3f3f46;
                font-size: 15px;
                font-weight: 700;
            }

            #lbl_camera_view {
                background: #111111;
            }

            #lbl_camera_status {
                background: #ffffff;
                color: #111827;
                border: 1px solid #3f3f46;
                font-size: 14px;
                font-weight: 800;
            }

            #lbl_fee_title,
            #lbl_payment_value,
            #lbl_space_hint,
            #lbl_last_payload {
                background: #ffffff;
                border: 1px solid #3f3f46;
                color: #111827;
                font-size: 14px;
                font-weight: 800;
            }

            #lbl_payment_value {
                font-size: 16px;
                font-weight: 900;
            }

            #lbl_barcode_title,
            #lbl_license_plate_title {
                font-size: 14px;
                font-weight: 800;
            }

            #txt_barcode,
            #txt_license_plate {
                min-height: 31px;
                max-height: 35px;
                font-size: 14px;
            }

            #lbl_gate_status_banner {
                font-size: 18px;
                font-weight: 900;
            }

            #lbl_status,
            #lbl_last_time,
            #lbl_session_status_value,
            #lbl_vehicle_type_value,
            #lst_detection_history,
            #btn_checkin {
                border: none;
                background: transparent;
            }
        """)

    def _format_time(self, value: object) -> str:
        if not value:
            return "-"

        if isinstance(value, str):
            try:
                dt = datetime.fromisoformat(value.replace("Z", "+00:00"))
                if dt.tzinfo is not None:
                    dt = dt.astimezone().replace(tzinfo=None)
                return dt.strftime("%Y-%m-%d %H:%M:%S")
            except ValueError:
                return value

        if isinstance(value, datetime):
            return value.strftime("%Y-%m-%d %H:%M:%S")

        return str(value)

    def _format_money(self, amount: object) -> str:
        if amount is None or amount == "":
            return "-"

        try:
            value = int(float(amount))
        except (TypeError, ValueError):
            return str(amount)

        return f"{value:,} VND".replace(",", ".")

    def _format_duration(self, check_in: object, check_out: object) -> str:
        if not check_in:
            return "-"

        try:
            if isinstance(check_in, str):
                start = datetime.fromisoformat(check_in.replace("Z", "+00:00"))
            elif isinstance(check_in, datetime):
                start = check_in
            else:
                return "-"

            if check_out:
                if isinstance(check_out, str):
                    end = datetime.fromisoformat(check_out.replace("Z", "+00:00"))
                elif isinstance(check_out, datetime):
                    end = check_out
                else:
                    end = datetime.now()
            else:
                end = datetime.now()

            if start.tzinfo is not None:
                start = start.astimezone().replace(tzinfo=None)

            if end.tzinfo is not None:
                end = end.astimezone().replace(tzinfo=None)

            total_seconds = int((end - start).total_seconds())

            if total_seconds < 0:
                return "-"

            hours = total_seconds // 3600
            minutes = (total_seconds % 3600) // 60
            seconds = total_seconds % 60

            return f"{hours:02d}:{minutes:02d}:{seconds:02d}"
        except Exception:
            return "-"
        
    def update_detection_info(self, plate: str, info=None) -> None:
        normalized = normalize_plate_text(plate)

        if not normalized:
            return

        self.current_plate = normalized

        if hasattr(self, "txt_license_plate"):
            self.txt_license_plate.setText(normalized)

        self.lbl_last_payload.setText(f"Biển số gần nhất:\n{normalized}")
        self.lbl_last_time.setText(
            f"Thời gian quét gần nhất: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
        )

        self.lbl_status.setText("Đã nhận biển số. Đang kiểm tra thông tin...")
        self._set_gate_status("ĐANG KIỂM TRA", "processing")

        self.current_plate_image_url = self._try_upload_latest_plate_crop()

        if not self.current_plate_image_url:
            print("upload latest plate crop failed")

        if hasattr(self, "lst_detection_history"):
            self.lst_detection_history.insertItem(
                0,
                f"{datetime.now().strftime('%H:%M:%S')} - PLATE - {normalized}",
            )
        self.txt_barcode.setFocus()

        if self.pending_barcode and not self._submitting:
            self._submit_current_barcode_and_plate()

    def _try_upload_latest_plate_crop(self) -> str | None:
        debug = (os.getenv("CLOUDINARY_DEBUG") or "").strip().lower() in {"1", "true", "yes", "on"}
        cloud_name = (os.getenv("CLOUDINARY_CLOUD_NAME") or "").strip()
        upload_preset = (os.getenv("CLOUDINARY_UPLOAD_PRESET") or "").strip()

        if not cloud_name or not upload_preset:
            if hasattr(self, "lst_detection_history"):
                self.lst_detection_history.insertItem(
                    0,
                    f"{datetime.now().strftime('%H:%M:%S')} - CLOUDINARY - skipped (missing env)",
                )
            if debug:
                print("[cloudinary] skipped: missing CLOUDINARY_CLOUD_NAME or CLOUDINARY_UPLOAD_PRESET")
            return None

        if not hasattr(self, "worker") or not self.worker:
            if debug:
                print("[cloudinary] skipped: worker not ready")
            return None

        plate_crop = getattr(self.worker, "_latest_plate_crop", None)
        if plate_crop is None:
            if hasattr(self, "lst_detection_history"):
                self.lst_detection_history.insertItem(
                    0,
                    f"{datetime.now().strftime('%H:%M:%S')} - CLOUDINARY - skipped (no crop)",
                )
            if debug:
                print("[cloudinary] skipped: no latest plate crop")
            return None

        try:
            ok, buf = cv2.imencode(".jpg", plate_crop)
            if not ok:
                if debug:
                    print("[cloudinary] failed: cv2.imencode returned false")
                return None

            files = {
                "file": ("plate.jpg", buf.tobytes(), "image/jpeg"),
            }
            data = {"upload_preset": upload_preset}

            url = f"https://api.cloudinary.com/v1_1/{cloud_name}/image/upload"
            if debug:
                print(f"[cloudinary] POST {url} preset={upload_preset!r} bytes={len(files['file'][1])}")
                if hasattr(self, "lst_detection_history"):
                    self.lst_detection_history.insertItem(
                        0,
                        f"{datetime.now().strftime('%H:%M:%S')} - CLOUDINARY - uploading...",
                    )
            res = requests.post(url, data=data, files=files, timeout=3)
            if not res.ok:
                if debug:
                    print(f"[cloudinary] upload failed: status={res.status_code} body={res.text[:500]!r}")
                    if hasattr(self, "lst_detection_history"):
                        self.lst_detection_history.insertItem(
                            0,
                            f"{datetime.now().strftime('%H:%M:%S')} - CLOUDINARY - failed ({res.status_code})",
                        )
                return None

            payload = res.json() or {}
            uploaded_url = str(payload.get("secure_url") or payload.get("url") or "").strip() or None
            if debug:
                print(f"[cloudinary] upload ok: url={uploaded_url!r}")
                if hasattr(self, "lst_detection_history"):
                    self.lst_detection_history.insertItem(
                        0,
                        f"{datetime.now().strftime('%H:%M:%S')} - CLOUDINARY - ok",
                    )
            return uploaded_url
        except Exception:
            if debug:
                print("[cloudinary] exception during upload")
            return None
        
    def set_frame(self, frame: QtGui.QImage) -> None:
        if frame is None:
            self.lbl_camera_view.clear()
            self.lbl_camera_view.setText("Camera đang kết nối...")
            return

        pixmap = QtGui.QPixmap.fromImage(frame)
        size = self.lbl_camera_view.size()

        if size.width() > 0 and size.height() > 0:
            pixmap = pixmap.scaled(
                size,
                QtCore.Qt.AspectRatioMode.KeepAspectRatio,
                QtCore.Qt.TransformationMode.SmoothTransformation,
            )

        self.lbl_camera_view.setPixmap(pixmap)

    def _on_barcode_scanned(self) -> None:
        token = self.txt_barcode.text().strip().upper()
        self.txt_barcode.clear()

        if not token:
            self.txt_barcode.setFocus()
            return

        now = time.time()

        if token == self.last_barcode and now - self.last_barcode_time < 2:
            self.txt_barcode.setFocus()
            return

        if self._submitting:
            self.txt_barcode.setFocus()
            return

        self.last_barcode = token
        self.last_barcode_time = now
        self.current_barcode = token
        self.pending_barcode = token
        self.current_plate_image_url = None

        if hasattr(self, "txt_barcode_display"):
            self.txt_barcode_display.setText(token)

        self.pending_access_payload = None
        self.pending_preview_data = None
        self.pending_gate_action_allowed = False
        self.pending_auto_confirm = False

        self.current_plate = None
        self.lbl_last_payload.setText("Biển số gần nhất:")

        if hasattr(self, "txt_license_plate"):
            self.txt_license_plate.clear()

        if hasattr(self, "worker") and self.worker:
            self.worker.set_detection_enabled(True)

        if hasattr(self, "lst_detection_history"):
            self.lst_detection_history.insertItem(
                0,
                f"{datetime.now().strftime('%H:%M:%S')} - Mã thẻ - {token}",
            )

        if hasattr(self, "lbl_plate_in_image"):
            self.lbl_plate_in_image.setPixmap(QtGui.QPixmap())
            self.lbl_plate_in_image.setText("Không có ảnh")

        if hasattr(self, "lbl_plate_out_image"):
            self.lbl_plate_out_image.setPixmap(QtGui.QPixmap())
            self.lbl_plate_out_image.setText("Không có ảnh")

        self._render_waiting_plate_state()
        self.txt_barcode.setFocus()
                        
    def _submit_current_barcode_and_plate(self) -> None:
        if not self.pending_barcode:
            return

        if not self.current_plate:
            return

        if self._submitting:
            return

        payload = {
            "barcode_token": self.pending_barcode,
            "vehicle_mode": "LICENSED",
            "license_plate": self.current_plate,
            "plate_image_url": self.current_plate_image_url,
        }

        self._preview_access_info(payload)

    def _get_total_amount_from_data(self, data: dict) -> int:
        fee_breakdown = data.get("fee_breakdown") or {}

        total_amount = None

        if isinstance(fee_breakdown, dict):
            total_amount = fee_breakdown.get("total_amount")

        if total_amount is None:
            total_amount = data.get("total_amount")

        try:
            return int(float(total_amount or 0))
        except (TypeError, ValueError):
            return 0

    def _confirm_pending_gate_action(self) -> None:
        if self._submitting:
            return

        if not self.pending_gate_action_allowed or not self.pending_access_payload:
            self.lbl_status.setText("Chưa có lượt xe hợp lệ để xác nhận.")
            self._set_gate_status("CHƯA CÓ LƯỢT HỢP LỆ", "warning")
            self.txt_barcode.clear()
            self.txt_barcode.setFocus()
            return
        
        self.txt_barcode.clear()
        self._auto_submit_access_confirm(self.pending_access_payload)
        
    def _preview_access_info(self, payload: dict) -> None:
        self._submitting = True

        self.pending_access_payload = None
        self.pending_preview_data = None
        self.pending_gate_action_allowed = False
        self.pending_auto_confirm = False

        self.lbl_status.setText("Đang kiểm tra thông tin thẻ và biển số...")
        self._set_gate_status("ĐANG KIỂM TRA", "processing")

        try:
            res = requests.post(
                f"{settings.BACKEND_HOST}/api/v1/parking_sessions/access/preview",
                json=payload,
                timeout=6,
            )

            if res.ok:
                data = res.json()
                self.pending_preview_data = data

                self._render_session_result(data)

                message = data.get("message") or "Đã lấy thông tin"
                self.lbl_status.setText(message)

                can_confirm = bool(data.get("can_confirm"))
                auto_confirm = bool(data.get("auto_confirm"))
                action = str(data.get("action") or "").upper()

                if can_confirm and auto_confirm:
                    self.pending_auto_confirm = True
                    # Auto confirm can happen for check-in, valid subscription (free exit),
                    # or wallet deduction. Keep the UI message generic and trust backend message.
                    self._set_gate_status("TỰ ĐỘNG XÁC NHẬN", "success")
                    self.lbl_status.setText(message)

                    QtCore.QTimer.singleShot(
                        300,
                        lambda payload=payload.copy(): self._auto_submit_access_confirm(payload),
                    )
                    return

                if can_confirm:
                    self.pending_access_payload = payload.copy()
                    self.pending_gate_action_allowed = True

                    if action == "CHECK_IN":
                        self._set_gate_status("CHO PHÉP XE VÀO - NHẤN SPACE", "warning")
                        self.lbl_status.setText(
                            f"{message} - Nhấn SPACE để bảo vệ xác nhận cho xe vào."
                        )
                    elif action == "CHECK_OUT":
                        total_amount = self._get_total_amount_from_data(data)
                        payment_source = str(data.get("payment_source") or "").strip().upper()

                        if payment_source == "CASH":
                            self._set_gate_status("THU TIỀN MẶT - NHẤN SPACE", "warning")
                            self.lbl_status.setText(
                                f"{message} - Nhấn SPACE sau khi đã thu tiền."
                            )
                        elif total_amount > 0:
                            self._set_gate_status("THU PHÍ - NHẤN SPACE", "warning")
                            self.lbl_status.setText(
                                f"{message} - Thu phí xong nhấn SPACE để cho xe ra."
                            )
                        else:
                            self._set_gate_status("CHO PHÉP XE RA - NHẤN SPACE", "warning")
                            self.lbl_status.setText(
                                f"{message} - Nhấn SPACE để bảo vệ xác nhận cho xe ra."
                            )
                    else:
                        self._set_gate_status("CHỜ XÁC NHẬN - NHẤN SPACE", "warning")

                    return

                self.pending_gate_action_allowed = False
                self.pending_access_payload = None
                self._set_gate_status("KHÔNG ĐỦ ĐIỀU KIỆN", "error")
                return

            try:
                detail = res.json().get("detail")
            except Exception:
                detail = res.text

            if isinstance(detail, dict):
                message = str(detail.get("message") or "Kiểm tra thất bại")
                self.lbl_status.setText(message)
                # render images (e.g. mismatch plate case)
                self._render_session_result(detail)
            else:
                self.lbl_status.setText(detail or "Kiểm tra thất bại")
            self._set_gate_status("TỪ CHỐI", "error")

            if hasattr(self, "lst_detection_history"):
                self.lst_detection_history.insertItem(
                    0,
                    f"{datetime.now().strftime('%H:%M:%S')} - ERROR - {detail or res.status_code}",
                )

        except Exception as e:
            self.lbl_status.setText(str(e))
            self._set_gate_status("LỖI KẾT NỐI", "error")

        finally:
            self._submitting = False
            self.txt_barcode.setFocus()
        
    def _auto_submit_access_confirm(self, payload: dict) -> None:
        self._submitting = True
        self.lbl_status.setText("Đang xác nhận cho xe ra/vào...")
        self._set_gate_status("ĐANG XÁC NHẬN", "processing")

        try:
            res = requests.post(
                f"{settings.BACKEND_HOST}/api/v1/parking_sessions/access/confirm",
                json=payload,
                timeout=6,
            )

            if res.ok:
                data = res.json()
                self._render_session_result(data)

                message = data.get("message") or "OK"
                self.lbl_status.setText(message)

                msg_lower = message.lower()

                if "cho phép xe vào" in msg_lower:
                    self._set_gate_status("CHO PHÉP XE VÀO", "success")
                elif "cho phép xe ra" in msg_lower:
                    self._set_gate_status("CHO PHÉP XE RA", "success")
                else:
                    self._set_gate_status("THÀNH CÔNG", "success")

                if hasattr(self, "lst_detection_history"):
                    self.lst_detection_history.insertItem(
                        0,
                        f"{datetime.now().strftime('%H:%M:%S')} - CONFIRM - {payload.get('barcode_token')}",
                    )

                self.pending_gate_action_allowed = False
                self.pending_auto_confirm = False

                self.lbl_last_payload.setText("Biển số gần nhất:")
                if hasattr(self, "txt_license_plate"):
                    self.txt_license_plate.clear()

                if hasattr(self, "worker") and self.worker:
                    self.worker.set_detection_enabled(False)

                return

            try:
                detail = res.json().get("detail")
            except Exception:
                detail = res.text

            if isinstance(detail, dict):
                message = str(detail.get("message") or "Xử lý thất bại")
                self.lbl_status.setText(message)
                self._render_session_result(detail)
            else:
                self.lbl_status.setText(detail or "Xử lý thất bại")
            self._set_gate_status("THẤT BẠI", "error")

            if hasattr(self, "lst_detection_history"):
                self.lst_detection_history.insertItem(
                    0,
                    f"{datetime.now().strftime('%H:%M:%S')} - ERROR - {detail or res.status_code}",
                )

        except Exception as e:
            self.lbl_status.setText(str(e))
            self._set_gate_status("LỖI KẾT NỐI", "error")

        finally:
            self._submitting = False
            self.txt_barcode.setFocus()
            
    def _render_session_result(self, data: dict) -> None:
        check_in_time = data.get("check_in_time")
        check_out_time = data.get("check_out_time")
        session_status = str(data.get("status") or "-")

        # Enriched fields (optional)
        user_code = (data.get("user_code") or "").strip() or "-"
        user_full_name = (data.get("user_full_name") or "").strip() or "-"
        sub_plan_code = (data.get("subscription_plan_code") or "").strip() or ""
        sub_status = (data.get("subscription_status") or "").strip() or ""
        vehicle_mode = (data.get("vehicle_mode") or "").strip() or ""
        license_plate = (data.get("license_plate") or "").strip() or ""

        def vi_session_status(code: str) -> str:
            mapping = {
                "ACTIVE": "Đang gửi",
                "DONE": "Đã hoàn tất",
            }
            return mapping.get(code, code or "-")

        def vi_subscription_status(code: str) -> str:
            if code and "." in code:
                code = code.split(".")[-1]
            mapping = {
                "ACTIVE": "Đang hoạt động",
                "PAYMENT_DUE": "Chờ thanh toán",
                "OVERDUE": "Quá hạn",
                "SUSPENDED": "Tạm khóa",
                "CANCELED": "Đã hủy",
                "INACTIVE": "Không hoạt động",
            }
            return mapping.get(code, code or "-")

        def vi_plan_name(code: str) -> str:
            if code and "." in code:
                code = code.split(".")[-1]
            mapping = {
                "BASIC": "Vé gửi xe cơ bản",
                "STARTUP": "Vé gửi xe linh hoạt",
                "ENTERPRISE": "Vé gửi xe toàn diện",
            }
            return mapping.get(code, code or code or "-")

        def vi_vehicle_mode(mode: str) -> str:
            mapping = {
                "LICENSED": "Xe có biển số",
                "UNLICENSED": "Xe không biển số",
            }
            return mapping.get(mode, mode or "-")

        fee_breakdown = data.get("fee_breakdown") or {}
        total_amount = (
            fee_breakdown.get("total_amount")
            if isinstance(fee_breakdown, dict)
            else None
        )

        if total_amount is None:
            total_amount = data.get("total_amount")

        self.lbl_checkin_time_value.setText(
            f"Thời điểm vào: {self._format_time(check_in_time)}"
        )
        self.lbl_checkout_time_value.setText(
            f"Thời điểm ra: {self._format_time(check_out_time)}"
        )
        self.lbl_total_time_value.setText(
            f"Thời gian gửi: {self._format_duration(check_in_time, check_out_time)}"
        )
        self.lbl_payment_value.setText(
            self._format_money(total_amount)
        )
        self.lbl_session_status_value.setText(
            f"Trạng thái: {vi_session_status(session_status)}"
        )

        # User / subscription / vehicle info (if UI has the labels)
        if hasattr(self, "lbl_user_name_value"):
            self.lbl_user_name_value.setText(f"Người dùng: {user_full_name}")
        if hasattr(self, "lbl_user_code_value"):
            self.lbl_user_code_value.setText(f"Mã người dùng: {user_code}")

        if hasattr(self, "lbl_subscription_value"):
            if sub_plan_code or sub_status:
                sub_text = f"{vi_plan_name(sub_plan_code)} ({vi_subscription_status(sub_status)})"
            else:
                sub_text = "-"
            self.lbl_subscription_value.setText(f"vé gửi xe hiện tại: {sub_text}")

        if hasattr(self, "lbl_vehicle_type_value"):
            # Prefer server vehicle_mode, but fall back to license_plate presence.
            if vehicle_mode:
                vehicle_text = vi_vehicle_mode(vehicle_mode)
            else:
                vehicle_text = "Xe có biển số" if license_plate else "-"
            self.lbl_vehicle_type_value.setText(f"Loại phương tiện: {vehicle_text}")

        if hasattr(self, "txt_license_plate"):
            self.txt_license_plate.setText(license_plate or self.current_plate or "")

        check_in_plate_image_url = (
            data.get("check_in_plate_image_url")
            or data.get("plate_image_in_url")
            or data.get("checkin_plate_image_url")
            or data.get("check_in_image_url")
        )
        check_out_plate_image_url = (
            data.get("check_out_plate_image_url")
            or data.get("plate_image_out_url")
            or data.get("checkout_plate_image_url")
            or data.get("check_out_image_url")
        )

        if hasattr(self, "lbl_plate_in_image"):
            self._load_image_url_to_label(check_in_plate_image_url, self.lbl_plate_in_image)

        if hasattr(self, "lbl_plate_out_image"):
            self._load_image_url_to_label(check_out_plate_image_url, self.lbl_plate_out_image)

    def _load_image_url_to_label(self, image_url: str | None, label: QtWidgets.QLabel) -> None:
        if not image_url:
            label.setPixmap(QtGui.QPixmap())
            label.setText("Không có ảnh")
            return

        image_url = str(image_url).strip().rstrip("|")
        if not image_url:
            label.setPixmap(QtGui.QPixmap())
            label.setText("Không có ảnh")
            return

        try:
            res = requests.get(image_url, timeout=6)

            if not res.ok:
                label.setText("Không tải được ảnh")
                label.setPixmap(QtGui.QPixmap())
                return

            image = QtGui.QImage()
            image.loadFromData(res.content)

            if image.isNull():
                label.setText("Ảnh không hợp lệ")
                label.setPixmap(QtGui.QPixmap())
                return

            pixmap = QtGui.QPixmap.fromImage(image)
            if label.width() > 0 and label.height() > 0:
                pixmap = pixmap.scaled(
                    label.size(),
                    QtCore.Qt.AspectRatioMode.KeepAspectRatio,
                    QtCore.Qt.TransformationMode.SmoothTransformation,
                )

            label.setText("")
            label.setPixmap(pixmap)

        except Exception:
            label.setText("Lỗi tải ảnh")
            label.setPixmap(QtGui.QPixmap())

    def set_status(self, text: str) -> None:
        message = text or "Đang chờ camera..."
        if hasattr(self, "lbl_camera_status"):
            self.lbl_camera_status.setText(f"Trạng thái camera\n{message}")

        camera_only_messages = {
            "Camera connected",
            "Camera stopped",
            "Loading model...",
            "Đang chờ camera...",
        }

        if message in camera_only_messages:
            # Camera lifecycle messages should not override gate/business status.
            # Only show them on the main status when console is idle.
            if not self.pending_barcode and not self._submitting and not self.pending_gate_action_allowed:
                self.lbl_status.setText(message)
                self._refresh_gate_state_banner()
            return

        # For any other camera status, reflect it to UI, then refresh gate banner
        # based on current workflow state.
        if not self._submitting and not self.pending_gate_action_allowed and self.pending_barcode and not self.current_plate:
            self.lbl_status.setText(message)
        elif not self.pending_barcode and not self._submitting:
            self.lbl_status.setText(message)

        msg = message.lower()

        if "chưa nhận diện" in msg or "không nhận diện" in msg:
            self._set_gate_status("CHƯA NHẬN DIỆN ĐƯỢC BIỂN", "warning")
            return

        if "đã nhận biển" in msg:
            self._set_gate_status("ĐANG XỬ LÝ", "processing")
            return

        if "lỗi" in msg or "thất bại" in msg:
            self._set_gate_status("LỖI", "error")
            return

        self._set_gate_status("ĐANG XỬ LÝ", self._status_level_from_text(message))
        self._refresh_gate_state_banner()

class SecurityConsole(SecurityConsoleUI):
    def __init__(self):
        super().__init__()

        self.worker = None
        self.start_worker()

    def _camera_source(self):
        return 0

    def start_worker(self) -> None:
        self.stop_worker()

        self.worker = CameraWorker(camera_source=self._camera_source())
        self.worker.frame_ready.connect(self.set_frame)
        self.worker.detection_ready.connect(self.record_detection)
        self.worker.status_changed.connect(self.set_status)
        self.worker.error_occurred.connect(self.on_camera_error)
        self.worker.start()

    def stop_worker(self) -> None:
        if self.worker:
            self.worker.stop()
            self.worker = None

    def on_camera_error(self, message: str) -> None:
        self.set_status(message)
        print(message)

    def record_detection(self, plate: str) -> None:
        normalized = plate.strip().upper()

        if not normalized:
            return

        self.update_detection_info(normalized)

    def closeEvent(self, event: QtGui.QCloseEvent) -> None:
        self.stop_worker()
        super().closeEvent(event)

def main() -> None:
    app = QtWidgets.QApplication(sys.argv)
    window = SecurityConsole()
    window.show()
    sys.exit(app.exec())


if __name__ == "__main__":
    main()
