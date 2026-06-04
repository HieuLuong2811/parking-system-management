from __future__ import annotations

import os
import sys
from typing import Final

from .banner_client import notify_banner_refresh

BACKEND_DIR: Final[str] = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))


def ensure_backend_on_path() -> str:
    """
    Allow running tools directly from `backend/security_console_tools` (e.g. `python security_console.py`)
    by ensuring `backend/` is on `sys.path` so imports like `from app...` work.
    Returns the resolved backend directory.
    """
    if BACKEND_DIR not in sys.path:
        sys.path.insert(0, BACKEND_DIR)
    return BACKEND_DIR


def refresh_banner_best_effort() -> None:
    """
    Notify the local banner process to refresh KPIs after a successful check-in/out.
    """
    try:
        notify_banner_refresh()
    except Exception:
        pass

