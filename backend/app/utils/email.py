from email.message import EmailMessage
from pathlib import Path

import aiosmtplib

from app.core.config import settings
from app.models.email import EmailData
from jinja2 import Template


BASE_DIR = Path(__file__).resolve().parent.parent
TEMPLATE_BUILD_DIR = BASE_DIR / "email-templates" / "build"

RESET_PASSWORD_SUBJECTS = {
    "en": "{project_name} - Password recovery for user {email}",
    "vi": "{project_name} - Khôi phục mật khẩu cho tài khoản {email}",
    "ja": "{project_name} - ユーザー {email} のパスワード再設定",
    "th": "{project_name} - กู้คืนรหัสผ่านสำหรับผู้ใช้ {email}",
}

TEST_SUBJECTS = {
    "en": "{project_name} - Test email",
    "vi": "{project_name} - Email kiểm tra",
    "ja": "{project_name} - テストメール",
    "th": "{project_name} - อีเมลทดสอบ",
}


def normalize_lang(lang: str | None) -> str:
    if not lang:
        return settings.DEFAULT_EMAIL_LANG or "vi"
    return lang.lower()


def is_email_configured() -> bool:
    return all(
        [
            settings.SMTP_HOST,
            settings.SMTP_PORT,
            settings.SMTP_USER,
            settings.SMTP_PASSWORD,
            settings.EMAILS_FROM_EMAIL,
        ]
    )


def get_template_path(template_name: str, lang: str | None = None) -> Path:
    selected_lang = normalize_lang(lang)

    template_path = TEMPLATE_BUILD_DIR / selected_lang / template_name
    if template_path.exists():
        return template_path

    fallback_path = TEMPLATE_BUILD_DIR / (settings.DEFAULT_EMAIL_LANG or "vi") / template_name
    if fallback_path.exists():
        return fallback_path

    en_fallback_path = TEMPLATE_BUILD_DIR / "en" / template_name
    if en_fallback_path.exists():
        return en_fallback_path

    raise FileNotFoundError(
        f"Template not found: template_name={template_name}, lang={selected_lang}"
    )


def load_email_template(template_name: str, lang: str | None = None) -> str:
    template_path = get_template_path(template_name, lang)
    return template_path.read_text(encoding="utf-8")



def render_email_template(
    *,
    template_name: str,
    context: dict[str, object],
    lang: str | None = None,
) -> str:
    template_str = load_email_template(template_name, lang)
    html_content = Template(template_str).render(**context)
    return html_content


async def send_email(to_email: str, email_data: EmailData) -> None:
    if not is_email_configured():
        raise ValueError("Email settings are not configured correctly.")

    message = EmailMessage()

    if settings.EMAILS_FROM_NAME:
        message["From"] = f"{settings.EMAILS_FROM_NAME} <{settings.EMAILS_FROM_EMAIL}>"
    else:
        message["From"] = str(settings.EMAILS_FROM_EMAIL)

    message["To"] = to_email
    message["Subject"] = email_data.subject
    message.set_content("This email requires HTML support.")
    message.add_alternative(email_data.html_content, subtype="html")

    if email_data.attachment_name and email_data.attachment_bytes:
        message.add_attachment(
            email_data.attachment_bytes,
            maintype="application",
            subtype="octet-stream",
            filename=email_data.attachment_name,
        )

    await aiosmtplib.send(
        message,
        hostname=settings.SMTP_HOST,
        port=settings.SMTP_PORT,
        username=settings.SMTP_USER,
        password=settings.SMTP_PASSWORD,
        start_tls=settings.SMTP_TLS,
        use_tls=settings.SMTP_SSL,
    )


# def generate_reset_password_email(
#     email_to: str,
#     email: str,
#     token: str,
#     lang: str = "en",
# ) -> EmailData:
#     project_name = settings.APP_NAME
#     selected_lang = normalize_lang(lang)

#     subject_template = RESET_PASSWORD_SUBJECTS.get(
#         selected_lang,
#         RESET_PASSWORD_SUBJECTS["en"],
#     )
#     subject = subject_template.format(project_name=project_name, email=email)

#     link = f"{settings.FRONTEND_HOST}/reset-password?token={token}"

#     html_content = render_email_template(
#         template_name="reset_password.html",
#         lang=selected_lang,
#         context={
#             "project_name": project_name,
#             "username": email,
#             "email": email_to,
#             "valid_hours": settings.EMAIL_RESET_TOKEN_EXPIRE_HOURS,
#             "link": link,
#         },
#     )

#     return EmailData(
#         html_content=html_content,
#         subject=subject,
#     )


def generate_test_email(
    email_to: str,
    user_name: str,
    user_code: str,
    lang: str = "vi",
) -> EmailData:
    project_name = settings.APP_NAME
    selected_lang = normalize_lang(lang)

    subject_template = TEST_SUBJECTS.get(
        selected_lang,
        TEST_SUBJECTS["vi"],
    )
    subject = subject_template.format(project_name=project_name)

    html_content = render_email_template(
        template_name="test_mail.html",
        lang=selected_lang,
        context={
            "project_name": project_name,
            "email": email_to,
            "user_name": user_name,
            "user_code": user_code,
        },
    )

    return EmailData(
        html_content=html_content,
        subject=subject,
    )