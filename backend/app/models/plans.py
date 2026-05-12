from __future__ import annotations

from datetime import datetime
from typing import Optional
import uuid

from sqlalchemy import Column as SAColumn, Enum, Integer, String, Text
from sqlmodel import Field, SQLModel

from app.enums.parking import SubscriptionPlanType
from .mixins import SoftDeleteMixin, TimestampMixin


class SubscriptionPlanBase(SQLModel):
    # Package-based policy fields (pricing computed externally).
    allow_monthly_payment: Optional[bool] = Field(default=None, nullable=True)
    allow_full_payment: Optional[bool] = Field(default=None, nullable=True)
    max_licensed_vehicle: Optional[int] = Field(default=None, sa_column=SAColumn(Integer, nullable=True))
    max_unlicensed_vehicle: Optional[int] = Field(default=None, sa_column=SAColumn(Integer, nullable=True))
    after_18_fee: Optional[int] = Field(default=None, sa_column=SAColumn(Integer, nullable=True))
    waive_after_18_fee: Optional[bool] = Field(default=None, nullable=True)
    status: Optional[str] = Field(default=None, sa_column=SAColumn(String(50), nullable=True))

    # Legacy fields kept for backward compatibility (old plan model).
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


class SubscriptionPlanRead(SQLModel):
    id: uuid.UUID
    allow_monthly_payment: Optional[bool]
    allow_full_payment: Optional[bool]
    max_licensed_vehicle: Optional[int]
    max_unlicensed_vehicle: Optional[int]
    after_18_fee: Optional[int]
    waive_after_18_fee: Optional[bool]
    status: Optional[str]
    plans_type: SubscriptionPlanType
    price_per_day: int
    deleted_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    is_in_use: bool = False


class SubscriptionPlanUpdate(SQLModel):
    plans_type: Optional[SubscriptionPlanType] = None
    price_per_day: Optional[int] = None
    allow_monthly_payment: Optional[bool] = None
    allow_full_payment: Optional[bool] = None
    max_licensed_vehicle: Optional[int] = None
    max_unlicensed_vehicle: Optional[int] = None
    after_18_fee: Optional[int] = None
    waive_after_18_fee: Optional[bool] = None
    status: Optional[str] = None
