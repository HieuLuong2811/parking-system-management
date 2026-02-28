from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy import Column as SAColumn, Integer, String
from sqlmodel import Field, SQLModel


class RolesBase(SQLModel):
    role_code: str = Field(max_length=50, sa_column=SAColumn(String(50), nullable=False))
    role_name: str = Field(max_length=255, sa_column=SAColumn(String(255), nullable=False))
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)


class Roles(RolesBase, table=True):
    __tablename__ = "roles"
    id: Optional[int] = Field(default=None, primary_key=True)


class RolesCreate(RolesBase):
    pass


class RolesRead(RolesBase):
    id: int


class RolesUpdate(SQLModel):
    role_code: Optional[str] = Field(default=None, max_length=50)
    role_name: Optional[str] = Field(default=None, max_length=255)
