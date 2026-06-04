from __future__ import annotations

from datetime import datetime
from typing import Any

import requests
from PyQt6 import QtCore

from app.core.config import settings


def normalize_token(value: str | None) -> str:
    return (value or "").strip().upper()


def format_time(value: object) -> str:
    if not value:
        return "-"

    if isinstance(value, str):
        try:
            dt = datetime.fromisoformat(value.replace("Z", "+00:00"))
            if dt.tzinfo is not None:
                dt = dt.astimezone().replace(tzinfo=None)
            return dt.strftime("%H:%M:%S %d/%m/%Y")
        except ValueError:
            return value

    if isinstance(value, datetime):
        return value.strftime("%H:%M:%S %d/%m/%Y")

    return str(value)


def format_money(amount: object) -> str:
    if amount is None or amount == "":
        return "-"

    try:
        value = int(float(amount))
    except (TypeError, ValueError):
        return str(amount)

    return f"{value:,} VND".replace(",", ".")


def get_total_amount_from_data(data: dict) -> int:
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


def vi_session_status(code: str) -> str:
    if code and "." in code:
        code = code.split(".")[-1]

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


def build_access_payload(
    barcode_token: str,
    *,
    vehicle_mode: str,
    vehicle_type: str | None = None,
    license_plate: str | None = None,
    plate_image_url: str | None = None,
    plate_image_base64: str | None = None,
    payment_source: str | None = None,
) -> dict[str, Any]:
    payload = {
        "barcode_token": normalize_token(barcode_token),
        "vehicle_mode": vehicle_mode,
        "license_plate": license_plate,
        "payment_source": payment_source,
    }

    if vehicle_type:
        payload["vehicle_type"] = vehicle_type

    if plate_image_url:
        payload["plate_image_url"] = plate_image_url

    if plate_image_base64:
        payload["plate_image_base64"] = plate_image_base64

    return payload


class AccessApiWorker(QtCore.QThread):
    success = QtCore.pyqtSignal(str, dict)
    failed = QtCore.pyqtSignal(str, object)

    def __init__(
        self,
        mode: str,
        payload: dict,
        *,
        backend_host: str | None = None,
        parent=None,
    ):
        super().__init__(parent)
        self.mode = mode
        self.payload = payload.copy() if payload else {}
        self.backend_host = (backend_host or settings.BACKEND_HOST).rstrip("/")

    def run(self) -> None:
        token = normalize_token(self.payload.get("barcode_token"))

        if not token:
            self.failed.emit("Barcode không hợp lệ", None)
            return

        if self.mode not in {"preview", "confirm"}:
            self.failed.emit("Loại xử lý không hợp lệ.", None)
            return

        try:
            url = f"{self.backend_host}/api/v1/parking_sessions/access/{self.mode}"

            res = requests.post(
                url,
                json=self.payload,
                timeout=6,
            )

            if res.ok:
                data = res.json() or {}
                data["barcode_token"] = token
                data["_payload"] = self.payload
                data["_mode"] = self.mode
                self.success.emit(self.mode, data)
                return

            if res.status_code == 404:
                self.failed.emit("Thẻ gửi xe không tồn tại", None)
                return

            try:
                detail = res.json().get("detail")
            except Exception:
                detail = res.text

            self.failed.emit(str(detail or "Xử lý thất bại"), detail)

        except requests.Timeout:
            self.failed.emit("Kết nối quá thời gian chờ", None)
        except Exception as e:
            self.failed.emit(str(e), None)
