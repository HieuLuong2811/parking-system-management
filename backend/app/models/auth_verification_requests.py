from __future__ import annotations

from datetime import datetime
from typing import Optional
import uuid

from sqlalchemy import Boolean, Column as SAColumn, DateTime, String
from sqlmodel import Field, SQLModel


class AuthVerificationRequestBase(SQLModel):
    user_code: str = Field(foreign_key="users.user_code", max_length=50)
    verification_type: str = Field(
        max_length=50,
        sa_column=SAColumn(String(50), nullable=False),
        description="Business type, e.g. RESET_PASSWORD, CHANGE_PASSWORD, VERIFY_EMAIL",
    )
    code_hash: str = Field(
        max_length=255,
        sa_column=SAColumn(String(255), nullable=False),
    )
    expires_at: datetime = Field(sa_column=SAColumn(DateTime(timezone=False), nullable=False))
    is_used: bool = Field(default=False, sa_column=SAColumn(Boolean, nullable=False))
    invalidated_at: Optional[datetime] = Field(default=None, sa_column=SAColumn(DateTime(timezone=False), nullable=True))


class AuthVerificationRequest(AuthVerificationRequestBase, table=True):
    __tablename__ = "auth_verification_requests"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)


class AuthVerificationRequestCreate(AuthVerificationRequestBase):
    pass


class AuthVerificationRequestRead(AuthVerificationRequestBase):
    id: uuid.UUID
    created_at: datetime

