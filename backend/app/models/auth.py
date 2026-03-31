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


class AuthUser(BaseModel):
    user_code: str
    full_name: str
    email: EmailStr
    roles: List[str] = []
    is_active: bool


class UserImportEntry(BaseModel):
    user_code: str
    full_name: str
    email: EmailStr


class UserBulkImportRequest(BaseModel):
    entries: List[UserImportEntry]
