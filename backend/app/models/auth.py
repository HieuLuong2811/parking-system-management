from __future__ import annotations

from datetime import datetime
from typing import List

from pydantic import BaseModel, EmailStr


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    user_code: str
    password: str


class TokenPayload(BaseModel):
    sub: str
    exp: datetime
    user_code: str
    roles: List[str] = []


class TokenResponse(Token):
    expires_at: datetime
    user_code: str
    roles: List[str] = []


class AuthCodeResponse(BaseModel):
    code: str
    expires_at: datetime
    user_code: str
    roles: List[str] = []


class ExchangeCodeRequest(BaseModel):
    code: str

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


class AuthUser(BaseModel):
    user_code: str
    full_name: str
    email: EmailStr
    roles: List[str] = []


class UserImportEntry(BaseModel):
    user_code: str
    full_name: str
    email: EmailStr
    phone_number: str | None = None


class UserBulkImportRequest(BaseModel):
    entries: List[UserImportEntry]
