from __future__ import annotations

from datetime import datetime
from typing import Optional
import uuid

from sqlalchemy import Boolean, Column as SAColumn, Enum, Integer, String, Text
from sqlmodel import Field, SQLModel

from app.enums.parking import PaymentType
from .mixins import TimestampMixin


class PaymentPlanBase(SQLModel):
    payment_type: PaymentType = Field(
        sa_column=SAColumn(Enum(PaymentType, name="payment_type_enum", create_type=False), nullable=False)
    )
    discount_percent: Optional[int] = Field(default=None, sa_column=SAColumn(Integer, nullable=True))
    is_active: bool = Field(default=True, sa_column=SAColumn(Boolean, nullable=False))


class PaymentPlan(PaymentPlanBase, TimestampMixin, table=True):
    __tablename__ = "payment_plans"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)


class PaymentPlanCreate(PaymentPlanBase):
    pass


class PaymentPlanRead(PaymentPlanBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime


class PaymentPlanUpdate(SQLModel):
    payment_type: Optional[PaymentType] = None
    discount_percent: Optional[int] = None
    is_active: Optional[bool] = None
