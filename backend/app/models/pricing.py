from __future__ import annotations

from datetime import date
from typing import Optional
from uuid import UUID

from pydantic import BaseModel

from app.enums.parking import PaymentType


class PlanPaymentModePricing(BaseModel):
    payment_plan_id: UUID
    payment_type: PaymentType
    discount_percent: Optional[int]
    original_amount: int
    amount: int


class PlanPricingResponse(BaseModel):
    plan_id: UUID
    term_id: UUID
    price_per_day: int
    start_date: date
    end_date: date
    working_days: int
    holiday_days: int
    sundays_skipped: int
    total_amount: int
    payment_modes: list[PlanPaymentModePricing]


class PaymentPlanPricingDetail(BaseModel):
    payment_plan_id: UUID
    payment_type: PaymentType
    plan_name: str
    description: Optional[str]
    discount_percent: Optional[int]
    is_active: bool
    original_amount: int
    amount: int


class PaymentPlanPricingResponse(PlanPricingResponse):
    payment_plan_details: list[PaymentPlanPricingDetail]
