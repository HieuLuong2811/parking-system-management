from __future__ import annotations

from datetime import date, datetime
from typing import Optional
import uuid

from sqlalchemy import Column as SAColumn, Enum
from sqlmodel import Field, SQLModel

from app.enums.parking import PaymentType, SubscriptionStatus
from .mixins import TimestampMixin


class UserSubscriptionBase(SQLModel):
    user_code: str = Field(foreign_key="users.user_code", max_length=50)
    plan_id: uuid.UUID = Field(foreign_key="subscription_plans.id")
    term_id: uuid.UUID = Field(foreign_key="academic_terms.id")
    payment_type: PaymentType = Field(
        sa_column=SAColumn(Enum(PaymentType, name="payment_type_enum", create_type=False), nullable=False)
    )
    status: SubscriptionStatus = Field(
        sa_column=SAColumn(Enum(SubscriptionStatus, name="subscription_status_enum", create_type=False), nullable=False)
    )
    start_date: date
    end_date: date


class UserSubscription(UserSubscriptionBase, TimestampMixin, table=True):
    __tablename__ = "user_subscriptions"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)


class UserSubscriptionCreate(UserSubscriptionBase):
    pass


class UserSubscriptionRead(UserSubscriptionBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime


class UserSubscriptionUpdate(SQLModel):
    payment_type: Optional[PaymentType] = None
    status: Optional[SubscriptionStatus] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
