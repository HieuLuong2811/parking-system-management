import sys
import time
from datetime import datetime

import requests
from PyQt6 import QtCore, QtWidgets

from app.core.config import settings


LOOKUP_DEBOUNCE_SECONDS = 0.5

SECURITY_UNLICENSED_VEHICLE_TYPE = getattr(
    settings,
    "SECURITY_UNLICENSED_VEHICLE_TYPE",
    "BICYCLE",
).strip().upper()


class LookupWorker(QtCore.QThread):
    finished = QtCore.pyqtSignal(dict)

    def __init__(self, backend_host: str):
        super().__init__()
        self.backend_host = backend_host.rstrip("/")
        self.token: str | None = None

    def set_token(self, token: str):
        self.token = token

    def run(self):
        token = (self.token or "").strip().upper()

        if not token:
            self.finished.emit({"error": "Barcode không hợp lệ"})
            return

        payload = {
            "barcode_token": token,
            "vehicle_mode": "UNLICENSED",
            "vehicle_type": SECURITY_UNLICENSED_VEHICLE_TYPE,
            "license_plate": None,
        }

        try:
            res = requests.post(
                f"{self.backend_host}/api/v1/parking_sessions/access/confirm",
                json=payload,
                timeout=6,
            )

            if res.status_code == 200:
                data = res.json()
                data["barcode_token"] = token
                self.finished.emit(data)
                return

            try:
                detail = res.json().get("detail")
            except Exception:
                detail = res.text

            self.finished.emit({"error": detail or "Xử lý thất bại"})

        except Exception as e:
            self.finished.emit({"error": str(e)})


class SecurityConsole(QtWidgets.QWidget):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Security Console QR - Xe không biển số")

        self.last_scan_time = 0.0
        self.current_token: str | None = None
        self.worker: LookupWorker | None = None

        self._build_ui()
        self._bind()

    def _row(self, label: str):
        container = QtWidgets.QHBoxLayout()
        lbl = QtWidgets.QLabel(label)
        lbl.setFixedWidth(130)
        value = QtWidgets.QLabel("-")
        container.addWidget(lbl)
        container.addWidget(value)
        return container, value

    def _styled_label(
        self,
        text: str,
        color: str = "#f8fafc",
        size: int = 14,
        bold: bool = False,
    ) -> QtWidgets.QLabel:
        label = QtWidgets.QLabel(text)
        style = f"color:{color}; font-size:{size}px;"
        if bold:
            style += " font-weight:700;"
        label.setStyleSheet(style)
        return label

    def _build_ui(self):
        self.setMinimumWidth(520)

        layout = QtWidgets.QVBoxLayout(self)

        header_frame = QtWidgets.QFrame()
        header_frame.setStyleSheet(
            "background-color:#0f172a; border-radius:14px; padding:8px;"
        )
        header_layout = QtWidgets.QHBoxLayout(header_frame)
        header_layout.addWidget(
            self._styled_label(
                "BẢNG ĐIỀU KHIỂN BẢO VỆ - XE KHÔNG BIỂN SỐ",
                color="#f8fafc",
                size=15,
                bold=True,
            )
        )
        layout.addWidget(header_frame)

        self.lbl_last_barcode = QtWidgets.QLabel("Barcode gần nhất: -")
        self.lbl_last_barcode.setStyleSheet(
            "font-size:14px; font-weight:800; color:#0f172a; "
            "background:#ffffff; border:1px solid #cbd5e1; "
            "border-radius:10px; padding:10px 12px;"
        )
        layout.addWidget(self.lbl_last_barcode)

        # Input ẩn để máy quét barcode vẫn bắn dữ liệu vào được
        self.input = QtWidgets.QLineEdit(self)
        self.input.setFixedSize(1, 1)
        self.input.move(-100, -100)
        self.input.setStyleSheet("border:none; background:transparent; color:transparent;")
        self.input.setFocus()

        row, self.lbl_status = self._row("Trạng thái:")
        layout.addLayout(row)

        row, self.val_vehicle = self._row("Phương tiện:")
        layout.addLayout(row)

        row, self.val_checkin = self._row("Thời điểm vào:")
        layout.addLayout(row)

        row, self.val_checkout = self._row("Thời điểm ra:")
        layout.addLayout(row)

        row, self.val_amount = self._row("Tổng tiền:")
        layout.addLayout(row)

        row, self.val_session_status = self._row("Phiên gửi xe:")
        layout.addLayout(row)

        self.setStyleSheet("""
            QWidget {
                background: #f8fafc;
                color: #0f172a;
                font-size: 14px;
                font-weight: 600;
            }

            QLineEdit {
                background: #ffffff;
                border: 1px solid #cbd5e1;
                border-radius: 10px;
                padding: 8px 12px;
                color: #0f172a;
                font-size: 15px;
                font-weight: 800;
            }

            QLineEdit:focus {
                border: 2px solid #43B14B;
            }

            QLabel {
                color: #0f172a;
            }
        """)

        self.lbl_status.setText("Đang chờ quét barcode...")
        self.val_vehicle.setText(f"{SECURITY_UNLICENSED_VEHICLE_TYPE} / Không biển số")
        self.input.setFocus()

    def _bind(self):
        self.input.returnPressed.connect(self.on_scan)

    def on_scan(self):
        now = time.time()

        if now - self.last_scan_time < LOOKUP_DEBOUNCE_SECONDS:
            return

        token = self.input.text().strip().upper()
        self.input.clear()

        self.lbl_last_barcode.setText(f"Barcode gần nhất: {token}")

        if not token:
            return

        self.last_scan_time = now
        self.lbl_status.setText("Đang xử lý barcode...")

        self.worker = LookupWorker(settings.BACKEND_HOST)
        self.worker.set_token(token)
        self.worker.finished.connect(self.on_result)
        self.worker.start()

    def on_result(self, data: dict):
        if data.get("error"):
            self.lbl_status.setText(data["error"])
            self._reset_values()
            self.input.setFocus()
            return

        self.current_token = data.get("barcode_token")

        self.lbl_status.setText(data.get("message") or "OK")

        vehicle_type = data.get("vehicle_type") or SECURITY_UNLICENSED_VEHICLE_TYPE
        license_plate = data.get("license_plate") or "Không biển số"
        check_in_time = data.get("check_in_time")
        check_out_time = data.get("check_out_time")
        status_text = data.get("status") or "-"

        fee_breakdown = data.get("fee_breakdown") or {}
        total_amount = (
            fee_breakdown.get("total_amount")
            if isinstance(fee_breakdown, dict)
            else None
        )

        if total_amount is None:
            total_amount = data.get("total_amount")

        self.val_vehicle.setText(f"{vehicle_type} / {license_plate}")
        self.val_checkin.setText(self._format_time(check_in_time))
        self.val_checkout.setText(self._format_time(check_out_time))
        self.val_amount.setText(self._format_money(total_amount))
        self.val_session_status.setText(str(status_text))

        self.input.setFocus()

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

    def _reset_values(self):
        self.input.setFocus()
        self.val_vehicle.setText(f"{SECURITY_UNLICENSED_VEHICLE_TYPE} / Không biển số")
        self.val_checkin.setText("-")
        self.val_checkout.setText("-")
        self.val_amount.setText("-")
        self.val_session_status.setText("-")


def main():
    app = QtWidgets.QApplication(sys.argv)
    window = SecurityConsole()
    window.show()
    sys.exit(app.exec())


if __name__ == "__main__":
    main()