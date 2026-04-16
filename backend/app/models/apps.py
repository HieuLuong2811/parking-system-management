from __future__ import annotations

from datetime import datetime
import uuid

from sqlalchemy import Column as SAColumn, Text
from sqlmodel import Field, SQLModel


class AppBase(SQLModel):
    app_id: str = Field(sa_column_kwargs={"unique": True, "nullable": False})
    name: str
    domain: str
    token: str = Field(sa_column=SAColumn(Text, nullable=False))
    is_active: bool = Field(default=True)


class App(AppBase, table=True):
    __tablename__ = "apps"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)


class AppCreate(SQLModel):
    app_id: str
    name: str
    domain: str
    token: str
    is_active: bool = True


class AppRead(AppBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime


class AppUpdate(SQLModel):
    name: str | None = None
    domain: str | None = None
    token: str | None = None
    is_active: bool | None = None
