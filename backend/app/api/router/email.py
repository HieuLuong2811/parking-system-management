from fastapi import APIRouter, HTTPException, Query

from app.core.config import settings
from app.models.email import SendTestEmailRequest
from app.utils.email import (
    generate_test_email,
    send_email,
)

router = APIRouter(prefix="/emails", tags=["emails"])


@router.post("/send-test")
async def send_test_email(payload: SendTestEmailRequest):
    try:
        email_data = generate_test_email(
            email_to=str(payload.to_email),
            user_name=payload.user_name,
            user_code=payload.user_code,
            lang=payload.lang,
        )
        await send_email(str(payload.to_email), email_data)

        return {
            "message": "Test email sent successfully",
            "to_email": str(payload.to_email),
            "lang": payload.lang,
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/send-test-default")
async def send_test_email_default(
    lang: str = Query(default="vi", pattern="^(en|ja|th|vi)$"),
):
    try:
        email_to = str(settings.EMAIL_TEST_USER)

        email_data = generate_test_email(
            email_to=email_to,
            user_name="Test User",
            user_code="TEST001",
            lang=lang,
        )
        await send_email(email_to, email_data)

        return {
            "message": "Default test email sent successfully",
            "to_email": email_to,
            "lang": lang,
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


# @router.post("/send-reset-password")
# async def send_reset_password_email(payload: SendResetPasswordEmailRequest):
#     try:
#         email_data = generate_reset_password_email(
#             email_to=str(payload.email_to),
#             email=payload.email,
#             token=payload.token,
#             lang=payload.lang,
#         )
#         await send_email(str(payload.email_to), email_data)

#         return {
#             "message": "Reset password email sent successfully",
#             "to_email": str(payload.email_to),
#             "lang": payload.lang,
#         }
#     except Exception as exc:
#         raise HTTPException(status_code=500, detail=str(exc))