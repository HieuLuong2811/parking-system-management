import json
import os
import sys
import cv2
import time
import queue
import requests
from datetime import datetime
from PyQt6 import QtCore, QtGui, QtWidgets

from app.core.config import settings


LOOKUP_DEBOUNCE_SECONDS = 2.0
MAX_LOOKUP_ATTEMPTS = 5
DETECT_EVERY_N_FRAMES = 5


class QRWorker(QtCore.QThread):
    frame_ready = QtCore.pyqtSignal(QtGui.QImage)
    detection_ready = QtCore.pyqtSignal(str)
    status_changed = QtCore.pyqtSignal(str)
    error_occurred = QtCore.pyqtSignal(str)

    def __init__(self, camera_source=0, parent=None):
        super().__init__(parent)
        self.camera_source = camera_source
        self._running = False
        self._latest_frame = None
        self._last_emit = {}
        self.detector = cv2.QRCodeDetector()

    def _build_capture(self):
        return cv2.VideoCapture(self.camera_source)

    def _detect_payloads(self, frame):
        payloads = []
        try:
            success, decoded_infos, _, _ = self.detector.detectAndDecodeMulti(frame)
        except AttributeError:
            success = False
            decoded_infos = []
        if success:
            payloads.extend([info.strip() for info in decoded_infos if info.strip()])
        else:
            decoded_text, _, _ = self.detector.detectAndDecode(frame)
            if decoded_text:
                payloads.append(decoded_text.strip())
        return payloads

    def run(self):
        self._running = True
        cap = self._build_capture()
        if not cap.isOpened():
            self.error_occurred.emit(f"Không mở được camera source: {self.camera_source}")
            return
        self.status_changed.emit("Đã kết nối camera QR")
        frame_count = 0

        while self._running:
            ret, frame = cap.read()
            if not ret or frame is None:
                self.status_changed.emit("Chờ khung hình...")
                QtCore.QThread.msleep(50)
                continue
            frame = cv2.flip(frame, 1)
            frame_count += 1
            output_frame = frame.copy()
            if frame_count % DETECT_EVERY_N_FRAMES == 0:
                try:
                    payloads = self._detect_payloads(frame)
                except Exception as exc:
                    self.error_occurred.emit(f"Lỗi quét QR: {exc}")
                    payloads = []
                for payload in payloads:
                    now = time.time()
                    last_time = self._last_emit.get(payload, 0)
                    if now - last_time < LOOKUP_DEBOUNCE_SECONDS:
                        continue
                    self._last_emit[payload] = now
                    self.detection_ready.emit(payload)
            rgb_frame = cv2.cvtColor(output_frame, cv2.COLOR_BGR2RGB)
            h, w, ch = rgb_frame.shape
            bytes_per_line = ch * w
            qimage = QtGui.QImage(
                rgb_frame.data,
                w,
                h,
                bytes_per_line,
                QtGui.QImage.Format.Format_RGB888
            ).copy()
            self._latest_frame = output_frame.copy()
            self.frame_ready.emit(qimage)
            QtCore.QThread.msleep(10)
        cap.release()
        self.status_changed.emit("Đã dừng camera QR")

    def stop(self):
        self._running = False
        self.wait(3000)

    def snapshot(self):
        return self._latest_frame.copy() if self._latest_frame is not None else None


class LookupWorker(QtCore.QThread):
    lookup_finished = QtCore.pyqtSignal(str, object)
    lookup_status = QtCore.pyqtSignal(str)

    def __init__(self, backend_host: str, parent=None):
        super().__init__(parent)
        self.backend_host = backend_host.rstrip("/")
        self._running = False
        self._queue = queue.Queue()

    def enqueue_payload(self, payload: str):
        self._queue.put(payload)

    def run(self):
        self._running = True
        self.lookup_status.emit("Bắt đầu tra cứu...")
        while self._running:
            try:
                payload = self._queue.get(timeout=0.2)
            except queue.Empty:
                continue
            if payload is None:
                break
            info = self.lookup_payload(payload)
            self.lookup_finished.emit(payload, info)
        self.lookup_status.emit("Đã dừng tra cứu")

    def lookup_payload(self, payload: str):
        normalized = payload.strip()
        try:
            data = json.loads(normalized)
        except json.JSONDecodeError:
            return {"error": "Dữ liệu QR không hợp lệ"}
        for field in ("vehicle_id", "user_code", "qr_secret"):
            if not data.get(field):
                return {"error": f"Thiếu trường bắt buộc: {field}"}
        for attempt in range(MAX_LOOKUP_ATTEMPTS):
            try:
                response = requests.post(
                    f"{self.backend_host}/api/v1/vehicles/verify-qr",
                    json=data,
                    timeout=5,
                )
                if response.status_code == 200:
                    info = response.json()
                    info["vehicle_id"] = data["vehicle_id"]
                    info["user_code"] = data["user_code"]
                    info["qr_secret"] = data["qr_secret"]
                    return info
                if response.status_code == 403:
                    return {"error": "Xác thực QR thất bại"}
            except requests.RequestException:
                time.sleep(0.15)
        return {"error": "Dịch vụ tra cứu không khả dụng"}

    def stop(self):
        self._running = False
        self._queue.put(None)
        self.wait(3000)

class HomePageWidget(QtWidgets.QWidget):
    toggle_camera_signal = QtCore.pyqtSignal(bool)
    checkin_requested = QtCore.pyqtSignal()

    def __init__(self, parent=None):
        super().__init__(parent)
        layout = QtWidgets.QVBoxLayout(self)

        header_frame = QtWidgets.QFrame()
        header_frame.setStyleSheet('background-color:#0f172a; padding:12px; border-radius:10px;')
        header_layout = QtWidgets.QHBoxLayout(header_frame)
        header_label = QtWidgets.QLabel('Bảng điều khiển quét QR')
        header_label.setStyleSheet('color:white; font-size:24px; font-weight:700;')
        header_layout.addWidget(header_label)
        layout.addWidget(header_frame)

        body_frame = QtWidgets.QFrame()
        body_layout = QtWidgets.QHBoxLayout(body_frame)

        qr_payload_frame = QtWidgets.QFrame()
        qr_payload_frame.setStyleSheet('background-color:#1e2a47; border-radius:10px; padding:15px;; font-size:16px;')
        qr_payload_layout = QtWidgets.QFormLayout(qr_payload_frame)
        self.checkin_label = QtWidgets.QLabel('Giờ vào: -')
        self.checkout_label = QtWidgets.QLabel('Giờ ra: -')
        qr_payload_layout.addRow(self.checkin_label)
        qr_payload_layout.addRow(self.checkout_label)
        body_layout.addWidget(qr_payload_frame, 1)

        user_info_frame = QtWidgets.QFrame()
        user_info_frame.setStyleSheet('background-color:#1e2a47; border-radius:10px; padding:15px; font-size:16px;')
        user_info_layout = QtWidgets.QFormLayout(user_info_frame)
        self.user_name_label = QtWidgets.QLabel('-')
        self.user_code_label = QtWidgets.QLabel('-')
        self.subscription_label = QtWidgets.QLabel('Chưa đăng ký gói gửi xe')
        self.payment_label = QtWidgets.QLabel('Chưa có')
        user_info_layout.addRow('Họ tên:', self.user_name_label)
        user_info_layout.addRow('Mã người dùng:', self.user_code_label)
        user_info_layout.addRow('Gói gửi xe:', self.subscription_label)
        user_info_layout.addRow('Thanh toán:', self.payment_label)
        body_layout.addWidget(user_info_frame, 1)

        session_details_frame = QtWidgets.QFrame()
        session_details_frame.setStyleSheet('background-color:#1e2a47; border-radius:10px; padding:15px; font-size:16px;')
        session_details_layout = QtWidgets.QFormLayout(session_details_frame)
        self.vehicle_type_label = QtWidgets.QLabel('Xe không biển số')
        self.session_status_label = QtWidgets.QLabel('Không có phiên gửi xe')
        session_details_layout.addRow('Loại phương tiện:', self.vehicle_type_label)
        session_details_layout.addRow('Phiên gửi xe:', self.session_status_label)
        body_layout.addWidget(session_details_frame, 1)

        layout.addWidget(body_frame)

        side_layout = QtWidgets.QHBoxLayout()

        feed_frame = QtWidgets.QFrame()
        feed_frame.setStyleSheet('border-radius:18px; padding:12px;')
        feed_layout = QtWidgets.QHBoxLayout(feed_frame)
        self.video_label = QtWidgets.QLabel('Nguồn camera')
        self.video_label.setAlignment(QtCore.Qt.AlignmentFlag.AlignCenter)
        self.video_label.setMinimumHeight(320)
        self.video_label.setStyleSheet('background:#0f172a; color:white; border-radius:12px;')
        feed_layout.addWidget(self.video_label, 2)

        # Detection Log and Check In Button
        detection_log_frame = QtWidgets.QFrame()
        detection_log_frame.setStyleSheet("background-color:#1e2a47; border-radius:10px; padding:15px;")
        detection_log_layout = QtWidgets.QVBoxLayout(detection_log_frame)
        self.detection_log_label = QtWidgets.QLabel("Tiến trình")
        self.detection_log_label.setStyleSheet("font-weight:700; font-size:18px;")
        self.detection_history = QtWidgets.QListWidget()
        detection_log_layout.addWidget(self.detection_log_label)
        detection_log_layout.addWidget(self.detection_history)

        self.status_label = QtWidgets.QLabel('Đang chờ quét QR...')
        self.status_label.setStyleSheet("font-size:14px; font-weight:600; color:#f8fafc; margin-top:12px;")
        detection_log_layout.addWidget(self.status_label)

        status_info_frame = QtWidgets.QFrame()
        status_info_frame.setStyleSheet("background:transparent; font-size:16px;")
        status_info_layout = QtWidgets.QFormLayout(status_info_frame)
        status_info_layout.setContentsMargins(0, 0, 0, 0)
        self.last_payload = QtWidgets.QLabel('-')
        self.last_time = QtWidgets.QLabel('-')
        status_info_layout.addRow('Kết quả quét QR:', self.last_payload)
        status_info_layout.addRow('Thời gian quét gần nhất:', self.last_time)
        detection_log_layout.addWidget(status_info_frame)

        self.checkin_btn = QtWidgets.QPushButton("Xác nhận")
        self.checkin_btn.setStyleSheet("background-color:#ffca3a; color:#000000; font-size:16px; font-weight:600; padding:12px 24px; border-radius:5px;")
        self.checkin_btn.setEnabled(True)
        self.checkin_btn.clicked.connect(self.checkin_requested.emit)
        detection_log_layout.addWidget(self.checkin_btn)

        side_layout.addWidget(feed_frame, 2)
        side_layout.addWidget(detection_log_frame, 1)

        layout.addLayout(side_layout)

    def update_detection_info(self, payload: str, info: dict | None = None) -> None:
        now = datetime.now().strftime('%H:%M:%S')
        self.last_time.setText(now)
        error_message = info.get('error') if info else None

        if info is None:
            item_text = "Đã phát hiện QR"
            self.last_payload.setText(item_text)
            self.status_label.setText("Đã phát hiện QR, đang xác thực...")
            self.set_checkin_enabled(False)
            self._reset_info_labels()
        elif error_message:
            item_text = "QR không hợp lệ"
            self.last_payload.setText(item_text)
            self.status_label.setText(item_text)
            self.set_checkin_enabled(False)
            self._reset_info_labels()
        else:
            item_text = "Quét QR thành công"
            self.last_payload.setText(item_text)
            self.status_label.setText(item_text)
            self.user_name_label.setText(info.get('user_full_name', '-'))
            self.user_code_label.setText(info.get('user_code', '-'))
            vehicle_type = info.get('vehicle_type', 'Không xác định')
            self.vehicle_type_label.setText(vehicle_type)
            self._populate_subscription(info.get('active_subscription'))
            self._populate_session(info.get('active_session'))
            self.set_checkin_enabled(True)

        item = QtWidgets.QListWidgetItem(f"{now} - {item_text}")
        self.detection_history.insertItem(0, item)
        self.detection_history.setCurrentRow(0)

    def set_status(self, text: str) -> None:
        text = text or '-'
        self.status_label.setText(text)
        self.status_label.setToolTip(text)

    def set_frame(self, frame: QtGui.QImage) -> None:
        if frame is None:
            self.video_label.clear()
            self.video_label.setText('Nguồn camera QR')
            return
        pixmap = QtGui.QPixmap.fromImage(frame)
        target_size = self.video_label.size()
        if target_size.width() > 0 and target_size.height() > 0:
            pixmap = pixmap.scaled(
                target_size,
                QtCore.Qt.AspectRatioMode.KeepAspectRatio,
                QtCore.Qt.TransformationMode.SmoothTransformation,
            )
        self.video_label.setPixmap(pixmap)

    def set_checkin_enabled(self, enabled: bool) -> None:
        self.checkin_btn.setEnabled(enabled)

    def _format_time(self, value: str | None) -> str:
        if not value:
            return '-'
        iso_value = value
        if iso_value.endswith("Z"):
            iso_value = f"{iso_value[:-1]}+00:00"
        try:
            parsed = datetime.fromisoformat(iso_value)
        except ValueError:
            return value
        return parsed.strftime('%Y-%m-%d %H:%M:%S')

    def _reset_info_labels(self) -> None:
        self.user_name_label.setText('-')
        self.user_code_label.setText('-')
        self.vehicle_type_label.setText('-')
        self.subscription_label.setText('Chưa đăng ký gói gửi xe')
        self.payment_label.setText('Chưa có')
        self.checkin_label.setText('Giờ vào: -')
        self.checkout_label.setText('Giờ ra: -')
        self.session_status_label.setText('Không có phiên gửi xe')

    def _populate_subscription(self, subscription: dict | None) -> None:
        if not subscription:
            self.subscription_label.setText('Chưa đăng ký gói gửi xe')
            return
        plan_name = subscription.get('name') or subscription.get('plan_name') or subscription.get('title') or 'Gói gửi xe'
        self.subscription_label.setText(plan_name)

    def _populate_session(self, session: dict | None) -> None:
        if not session:
            self.session_status_label.setText('Không có phiên gửi xe')
            self.payment_label.setText('Chưa có')
            self.checkin_label.setText('Giờ vào: -')
            self.checkout_label.setText('Giờ ra: -')
            return
        check_in_raw = session.get('check_in_time')
        check_out_raw = session.get('check_out_time')
        formatted_in = self._format_time(check_in_raw)
        formatted_out = self._format_time(check_out_raw) if check_out_raw else 'Chưa ra'
        self.checkin_label.setText(f"Giờ vào: {formatted_in}")
        self.checkout_label.setText(f"Giờ ra: {formatted_out}")
        status_raw = session.get('status') or session.get('state') or 'ACTIVE'
        status_upper = str(status_raw).upper()
        status_map = {
            "ACTIVE": "Đang gửi",
            "COMPLETED": "Đã kết thúc",
            "FINISHED": "Đã kết thúc",
            "CANCELLED": "Đã hủy",
            "CANCELED": "Đã hủy",
        }
        self.session_status_label.setText(status_map.get(status_upper, str(status_raw)))
        total_amount = session.get('total_amount')
        if isinstance(total_amount, str) and total_amount.isdigit():
            total_amount = int(total_amount)
        if total_amount is not None:
            self.payment_label.setText(f"{total_amount:,} đ")
        else:
            if status_upper in ('ACTIVE',):
                self.payment_label.setText('Chưa tính')
            else:
                self.payment_label.setText('Chờ thanh toán')


class SecurityConsoleQR(QtWidgets.QMainWindow):
    def __init__(self):
        super().__init__()
        self.resize(1380, 880)
        self.home_page = HomePageWidget()
        self.worker: QRWorker | None = None
        self.lookup_worker: LookupWorker | None = None
        self.setCentralWidget(self.build_ui())
        self.start_lookup_worker()
        self.start_worker()
        self._last_verified_payload: dict | None = None
        self._last_lookup_payload: str | None = None
        self.home_page.checkin_requested.connect(self.handle_checkin_request)

    def build_ui(self) -> QtWidgets.QWidget:
        self.home_page.toggle_camera_signal.connect(self.toggle_camera)
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
        if settings.QR_CAMERA_SOURCE:
            source = settings.QR_CAMERA_SOURCE.strip()
            if source.isdigit():
                return int(source)
            return source
        return 0

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
        self.worker = QRWorker(camera_source=self._camera_source())
        self.worker.frame_ready.connect(self.home_page.set_frame)
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
            self.home_page.set_status("Đã tạm dừng camera")

    def record_detection(self, payload: str) -> None:
        self.home_page.update_detection_info(payload, None)
        self._last_verified_payload = None
        self._last_lookup_payload = payload
        self.home_page.set_checkin_enabled(False)
        if self.lookup_worker:
            self.lookup_worker.enqueue_payload(payload)

    def on_lookup_finished(self, payload: str, info: dict | None) -> None:
        self.home_page.update_detection_info(payload, info)
        if info and not info.get("error"):
            self._last_verified_payload = {
                "vehicle_id": info.get("vehicle_id"),
                "user_code": info.get("user_code"),
                "qr_secret": info.get("qr_secret"),
            }
            self._last_lookup_payload = payload
        else:
            self._last_verified_payload = None

    def handle_checkin_request(self) -> None:
        if not self._last_verified_payload:
            self.home_page.set_status("Chưa có QR hợp lệ để xác nhận")
            return
        try:
            response = requests.post(
                f"{settings.BACKEND_HOST}/api/v1/parking_sessions/qr_checkin",
                json=self._last_verified_payload,
                timeout=5,
            )
            if response.ok:
                self.home_page.set_status("Đã ghi nhận vào bãi")
                self.home_page.set_checkin_enabled(False)
                self._last_verified_payload = None
                if self.lookup_worker and self._last_lookup_payload:
                    self.lookup_worker.enqueue_payload(self._last_lookup_payload)
            else:
                self.home_page.set_status(f"Xác nhận thất bại: {response.text}")
        except requests.RequestException as exc:
            self.home_page.set_status(f"Lỗi xác nhận: {exc}")

    def on_camera_error(self, message: str) -> None:
        self.home_page.set_status(message)
        print(message)

    def closeEvent(self, event: QtGui.QCloseEvent) -> None:
        self.stop_worker()
        self.stop_lookup_worker()
        super().closeEvent(event)


def main() -> None:
    app = QtWidgets.QApplication(sys.argv)
    window = SecurityConsoleQR()
    window.show()
    sys.exit(app.exec())


if __name__ == "__main__":
    main()
