import logging
import smtplib
import ssl
from email.message import EmailMessage

from app.core.config import settings
from app.models.invoices import Invoice
from app.models.subscriptions import UserSubscription
from app.models.users import Users
from app.utils.email import render_email_template

logger = logging.getLogger(__name__)

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


def _send_smtp_message(*, to_email: str, subject: str, body: str) -> None:
    from_name = settings.EMAILS_FROM_NAME or settings.PROJECT_NAME
    from_email = settings.EMAILS_FROM_EMAIL

    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = f"{from_name} <{from_email}>"
    message["To"] = to_email
    message.set_content(body)

    context = ssl.create_default_context()
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

    subject = f"[{settings.PROJECT_NAME}] Thanh toán thành công - Invoice {invoice.id}"
    amount_text = f"{invoice.amount:,}"
    body = (
        f"Xin chào {user.full_name},\n\n"
        f"Thanh toán tự động đã THÀNH CÔNG.\n"
        f"- Invoice: {invoice.id}\n"
        f"- Số tiền: {amount_text} VND\n"
        f"- Thời hạn gói: {subscription.start_date} đến {subscription.end_date}\n\n"
        "Trân trọng,\n"
        f"{settings.EMAILS_FROM_NAME or settings.PROJECT_NAME}"
    )

    for to_email in recipients:
        try:
            _send_smtp_message(to_email=to_email, subject=subject, body=body)
        except Exception as exc:
            logger.exception("Failed to send billing success email to %s for invoice %s: %s", to_email, invoice.id, exc)


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

    subject = f"[{settings.PROJECT_NAME}] Thanh toán thất bại - Invoice {invoice.id}"
    amount_text = f"{invoice.amount:,}"
    status_text = "Subscription đã bị tạm ngưng (SUSPENDED)." if suspended else "Hệ thống sẽ tự retry trong ngày."
    body = (
        f"Xin chào {user.full_name},\n\n"
        f"Thanh toán tự động đã THẤT BẠI (lần thử {attempt_number}).\n"
        f"- Invoice: {invoice.id}\n"
        f"- Số tiền: {amount_text} VND\n"
        f"- Lý do: {error_message}\n"
        f"- Trạng thái: {status_text}\n\n"
        "Nếu bạn cần hỗ trợ, vui lòng liên hệ quản trị.\n\n"
        "Trân trọng,\n"
        f"{settings.EMAILS_FROM_NAME or settings.PROJECT_NAME}"
    )

    for to_email in recipients:
        try:
            _send_smtp_message(to_email=to_email, subject=subject, body=body)
        except Exception as exc:
            logger.exception("Failed to send billing failed email to %s for invoice %s: %s", to_email, invoice.id, exc)


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
