from __future__ import annotations

from datetime import datetime
from typing import Optional
import uuid

from sqlalchemy import Column as SAColumn, Enum, Integer, String, Text
from sqlmodel import Field, SQLModel

from app.enums.parking import SubscriptionPlanType
from .mixins import SoftDeleteMixin, TimestampMixin


class SubscriptionPlanBase(SQLModel):
    plans_type: SubscriptionPlanType = Field(
        sa_column=SAColumn(
            Enum(SubscriptionPlanType, name="subscription_plan_type_enum", create_type=False),
            nullable=False,
        )
    )
    price_per_day: int = Field(sa_column=SAColumn(Integer, nullable=False))


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
    is_in_use: bool = False


class SubscriptionPlanUpdate(SQLModel):
    plans_type: Optional[SubscriptionPlanType] = None
    price_per_day: Optional[int] = None
