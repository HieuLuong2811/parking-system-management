from __future__ import annotations

from datetime import datetime
from typing import Optional
import uuid

from sqlalchemy import Column as SAColumn, Integer, String, Text
from sqlmodel import Field, SQLModel

from .mixins import SoftDeleteMixin, TimestampMixin


class SubscriptionPlanBase(SQLModel):
    plan_name: str = Field(max_length=255, nullable=False)
    price_per_day: int = Field(sa_column=SAColumn(Integer, nullable=False))
    description: Optional[str] = Field(default=None, sa_column=SAColumn(Text))


class SubscriptionPlan(SubscriptionPlanBase, TimestampMixin, SoftDeleteMixin, table=True):
    __tablename__ = "subscription_plans"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)


class SubscriptionPlanCreate(SubscriptionPlanBase):
    pass


class SubscriptionPlanRead(SubscriptionPlanBase):
    id: uuid.UUID
    deleted_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime


class SubscriptionPlanUpdate(SQLModel):
    plan_name: Optional[str] = Field(default=None, max_length=255)
    price_per_day: Optional[int] = None
    description: Optional[str] = None
