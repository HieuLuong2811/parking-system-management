from __future__ import annotations

from datetime import datetime
from typing import Any, Optional
import uuid

from sqlalchemy import Column as SAColumn, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlmodel import Field, SQLModel


class BillingEventLogBase(SQLModel):
    user_code: str = Field(max_length=50)
    subscription_id: uuid.UUID = Field(foreign_key="user_subscriptions.id")
    event_type: str = Field(max_length=50)
    meta_data: Optional[dict[str, Any]] = Field(
        default=None, sa_column=SAColumn(JSONB, nullable=True)
    )


class BillingEventLog(BillingEventLogBase, table=True):
    __tablename__ = "billing_event_logs"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)


class BillingEventLogCreate(BillingEventLogBase):
    pass


class BillingEventLogRead(BillingEventLogBase):
    id: uuid.UUID
    created_at: datetime


class BillingEventLogUpdate(SQLModel):
    event_type: Optional[str] = Field(default=None, max_length=50)
    meta_data: Optional[dict[str, Any]] = None
