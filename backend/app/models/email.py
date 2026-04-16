from typing import Literal, Optional

from pydantic import BaseModel, EmailStr


class EmailData(BaseModel):
    html_content: str
    subject: str
    attachment_name: Optional[str] = None
    attachment_bytes: Optional[bytes] = None


class SendTestEmailRequest(BaseModel):
    to_email: EmailStr
    lang: Literal["en", "ja", "th", "vi"] = "vi"
    user_name: str
    user_code: str
