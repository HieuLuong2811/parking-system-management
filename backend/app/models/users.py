from __future__ import annotations

from datetime import datetime
import uuid
from typing import Optional

from sqlalchemy import Column as SAColumn, String, Text
from sqlmodel import Field, SQLModel

from .mixins import SoftDeleteMixin, TimestampMixin


class UsersBase(SQLModel):
    full_name: str = Field(max_length=255)
    email: str = Field(max_length=255, sa_column=SAColumn(String(255), nullable=False))
    phone_number: Optional[str] = Field(
        default=None,
        max_length=10,
        sa_column=SAColumn(String(10), nullable=True),
    )
    language_use: Optional[str] = Field(default="en", max_length=10)
    stripe_customer_id: Optional[str] = Field(
        default=None,
        max_length=255,
        sa_column=SAColumn(String(255), nullable=True),
    )


class Users(UsersBase, TimestampMixin, SoftDeleteMixin, table=True):
    __tablename__ = "users"
    user_code: str = Field(max_length=50, primary_key=True, index=True)
    password: str = Field(sa_column=SAColumn(Text, nullable=False))


class UsersCreate(UsersBase):
    user_code: str = Field(max_length=50)
    password: str = Field(min_length=6)


class UsersRead(UsersBase):
    user_code: str
    deleted_at: Optional[datetime]
    created_at: datetime | None = None
    updated_at: datetime | None = None

class RoleSummary(SQLModel):
    id: uuid.UUID
    role_code: str


class UserWithRoles(SQLModel):
    user: UsersRead
    roles: list[RoleSummary]


class UsersUpdate(SQLModel):
    full_name: Optional[str] = Field(default=None, max_length=255)
    email: Optional[str] = Field(default=None, max_length=255)
    phone_number: Optional[str] = Field(default=None, max_length=10)
    stripe_customer_id: Optional[str] = Field(default=None, max_length=255)
    language_use: Optional[str] = Field(default=None, max_length=10)
    password: Optional[str] = Field(default=None, min_length=6)
    deleted_at: Optional[datetime] = Field(default=None)
    stripe_customer_id: Optional[str] = Field(default=None, max_length=255)
