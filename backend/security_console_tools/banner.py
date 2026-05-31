from __future__ import annotations

import json
import os
import sys
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

import requests
from PyQt6 import QtCore, QtWidgets

_BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if _BACKEND_DIR not in sys.path:
    sys.path.insert(0, _BACKEND_DIR)

from app.core.config import settings


def _env_int(name: str, default: int) -> int:
    raw = (os.getenv(name) or "").strip()
    if not raw:
        return default
    try:
        return int(raw)
    except Exception:
        return default


class SummaryFetchWorker(QtCore.QThread):
    success = QtCore.pyqtSignal(dict)
    failed = QtCore.pyqtSignal(str)

    def run(self) -> None:
        try:
            key = (os.getenv("SECURITY_CONSOLE_KEY") or "").strip()
            headers = {"X-Console-Key": key} if key else {}
            url = f"{settings.BACKEND_HOST}/api/v1/statistics/summary_console"

            res = requests.get(url, headers=headers, timeout=4)
            if not res.ok:
                self.failed.emit(f"HTTP {res.status_code}")
                return
            self.success.emit(res.json() or {})
        except Exception as e:
            self.failed.emit(str(e))


class BannerWindow(QtWidgets.QWidget):
    request_refresh = QtCore.pyqtSignal()

    def __init__(self):
        super().__init__()
        self.setWindowTitle("Parking - Banner")
        self.setMinimumSize(860, 190)
        self._worker: SummaryFetchWorker | None = None

        self._build_ui()
        self.request_refresh.connect(self.refresh)
        self.lbl_status.setText("Đang chờ check-in/check-out để cập nhật...")

    def _card(
        self, title: str, subtitle: str, accent: str
    ) -> tuple[QtWidgets.QFrame, QtWidgets.QLabel]:
        frame = QtWidgets.QFrame()
        frame.setObjectName("card")
        frame.setStyleSheet(
            "QFrame#card{background:#fff;border:2px solid "
            + accent
            + ";border-radius:14px;} QLabel{color:#0f172a;}"
            " QLabel#title{font-weight:600;font-size:14px;}"
            " QLabel#value{font-weight:800;font-size:40px;}"
            " QLabel#sub{color:#334155;font-size:12px;}"
        )

        layout = QtWidgets.QVBoxLayout(frame)
        layout.setContentsMargins(18, 14, 18, 14)
        layout.setSpacing(6)

        lbl_title = QtWidgets.QLabel(title)
        lbl_title.setObjectName("title")
        lbl_value = QtWidgets.QLabel("-")
        lbl_value.setObjectName("value")
        lbl_sub = QtWidgets.QLabel(subtitle)
        lbl_sub.setObjectName("sub")

        layout.addWidget(lbl_title)
        layout.addWidget(lbl_value)
        layout.addWidget(lbl_sub)
        layout.addStretch(1)

        return frame, lbl_value

    def _build_ui(self) -> None:
        root = QtWidgets.QVBoxLayout(self)
        root.setContentsMargins(14, 14, 14, 14)
        root.setSpacing(10)

        grid = QtWidgets.QGridLayout()
        grid.setHorizontalSpacing(14)
        grid.setVerticalSpacing(14)

        card1, self.lbl_in_parking = self._card(
            "Xe đang trong bãi",
            "Phiên gửi xe chưa check-out",
            "#22c55e",
        )
        card2, self.lbl_checkins = self._card(
            "Lượt check-in hôm nay",
            "Theo thời gian check-in",
            "#3b82f6",
        )
        card3, self.lbl_checkouts = self._card(
            "Lượt check-out hôm nay",
            "Theo thời gian check-out",
            "#f97316",
        )
        grid.addWidget(card1, 0, 0)
        grid.addWidget(card2, 0, 1)
        grid.addWidget(card3, 0, 2)
        grid.setColumnStretch(0, 1)
        grid.setColumnStretch(1, 1)
        grid.setColumnStretch(2, 1)

        self.lbl_status = QtWidgets.QLabel("Đang tải...")
        self.lbl_status.setStyleSheet("color:#64748b;font-size:12px;")

        root.addLayout(grid)
        root.addWidget(self.lbl_status)

    def refresh(self) -> None:
        if self._worker is not None:
            return

        self.lbl_status.setText("Đang cập nhật...")
        worker = SummaryFetchWorker(self)
        self._worker = worker
        worker.success.connect(self._on_summary)
        worker.failed.connect(self._on_failed)
        worker.finished.connect(worker.deleteLater)
        worker.finished.connect(lambda: setattr(self, "_worker", None))
        worker.start()

    def _on_summary(self, data: dict) -> None:
        self.lbl_in_parking.setText(str(data.get("vehicles_in_parking", 0)))
        self.lbl_checkins.setText(str(data.get("today_checkins", 0)))
        self.lbl_checkouts.setText(str(data.get("today_checkouts", 0)))
        self.lbl_status.setText("Cập nhật xong")

    def _on_failed(self, message: str) -> None:
        self.lbl_status.setText(f"Lỗi tải summary: {message}")


class _BannerHttpHandler(BaseHTTPRequestHandler):
    def do_POST(self):  # noqa: N802
        if self.path.rstrip("/") != "/refresh":
            self.send_response(404)
            self.end_headers()
            return

        try:
            if self.server.banner_window is not None:
                self.server.banner_window.request_refresh.emit()
        except Exception:
            pass

        body = json.dumps({"ok": True}).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, *_args, **_kwargs):
        return


class BannerHttpServer(ThreadingHTTPServer):
    def __init__(self, server_address, RequestHandlerClass, banner_window: BannerWindow):
        super().__init__(server_address, RequestHandlerClass)
        self.banner_window = banner_window


def main() -> int:
    host = (os.getenv("SECURITY_BANNER_HOST") or "127.0.0.1").strip()
    port = _env_int("SECURITY_BANNER_PORT", 8765)

    app = QtWidgets.QApplication([])
    win = BannerWindow()
    win.show()

    httpd = BannerHttpServer((host, port), _BannerHttpHandler, win)
    thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    thread.start()

    code = app.exec()
    try:
        httpd.shutdown()
    except Exception:
        pass
    return int(code)


if __name__ == "__main__":
    raise SystemExit(main())
