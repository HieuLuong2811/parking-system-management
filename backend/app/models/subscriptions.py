from __future__ import annotations

from datetime import date, datetime
from typing import Optional
import uuid

from sqlalchemy import Column as SAColumn, Enum, Integer
from sqlmodel import Field, SQLModel

from app.enums.parking import PaymentType, SubscriptionPlanType, SubscriptionStatus, VehicleType
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


class UserSubscription(UserSubscriptionBase, TimestampMixin, table=True):
    __tablename__ = "user_subscriptions"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)


class UserSubscriptionCreate(UserSubscriptionBase):
    # Backward compatible single-vehicle field (not persisted on `user_subscriptions` table).
    vehicle_id: uuid.UUID | None = None
    # New API path: attach multiple vehicles to a subscription.
    vehicle_ids: list[uuid.UUID] | None = None


class UserSubscriptionRead(UserSubscriptionBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime


class UserSubscriptionUpdate(SQLModel):
    # Backward compatible: allow switching licensed vehicle on an ACTIVE subscription.
    # This field is not persisted on `user_subscriptions` table; it is applied to `user_subscription_vehicles` mappings.
    vehicle_id: Optional[uuid.UUID] = None
    vehicle_ids: list[uuid.UUID] | None = None
    sub_plan_id: Optional[uuid.UUID] = None
    payment_plan_id: Optional[uuid.UUID] = None
    status: Optional[SubscriptionStatus] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    total_amount: Optional[int] = None
    paid_amount: Optional[int] = None


class VehicleSummary(SQLModel):
    id: Optional[uuid.UUID] = None
    vehicle_type: VehicleType
    license_plate: Optional[str] = None
    # Mobile client expects `qr_code`; backend stores it as `barcode_payload` on Vehicle.
    qr_code: Optional[str] = None


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

class UserSubscriptionDetail(SQLModel):
    subscription_plan: Optional[SubscriptionPlanSummary] = None
    payment_plan: Optional[PaymentPlanSummary] = None
    term: Optional[AcademicTermSummary] = None
    vehicle: Optional[VehicleSummary] = None
    covered_vehicles: list[VehicleSummary] | None = None

class UserSubscriptionClientView(SQLModel):
    id: uuid.UUID
    status: SubscriptionStatus
    start_date: date
    end_date: date
    total_amount: int
    paid_amount: int
    created_at: datetime
    # Backward compatible fields used by `client-web`
    vehicle: Optional[VehicleSummary] = None
    plan: Optional[SubscriptionPlanType] = None
    payment: Optional[PaymentPlanSummary] = None
    term: Optional[AcademicTermSummary] = None
    covered_vehicles: list[VehicleSummary] | None = None

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
    vehicle: Optional[VehicleSummary] = None
    covered_vehicles: list[VehicleSummary] | None = None
    
