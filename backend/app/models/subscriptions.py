from __future__ import annotations

from datetime import date, datetime
from typing import Optional
import uuid

from sqlalchemy import Column as SAColumn, Enum, Integer
from sqlmodel import Field, SQLModel

from app.enums.parking import PaymentType, SubscriptionPlanType, SubscriptionStatus
from .mixins import TimestampMixin


class UserSubscriptionBase(SQLModel):
    user_code: str = Field(foreign_key="users.user_code", max_length=50)
    sub_plan_id: uuid.UUID = Field(foreign_key="subscription_plans.id")
    term_id: uuid.UUID = Field(foreign_key="academic_terms.id")
    payment_plan_id: uuid.UUID = Field(foreign_key="payment_plans.id")
    total_amount: int = Field(sa_column=SAColumn(Integer, nullable=False))
    paid_amount: int = Field(default=0, sa_column=SAColumn(Integer, nullable=False))
    status: SubscriptionStatus = Field(
        sa_column=SAColumn(Enum(SubscriptionStatus, name="subscription_status_enum", create_type=False), nullable=False)
    )
    start_date: date
    end_date: date
    next_billing_date: date | None = Field(default=None)
    billing_attempt_count: int = Field(default=0, sa_column=SAColumn(Integer, nullable=False))


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
    sub_plan_id: Optional[uuid.UUID] = None
    payment_plan_id: Optional[uuid.UUID] = None
    status: Optional[SubscriptionStatus] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    total_amount: Optional[int] = None
    paid_amount: Optional[int] = None


class SubscriptionPlanSummary(SQLModel):
    plans_type: SubscriptionPlanType


class PaymentPlanSummary(SQLModel):
    payment_type: PaymentType


class AcademicTermSummary(SQLModel):
    term_name: str


class UserSummary(SQLModel):
    user_code: str
    full_name: str
    email: str
    phone_number: Optional[str] = None

class UserSubscriptionClientView(SQLModel):
    id: uuid.UUID
    status: SubscriptionStatus
    start_date: date
    end_date: date
    total_amount: int
    paid_amount: int
    created_at: datetime
    plan: Optional[SubscriptionPlanType] = None
    payment: Optional[PaymentPlanSummary] = None
    term: Optional[AcademicTermSummary] = None

class UserSubscriptionAdminView(SQLModel): 
    id: uuid.UUID 
    user_code: str 
    user: Optional[UserSummary] = None 
    status: SubscriptionStatus 
    start_date: date 
    end_date: date 
    total_amount: int 
    paid_amount: int 
    created_at: datetime 
    updated_at: datetime 
    # Backward compatible fields used by `dashboard` + `client-mobile`
    subscription_plan: Optional[SubscriptionPlanSummary] = None
    payment_plan: Optional[PaymentPlanSummary] = None
    term: Optional[AcademicTermSummary] = None
    
