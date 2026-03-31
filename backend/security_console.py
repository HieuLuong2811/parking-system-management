import sys
import cv2
import requests
import time
from datetime import datetime

from PyQt6 import QtCore, QtGui, QtWidgets

from app.service.detect import DetectService, model
from app.api.controller.vehicles import VehicleController
from app.core.config import settings

MAX_LOOKUP_ATTEMPTS = 5


class CameraWorker(QtCore.QThread):
    frame_ready = QtCore.pyqtSignal(QtGui.QImage)
    detection_ready = QtCore.pyqtSignal(str)

    def __init__(self, camera_index=0, parent=None):
        super().__init__(parent)
        self.camera_index = camera_index
        self._running = False
        self._latest_frame = None

    def run(self):
        cap = cv2.VideoCapture(self.camera_index)
        if not cap.isOpened():
            return
        self._running = True

        while self._running:
            ret, frame = cap.read()
            if not ret:
                QtCore.QThread.msleep(100)
                continue

            results = model(frame)
            annotated = results[0].plot()
            plate_text = DetectService.segment_image(annotated).strip()

            rgb_frame = cv2.cvtColor(annotated, cv2.COLOR_BGR2RGB)
            height, width, channel = rgb_frame.shape
            bytes_per_line = 3 * width
            qimage = QtGui.QImage(rgb_frame.data, width, height, bytes_per_line, QtGui.QImage.Format.Format_RGB888)
            self._latest_frame = annotated
            self.frame_ready.emit(qimage)

            if plate_text:
                self.detection_ready.emit(plate_text)

            QtCore.QThread.msleep(200)

        cap.release()

    def stop(self):
        self._running = False
        self.wait()

    def snapshot(self) -> cv2.Mat | None:
        return self._latest_frame


class HomePageWidget(QtWidgets.QWidget):
    toggle_camera_signal = QtCore.pyqtSignal(bool)

    def __init__(self, parent=None):
        super().__init__(parent)
        layout = QtWidgets.QVBoxLayout(self)
        
        info_frame = QtWidgets.QFrame()
        info_frame.setStyleSheet("border-radius:18px; padding:18px;")
        info_layout = QtWidgets.QHBoxLayout(info_frame)
        info_left = QtWidgets.QFormLayout()
        info_left.addRow("Operator:", QtWidgets.QLabel("Nguyễn Văn A"))
        info_left.addRow("User ID:", QtWidgets.QLabel("SEC-204"))
        info_right = QtWidgets.QFormLayout()
        self.license_label = QtWidgets.QLabel("N/A")
        self.vehicle_type_label = QtWidgets.QLabel("Unknown")
        info_right.addRow("License:", self.license_label)
        info_right.addRow("Vehicle Type:", self.vehicle_type_label)
        info_layout.addLayout(info_left)
        info_layout.addLayout(info_right)
        layout.addWidget(info_frame)

        self.toggle_btn = QtWidgets.QPushButton("Toggle Camera")
        self.toggle_btn.setCheckable(True)
        self.toggle_btn.setChecked(True)
        self.toggle_btn.setMinimumHeight(40)
        self.toggle_btn.setStyleSheet("font-weight:600; padding:6px 16px;")
        self.toggle_btn.toggled.connect(self.toggle_camera_signal.emit)
        layout.addWidget(self.toggle_btn)

        self.status_label = QtWidgets.QLabel("Waiting for new plate...")
        self.status_label.setStyleSheet("color:#0f172a; font-weight:600;")
        layout.addWidget(self.status_label)

        feed_frame = QtWidgets.QFrame()
        feed_frame.setStyleSheet("border-radius:18px; padding:12px;")
        feed_layout = QtWidgets.QHBoxLayout(feed_frame)

        self.video_label = QtWidgets.QLabel("Camera feed")
        self.video_label.setAlignment(QtCore.Qt.AlignmentFlag.AlignCenter)
        self.video_label.setFixedHeight(320)
        feed_layout.addWidget(self.video_label, 2)

        log_frame = QtWidgets.QFrame()
        log_frame.setStyleSheet("border-radius:14px; padding:10px;")
        log_layout = QtWidgets.QVBoxLayout(log_frame)
        label = QtWidgets.QLabel("Latest detection")
        label.setStyleSheet("font-weight:600;")
        log_layout.addWidget(label)
        self.last_plate = QtWidgets.QLabel("-")
        self.last_plate.setStyleSheet("font-size:20px; font-weight:700; color:#ef4444;")
        log_layout.addWidget(self.last_plate)
        self.last_time = QtWidgets.QLabel("-")
        log_layout.addWidget(self.last_time)
        self.detection_history = QtWidgets.QListWidget()
        self.detection_history.setStyleSheet("border:none; padding:4px;")
        log_layout.addWidget(self.detection_history)
        feed_layout.addWidget(log_frame, 1)

        layout.addWidget(feed_frame)

        stats_frame = QtWidgets.QFrame()
        stats_frame.setStyleSheet("border-radius:16px; padding:14px;")
        stats_layout = QtWidgets.QHBoxLayout(stats_frame)
        stats_layout.addWidget(QtWidgets.QLabel("Active plan: None"))
        stats_layout.addStretch()
        self.register_btn = QtWidgets.QPushButton("Register new plan")
        self.register_btn.setMinimumHeight(40)
        self.register_btn.setStyleSheet("font-weight:600; padding:6px 16px;")
        stats_layout.addWidget(self.register_btn)
        layout.addWidget(stats_frame)

    def update_detection_info(self, plate: str, info: dict | None = None) -> None:
        self.last_plate.setText(plate)
        now = datetime.now().strftime("%H:%M:%S")
        self.last_time.setText(now)
        item = QtWidgets.QListWidgetItem(f"{now} - {plate}")
        self.detection_history.insertItem(0, item)
        self.detection_history.setCurrentRow(0)
        if info:
            self.license_label.setText(info.get("license_plate", plate))
            self.vehicle_type_label.setText(info.get("vehicle_type", "Unknown"))
            self.status_label.setText(f"Matched: {info.get('user_full_name')} ({info.get('user_code')})")
        else:
            self.license_label.setText(plate)
            self.vehicle_type_label.setText("Unknown")
            self.status_label.setText("Guest detection - no match in database")

    def set_frame(self, image: QtGui.QImage) -> None:
        pixmap = QtGui.QPixmap.fromImage(image).scaled(self.video_label.size(), QtCore.Qt.AspectRatioMode.KeepAspectRatio)
        self.video_label.setPixmap(pixmap)

class SecurityConsole(QtWidgets.QMainWindow):
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

    def __init__(self):
        super().__init__()
        self.setWindowTitle("Parking Security Console")
        self.resize(1380, 880)
        self.home_page = HomePageWidget()

        self.worker = None
        self.stop_worker()

        self.setCentralWidget(self.build_ui())

    def start_worker(self) -> None:
        self.stop_worker()
        self.worker = CameraWorker()
        self.worker.frame_ready.connect(self.home_page_frame)
        self.worker.detection_ready.connect(self.record_detection)
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


    def lookup_plate_info(self, plate: str) -> dict | None:
        normalized = plate.strip().upper()
        for attempt in range(MAX_LOOKUP_ATTEMPTS):
            try:
                response = requests.get(f"{settings.BACKEND_HOST}/api/v1/vehicles/lookup", params={"license_plate": normalized}, timeout=5)
                if response.status_code == 200:
                    return response.json()
            except requests.RequestException:
                time.sleep(0.15)
        return None

    def home_page_frame(self, image: QtGui.QImage) -> None:
        self.home_page.set_frame(image)

    def record_detection(self, plate: str) -> None:
        info = self.lookup_plate_info(plate)
        self.home_page.update_detection_info(plate, info)

    def closeEvent(self, event: QtGui.QCloseEvent) -> None:
        self.worker.stop()
        super().closeEvent(event)


def main() -> None:
    app = QtWidgets.QApplication(sys.argv)
    window = SecurityConsole()
    window.show()
    sys.exit(app.exec())


if __name__ == "__main__":
    main()
