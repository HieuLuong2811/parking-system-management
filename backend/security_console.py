import os
import sys
import cv2
import time
import queue
import requests
import re
from datetime import datetime
from PyQt6 import QtCore, QtGui, QtWidgets, uic

from app.service.detect import DetectService, get_model
from app.core.config import settings


MAX_LOOKUP_ATTEMPTS = 5
LOOKUP_DEBOUNCE_SECONDS = 2.0
DETECT_EVERY_N_FRAMES = 10
PLATE_REGEX = re.compile(r"^[A-Z0-9]{5,12}$")
SECURITY_GATE_ACTION = getattr(settings, "SECURITY_GATE_ACTION", "CHECK_IN").strip().upper()

def normalize_plate_text(text: str) -> str:
    if not text:
        return ""
    print(re.sub(r"[^A-Z0-9]", "", text.strip().upper()))
    return re.sub(r"[^A-Z0-9]", "", text.strip().upper())

class CameraWorker(QtCore.QThread):
    frame_ready = QtCore.pyqtSignal(QtGui.QImage)
    detection_ready = QtCore.pyqtSignal(str)
    status_changed = QtCore.pyqtSignal(str)
    error_occurred = QtCore.pyqtSignal(str)

    def __init__(self, camera_source=0, parent=None):
        super().__init__(parent)
        self.camera_source = camera_source
        self._running = False
        self._latest_frame = None
        self._last_plate = None
        self._last_emit_time = 0

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

        return cap

    def run(self):
        self._running = True

        try:
            self.status_changed.emit("Loading model...")
            model = get_model()
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
                x1, y1 = int(w*0.2), int(h*0.25)
                x2, y2 = int(w*0.8), int(h*0.85)

                roi = frame[y1:y2, x1:x2]

                # vẽ ROI
                cv2.rectangle(output, (x1, y1), (x2, y2), (0, 255, 255), 2)

                plate_text = ""

                if frame_count % DETECT_EVERY_N_FRAMES == 0:
                    try:
                        results = model(roi, conf=0.25, verbose=False)
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
                                    best_crop = roi[by1:by2, bx1:bx2]

                                cv2.rectangle(
                                    output,
                                    (x1 + bx1, y1 + by1),
                                    (x1 + bx2, y1 + by2),
                                    (0, 255, 0),
                                    2,
                                )

                        if best_crop is not None and best_crop.size > 0:
                            debug_dir = "debug_plates"
                            os.makedirs(debug_dir, exist_ok=True)

                            debug_path = os.path.join(
                                debug_dir,
                                f"plate_{int(time.time() * 1000)}.jpg"
                            )
                            cv2.imwrite(debug_path, best_crop)

                            plate_candidate_raw = DetectService.segment_image(best_crop)
                            print("best_conf:", best_conf)
                            print("crop_shape:", best_crop.shape)
                            print("debug_crop:", debug_path)
                            print("plate_candidate_raw:", repr(plate_candidate_raw))

                            plate_candidate = normalize_plate_text(plate_candidate_raw)
                            print("plate_candidate:", repr(plate_candidate))

                            if PLATE_REGEX.match(plate_candidate):
                                plate_text = plate_candidate
                    except Exception as e:
                        self.error_occurred.emit(str(e))

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

        if not hasattr(self, "txt_barcode"):
            self.txt_barcode = QtWidgets.QLineEdit(self)
            self.txt_barcode.setObjectName("txt_barcode")
            self.txt_barcode.setPlaceholderText("Quét barcode thẻ gửi xe...")
            self.txt_barcode.setMinimumHeight(42)

            # UI của bạn có verticalLayout_2 ở panel bên phải.
            # Chèn ô barcode vào ngay dưới danh sách lịch sử quét.
            if hasattr(self, "verticalLayout_2"):
                self.verticalLayout_2.insertWidget(1, self.txt_barcode)
                self.txt_barcode.show()
            elif hasattr(self, "frm_log_panel"):
                self.txt_barcode.setParent(self.frm_log_panel)
                self.txt_barcode.setGeometry(20, 315, 500, 44)
                self.txt_barcode.show()
            else:
                self.txt_barcode.setParent(self.centralWidget())
                self.txt_barcode.setGeometry(760, 600, 320, 44)
                self.txt_barcode.show()

        self.current_plate: str | None = None
        self.current_info: dict | None = None
        self.current_action = SECURITY_GATE_ACTION

        self.current_barcode: str | None = None
        self.last_barcode: str | None = None
        self.last_barcode_time = 0.0
        self._submitting = False
        self.pending_barcode: str | None = None

        self._setup_initial_ui()
        self._connect_events()

    def _setup_initial_ui(self) -> None:
        self.lbl_camera_view.setText("Camera đang kết nối...")
        self.lbl_camera_view.setAlignment(QtCore.Qt.AlignmentFlag.AlignCenter)

        self.lbl_status.setText("Đang chờ camera...")
        self.lbl_last_payload.setText("Lần quét gần nhất: -")
        self.lbl_last_time.setText("Thời gian quét gần nhất: -")

        self.lbl_checkin_time_value.setText("Thời điểm vào: -")
        self.lbl_checkout_time_value.setText("Thời điểm ra: -")
        self.lbl_total_time_value.setText("Tổng thời gian: -")

        self.lbl_user_name_value.setText("Tên người dùng: -")
        self.lbl_user_code_value.setText("Mã người dùng: -")
        self.lbl_subscription_value.setText("Gói gửi xe: -")

        self.lbl_payment_value.setText("Tổng tiền: -")
        self.lbl_vehicle_type_value.setText("Loại phương tiện: -")
        self.lbl_session_status_value.setText("Trạng thái: -")

        self.btn_checkin.setVisible(False)
        self.btn_checkin.setEnabled(False)
        self.lbl_status.setText("Đang chờ camera nhận diện biển số...")
        self.setStyleSheet("""
            QMainWindow {
                background: #f8fafc;
            }

            QFrame {
                background: #ffffff;
                border: 1px solid #e2e8f0;
                border-radius: 12px;
            }

            QLabel {
                color: #0f172a;
                font-size: 14px;
                font-weight: 600;
            }

            QListWidget {
                border: 1px solid #e2e8f0;
                border-radius: 10px;
                padding: 8px;
                background: #ffffff;
                color: #0f172a;
                font-size: 13px;
            }

            QLineEdit {
                background: #ffffff;
                border: 1px solid #cbd5e1;
                border-radius: 10px;
                padding: 8px 12px;
                color: #0f172a;
                font-size: 14px;
                font-weight: 800;
            }

            QLineEdit:focus {
                border: 2px solid #43B14B;
            }

            QPushButton {
                background: #43B14B;
                color: #ffffff;
                border: none;
                border-radius: 10px;
                font-size: 14px;
                font-weight: 700;
                padding: 10px 16px;
            }

            QPushButton:disabled {
                background: #cbd5e1;
                color: #ffffff;
            }

            QPushButton:hover:!disabled {
                background: #4fc257;
            }

            #frm_camera {
                background: #0f172a;
            }

            #lbl_camera_view {
                background: #020617;
                color: #ffffff;
                border-radius: 10px;
            }

            #lbl_payment_value {
                color: #16a34a;
                font-size: 18px;
                font-weight: 800;
            }

            #lbl_session_status_value {
                color: #2563eb;
                font-weight: 800;
            }
        """)

    def _connect_events(self) -> None:
        self.txt_barcode.returnPressed.connect(self._on_barcode_scanned)
        self.btn_checkin.setVisible(False)

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

        self.lbl_last_payload.setText(f"Biển số gần nhất: {normalized}")
        self.lbl_last_time.setText(
            f"Thời gian quét gần nhất: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
        )

        self.lbl_vehicle_type_value.setText("Loại phương tiện: MOTORBIKE")
        self.lbl_status.setText("Đã nhận biển số. Vui lòng quét barcode.")

        self.lst_detection_history.insertItem(
            0,
            f"{datetime.now().strftime('%H:%M:%S')} - PLATE - {normalized}",
        )
        self.txt_barcode.setFocus()

        if self.pending_barcode and not self._submitting:
            self._submit_current_barcode_and_plate()
        
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
            return

        now = time.time()

        if token == self.last_barcode and now - self.last_barcode_time < 2:
            return

        if self._submitting:
            return

        self.last_barcode = token
        self.last_barcode_time = now
        self.current_barcode = token
        self.pending_barcode = token

        self.lst_detection_history.insertItem(
            0,
            f"{datetime.now().strftime('%H:%M:%S')} - BARCODE - {token}",
        )

        if self.current_plate:
            self._submit_current_barcode_and_plate()
            return

        self.lbl_status.setText(
            "Đã quét barcode. Đang chờ camera nhận diện biển số..."
        )
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
            "vehicle_type": "MOTORBIKE",
            "license_plate": self.current_plate,
        }

        self._auto_submit_access_confirm(payload)
        
    def _auto_submit_access_confirm(self, payload: dict) -> None:
        self._submitting = True
        self.lbl_status.setText("Đang xử lý barcode...")

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

                self.lst_detection_history.insertItem(
                    0,
                    f"{datetime.now().strftime('%H:%M:%S')} - BARCODE - {payload.get('barcode_token')} - {message}",
                )

                # Sau khi check-in/check-out xong, reset barcode.
                self.current_barcode = None
                self.pending_barcode = None
                self.current_plate = None
                self.lbl_last_payload.setText("Biển số gần nhất: -")
                return

            try:
                detail = res.json().get("detail")
            except Exception:
                detail = res.text

            self.lbl_status.setText(detail or "Xử lý thất bại")

            self.lst_detection_history.insertItem(
                0,
                f"{datetime.now().strftime('%H:%M:%S')} - ERROR - {detail or res.status_code}",
            )

        except Exception as e:
            self.lbl_status.setText(str(e))

        finally:
            self._submitting = False
            self.txt_barcode.setFocus()

    def _render_session_result(self, data: dict) -> None:
        check_in_time = data.get("check_in_time")
        check_out_time = data.get("check_out_time")
        session_status = data.get("status") or "-"

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
            f"Tổng thời gian: {self._format_duration(check_in_time, check_out_time)}"
        )
        self.lbl_payment_value.setText(
            f"Tổng tiền: {self._format_money(total_amount)}"
        )
        self.lbl_vehicle_type_value.setText(
            f"Loại phương tiện: {data.get('vehicle_type') or '-'}"
        )
        self.lbl_session_status_value.setText(
            f"Trạng thái: {session_status}"
        )

    def set_status(self, text: str) -> None:
        self.lbl_status.setText(text or "Đang chờ camera...")

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
