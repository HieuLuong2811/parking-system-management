from __future__ import annotations

import os
from typing import Final

import requests


DEFAULT_BANNER_HOST: Final[str] = "127.0.0.1"
DEFAULT_BANNER_PORT: Final[int] = 8765


def _get_banner_url() -> str:
    host = (os.getenv("SECURITY_BANNER_HOST") or DEFAULT_BANNER_HOST).strip()
    port_raw = (os.getenv("SECURITY_BANNER_PORT") or str(DEFAULT_BANNER_PORT)).strip()
    try:
        port = int(port_raw)
    except Exception:
        port = DEFAULT_BANNER_PORT
    return f"http://{host}:{port}"


def notify_banner_refresh(timeout_seconds: float = 0.3) -> bool:
    """
    Best-effort: notify the local banner process to refresh its data.
    Returns True if the banner acknowledged, False otherwise.
    """
    try:
        res = requests.post(f"{_get_banner_url()}/refresh", timeout=timeout_seconds)
        return bool(res.ok)
    except Exception:
        return False

