from __future__ import annotations

from datetime import date, timedelta
from typing import Iterable, Set

from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.enums.parking import PaymentType
from app.models.pricing import PaymentPlanPricingDetail, PaymentPlanPricingResponse
from app.service.holiday import HolidayService
from app.service.payment_plans import paymentPlanService
from app.service.plans import planService
from app.service.terms import termService


def iterate_dates(start: date, end: date) -> Iterable[date]:
    current = start
    while current <= end:
        yield current
        current += timedelta(days=1)


def calculate_term_amount(start_date: date, end_date: date, price_per_day: int) -> tuple[int, int, int, int]:
    if start_date > end_date:
        return 0, 0, 0, 0

    holiday_dates: Set[date] = {entry["date"] for entry in HolidayService.get_holidays_in_range(start_date, end_date)}

    working_days = 0
    holiday_days = 0
    sunday_skipped = 0
    for day in iterate_dates(start_date, end_date):
        if day.weekday() == 6:
            sunday_skipped += 1
            continue
        if day in holiday_dates:
            holiday_days += 1
            continue
        working_days += 1

    total_amount = working_days * price_per_day

    return total_amount, working_days, holiday_days, sunday_skipped


def calculate_term_months(start_date: date, end_date: date) -> int:
    if start_date > end_date:
        return 0
    month_delta = (end_date.year - start_date.year) * 12 + end_date.month - start_date.month + 1
    return max(month_delta, 1)


class planPricingService:
    @staticmethod
    async def get_plan_pricing(
        plan_id: str,
        term_id: str,
        db: AsyncSession,
    ) -> PaymentPlanPricingResponse:
        plan = await planService.get_plan(plan_id, db)
        if not plan:
            raise HTTPException(status_code=404, detail="Subscription plan not found")

        term = await termService.get_term(term_id, db)
        if not term:
            raise HTTPException(status_code=404, detail="Academic term not found")

        total_amount, working_days, holiday_days, sundays_skipped = calculate_term_amount(
            start_date=term.start_date,
            end_date=term.end_date,
            price_per_day=plan.price_per_day,
        )

        payment_plans = await paymentPlanService.get_all_payment_plans(db)
        if not payment_plans:
            raise HTTPException(status_code=404, detail="Payment plans not configured")

        payment_plan_details: list[PaymentPlanPricingDetail] = []

        for payment_plan in payment_plans:
            if not payment_plan.is_active:
                continue

            discount_percent = payment_plan.discount_percent

            if payment_plan.payment_type == PaymentType.MONTHLY:
                total_months = calculate_term_months(term.start_date, term.end_date)
                base_amount = int(round(total_amount / total_months)) if total_months > 0 else total_amount
            else:
                base_amount = total_amount

            final_amount = base_amount

            if discount_percent:
                final_amount = int(round(final_amount * (100 - discount_percent) / 100))

            payment_plan_details.append(
                PaymentPlanPricingDetail(
                    payment_plan_id=payment_plan.id,
                    payment_type=payment_plan.payment_type,
                    discount_percent=discount_percent,
                    is_active=payment_plan.is_active,
                    original_amount=base_amount,
                    amount=final_amount,
                )
            )

        if not payment_plan_details:
            raise HTTPException(status_code=404, detail="No active payment plans available")

        return PaymentPlanPricingResponse(
            plan_id=plan.id,
            term_id=term.id,
            price_per_day=plan.price_per_day,
            start_date=term.start_date,
            end_date=term.end_date,
            working_days=working_days,
            holiday_days=holiday_days,
            sundays_skipped=sundays_skipped,
            total_amount=total_amount,
            payment_plan_details=payment_plan_details,
        )
