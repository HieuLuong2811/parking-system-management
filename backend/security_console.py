import os
import sys
import cv2
import time
import queue
import requests
import re
from datetime import datetime
from PyQt6 import QtCore, QtGui, QtWidgets

from app.service.detect import DetectService, get_model
from app.core.config import settings


MAX_LOOKUP_ATTEMPTS = 5
LOOKUP_DEBOUNCE_SECONDS = 2.0
DETECT_EVERY_N_FRAMES = 10
PLATE_REGEX = re.compile(r"^[A-Z0-9]{4,12}$")

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
        os.environ["OPENCV_FFMPEG_CAPTURE_OPTIONS"] = "rtsp_transport;tcp|max_delay;0"

        if isinstance(self.camera_source, str) and self.camera_source.startswith("rtsp://"):
            cap = cv2.VideoCapture(self.camera_source, cv2.CAP_FFMPEG)
        else:
            cap = cv2.VideoCapture(self.camera_source)

        cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
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
                        results = model(roi, conf=0.4, verbose=False)
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
                            plate_candidate = DetectService.segment_image(best_crop).strip().upper()
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

class LookupWorker(QtCore.QThread):
    lookup_finished = QtCore.pyqtSignal(str, object)
    lookup_status = QtCore.pyqtSignal(str)

    def __init__(self, backend_host: str, parent=None):
        super().__init__(parent)
        self.backend_host = backend_host.rstrip("/")
        self._running = False
        self._queue = queue.Queue()

    def enqueue_plate(self, plate: str):
        self._queue.put(plate)

    def run(self):
        self._running = True
        self.lookup_status.emit("Lookup worker started")

        while self._running:
            try:
                plate = self._queue.get(timeout=0.2)
            except queue.Empty:
                continue

            if plate is None:
                break

            info = self.lookup_plate_info(plate)
            self.lookup_finished.emit(plate, info)

        self.lookup_status.emit("Lookup worker stopped")

    def lookup_plate_info(self, plate: str):
        normalized = plate.strip().upper()

        for attempt in range(MAX_LOOKUP_ATTEMPTS):
            try:
                response = requests.get(
                    f"{self.backend_host}/api/v1/vehicles/lookup",
                    params={"license_plate": normalized},
                    timeout=5
                )
                if response.status_code == 200:
                    return response.json()
            except requests.RequestException:
                time.sleep(0.15)

        return None

    def stop(self):
        self._running = False
        self._queue.put(None)
        self.wait(3000)


class HomePageWidget(QtWidgets.QWidget):
    def __init__(self, parent=None):
        super().__init__(parent)
        layout = QtWidgets.QVBoxLayout(self)
        layout.setSpacing(12)
        layout.setContentsMargins(12, 12, 12, 12)

        header_frame = QtWidgets.QFrame()
        header_frame.setStyleSheet("background-color:#0f172a; border-radius:14px; padding:14px;")
        header_layout = QtWidgets.QHBoxLayout(header_frame)
        header_layout.addWidget(self._styled_label("BẢNG ĐIỀU KHIỂN BẢO VỆ", color="#f8fafc", size=22, bold=True))
        layout.addWidget(header_frame)

        body_frame = QtWidgets.QFrame()
        body_layout = QtWidgets.QHBoxLayout(body_frame)
        body_layout.setSpacing(12)

        left_column = QtWidgets.QVBoxLayout()
        left_column.setSpacing(12)

        detection_frame = QtWidgets.QFrame()
        detection_frame.setStyleSheet("background-color:#111b2b; border-radius:12px; padding:16px;")
        detection_layout = QtWidgets.QFormLayout(detection_frame)
        detection_layout.setHorizontalSpacing(20)
        detection_layout.setVerticalSpacing(10)

        self.check_in_time_label = QtWidgets.QLabel("-")
        self.check_out_time_label = QtWidgets.QLabel("-")
        self.user_code_label = QtWidgets.QLabel("-")
        self.user_name_label = QtWidgets.QLabel("-")
        self.vehicle_type_label = QtWidgets.QLabel("-")
        self.license_label = QtWidgets.QLabel("-")
        self.amount_due_label = QtWidgets.QLabel("-")

        base_style = "color:#f8fafc; font-weight:600;"
        self.check_in_time_label.setStyleSheet(base_style)
        self.check_out_time_label.setStyleSheet(base_style)
        self.user_code_label.setStyleSheet(base_style)
        self.user_name_label.setStyleSheet(base_style)
        self.vehicle_type_label.setStyleSheet(base_style)
        self.license_label.setStyleSheet("color:#f8fafc; font-weight:700;")
        self.amount_due_label.setStyleSheet("color:#22c55e; font-weight:800; font-size:28px;")

        detection_layout.addRow("Thời điểm vào:", self.check_in_time_label)
        detection_layout.addRow("Thời điểm ra:", self.check_out_time_label)
        detection_layout.addRow("Mã người dùng:", self.user_code_label)
        detection_layout.addRow("Tên người dùng:", self.user_name_label)
        detection_layout.addRow("Loại phương tiện:", self.vehicle_type_label)
        detection_layout.addRow("Biển số xe:", self.license_label)
        detection_layout.addRow("Số tiền cần thanh toán:", self.amount_due_label)
        left_column.addWidget(detection_frame)

        self.confirm_btn = QtWidgets.QPushButton("Xác nhận")
        self.confirm_btn.setEnabled(False)
        self.confirm_btn.setMinimumHeight(44)
        self.confirm_btn.setStyleSheet(
            "font-weight:700; padding:10px 18px; background-color:#2563eb; color:white; border-radius:12px;"
        )
        left_column.addWidget(self.confirm_btn)

        self.result_status = QtWidgets.QLabel("-")
        self.result_status.setStyleSheet("color:#94a3b8; font-weight:600; margin-top:4px;")
        left_column.addWidget(self.result_status)
        left_column.addStretch()

        body_layout.addLayout(left_column, 1)

        feed_frame = QtWidgets.QFrame()
        feed_frame.setStyleSheet("border-radius:18px; padding:12px; background-color:#0f172a;")
        feed_layout = QtWidgets.QVBoxLayout(feed_frame)
        self.video_label = QtWidgets.QLabel("Camera đang kết nối...")
        self.video_label.setAlignment(QtCore.Qt.AlignmentFlag.AlignCenter)
        self.video_label.setMinimumHeight(320)
        self.video_label.setStyleSheet("background:#0f172a; color:white; border-radius:12px;")
        feed_layout.addWidget(self.video_label)

        self.status_label = QtWidgets.QLabel("Đang chờ camera...")
        self.status_label.setStyleSheet("font-weight:600; color:#f8fafc; margin-top:8px;")
        feed_layout.addWidget(self.status_label)

        body_layout.addWidget(feed_frame, 2)

        layout.addWidget(body_frame)

        self.current_plate: str | None = None
        self.current_info: dict | None = None
        self.confirm_btn.clicked.connect(self._confirm_action)

    def _styled_label(self, text: str, color: str = "#f8fafc", size: int = 14, bold: bool = False) -> QtWidgets.QLabel:
        label = QtWidgets.QLabel(text)
        style = f"color:{color}; font-size:{size}px;"
        if bold:
            style += " font-weight:700;"
        label.setStyleSheet(style)
        return label

    def _format_time(self, value: object) -> str:
        if not value:
            return "-"
        if isinstance(value, str):
            try:
                # accept ISO8601 from backend
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

    def update_detection_info(self, plate: str, info: dict | None = None) -> None:
        normalized = plate.strip()
        if not normalized:
            return

        now = datetime.now()
        self.current_plate = normalized.upper()
        self.current_info = info

        self.license_label.setText(self.current_plate)

        user_code = info.get("user_code") if info else None
        user_name = info.get("user_full_name") if info else None
        vehicle_type = info.get("vehicle_type") if info else None

        self.user_code_label.setText(str(user_code) if user_code else "-")
        self.user_name_label.setText(str(user_name) if user_name else "-")
        self.vehicle_type_label.setText(str(vehicle_type) if vehicle_type else "-")

        active_session = info.get("active_session") if info else None
        check_in_time = None
        check_out_time = None

        if active_session:
            check_in_time = active_session.get("check_in_time")
            check_out_time = active_session.get("check_out_time")

        if not check_in_time:
            check_in_time = now

        self.check_in_time_label.setText(self._format_time(check_in_time))
        self.check_out_time_label.setText(self._format_time(check_out_time))

        fee_breakdown = info.get("fee_breakdown") if info else None
        amount_due = None
        if fee_breakdown and isinstance(fee_breakdown, dict):
            amount_due = fee_breakdown.get("total_amount")
        if amount_due is None and active_session and isinstance(active_session, dict):
            amount_due = active_session.get("total_amount")
        self.amount_due_label.setText(self._format_money(amount_due))

        self.result_status.setText("Đã nhận biển số, chờ xác nhận.")
        self.confirm_btn.setEnabled(True)

    def _confirm_action(self) -> None:
        if not self.current_plate:
            return

        plate = self.current_plate
        self.confirm_btn.setEnabled(False)
        self.result_status.setText("Đang xử lý...")

        try:
            res = requests.post(
                f"{settings.BACKEND_HOST}/api/v1/parking_sessions/plate_checkin",
                json={"license_plate": plate},
                timeout=6,
            )
            if res.ok:
                data = res.json()
                action = "CHECK-OUT" if data.get("check_out_time") else "CHECK-IN"
                when = data.get("check_out_time") or data.get("check_in_time") or ""
                self.result_status.setText(f"OK: {action} @ {when}")
            else:
                self.result_status.setText(f"Failed ({res.status_code})")
        except Exception as e:
            self.result_status.setText(str(e))

    def set_frame(self, frame: QtGui.QImage) -> None:
        if frame is None:
            self.video_label.clear()
            self.video_label.setText("Camera đang kết nối...")
            return
        pixmap = QtGui.QPixmap.fromImage(frame)
        size = self.video_label.size()
        if size.width() > 0 and size.height() > 0:
            pixmap = pixmap.scaled(
                size,
                QtCore.Qt.AspectRatioMode.KeepAspectRatio,
                QtCore.Qt.TransformationMode.SmoothTransformation,
            )
        self.video_label.setPixmap(pixmap)

    def set_status(self, text: str) -> None:
        self.status_label.setText(text or "Đang chờ camera...")


class SecurityConsole(QtWidgets.QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Parking Security Console")
        self.resize(1380, 880)

        self.home_page = HomePageWidget()
        self.worker = None
        self.lookup_worker = None

        self.last_lookup_plate = None
        self.last_lookup_time = 0.0
        self.pending_lookup_plates = set()

        self.setCentralWidget(self.build_ui())

        self.start_lookup_worker()
        self.start_worker()

    def build_ui(self) -> QtWidgets.QWidget:
        container = QtWidgets.QWidget()
        layout = QtWidgets.QHBoxLayout(container)
        layout.setSpacing(0)

        content_frame = QtWidgets.QFrame()
        content_layout = QtWidgets.QVBoxLayout(content_frame)
        content_layout.setSpacing(12)

        content_layout.addWidget(self.home_page)

        layout.addWidget(content_frame)
        return container

    def _camera_source(self):
        return settings.CAMERA_RTSP_URL or 0

    def start_lookup_worker(self) -> None:
        self.stop_lookup_worker()
        self.lookup_worker = LookupWorker(settings.BACKEND_HOST)
        self.lookup_worker.lookup_finished.connect(self.on_lookup_finished)
        self.lookup_worker.lookup_status.connect(self.home_page.set_status)
        self.lookup_worker.start()

    def stop_lookup_worker(self) -> None:
        if self.lookup_worker:
            self.lookup_worker.stop()
            self.lookup_worker = None

    def start_worker(self) -> None:
        self.stop_worker()

        self.worker = CameraWorker(camera_source=self._camera_source())
        self.worker.frame_ready.connect(self.home_page_frame)
        self.worker.detection_ready.connect(self.record_detection)
        self.worker.status_changed.connect(self.home_page.set_status)
        self.worker.error_occurred.connect(self.on_camera_error)
        self.worker.start()

    def stop_worker(self) -> None:
        if self.worker:
            self.worker.stop()
            self.worker = None

    def home_page_frame(self, image: QtGui.QImage) -> None:
        self.home_page.set_frame(image)

    def on_camera_error(self, message: str) -> None:
        self.home_page.set_status(message)
        print(message)

    def should_lookup(self, plate: str) -> bool:
        normalized = plate.strip().upper()
        now = time.time()

        if not normalized:
            return False

        if normalized in self.pending_lookup_plates:
            return False

        if normalized == self.last_lookup_plate and (now - self.last_lookup_time) < LOOKUP_DEBOUNCE_SECONDS:
            return False

        self.last_lookup_plate = normalized
        self.last_lookup_time = now
        return True

    def record_detection(self, plate: str) -> None:
        normalized = plate.strip().upper()
        if not normalized:
            return

        # Cập nhật UI trước cho mượt
        self.home_page.update_detection_info(normalized, None)

        if self.lookup_worker and self.should_lookup(normalized):
            self.pending_lookup_plates.add(normalized)
            self.lookup_worker.enqueue_plate(normalized)

    def on_lookup_finished(self, plate: str, info: dict | None) -> None:
        normalized = plate.strip().upper()
        self.pending_lookup_plates.discard(normalized)
        self.home_page.update_detection_info(normalized, info)

    def closeEvent(self, event: QtGui.QCloseEvent) -> None:
        self.stop_worker()
        self.stop_lookup_worker()
        super().closeEvent(event)


def main() -> None:
    app = QtWidgets.QApplication(sys.argv)
    window = SecurityConsole()
    window.show()
    sys.exit(app.exec())


if __name__ == "__main__":
    main()
