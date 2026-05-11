import sys
import time
from datetime import datetime

import requests
from PyQt6 import QtCore, QtWidgets

from app.core.config import settings

LOOKUP_DEBOUNCE_SECONDS = 0.5


class LookupWorker(QtCore.QThread):
    finished = QtCore.pyqtSignal(dict)

    def __init__(self, backend_host: str):
        super().__init__()
        self.backend_host = backend_host.rstrip("/")
        self.token: str | None = None

    def set_token(self, token: str):
        self.token = token

    def run(self):
        try:
            res = requests.post(
                f"{self.backend_host}/api/v1/vehicles/verify-barcode",
                json={"barcode_token": (self.token or "").strip().upper()},
                timeout=5,
            )
            if res.status_code == 200:
                data = res.json()
                data["barcode_token"] = self.token
                self.finished.emit(data)
                return
            self.finished.emit({"error": res.text})
        except Exception as e:
            self.finished.emit({"error": str(e)})


class SecurityConsole(QtWidgets.QWidget):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Checkin Console")

        self.last_scan_time = 0
        self.current_token: str | None = None

        self._build_ui()
        self._bind()

    def _row(self, label: str):
        container = QtWidgets.QHBoxLayout()
        lbl = QtWidgets.QLabel(label)
        lbl.setFixedWidth(120)
        value = QtWidgets.QLabel("-")
        container.addWidget(lbl)
        container.addWidget(value)
        return container, value
    
    def _styled_label(self, text: str, color: str = "#f8fafc", size: int = 14, bold: bool = False) -> QtWidgets.QLabel:
        label = QtWidgets.QLabel(text)
        style = f"color:{color}; font-size:{size}px;"
        if bold:
            style += " font-weight:700;"
        label.setStyleSheet(style)
        return label


    def _build_ui(self):
        layout = QtWidgets.QVBoxLayout(self)

        header_frame = QtWidgets.QFrame()
        header_frame.setStyleSheet("background-color:#0f172a; border-radius:14px; padding:5px;")
        header_layout = QtWidgets.QHBoxLayout(header_frame)
        header_layout.addWidget(self._styled_label("BẢNG ĐIỀU KHIỂN BẢO VỆ", color="#f8fafc", size=15, bold=True))
        layout.addWidget(header_frame)

        self.input = QtWidgets.QLineEdit()
        self.input.setPlaceholderText("Quét barcode...")
        layout.addWidget(self.input)

        self.lbl_status = QtWidgets.QLabel("-")
        row, self.lbl_status = self._row("Trạng thái:")
        layout.addWidget(self.lbl_status)

        row, self.val_user = self._row("Người dùng:")
        layout.addLayout(row)

        row, self.val_vehicle = self._row("Phương tiện:")
        layout.addLayout(row)

        row, self.val_plan = self._row("Gói gửi xe:")
        layout.addLayout(row)

        row, self.val_checkin = self._row("Thời điểm vào:")
        layout.addLayout(row)

        row, self.val_checkout = self._row("Thời điểm ra:")
        layout.addLayout(row)

        self.btn = QtWidgets.QPushButton("Xác nhận")
        self.btn.setEnabled(False)
        layout.addWidget(self.btn)

        self.input.setFocus()

    def _bind(self):
        self.input.returnPressed.connect(self.on_scan)
        self.btn.clicked.connect(self.confirm)

    def on_scan(self):
        now = time.time()
        if now - self.last_scan_time < LOOKUP_DEBOUNCE_SECONDS:
            return

        token = self.input.text().strip()
        if not token:
            return

        self.last_scan_time = now
        self.lbl_status.setText("Loading...")
        self.btn.setEnabled(False)

        self.worker = LookupWorker(settings.BACKEND_HOST)
        self.worker.set_token(token)
        self.worker.finished.connect(self.on_result)
        self.worker.start()

    def on_result(self, data: dict):
        if data.get("error"):
            self.lbl_status.setText(data["error"])
            self._reset_values()
            return

        self.current_token = data.get("barcode_token")

        self.lbl_status.setText("OK")
        self.val_user.setText(f"{data.get('user_full_name')} ({data.get('user_code')})")
        self.val_vehicle.setText(str(data.get("vehicle_type")))

        sub = data.get("active_subscription")
        self.val_plan.setText(str(sub.get("plans_type")) if sub else "-")

        session = data.get("active_session")
        if session:
            self.val_checkin.setText(str(session.get("check_in_time") or "-"))
            self.val_checkout.setText(str(session.get("check_out_time") or "-"))
        else:
            self.val_checkin.setText("-")
            self.val_checkout.setText("-")

        self.btn.setEnabled(True)

    def confirm(self):
        if not self.current_token:
            return

        try:
            res = requests.post(
                f"{settings.BACKEND_HOST}/api/v1/parking_sessions/barcode_checkin",
                json={"barcode_token": self.current_token},
                timeout=5,
            )
            if res.ok:
                self.lbl_status.setText("Checked")
            else:
                self.lbl_status.setText("Failed")
        except Exception as e:
            self.lbl_status.setText(str(e))

        self._reset()

    def _reset_values(self):
        self.val_user.setText("-")
        self.val_vehicle.setText("-")
        self.val_plan.setText("-")
        self.val_checkin.setText("-")
        self.val_checkout.setText("-")

    def _reset(self):
        self.current_token = None
        self.btn.setEnabled(False)
        self.input.clear()
        self.input.setFocus()
        self._reset_values()


def main():
    app = QtWidgets.QApplication(sys.argv)
    w = SecurityConsole()
    w.show()
    sys.exit(app.exec())


if __name__ == "__main__":
    main()