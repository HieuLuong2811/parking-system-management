from __future__ import annotations

from io import BytesIO

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas


def _safe_register_font() -> str:
    """
    Register a Unicode-capable font if available.
    On Windows environments, Arial Unicode may exist; otherwise fall back to Helvetica.
    """
    try:
        pdfmetrics.registerFont(TTFont("DejaVuSans", "DejaVuSans.ttf"))
        return "DejaVuSans"
    except Exception:
        return "Helvetica"


def build_invoice_pdf_bytes(
    *,
    project_name: str,
    invoice_id: str,
    user_code: str,
    user_name: str,
    amount_vnd: int,
    start_date: str,
    end_date: str,
) -> bytes:
    """
    Build a simple 1-page invoice PDF (bytes) for email attachment.
    """
    buf = BytesIO()
    page_w, page_h = A4
    c = canvas.Canvas(buf, pagesize=A4)
    font_name = _safe_register_font()

    left = 18 * mm
    top = page_h - 18 * mm
    line_h = 7 * mm

    c.setTitle(f"Invoice {invoice_id}")
    c.setFont(font_name, 16)
    c.drawString(left, top, project_name)

    c.setFont(font_name, 10)
    c.drawString(left, top - 1.2 * line_h, f"Invoice ID: {invoice_id}")
    c.drawString(left, top - 2.2 * line_h, f"User code: {user_code}")
    c.drawString(left, top - 3.2 * line_h, f"Customer: {user_name}")

    c.line(left, top - 4.1 * line_h, page_w - left, top - 4.1 * line_h)

    c.setFont(font_name, 11)
    c.drawString(left, top - 5.2 * line_h, "Billing period:")
    c.setFont(font_name, 10)
    c.drawString(left + 30 * mm, top - 5.2 * line_h, f"{start_date} - {end_date}")

    c.setFont(font_name, 11)
    c.drawString(left, top - 6.4 * line_h, "Amount (VND):")
    c.setFont(font_name, 12)
    c.drawString(left + 30 * mm, top - 6.4 * line_h, f"{amount_vnd:,}")

    c.setFont(font_name, 9)
    c.drawString(left, 18 * mm, "This invoice is generated electronically.")

    c.showPage()
    c.save()
    return buf.getvalue()

