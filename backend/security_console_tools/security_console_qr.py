import os
import sys
import time
from datetime import datetime

import requests
from PyQt6 import QtCore, QtGui, QtWidgets

_BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if _BACKEND_DIR not in sys.path:
    sys.path.insert(0, _BACKEND_DIR)

from app.core.config import settings
from security_console_tools.banner_client import notify_banner_refresh


LOOKUP_DEBOUNCE_SECONDS = 0.5
SCAN_BUFFER_RESET_SECONDS = 1.0

SECURITY_UNLICENSED_VEHICLE_TYPE = getattr(
    settings,
    "SECURITY_UNLICENSED_VEHICLE_TYPE",
    "BICYCLE",
).strip().upper()


def normalize_token(value: str | None) -> str:
    return (value or "").strip().upper()


class LookupWorker(QtCore.QThread):
    finished = QtCore.pyqtSignal(dict)

    def __init__(
        self,
        backend_host: str,
        *,
        mode: str = "preview",
        payload: dict | None = None,
        parent=None,
    ):
        super().__init__(parent)
        self.backend_host = backend_host.rstrip("/")
        self.mode = mode
        self.payload = payload or {}

    def run(self):
        token = normalize_token(self.payload.get("barcode_token"))

        if not token:
            self.finished.emit({"error": "Barcode không hợp lệ"})
            return

        endpoint = "preview" if self.mode == "preview" else "confirm"

        try:
            res = requests.post(
                f"{self.backend_host}/api/v1/parking_sessions/access/{endpoint}",
                json=self.payload,
                timeout=6,
            )

            if res.status_code == 200:
                data = res.json()
                data["barcode_token"] = token
                data["_payload"] = self.payload
                data["_mode"] = self.mode
                self.finished.emit(data)
                return

            if res.status_code == 404:
                self.finished.emit({"error": "Thẻ gửi xe không tồn tại"})
                return

            try:
                detail = res.json().get("detail")
            except Exception:
                detail = res.text

            self.finished.emit({"error": detail or "Xử lý thất bại"})

        except requests.Timeout:
            self.finished.emit({"error": "Kết nối quá thời gian chờ"})
        except Exception as e:
            self.finished.emit({"error": str(e)})


class SecurityConsole(QtWidgets.QWidget):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Security Console QR - Xe không biển số")

        self.last_scan_time = 0.0
        self.current_token: str | None = None
        self.worker: LookupWorker | None = None

        # Buffer để bắt barcode toàn cửa sổ, không phụ thuộc hoàn toàn vào QLineEdit ẩn.
        self.scan_buffer = ""
        self.scan_last_key_time = 0.0

        self.pending_access_payload: dict | None = None
        self.pending_preview_data: dict | None = None
        self.pending_gate_action_allowed = False
        self.pending_auto_confirm = False
        self.is_submitting = False

        self._build_ui()
        self._bind()
        self._set_status("ĐANG CHỜ QUÉT THẺ", "info", "Quét thẻ gửi xe để kiểm tra thông tin xe không biển số.")

    # =========================
    # UI
    # =========================

    def _build_ui(self):
        self.setMinimumWidth(640)
        self.setFixedWidth(680)
        self.setWindowFlag(QtCore.Qt.WindowType.WindowMaximizeButtonHint, False)

        # Cho phép QWidget chính nhận keyPressEvent.
        self.setFocusPolicy(QtCore.Qt.FocusPolicy.StrongFocus)

        root = QtWidgets.QVBoxLayout(self)
        root.setContentsMargins(18, 18, 18, 18)
        root.setSpacing(12)

        self.header_frame = QtWidgets.QFrame()
        self.header_frame.setObjectName("headerFrame")
        header_layout = QtWidgets.QVBoxLayout(self.header_frame)
        header_layout.setContentsMargins(18, 16, 18, 16)

        self.lbl_title = QtWidgets.QLabel("BẢNG ĐIỀU KHIỂN BẢO VỆ")
        self.lbl_title.setObjectName("titleLabel")
        self.lbl_title.setAttribute(QtCore.Qt.WidgetAttribute.WA_TranslucentBackground, True)

        self.lbl_subtitle = QtWidgets.QLabel("CỔNG CHO XE KHÔNG BIỂN SỐ • QUÉT THẺ GỬI XE")
        self.lbl_subtitle.setObjectName("subtitleLabel")
        self.lbl_subtitle.setAttribute(QtCore.Qt.WidgetAttribute.WA_TranslucentBackground, True)

        header_layout.addWidget(self.lbl_title)
        header_layout.addWidget(self.lbl_subtitle)
        root.addWidget(self.header_frame)

        self.lbl_gate_banner = QtWidgets.QLabel("ĐANG CHỜ QUÉT THẺ")
        self.lbl_gate_banner.setObjectName("gateBanner")
        self.lbl_gate_banner.setAlignment(QtCore.Qt.AlignmentFlag.AlignCenter)
        self.lbl_gate_banner.setMinimumHeight(64)
        root.addWidget(self.lbl_gate_banner)

        self.lbl_detail_status = QtWidgets.QLabel("Quét thẻ gửi xe để kiểm tra thông tin.")
        self.lbl_detail_status.setObjectName("detailStatus")
        self.lbl_detail_status.setWordWrap(True)
        self.lbl_detail_status.setMinimumHeight(42)
        root.addWidget(self.lbl_detail_status)

        self.lbl_last_barcode = QtWidgets.QLabel("Mã thẻ gửi xe gần nhất: -")
        self.lbl_last_barcode.setObjectName("lastBarcode")
        root.addWidget(self.lbl_last_barcode)

        info_frame = QtWidgets.QFrame()
        info_frame.setObjectName("infoFrame")
        info_layout = QtWidgets.QGridLayout(info_frame)
        info_layout.setContentsMargins(16, 14, 16, 14)
        info_layout.setHorizontalSpacing(14)
        info_layout.setVerticalSpacing(10)

        self.val_vehicle = self._add_info_row(info_layout, 0, "Phương tiện")
        self.val_user_name = self._add_info_row(info_layout, 1, "Tên người dùng")
        self.val_user_code = self._add_info_row(info_layout, 2, "Mã người dùng")
        self.val_subscription = self._add_info_row(info_layout, 3, "vé gửi xe")
        self.val_checkin = self._add_info_row(info_layout, 4, "Thời điểm vào")
        self.val_checkout = self._add_info_row(info_layout, 5, "Thời điểm ra")
        self.val_amount = self._add_info_row(info_layout, 6, "Tổng tiền")
        self.val_session_status = self._add_info_row(info_layout, 7, "Phiên gửi xe")

        root.addWidget(info_frame)

        hint_frame = QtWidgets.QFrame()
        hint_frame.setObjectName("hintFrame")
        hint_layout = QtWidgets.QHBoxLayout(hint_frame)
        hint_layout.setContentsMargins(14, 10, 14, 10)

        self.lbl_hint = QtWidgets.QLabel("Phím tắt: SPACE để bảo vệ xác nhận khi hệ thống yêu cầu.")
        self.lbl_hint.setObjectName("hintLabel")
        self.lbl_hint.setWordWrap(True)
        hint_layout.addWidget(self.lbl_hint)

        root.addWidget(hint_frame)

        # Input ẩn để máy quét barcode bắn dữ liệu vào nếu focus vẫn nằm ở input.
        self.input = QtWidgets.QLineEdit(self)
        self.input.setFixedSize(1, 1)
        self.input.move(-100, -100)
        self.input.setObjectName("hiddenInput")
        self.input.setFocusPolicy(QtCore.Qt.FocusPolicy.StrongFocus)

        self._apply_styles()
        self._reset_values()
        self._set_idle()

    def _add_info_row(
        self,
        layout: QtWidgets.QGridLayout,
        row: int,
        label: str,
    ) -> QtWidgets.QLabel:
        lbl = QtWidgets.QLabel(f"{label}:")
        lbl.setObjectName("infoLabel")
        lbl.setMinimumWidth(150)

        value = QtWidgets.QLabel("-")
        value.setObjectName("infoValue")
        value.setWordWrap(True)
        value.setTextInteractionFlags(QtCore.Qt.TextInteractionFlag.TextSelectableByMouse)

        layout.addWidget(lbl, row, 0)
        layout.addWidget(value, row, 1)

        return value

    def _apply_styles(self):
        self.setStyleSheet("""
            QWidget {
                background: #eef2f7;
                color: #0f172a;
                font-family: "Segoe UI";
                font-size: 14px;
                font-weight: 600;
            }

            QLabel {
                background: transparent;
                border: none;
            }

            QFrame#headerFrame {
                background: #0f172a;
                border: none;
                border-radius: 18px;
            }

            QLabel#titleLabel {
                background: transparent;
                color: #ffffff;
                font-size: 22px;
                font-weight: 900;
                letter-spacing: 1px;
                padding: 0;
                margin: 0;
            }

            QLabel#subtitleLabel {
                background: transparent;
                color: #94a3b8;
                font-size: 13px;
                font-weight: 800;
                padding: 0;
                margin: 0;
            }

            QLabel#gateBanner {
                background: #1e293b;
                color: #facc15;
                border: none;
                border-radius: 18px;
                font-size: 28px;
                font-weight: 900;
                letter-spacing: 1px;
                padding: 10px 14px;
            }

            QLabel#detailStatus {
                background: #ffffff;
                color: #334155;
                border: 1px solid #dbe3ef;
                border-radius: 14px;
                padding: 10px 12px;
                font-size: 14px;
                font-weight: 700;
            }

            QLabel#lastBarcode {
                background: #ffffff;
                color: #0f172a;
                border: 1px solid #cbd5e1;
                border-radius: 14px;
                padding: 12px 14px;
                font-size: 15px;
                font-weight: 900;
            }

            QFrame#infoFrame {
                background: #ffffff;
                border: 1px solid #dbe3ef;
                border-radius: 18px;
            }

            QLabel#infoLabel {
                background: transparent;
                color: #64748b;
                font-size: 14px;
                font-weight: 800;
                padding: 4px 0;
            }

            QLabel#infoValue {
                background: transparent;
                color: #0f172a;
                font-size: 15px;
                font-weight: 800;
                padding: 4px 0;
            }

            QLabel#amountValue {
                background: transparent;
                color: #16a34a;
                font-size: 20px;
                font-weight: 900;
                padding: 4px 0;
            }

            QFrame#hintFrame {
                background: #f8fafc;
                border: 1px dashed #94a3b8;
                border-radius: 14px;
            }

            QLabel#hintLabel {
                background: transparent;
                color: #475569;
                font-size: 13px;
                font-weight: 700;
            }

            QLineEdit#hiddenInput {
                border: none;
                background: transparent;
                color: transparent;
                selection-background-color: transparent;
                selection-color: transparent;
            }
        """)

        self.val_amount.setObjectName("amountValue")
        self.val_amount.style().unpolish(self.val_amount)
        self.val_amount.style().polish(self.val_amount)

    def _bind(self):
        # Vẫn giữ cách cũ: nếu scanner bắn vào input ẩn và kết thúc bằng Enter.
        self.input.returnPressed.connect(self.on_scan)

        self.shortcut_confirm_gate = QtGui.QShortcut(
            QtGui.QKeySequence(QtCore.Qt.Key.Key_Space),
            self,
        )
        self.shortcut_confirm_gate.setContext(
            QtCore.Qt.ShortcutContext.ApplicationShortcut
        )
        self.shortcut_confirm_gate.activated.connect(self.confirm_pending_gate_action)

    # =========================
    # Keyboard / Barcode capture
    # =========================

    def keyPressEvent(self, event: QtGui.QKeyEvent):
        key = event.key()
        text = event.text()

        # SPACE chỉ dùng để xác nhận, không đưa vào barcode buffer.
        if key == QtCore.Qt.Key.Key_Space:
            self.confirm_pending_gate_action()
            event.accept()
            return

        # Máy quét thường kết thúc bằng Enter/Return/Tab.
        if key in {
            QtCore.Qt.Key.Key_Return,
            QtCore.Qt.Key.Key_Enter,
            QtCore.Qt.Key.Key_Tab,
        }:
            token = normalize_token(self.scan_buffer)
            self.scan_buffer = ""

            # Nếu buffer toàn cửa sổ rỗng, thử lấy từ input ẩn.
            if not token:
                token = normalize_token(self.input.text())
                self.input.clear()

            if token:
                self._handle_scanned_token(token)
                event.accept()
                return

        # Bỏ qua phím chức năng, Shift, Ctrl, Alt, mũi tên...
        if not text or len(text) != 1:
            super().keyPressEvent(event)
            return

        now = time.time()

        # Nếu nhập quá chậm, coi như lượt scan/gõ mới.
        if now - self.scan_last_key_time > SCAN_BUFFER_RESET_SECONDS:
            self.scan_buffer = ""

        self.scan_last_key_time = now
        self.scan_buffer += text

        super().keyPressEvent(event)

    # =========================
    # Status helpers
    # =========================

    def _set_status(self, banner: str, level: str, detail: str | None = None):
        banner = (banner or "ĐANG CHỜ").strip().upper()
        detail = detail or ""

        bg_map = {
            "success": "#14532d",
            "warning": "#422006",
            "error": "#450a0a",
            "info": "#1e293b",
            "processing": "#1e293b",
        }

        color_map = {
            "success": "#facc15",
            "warning": "#facc15",
            "error": "#fb7185",
            "info": "#facc15",
            "processing": "#fde047",
        }

        bg = bg_map.get(level, "#1e293b")
        color = color_map.get(level, "#facc15")

        self.lbl_gate_banner.setText(banner)
        self.lbl_gate_banner.setStyleSheet(f"""
            QLabel#gateBanner {{
                background: {bg};
                color: {color};
                border: none;
                border-radius: 18px;
                font-size: 28px;
                font-weight: 900;
                letter-spacing: 1px;
                padding: 10px 14px;
            }}
        """)

        if detail:
            self.lbl_detail_status.setText(detail)

        QtWidgets.QApplication.processEvents()

    def _set_busy(self, text: str = "ĐANG XỬ LÝ"):
        self._set_status(text, "processing", "Hệ thống đang xử lý, vui lòng chờ...")
        self.input.setEnabled(False)

    def _set_idle(self):
        self.input.setEnabled(True)
        self.input.clear()

        # Cố gắng lấy lại focus để scanner bắn vào app ổn định hơn.
        self.activateWindow()
        self.raise_()
        self.setFocus(QtCore.Qt.FocusReason.OtherFocusReason)
        self.input.setFocus(QtCore.Qt.FocusReason.OtherFocusReason)

    # =========================
    # Scan / preview / confirm
    # =========================

    def on_scan(self):
        token = normalize_token(self.input.text())
        self.input.clear()

        if not token:
            self._set_idle()
            return

        self._handle_scanned_token(token)

    def _handle_scanned_token(self, token: str):
        if self.is_submitting:
            self._set_status(
                "ĐANG XỬ LÝ",
                "processing",
                "Đang có thao tác xử lý, vui lòng chờ.",
            )
            return

        now = time.time()

        if now - self.last_scan_time < LOOKUP_DEBOUNCE_SECONDS:
            return

        token = normalize_token(token)

        if not token:
            self._set_idle()
            return

        self.last_scan_time = now
        self.current_token = token

        self._clear_pending()
        self._reset_values(keep_barcode=True)

        self.lbl_last_barcode.setText(f"Mã thẻ gửi xe gần nhất: {token}")
        self._set_busy("ĐANG KIỂM TRA")

        payload = self._build_access_payload(token)

        self.worker = LookupWorker(
            settings.BACKEND_HOST,
            mode="preview",
            payload=payload,
        )
        self.worker.finished.connect(self.on_preview_result)
        self.worker.start()

    def on_preview_result(self, data: dict):
        self.is_submitting = False
        self._set_idle()

        if data.get("error"):
            self._clear_pending()
            self._reset_values(keep_barcode=True)
            self._set_status("TỪ CHỐI", "error", data["error"])
            return

        self.current_token = data.get("barcode_token")
        self.pending_preview_data = data

        self._render_result(data)

        message = data.get("message") or "OK"
        can_confirm = bool(data.get("can_confirm"))
        auto_confirm = bool(data.get("auto_confirm"))
        action = str(data.get("action") or "").upper()
        total_amount = self._get_total_amount_from_data(data)

        if can_confirm and auto_confirm:
            self.pending_auto_confirm = True
            self.pending_access_payload = data.get("_payload") or self._build_access_payload(self.current_token)
            self.pending_access_payload["payment_source"] = data.get("payment_source")

            payment_source = str(data.get("payment_source") or "").upper()

            if action == "CHECK_IN":
                self._set_status(
                    "TỰ ĐỘNG CHO XE VÀO",
                    "success",
                    f"{message} - Hệ thống tự động xác nhận.",
                )
            elif action == "CHECK_OUT":
                if payment_source == "WALLET":
                    self._set_status(
                        "ĐANG TRỪ VÍ",
                        "success",
                        f"{message} - Hệ thống đang tự động trừ ví và cho xe ra.",
                    )
                elif payment_source in {"SUBSCRIPTION", "SYSTEM"}:
                    self._set_status(
                        "TỰ ĐỘNG CHO XE RA",
                        "success",
                        f"{message} - Hệ thống tự động xác nhận.",
                    )
                else:
                    self._set_status(
                        "TỰ ĐỘNG CHO XE RA",
                        "success",
                        f"{message} - Hệ thống tự động xác nhận.",
                    )
            else:
                self._set_status(
                    "TỰ ĐỘNG MỞ CỔNG",
                    "success",
                    f"{message} - Hệ thống tự động xác nhận.",
                )

            QtCore.QTimer.singleShot(350, self.auto_confirm_current_token)
            return

        if can_confirm:
            self.pending_access_payload = data.get("_payload") or self._build_access_payload(self.current_token)
            self.pending_access_payload["payment_source"] = data.get("payment_source")
            self.pending_gate_action_allowed = True

            if action == "CHECK_IN":
                self._set_status(
                    "CHO PHÉP XE VÀO",
                    "warning",
                    f"{message} - Nhấn SPACE để bảo vệ xác nhận cho xe vào.",
                )
            elif action == "CHECK_OUT":
                payment_source = str(data.get("payment_source") or "").upper()

                if payment_source == "CASH":
                    self._set_status(
                        "THU TIỀN MẶT",
                        "warning",
                        f"{message} - Tổng tiền {self._format_money(total_amount)}. Thu tiền xong nhấn SPACE để cho xe ra.",
                    )
                elif total_amount > 0:
                    self._set_status(
                        "THU PHÍ",
                        "warning",
                        f"{message} - Tổng tiền {self._format_money(total_amount)}. Nhấn SPACE để xác nhận.",
                    )
                else:
                    self._set_status(
                        "CHO PHÉP XE RA",
                        "warning",
                        f"{message} - Nhấn SPACE để bảo vệ xác nhận cho xe ra.",
                    )
            else:
                self._set_status(
                    "CHỜ XÁC NHẬN",
                    "warning",
                    f"{message} - Nhấn SPACE để xác nhận.",
                )

            return

        self._clear_pending()
        self._set_status(
            "KHÔNG ĐỦ ĐIỀU KIỆN",
            "error",
            message or "Không đủ điều kiện xác nhận.",
        )

    def auto_confirm_current_token(self):
        if not self.current_token:
            return

        self._confirm_token(self.current_token, triggered_by="AUTO")

    def confirm_pending_gate_action(self):
        if self.is_submitting:
            return

        if not self.pending_gate_action_allowed or not self.current_token:
            self._set_status(
                "CHƯA CÓ LƯỢT HỢP LỆ",
                "warning",
                "Chưa có lượt xe hợp lệ để xác nhận. Vui lòng quét thẻ trước.",
            )
            self._set_idle()
            return

        self._confirm_token(self.current_token, triggered_by="SPACE")

    def _confirm_token(self, token: str, *, triggered_by: str):
        if self.is_submitting:
            return

        payload = self.pending_access_payload or self._build_access_payload(token)

        self.is_submitting = True

        if triggered_by == "SPACE":
            self._set_status(
                "ĐÃ NHẬN PHÍM SPACE",
                "processing",
                "Bảo vệ đã xác nhận. Đang gửi yêu cầu cho xe ra/vào...",
            )
        else:
            self._set_status(
                "ĐANG XÁC NHẬN",
                "processing",
                "Hệ thống đang tự động xác nhận cho xe ra/vào...",
            )

        self.input.setEnabled(False)

        self.worker = LookupWorker(
            settings.BACKEND_HOST,
            mode="confirm",
            payload=payload,
        )
        self.worker.finished.connect(self.on_confirm_result)
        self.worker.start()

    def on_confirm_result(self, data: dict):
        self.is_submitting = False
        self._set_idle()

        if data.get("error"):
            self._set_status("THẤT BẠI", "error", data["error"])
            return

        self._render_result(data)

        message = data.get("message") or "OK"
        msg_lower = message.lower()

        if "đã trừ ví" in msg_lower:
            self._set_status(
                "ĐÃ TRỪ VÍ - CHO PHÉP XE RA",
                "success",
                f"Đã xác nhận: {message}",
            )
        elif "đã thu tiền mặt" in msg_lower:
            self._set_status(
                "ĐÃ THU TIỀN MẶT - CHO PHÉP XE RA",
                "success",
                f"Đã xác nhận: {message}",
            )
        elif "cho phép xe vào" in msg_lower:
            self._set_status("CHO PHÉP XE VÀO", "success", f"Đã xác nhận: {message}")
        elif "cho phép xe ra" in msg_lower:
            self._set_status("CHO PHÉP XE RA", "success", f"Đã xác nhận: {message}")
        else:
            self._set_status("THÀNH CÔNG", "success", f"Đã xác nhận: {message}")

        self._clear_pending()

        # Best-effort refresh banner KPIs after a successful check-in/out.
        notify_banner_refresh()

    # =========================
    # Data helpers
    # =========================

    def _build_access_payload(self, token: str) -> dict:
        return {
            "barcode_token": normalize_token(token),
            "vehicle_mode": "UNLICENSED",
            "vehicle_type": SECURITY_UNLICENSED_VEHICLE_TYPE,
            "license_plate": None,
            "payment_source": None,
        }

    def _clear_pending(self):
        self.pending_access_payload = None
        self.pending_preview_data = None
        self.pending_gate_action_allowed = False
        self.pending_auto_confirm = False

    def _render_result(self, data: dict):
        vehicle_type = data.get("vehicle_type") or SECURITY_UNLICENSED_VEHICLE_TYPE
        license_plate = data.get("license_plate") or "Không biển số"

        user_name = (data.get("user_full_name") or "").strip() or "-"
        user_code = (data.get("user_code") or "").strip() or "-"

        sub_plan_code = (data.get("subscription_plan_code") or "").strip()
        sub_status = (data.get("subscription_status") or "").strip()
        subscription_text = "-"

        if sub_plan_code or sub_status:
            subscription_text = f"{self._vi_plan_name(sub_plan_code)} ({self._vi_subscription_status(sub_status)})"

        check_in_time = data.get("check_in_time")
        check_out_time = data.get("check_out_time")
        status_text = data.get("status") or "-"

        total_amount = self._get_total_amount_from_data(data)

        self.val_vehicle.setText(f"{vehicle_type} / {license_plate}")
        self.val_user_name.setText(user_name)
        self.val_user_code.setText(user_code)
        self.val_subscription.setText(subscription_text)
        self.val_checkin.setText(self._format_time(check_in_time))
        self.val_checkout.setText(self._format_time(check_out_time))
        self.val_amount.setText(self._format_money(total_amount))
        self.val_session_status.setText(self._vi_session_status(str(status_text)))

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

    def _vi_session_status(self, code: str) -> str:
        if code and "." in code:
            code = code.split(".")[-1]

        mapping = {
            "ACTIVE": "Đang gửi",
            "DONE": "Đã hoàn tất",
        }

        return mapping.get(code, code or "-")

    def _vi_subscription_status(self, code: str) -> str:
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

    def _vi_plan_name(self, code: str) -> str:
        if code and "." in code:
            code = code.split(".")[-1]

        mapping = {
            "BASIC": "Vé gửi xe cơ bản",
            "STARTUP": "Vé gửi xe linh hoạt",
            "ENTERPRISE": "Vé gửi xe toàn diện",
        }

        return mapping.get(code, code or code or "-")

    def _reset_values(self, *, keep_barcode: bool = False):
        if not keep_barcode:
            self.lbl_last_barcode.setText("Mã thẻ gửi xe gần nhất: -")

        self.val_vehicle.setText(f"{SECURITY_UNLICENSED_VEHICLE_TYPE} / Không biển số")
        self.val_user_name.setText("-")
        self.val_user_code.setText("-")
        self.val_subscription.setText("-")
        self.val_checkin.setText("-")
        self.val_checkout.setText("-")
        self.val_amount.setText("-")
        self.val_session_status.setText("-")

    def closeEvent(self, event: QtGui.QCloseEvent):
        if self.worker and self.worker.isRunning():
            self.worker.quit()
            self.worker.wait(1000)

        super().closeEvent(event)


def main():
    app = QtWidgets.QApplication(sys.argv)
    window = SecurityConsole()
    window.show()
    sys.exit(app.exec())


if __name__ == "__main__":
    main()
