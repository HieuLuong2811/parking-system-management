import json
import os
import queue
import sys
import time
from datetime import datetime

import cv2
import requests
from PyQt6 import QtCore, QtGui, QtWidgets, uic

from app.core.config import settings


LOOKUP_DEBOUNCE_SECONDS = 2.0
MAX_LOOKUP_ATTEMPTS = 5
DETECT_EVERY_N_FRAMES = 5
UI_PATH = os.path.join(os.path.dirname(__file__), "GUI_security", "security_console_qr.ui")


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
        self._last_emit: dict[str, float] = {}
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
            qimage = QtGui.QImage(
                rgb_frame.data,
                w,
                h,
                ch * w,
                QtGui.QImage.Format.Format_RGB888,
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
        self._queue: queue.Queue[str | None] = queue.Queue()

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

        for _attempt in range(MAX_LOOKUP_ATTEMPTS):
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


class SecurityConsoleQR(QtWidgets.QMainWindow):
    def __init__(self):
        super().__init__()
        uic.loadUi(UI_PATH, self)
        self._bind_widgets()
        self._static_texts: dict[str, str] = {}
        self._capture_static_texts()

        self.worker: QRWorker | None = None
        self.lookup_worker: LookupWorker | None = None

        self._last_verified_payload: dict | None = None
        self._last_lookup_payload: str | None = None

        self.btn_checkin.clicked.connect(self.handle_checkin_request)
        self.set_checkin_enabled(False)
        self.set_status("Đang chờ quét QR...")
        self._reset_info_labels()

        self.start_lookup_worker()
        self.start_worker()

    def _bind_widgets(self) -> None:
        def require_widget(widget_type, name: str):
            widget = self.findChild(widget_type, name)
            if widget is None:
                raise RuntimeError(f"Thiếu widget '{name}' trong UI ({UI_PATH})")
            return widget

        self.lbl_checkin_time_value = require_widget(QtWidgets.QLabel, "lbl_checkin_time_value")
        self.lbl_checkout_time_value = require_widget(QtWidgets.QLabel, "lbl_checkout_time_value")
        self.lbl_total_time_value = self.findChild(QtWidgets.QLabel, "lbl_total_time_value")
        self.lbl_user_name_value = require_widget(QtWidgets.QLabel, "lbl_user_name_value")
        self.lbl_user_code_value = require_widget(QtWidgets.QLabel, "lbl_user_code_value")
        self.lbl_subscription_value = require_widget(QtWidgets.QLabel, "lbl_subscription_value")
        self.lbl_payment_value = require_widget(QtWidgets.QLabel, "lbl_payment_value")
        self.lbl_vehicle_type_value = require_widget(QtWidgets.QLabel, "lbl_vehicle_type_value")
        self.lbl_session_status_value = require_widget(QtWidgets.QLabel, "lbl_session_status_value")

        self.lbl_camera_view = require_widget(QtWidgets.QLabel, "lbl_camera_view")
        self.lst_detection_history = require_widget(QtWidgets.QListWidget, "lst_detection_history")

        self.lbl_status = require_widget(QtWidgets.QLabel, "lbl_status")
        self.lbl_last_payload = require_widget(QtWidgets.QLabel, "lbl_last_payload")
        self.lbl_last_time = require_widget(QtWidgets.QLabel, "lbl_last_time")
        self.btn_checkin = require_widget(QtWidgets.QPushButton, "btn_checkin")

    def _capture_static_texts(self) -> None:
        labels: list[QtWidgets.QLabel] = [
            self.lbl_checkin_time_value,
            self.lbl_checkout_time_value,
            self.lbl_user_name_value,
            self.lbl_user_code_value,
            self.lbl_subscription_value,
            self.lbl_payment_value,
            self.lbl_vehicle_type_value,
            self.lbl_session_status_value,
            self.lbl_status,
            self.lbl_last_payload,
            self.lbl_last_time,
        ]
        if self.lbl_total_time_value is not None:
            labels.append(self.lbl_total_time_value)

        for label in labels:
            name = label.objectName()
            if not name:
                continue
            static_text = (label.text() or "").strip()
            self._static_texts[name] = static_text

    def _set_labeled_value(self, label: QtWidgets.QLabel, value: str | None) -> None:
        value_text = (value or "-").strip() or "-"
        static_text = (self._static_texts.get(label.objectName(), "") or "").strip()
        if not static_text or static_text == "TextLabel":
            label.setText(value_text)
            return
        label.setText(f"{static_text}: {value_text}")

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
        self.lookup_worker.lookup_status.connect(self.set_status)
        self.lookup_worker.start()

    def stop_lookup_worker(self) -> None:
        if self.lookup_worker:
            self.lookup_worker.stop()
            self.lookup_worker = None

    def start_worker(self) -> None:
        self.stop_worker()
        self.worker = QRWorker(camera_source=self._camera_source())
        self.worker.frame_ready.connect(self.set_frame)
        self.worker.detection_ready.connect(self.record_detection)
        self.worker.status_changed.connect(self.set_status)
        self.worker.error_occurred.connect(self.on_camera_error)
        self.worker.start()

    def stop_worker(self) -> None:
        if self.worker:
            self.worker.stop()
            self.worker = None

    def record_detection(self, payload: str) -> None:
        self.update_detection_info(payload, None)
        self._last_verified_payload = None
        self._last_lookup_payload = payload
        self.set_checkin_enabled(False)
        if self.lookup_worker:
            self.lookup_worker.enqueue_payload(payload)

    def on_lookup_finished(self, payload: str, info: dict | None) -> None:
        self.update_detection_info(payload, info)
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
            self.set_status("Chưa có QR hợp lệ để xác nhận")
            return
        try:
            response = requests.post(
                f"{settings.BACKEND_HOST}/api/v1/parking_sessions/qr_checkin",
                json=self._last_verified_payload,
                timeout=5,
            )
            if response.ok:
                self.set_status("Đã ghi nhận vào bãi")
                self.set_checkin_enabled(False)
                self._last_verified_payload = None
                if self.lookup_worker and self._last_lookup_payload:
                    self.lookup_worker.enqueue_payload(self._last_lookup_payload)
            else:
                self.set_status(f"Xác nhận thất bại: {response.text}")
        except requests.RequestException as exc:
            self.set_status(f"Lỗi xác nhận: {exc}")

    def update_detection_info(self, payload: str, info: dict | None = None) -> None:
        now = datetime.now().strftime("%H:%M:%S")
        self._set_labeled_value(self.lbl_last_time, now)
        error_message = info.get("error") if info else None

        if info is None:
            item_text = "Đã phát hiện QR"
            self._set_labeled_value(self.lbl_last_payload, item_text)
            self.set_status("Đã phát hiện QR, đang xác thực...")
            self.set_checkin_enabled(False)
            self._reset_info_labels()
        elif error_message:
            item_text = "QR không hợp lệ"
            self._set_labeled_value(self.lbl_last_payload, item_text)
            self.set_status(item_text)
            self.set_checkin_enabled(False)
            self._reset_info_labels()
        else:
            item_text = "Quét QR thành công"
            self._set_labeled_value(self.lbl_last_payload, item_text)
            self.set_status(item_text)
            self._set_labeled_value(self.lbl_user_name_value, str(info.get("user_full_name", "-")))
            self._set_labeled_value(self.lbl_user_code_value, str(info.get("user_code", "-")))
            vehicle_type = info.get("vehicle_type") or "Không xác định"
            self._set_labeled_value(self.lbl_vehicle_type_value, str(vehicle_type))
            self._populate_subscription(info.get("active_subscription"))
            self._populate_session(info.get("active_session"))
            self.set_checkin_enabled(True)

        history_item = QtWidgets.QListWidgetItem(f"{now} - {item_text}")
        self.lst_detection_history.insertItem(0, history_item)
        self.lst_detection_history.setCurrentRow(0)

    def set_status(self, text: str) -> None:
        text = text or "-"
        self._set_labeled_value(self.lbl_status, text)
        self.lbl_status.setToolTip(text)

    def set_frame(self, frame: QtGui.QImage) -> None:
        if frame is None:
            self.lbl_camera_view.clear()
            self.lbl_camera_view.setText("Nguồn camera QR")
            return
        pixmap = QtGui.QPixmap.fromImage(frame)
        target_size = self.lbl_camera_view.size()
        if target_size.width() > 0 and target_size.height() > 0:
            pixmap = pixmap.scaled(
                target_size,
                QtCore.Qt.AspectRatioMode.KeepAspectRatio,
                QtCore.Qt.TransformationMode.SmoothTransformation,
            )
        self.lbl_camera_view.setPixmap(pixmap)

    def set_checkin_enabled(self, enabled: bool) -> None:
        self.btn_checkin.setEnabled(enabled)

    def _format_time(self, value: str | None) -> str:
        if not value:
            return "-"
        iso_value = value
        if iso_value.endswith("Z"):
            iso_value = f"{iso_value[:-1]}+00:00"
        try:
            parsed = datetime.fromisoformat(iso_value)
        except ValueError:
            return value
        return parsed.strftime("%Y-%m-%d %H:%M:%S")

    def _reset_info_labels(self) -> None:
        self._set_labeled_value(self.lbl_user_name_value, "-")
        self._set_labeled_value(self.lbl_user_code_value, "-")
        self._set_labeled_value(self.lbl_vehicle_type_value, "-")
        self._set_labeled_value(self.lbl_subscription_value, "Chưa đăng ký gói gửi xe")
        self._set_labeled_value(self.lbl_payment_value, "Chưa có")
        self._set_labeled_value(self.lbl_checkin_time_value, "-")
        self._set_labeled_value(self.lbl_checkout_time_value, "-")
        if self.lbl_total_time_value is not None:
            self._set_labeled_value(self.lbl_total_time_value, "-")
        self._set_labeled_value(self.lbl_session_status_value, "Không có phiên gửi xe")

    def _populate_subscription(self, subscription: dict | None) -> None:
        if not subscription:
            self._set_labeled_value(self.lbl_subscription_value, "Chưa đăng ký gói gửi xe")
            return

        plan_type = (
            subscription.get("plans_type")
            or subscription.get("name")
            or subscription.get("title")
            or "Gói gửi xe"
        )
        self._set_labeled_value(self.lbl_subscription_value, str(plan_type))

    def _populate_session(self, session: dict | None) -> None:
        if not session:
            self._set_labeled_value(self.lbl_session_status_value, "Không có phiên gửi xe")
            self._set_labeled_value(self.lbl_payment_value, "Chưa có")
            self._set_labeled_value(self.lbl_checkin_time_value, "-")
            self._set_labeled_value(self.lbl_checkout_time_value, "-")
            if self.lbl_total_time_value is not None:
                self._set_labeled_value(self.lbl_total_time_value, "-")
            return

        check_in_raw = session.get("check_in_time")
        check_out_raw = session.get("check_out_time")
        formatted_in = self._format_time(check_in_raw)
        formatted_out = self._format_time(check_out_raw) if check_out_raw else "Chưa ra"
        self._set_labeled_value(self.lbl_checkin_time_value, formatted_in)
        self._set_labeled_value(self.lbl_checkout_time_value, formatted_out)
        if self.lbl_total_time_value is not None:
            self._set_labeled_value(
                self.lbl_total_time_value,
                self._compute_total_time(check_in_raw, check_out_raw),
            )

        status_raw = session.get("status") or session.get("state") or "ACTIVE"
        status_upper = str(status_raw).upper()
        status_map = {
            "ACTIVE": "Đang gửi",
            "COMPLETED": "Đã kết thúc",
            "FINISHED": "Đã kết thúc",
            "CANCELLED": "Đã hủy",
            "CANCELED": "Đã hủy",
        }
        self._set_labeled_value(
            self.lbl_session_status_value,
            status_map.get(status_upper, str(status_raw)),
        )

        total_amount = session.get("total_amount")
        if isinstance(total_amount, str) and total_amount.isdigit():
            total_amount = int(total_amount)
        if total_amount is not None:
            self._set_labeled_value(self.lbl_payment_value, f"{total_amount:,} đ")
        else:
            if status_upper in ("ACTIVE",):
                self._set_labeled_value(self.lbl_payment_value, "Chưa tính")
            else:
                self._set_labeled_value(self.lbl_payment_value, "Chờ thanh toán")

    def _parse_iso_datetime(self, value: str | None) -> datetime | None:
        if not value:
            return None
        iso_value = value
        if iso_value.endswith("Z"):
            iso_value = f"{iso_value[:-1]}+00:00"
        try:
            return datetime.fromisoformat(iso_value)
        except ValueError:
            return None

    def _compute_total_time(self, check_in_raw: str | None, check_out_raw: str | None) -> str:
        check_in_dt = self._parse_iso_datetime(check_in_raw)
        check_out_dt = self._parse_iso_datetime(check_out_raw)
        if not check_in_dt or not check_out_dt:
            return "-"
        delta = check_out_dt - check_in_dt
        total_seconds = int(delta.total_seconds())
        if total_seconds < 0:
            return "-"
        hours, rem = divmod(total_seconds, 3600)
        minutes, seconds = divmod(rem, 60)
        if hours:
            return f"{hours}h {minutes}m"
        if minutes:
            return f"{minutes}m {seconds}s"
        return f"{seconds}s"

    def on_camera_error(self, message: str) -> None:
        self.set_status(message)
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
