from __future__ import annotations

from datetime import datetime
from typing import Optional
import uuid

from sqlalchemy import Boolean, Column as SAColumn, String, Text
from sqlmodel import Field, SQLModel


class NotificationBase(SQLModel):
    actor_id: Optional[str] = Field(default=None, max_length=50)
    receiver_id: str = Field(max_length=50)
    title: str = Field(max_length=255, sa_column=SAColumn(String(255), nullable=False))
    content: str = Field(sa_column=SAColumn(Text, nullable=False))
    is_read: bool = Field(default=False, sa_column=SAColumn(Boolean, nullable=False))


class Notification(NotificationBase, table=True):
    __tablename__ = "notifications"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    deleted_at: Optional[datetime] = Field(default=None, nullable=True)


class NotificationCreate(NotificationBase):
    pass


class NotificationRead(NotificationBase):
    id: uuid.UUID
    created_at: datetime
    deleted_at: Optional[datetime]


class NotificationUpdate(SQLModel):
    is_read: Optional[bool] = None
    deleted_at: Optional[datetime] = None
