from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy import Column as SAColumn, Boolean, String, Text
from sqlmodel import Field, SQLModel

from .mixins import SoftDeleteMixin, TimestampMixin


class UsersBase(SQLModel):
    full_name: str = Field(max_length=255)
    email: str = Field(max_length=255, sa_column=SAColumn(String(255), nullable=False))
    password_hash: str = Field(sa_column=SAColumn(Text, nullable=False))
    is_active: bool = Field(default=True, sa_column=SAColumn(Boolean, nullable=False))


class Users(UsersBase, TimestampMixin, SoftDeleteMixin, table=True):
    __tablename__ = "users"
    user_code: str = Field(max_length=50, primary_key=True, index=True)


class UsersCreate(UsersBase):
    user_code: str = Field(max_length=50)


class UsersRead(UsersBase):
    user_code: str
    deleted_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime


class UsersUpdate(SQLModel):
    full_name: Optional[str] = Field(default=None, max_length=255)
    email: Optional[str] = Field(default=None, max_length=255)
    password_hash: Optional[str] = Field(default=None)
    is_active: Optional[bool] = Field(default=None)
    deleted_at: Optional[datetime] = Field(default=None)
