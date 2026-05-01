import os
import sys
import cv2
import time
import queue
import requests
from datetime import datetime
from PyQt6 import QtCore, QtGui, QtWidgets

from app.service.detect import DetectService, get_model
from app.core.config import settings


MAX_LOOKUP_ATTEMPTS = 5
LOOKUP_DEBOUNCE_SECONDS = 2.0
DETECT_EVERY_N_FRAMES = 10

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
                        annotated = results[0].plot()
                        output[y1:y2, x1:x2] = annotated

                        plate_text = DetectService.segment_image(roi).strip()
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
    toggle_camera_signal = QtCore.pyqtSignal(bool)

    def __init__(self, parent=None):
        super().__init__(parent)
        layout = QtWidgets.QVBoxLayout(self)
        layout.setSpacing(12)
        layout.setContentsMargins(12, 12, 12, 12)

        header_frame = QtWidgets.QFrame()
        header_frame.setStyleSheet("background-color:#0f172a; border-radius:14px; padding:14px;")
        header_layout = QtWidgets.QHBoxLayout(header_frame)
        header_layout.addWidget(self._styled_label("BẢNG ĐIỀU KHIỂN BẢO VỆ", color="#f8fafc", size=22, bold=True))
        header_layout.addStretch()
        self.toggle_btn = QtWidgets.QPushButton("Camera bật")
        self.toggle_btn.setCheckable(True)
        self.toggle_btn.setChecked(True)
        self.toggle_btn.setMinimumHeight(40)
        self.toggle_btn.setStyleSheet("font-weight:600; padding:8px 18px; border-radius:10px; background-color:#14b8a6; color:white;")
        self.toggle_btn.toggled.connect(self._handle_toggle)
        header_layout.addWidget(self.toggle_btn)
        layout.addWidget(header_frame)

        body_frame = QtWidgets.QFrame()
        body_layout = QtWidgets.QHBoxLayout(body_frame)
        body_layout.setSpacing(12)

        left_column = QtWidgets.QVBoxLayout()
        left_column.setSpacing(12)

        operator_frame = QtWidgets.QFrame()
        operator_frame.setStyleSheet("background-color:#1f2937; border-radius:12px; padding:16px;")
        operator_layout = QtWidgets.QFormLayout(operator_frame)
        operator_layout.setHorizontalSpacing(20)
        operator_layout.setVerticalSpacing(10)
        operator_layout.addRow("Nhân viên:", QtWidgets.QLabel("Nguyễn Văn A"))
        operator_layout.addRow("Mã bảo vệ:", QtWidgets.QLabel("SEC-204"))
        camera_source_label = QtWidgets.QLabel(settings.CAMERA_RTSP_URL or "Chưa cấu hình RTSP")
        operator_layout.addRow("Camera RTSP:", camera_source_label)
        left_column.addWidget(operator_frame)

        detection_frame = QtWidgets.QFrame()
        detection_frame.setStyleSheet("background-color:#111b2b; border-radius:12px; padding:16px;")
        detection_layout = QtWidgets.QFormLayout(detection_frame)
        detection_layout.setHorizontalSpacing(20)
        detection_layout.setVerticalSpacing(10)
        self.license_label = QtWidgets.QLabel("-")
        self.vehicle_type_label = QtWidgets.QLabel("-")
        self.match_status_label = QtWidgets.QLabel("Chưa có dữ liệu")
        self.match_status_label.setStyleSheet("color:#34d399; font-weight:600;")
        detection_layout.addRow("Biển số:", self.license_label)
        detection_layout.addRow("Loại xe:", self.vehicle_type_label)
        detection_layout.addRow("Trạng thái:", self.match_status_label)
        left_column.addWidget(detection_frame)

        stats_frame = QtWidgets.QFrame()
        stats_frame.setStyleSheet("background-color:#1f2937; border-radius:12px; padding:16px;")
        stats_layout = QtWidgets.QHBoxLayout(stats_frame)
        active_plan_label = QtWidgets.QLabel("Kế hoạch đang hoạt động: Không")
        active_plan_label.setStyleSheet("color:#f8fafc; font-weight:600;")
        stats_layout.addWidget(active_plan_label)
        stats_layout.addStretch()
        self.register_btn = QtWidgets.QPushButton("Đăng ký ca trực mới")
        self.register_btn.setMinimumHeight(36)
        self.register_btn.setStyleSheet("font-weight:600; padding:6px 16px; background-color:#2563eb; color:white; border-radius:10px;")
        stats_layout.addWidget(self.register_btn)
        left_column.addWidget(stats_frame)

        body_layout.addLayout(left_column, 1)

        side_layout = QtWidgets.QHBoxLayout()
        feed_frame = QtWidgets.QFrame()
        feed_frame.setStyleSheet("border-radius:18px; padding:12px; background-color:#0f172a;")
        feed_layout = QtWidgets.QHBoxLayout(feed_frame)
        self.video_label = QtWidgets.QLabel("Camera đang kết nối...")
        self.video_label.setAlignment(QtCore.Qt.AlignmentFlag.AlignCenter)
        self.video_label.setMinimumHeight(320)
        self.video_label.setStyleSheet("background:#0f172a; color:white; border-radius:12px;")
        feed_layout.addWidget(self.video_label, 2)

        detection_log_frame = QtWidgets.QFrame()
        detection_log_frame.setStyleSheet("background-color:#1f2740; border-radius:12px; padding:16px;")
        detection_log_layout = QtWidgets.QVBoxLayout(detection_log_frame)
        self.detection_label = self._styled_label("Tiến trình phát hiện", color="#f8fafc", size=16, bold=True)
        detection_log_layout.addWidget(self.detection_label)
        self.last_plate = QtWidgets.QLabel("-")
        self.last_plate.setStyleSheet("font-size:20px; font-weight:700; color:#f97316;")
        detection_log_layout.addWidget(self.last_plate)
        self.last_time = QtWidgets.QLabel("-")
        detection_log_layout.addWidget(self.last_time)
        self.detection_history = QtWidgets.QListWidget()
        self.detection_history.setStyleSheet("border:none; padding:4px; background-color:transparent;")
        detection_log_layout.addWidget(self.detection_history)
        self.status_label = QtWidgets.QLabel("Đang chờ camera...")
        self.status_label.setStyleSheet("font-weight:600; color:#f8fafc; margin-top:8px;")
        detection_log_layout.addWidget(self.status_label)

        side_layout.addWidget(feed_frame, 2)
        side_layout.addWidget(detection_log_frame, 1)
        body_layout.addLayout(side_layout, 2)

        layout.addWidget(body_frame)

    def _styled_label(self, text: str, color: str = "#f8fafc", size: int = 14, bold: bool = False) -> QtWidgets.QLabel:
        label = QtWidgets.QLabel(text)
        style = f"color:{color}; font-size:{size}px;"
        if bold:
            style += " font-weight:700;"
        label.setStyleSheet(style)
        return label

    def _handle_toggle(self, enabled: bool) -> None:
        self.toggle_btn.setText("Camera bật" if enabled else "Camera tắt")
        self.toggle_camera_signal.emit(enabled)

    def update_detection_info(self, plate: str, info: dict | None = None) -> None:
        normalized = plate.strip()
        if not normalized:
            return
        now = datetime.now().strftime("%H:%M:%S")
        self.last_plate.setText(normalized)
        self.last_time.setText(now)
        item = QtWidgets.QListWidgetItem(f"{now} - {normalized}")
        self.detection_history.insertItem(0, item)
        self.detection_history.setCurrentRow(0)

        if info:
            self.license_label.setText(info.get("license_plate", normalized))
            self.vehicle_type_label.setText(info.get("vehicle_type", "Không xác định"))
            user_name = info.get("user_full_name", "Khách")
            vehicle_type = info.get("vehicle_type", "Không xác định")
            self.match_status_label.setText(f"Đã đối chiếu: {user_name} ({vehicle_type})")
            self.match_status_label.setStyleSheet("color:#34d399; font-weight:600;")
        else:
            self.license_label.setText(normalized)
            self.vehicle_type_label.setText("Chưa rõ loại")
            self.match_status_label.setText("Khách hoặc không có dữ liệu")
            self.match_status_label.setStyleSheet("color:#facc15; font-weight:600;")

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
        self.home_page.toggle_camera_signal.connect(self.toggle_camera)

        container = QtWidgets.QWidget()
        layout = QtWidgets.QHBoxLayout(container)
        layout.setSpacing(0)

        content_frame = QtWidgets.QFrame()
        content_layout = QtWidgets.QVBoxLayout(content_frame)
        content_layout.setSpacing(12)

        header = QtWidgets.QFrame()
        header.setStyleSheet("border-radius:14px; padding:12px;")
        header_layout = QtWidgets.QHBoxLayout(header)
        header_layout.addWidget(QtWidgets.QLabel("Operator console"))
        header_layout.addStretch()
        header_layout.addWidget(QtWidgets.QLabel("Nguyễn Văn A"))

        content_layout.addWidget(header)
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

    def toggle_camera(self, enabled: bool) -> None:
        if enabled:
            self.start_worker()
        else:
            self.stop_worker()
            self.home_page.set_status("Camera paused")

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
