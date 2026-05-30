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

TERM_UPDATED_SUBJECTS = {
    "en": "{project_name} - Academic term updated",
    "vi": "{project_name} - Thông báo cập nhật học kỳ",
    "ja": "{project_name} - 学期更新のお知らせ",
    "th": "{project_name} - แจ้งเตือนอัปเดตภาคการศึกษา",
}

SUBSCRIPTION_PLAN_UPDATED_SUBJECTS = {
    "en": "{project_name} - Subscription plan updated",
    "vi": "{project_name} - Thông báo cập nhật vé gửi xe đã đăng ký",
    "ja": "{project_name} - 登録プラン更新のお知らせ",
    "th": "{project_name} - แจ้งเตือนอัปเดตแพ็กเกจสมัครสมาชิก",
}

TEST_SUBJECTS = {
    "en": "{project_name} - Test email",
    "vi": "{project_name} - Email kiểm tra",
    "ja": "{project_name} - テストメール",
    "th": "{project_name} - อีเมลทดสอบ",
}

PASSWORD_RESET_CODE_SUBJECTS = {
    "en": "{project_name} - Password reset code for {email}",
    "vi": "{project_name} - Mã xác minh đặt lại mật khẩu cho {email}",
    "ja": "{project_name} - ăƒ¦ăƒ¼ă‚¶ăƒ¼ {email} のパスワード再設定コード",
    "th": "{project_name} - รหัสยืนยันตั้งรหัสผ่านใหม่สำหรับ {email}",
}

PARKING_ACCESS_CARD_DISABLED_SUBJECTS = {
    "en": "{project_name} - Your parking access card has been disabled",
    "vi": "{project_name} - Thẻ gửi xe của bạn đã bị khoá",
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


def generate_term_updated_email(
    *,
    user_name: str,
    old_term_name: str,
    new_term_name: str,
    lang: str | None = None,
) -> EmailData:
    project_name = settings.APP_NAME
    selected_lang = normalize_lang(lang)

    subject_template = TERM_UPDATED_SUBJECTS.get(selected_lang, TERM_UPDATED_SUBJECTS["vi"])
    subject = subject_template.format(project_name=project_name)

    html_content = render_email_template(
        template_name="term_updated.html",
        lang=selected_lang,
        context={
            "project_name": project_name,
            "user_name": user_name,
            "old_term_name": old_term_name,
            "new_term_name": new_term_name,
        },
    )

    return EmailData(html_content=html_content, subject=subject)


def generate_subscription_plan_updated_email(
    *,
    user_name: str,
    old_plan_type: str,
    new_plan_type: str,
    lang: str | None = None,
) -> EmailData:
    project_name = settings.APP_NAME
    selected_lang = normalize_lang(lang)

    subject_template = SUBSCRIPTION_PLAN_UPDATED_SUBJECTS.get(
        selected_lang, SUBSCRIPTION_PLAN_UPDATED_SUBJECTS["vi"]
    )
    subject = subject_template.format(project_name=project_name)

    html_content = render_email_template(
        template_name="subscription_plan_updated.html",
        lang=selected_lang,
        context={
            "project_name": project_name,
            "user_name": user_name,
            "old_plan_type": old_plan_type,
            "new_plan_type": new_plan_type,
        },
    )

    return EmailData(html_content=html_content, subject=subject)


def generate_parking_access_card_disabled_email(
    *,
    email_to: str,
    user_name: str,
    user_code: str,
    barcode_token: str,
    lang: str | None = None,
) -> EmailData:
    project_name = settings.APP_NAME
    selected_lang = normalize_lang(lang)

    subject_template = PARKING_ACCESS_CARD_DISABLED_SUBJECTS.get(
        selected_lang, PARKING_ACCESS_CARD_DISABLED_SUBJECTS["vi"]
    )
    subject = subject_template.format(project_name=project_name)

    html_content = render_email_template(
        template_name="parking_access_card_disabled.html",
        lang=selected_lang,
        context={
            "project_name": project_name,
            "email": email_to,
            "user_name": user_name,
            "user_code": user_code,
            "barcode_token": barcode_token,
        },
    )

    return EmailData(html_content=html_content, subject=subject)


def generate_password_reset_code_email(
    *,
    email_to: str,
    user_name: str,
    user_code: str,
    code: str,
    ttl_seconds: int,
    lang: str | None = None,
) -> EmailData:
    project_name = settings.APP_NAME
    selected_lang = normalize_lang(lang)

    subject_template = PASSWORD_RESET_CODE_SUBJECTS.get(selected_lang, PASSWORD_RESET_CODE_SUBJECTS["en"])
    subject = subject_template.format(project_name=project_name, email=email_to)

    ttl_minutes = max(1, int(ttl_seconds // 60))

    html_content = render_email_template(
        template_name="password_reset_code.html",
        lang=selected_lang,
        context={
            "project_name": project_name,
            "email": email_to,
            "user_name": user_name,
            "user_code": user_code,
            "code": code,
            "ttl_minutes": ttl_minutes,
        },
    )

    return EmailData(html_content=html_content, subject=subject)
