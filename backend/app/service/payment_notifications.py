from datetime import datetime
import logging
import smtplib
import ssl
from email.message import EmailMessage
from typing import TypedDict

from app.core.config import settings
from app.models.invoices import Invoice
from app.models.subscriptions import UserSubscription
from app.models.users import Users
from app.utils.email import render_email_template
from app.utils.invoice_pdf import build_invoice_pdf_bytes
from app.scheduler.utils import DEFAULT_TZ

logger = logging.getLogger(__name__)

class EmailAttachment(TypedDict):
    filename: str
    content: bytes
    maintype: str
    subtype: str


_BILLING_SUCCESS_SUBJECTS: dict[str, str] = {
    "en": "[{project_name}] Billing success - Invoice {invoice_id}",
    "vi": "[{project_name}] Thanh toán thành công - Invoice {invoice_id}",
    "th": "[{project_name}] ชำระเงินสำเร็จ - Invoice {invoice_id}",
}

_BILLING_FAILED_SUBJECTS: dict[str, str] = {
    "en": "[{project_name}] Billing failed - Invoice {invoice_id}",
    "vi": "[{project_name}] Thanh toán thất bại - Invoice {invoice_id}",
    "th": "[{project_name}] ชำระเงินไม่สำเร็จ - Invoice {invoice_id}",
}

_ADMIN_BILLING_REPORT_SUBJECTS: dict[str, str] = {
    "en": "[{project_name}] Overdue subscription billing report - {report_date}",
    "vi": "[{project_name}] Báo cáo gói gửi xe chưa thanh toán đúng hạn - {report_date}",
    "th": "[{project_name}] รายงานแพ็กเกจที่จอดรถค้างชำระ - {report_date}",
}

_ADMIN_BILLING_FAILURE_ALERT_SUBJECTS: dict[str, str] = {
    "en": "[{project_name}] Subscription suspended - Invoice {invoice_id}",
    "vi": "[{project_name}] Gói gửi xe bị tạm ngưng - Invoice {invoice_id}",
    "th": "[{project_name}] แพ็กเกจถูกระงับ - Invoice {invoice_id}",
}

def _iter_billing_recipients(user: Users) -> list[str]:
    recipients: list[str] = []
    if user.email:
        recipients.append(str(user.email))
    # Default "admin" recipient: the first superuser email.
    if settings.FIRST_SUPERUSER:
        recipients.append(str(settings.FIRST_SUPERUSER))
    # De-duplicate while preserving order.
    seen: set[str] = set()
    unique: list[str] = []
    for email in recipients:
        if email and email not in seen:
            seen.add(email)
            unique.append(email)
    return unique


def _send_smtp_message(
    *,
    to_email: str,
    subject: str,
    body: str,
    html_body: str | None = None,
    attachments: list[EmailAttachment] | None = None,
) -> None:
    from_name = settings.EMAILS_FROM_NAME or settings.PROJECT_NAME
    from_email = settings.EMAILS_FROM_EMAIL

    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = f"{from_name} <{from_email}>"
    message["To"] = to_email
    message.set_content(body)

    if html_body:
        message.add_alternative(html_body, subtype="html")

    for attachment in attachments or []:
        message.add_attachment(
            attachment["content"],
            maintype=attachment["maintype"],
            subtype=attachment["subtype"],
            filename=attachment["filename"],
        )

    context = ssl.create_default_context()

    if settings.SMTP_SSL:
        server = smtplib.SMTP_SSL(
            settings.SMTP_HOST,
            settings.SMTP_PORT,
            context=context,
            timeout=10,
        )
    else:
        server = smtplib.SMTP(
            settings.SMTP_HOST,
            settings.SMTP_PORT,
            timeout=10,
        )

    with server as smtp:
        if settings.SMTP_TLS and not settings.SMTP_SSL:
            smtp.starttls(context=context)

        if settings.SMTP_USER and settings.SMTP_PASSWORD:
            smtp.login(settings.SMTP_USER, settings.SMTP_PASSWORD)

        smtp.send_message(message)

def send_billing_success_email(user: Users, invoice: Invoice, subscription: UserSubscription) -> None:
    """
    Send billing success email to the user + admin (FIRST_SUPERUSER).
    """
    if not settings.emails_enabled:
        logger.debug("Email is disabled; skipping billing success email for invoice %s", invoice.id)
        return

    recipients = _iter_billing_recipients(user)
    if not recipients:
        logger.warning("No email recipients available for billing success invoice %s", invoice.id)
        return

    selected_lang = (user.language_use or settings.DEFAULT_EMAIL_LANG or "vi").lower()
    subject_template = _BILLING_SUCCESS_SUBJECTS.get(selected_lang, _BILLING_SUCCESS_SUBJECTS["en"])
    subject = subject_template.format(project_name=settings.PROJECT_NAME, invoice_id=invoice.id)
    amount_text = f"{invoice.amount:,}"

    html_content = render_email_template(
        template_name="billing_success.html",
        lang=selected_lang,
        context={
            "project_name": settings.PROJECT_NAME,
            "user_name": user.full_name,
            "invoice_id": str(invoice.id),
            "amount_text": amount_text,
            "start_date": str(subscription.start_date),
            "end_date": str(subscription.end_date),
        },
    )

    body = f"Invoice {invoice.id} paid successfully. Amount: {amount_text} VND."

    for to_email in recipients:
        try:
            _send_smtp_message(to_email=to_email, subject=subject, body=body, html_body=html_content)
        except Exception as exc:
            logger.exception(
                "Failed to send billing success email to %s for invoice %s: %s",
                to_email,
                invoice.id,
                exc,
            )


def send_billing_failed_email(
    *,
    user: Users,
    invoice: Invoice,
    subscription: UserSubscription,
    attempt_number: int,
    error_message: str,
    suspended: bool,
) -> None:
    """
    Send billing failed email to the user + admin (FIRST_SUPERUSER).
    """
    if not settings.emails_enabled:
        logger.debug("Email is disabled; skipping billing failed email for invoice %s", invoice.id)
        return

    recipients = _iter_billing_recipients(user)
    if not recipients:
        logger.warning("No email recipients available for billing failed invoice %s", invoice.id)
        return

    selected_lang = (user.language_use or settings.DEFAULT_EMAIL_LANG or "vi").lower()
    subject_template = _BILLING_FAILED_SUBJECTS.get(selected_lang, _BILLING_FAILED_SUBJECTS["en"])
    subject = subject_template.format(project_name=settings.PROJECT_NAME, invoice_id=invoice.id)
    amount_text = f"{invoice.amount:,}"
    status_text = "SUSPENDED" if suspended else "RETRYING"

    html_content = render_email_template(
        template_name="billing_failed.html",
        lang=selected_lang,
        context={
            "project_name": settings.PROJECT_NAME,
            "user_name": user.full_name,
            "invoice_id": str(invoice.id),
            "amount_text": amount_text,
            "attempt_number": attempt_number,
            "error_message": error_message,
            "status_text": status_text,
            "start_date": str(subscription.start_date),
            "end_date": str(subscription.end_date),
        },
    )

    body = (
        f"Invoice {invoice.id} payment failed (attempt {attempt_number}). "
        f"Reason: {error_message}. Status: {status_text}."
    )

    for to_email in recipients:
        try:
            _send_smtp_message(to_email=to_email, subject=subject, body=body, html_body=html_content)
        except Exception as exc:
            logger.exception(
                "Failed to send billing failed email to %s for invoice %s: %s",
                to_email,
                invoice.id,
                exc,
            )


def send_payment_confirmation_email(user: Users, invoice: Invoice, subscription: UserSubscription) -> None:
    if not settings.emails_enabled:
        logger.debug("Email is disabled; skipping receipt for invoice %s", invoice.id)
        return
    if not user.email:
        logger.warning("User %s does not have an email address; cannot send receipt", user.user_code)
        return

    from_name = settings.EMAILS_FROM_NAME or settings.PROJECT_NAME
    from_email = settings.EMAILS_FROM_EMAIL
    subject = f"[{settings.PROJECT_NAME}] Payment received - Invoice {invoice.id}"
    amount_text = f"{invoice.amount:,}"

    html_content = render_email_template(
        template_name="payment_confirmation.html",
        lang=user.language_use,
        context={
            "project_name": settings.PROJECT_NAME,
            "user_name": user.full_name,
            "invoice_id": str(invoice.id),
            "amount_text": amount_text,
            "start_date": str(subscription.start_date),
            "end_date": str(subscription.end_date),
        },
    )

    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = f"{from_name} <{from_email}>"
    message["To"] = user.email
    message.set_content("This email requires HTML support.")
    message.add_alternative(html_content, subtype="html")

    # Attach PDF invoice (best-effort).
    try:
        pdf_bytes = build_invoice_pdf_bytes(
            project_name=settings.PROJECT_NAME,
            invoice_id=str(invoice.id),
            user_code=str(user.user_code),
            user_name=str(user.full_name),
            amount_vnd=int(invoice.amount or 0),
            start_date=str(subscription.start_date),
            end_date=str(subscription.end_date),
        )
        message.add_attachment(
            pdf_bytes,
            maintype="application",
            subtype="pdf",
            filename=f"invoice-{invoice.id}.pdf",
        )
    except Exception as exc:
        logger.exception("Failed to build invoice PDF for invoice %s: %s", invoice.id, exc)

    context = ssl.create_default_context()
    try:
        if settings.SMTP_SSL:
            server = smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT, context=context, timeout=10)
        else:
            server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10)
        with server as smtp:
            if settings.SMTP_TLS and not settings.SMTP_SSL:
                smtp.starttls(context=context)
            if settings.SMTP_USER and settings.SMTP_PASSWORD:
                smtp.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            smtp.send_message(message)
    except Exception as exc:
        logger.exception("Failed to send payment confirmation email for invoice %s: %s", invoice.id, exc)


def send_admin_billing_report_email(
    *,
    admin_emails: list[str],
    report_rows_count: int,
    excel_bytes: bytes,
    filename: str,
    lang: str = "vi",
) -> None:
    """
    Send monthly overdue/canceled subscription billing report to admins.
    The Excel file should contain users/subscriptions that are not paid on time.
    """
    if not settings.emails_enabled:
        logger.debug("Email is disabled; skipping admin billing report email")
        return

    recipients = []
    for email in admin_emails:
        if email and email not in recipients:
            recipients.append(str(email))

    if not recipients:
        logger.warning("No admin recipients available for billing report email")
        return

    selected_lang = (lang or settings.DEFAULT_EMAIL_LANG or "vi").lower()
    subject_template = _ADMIN_BILLING_REPORT_SUBJECTS.get(
        selected_lang,
        _ADMIN_BILLING_REPORT_SUBJECTS["vi"],
    )

    now = datetime.now(DEFAULT_TZ)

    subject = subject_template.format(
        project_name=settings.PROJECT_NAME,
        report_date=now.strftime("%d/%m/%Y"),
    )

    html_content = render_email_template(
        template_name="admin_billing_overdue_report.html",
        lang=selected_lang,
        context={
            "project_name": settings.PROJECT_NAME,
            "report_date": now.strftime("%d/%m/%Y"),
            "report_time": now.strftime("%H:%M"),
            "rows_count": report_rows_count,
            "school_logo_url": getattr(settings, "https://cdn.haitrieu.com/wp-content/uploads/2022/11/Logo-Truong-Dai-hoc-Su-pham-Ky-thuat-Hung-Yen-UTEHY-1000x1024.png", "") or "",
        },
    )

    body = (
        f"Báo cáo gói gửi xe chưa thanh toán đúng hạn.\n"
        f"Ngày báo cáo: {now.strftime('%d/%m/%Y')}.\n"
        f"Số bản ghi: {report_rows_count}.\n"
        f"Vui lòng xem file Excel đính kèm."
    )

    attachments: list[EmailAttachment] = [
        {
            "filename": filename,
            "content": excel_bytes,
            "maintype": "application",
            "subtype": "vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }
    ]

    for to_email in recipients:
        try:
            _send_smtp_message(
                to_email=to_email,
                subject=subject,
                body=body,
                html_body=html_content,
                attachments=attachments,
            )
        except Exception as exc:
            logger.exception(
                "Failed to send admin billing report email to %s: %s",
                to_email,
                exc,
            )


def send_admin_billing_failure_alert_email(
    *,
    admin_emails: list[str],
    user: Users,
    invoice: Invoice,
    subscription: UserSubscription,
    amount_vnd: int,
    lang: str = "vi",
) -> None:
    """
    Send an immediate alert to admins when a monthly subscription is suspended after billing retries.
    """
    if not settings.emails_enabled:
        logger.debug("Email is disabled; skipping admin billing failure alert")
        return

    recipients: list[str] = []
    for email in admin_emails or []:
        if email and email not in recipients:
            recipients.append(str(email))

    if not recipients:
        return

    selected_lang = (lang or settings.DEFAULT_EMAIL_LANG or "vi").lower()
    subject_template = _ADMIN_BILLING_FAILURE_ALERT_SUBJECTS.get(
        selected_lang,
        _ADMIN_BILLING_FAILURE_ALERT_SUBJECTS["vi"],
    )

    subject = subject_template.format(
        project_name=settings.PROJECT_NAME,
        invoice_id=invoice.id,
    )

    body = (
        "Monthly billing failed after 3 attempts.\n"
        f"User: {user.user_code} - {user.full_name}\n"
        f"Subscription: {subscription.id}\n"
        f"Invoice: {invoice.id}\n"
        f"Amount due: {amount_vnd:,} VND\n"
        "Action required: review and contact user."
    )

    for to_email in recipients:
        try:
            _send_smtp_message(to_email=to_email, subject=subject, body=body)
        except Exception as exc:
            logger.exception(
                "Failed to send admin billing failure alert email to %s: %s",
                to_email,
                exc,
            )
