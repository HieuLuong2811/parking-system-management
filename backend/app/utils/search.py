from __future__ import annotations

from typing import Any

from sqlmodel import func


def ilike_unaccent(column: Any, value: str):
    """
    Accent-insensitive, case-insensitive LIKE for Postgres.

    The caller should supply a non-empty search string; this helper ensures
    both the column and pattern are passed through `unaccent`/`lower`
    before matching.
    """

    normalized = (value or "").strip().lower()
    pattern = func.unaccent(f"%{normalized}%")
    return func.unaccent(func.lower(column)).like(pattern)
