from __future__ import annotations

import re
import unicodedata

_ALNUM_RE = re.compile(r"[^A-Z0-9]+")


def normalize_barcode_token(value: str | None) -> str:
    """
    Normalize barcode tokens coming from scanners/OCR.

    Some inputs may include diacritics (e.g. 'Ú' instead of 'U'). We:
    - Trim
    - Unicode NFKD normalize
    - Strip combining marks
    - Uppercase
    - Remove any non A-Z0-9 characters
    """

    raw = (value or "").strip()
    if not raw:
        return ""

    decomposed = unicodedata.normalize("NFKD", raw)
    without_marks = "".join(ch for ch in decomposed if not unicodedata.combining(ch))
    upper = without_marks.upper()
    return _ALNUM_RE.sub("", upper)

