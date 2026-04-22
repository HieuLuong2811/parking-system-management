from __future__ import annotations

from datetime import datetime
from typing import Optional
import uuid

from sqlalchemy import Column as SAColumn, String
from sqlmodel import Field, SQLModel


class RolesBase(SQLModel):
    role_code: str = Field(max_length=50, sa_column=SAColumn(String(50), nullable=False))


class Roles(RolesBase, table=True):
    __tablename__ = "roles"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)


class RolesCreate(SQLModel):
    role_code: str = Field(max_length=50, sa_column=SAColumn(String(50), nullable=False))


class RolesRead(RolesBase):
    id: uuid.UUID
    created_at: datetime


class RolesUpdate(SQLModel):
    role_code: Optional[str] = Field(default=None, max_length=50)
