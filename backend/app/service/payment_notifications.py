import logging
import smtplib
import ssl
from email.message import EmailMessage

from app.core.config import settings
from app.models.invoices import Invoice
from app.models.subscriptions import UserSubscription
from app.models.users import Users

logger = logging.getLogger(__name__)

def send_payment_confirmation_email(user: Users, invoice: Invoice, subscription: UserSubscription) -> None:
    if not settings.emails_enabled:
        logger.debug("Email is disabled; skipping receipt for invoice %s", invoice.id)
        return
    if not user.email:
        logger.warning("User %s does not have an email address; cannot send receipt", user.user_code)
        return

    from_name = settings.EMAILS_FROM_NAME or settings.PROJECT_NAME
    from_email = settings.EMAILS_FROM_EMAIL
    subject = f"[{settings.PROJECT_NAME}] Payment received for invoice {invoice.id}"
    amount_text = f"{invoice.amount:,}"
    body = (
        f"Hi {user.full_name},\n\n"
        f"Thanks for your payment of {amount_text} VND (invoice {invoice.id}).\n"
        f"Your parking subscription is active from {subscription.start_date} to {subscription.end_date}.\n"
        "If you have questions, reply to this email and our team will help you.\n\n"
        "Best regards,\n"
        f"{from_name}"
    )

    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = f"{from_name} <{from_email}>"
    message["To"] = user.email
    message.set_content(body)

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
