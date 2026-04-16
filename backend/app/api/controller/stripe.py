from __future__ import annotations

from datetime import date
from typing import Any
from uuid import UUID

import stripe
from fastapi import HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.authen.current_user import AuthUser
from app.core.stripe_client import ensure_stripe_configured, stripe_client
from app.service.stripe_payment import StripePaymentService, get_or_create_customer
from app.service.users import userService


class SetupIntentResponse(BaseModel):
    client_secret: str
    customer_id: str


class AttachPaymentMethodRequest(BaseModel):
    payment_method_id: str


class StripePaymentIntentRequest(BaseModel):
    payment_method_id: str
    amount: int = Field(..., gt=0)
    sub_plan_id: UUID
    term_id: UUID
    vehicle_id: UUID
    payment_plan_id: UUID
    start_date: date
    end_date: date
    total_amount: int | None = None


class StripePaymentIntentResponse(BaseModel):
    invoice_id: UUID
    subscription_id: UUID
    payment_intent_id: str
    status: str


class StripeController:
    @staticmethod
    async def create_setup_intent(
        current_user: AuthUser,
        db: AsyncSession,
    ) -> SetupIntentResponse:
        ensure_stripe_configured()
        user = await userService.crud.get(db, current_user.user_code)
        customer_id = await get_or_create_customer(user.user_code, db)
        try:
            intent = stripe_client.SetupIntent.create(
                customer=customer_id,
                usage="off_session",
            )
        except stripe.error.StripeError as exc:  # capture potential config/runtime errors
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Unable to create SetupIntent on Stripe",
            ) from exc
        return SetupIntentResponse(client_secret=intent.client_secret, customer_id=customer_id)

    @staticmethod
    async def attach_payment_method(
        current_user: AuthUser,
        payload: AttachPaymentMethodRequest,
        db: AsyncSession,
    ) -> dict[str, Any]:
        ensure_stripe_configured()
        user = await userService.crud.get(db, current_user.user_code)
        customer_id = user.stripe_customer_id
        if not customer_id:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="User does not have a Stripe customer",
            )
        try:
            stripe_client.PaymentMethod.attach(
                payload.payment_method_id,
                customer=customer_id,
            )
            stripe_client.Customer.modify(
                customer_id,
                invoice_settings={"default_payment_method": payload.payment_method_id},
            )
        except stripe.error.StripeError as exc:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Unable to persist payment method",
            ) from exc
        return {"payment_method_id": payload.payment_method_id}

    @staticmethod
    async def create_payment_intent(
        current_user: AuthUser,
        payload: StripePaymentIntentRequest,
        db: AsyncSession,
    ) -> StripePaymentIntentResponse:
        ensure_stripe_configured()
        payment_result = await StripePaymentService.charge(
            {
                "user_code": current_user.user_code,
                "payment_method_id": payload.payment_method_id,
                "amount": payload.amount,
                "sub_plan_id": payload.sub_plan_id,
                "term_id": payload.term_id,
                "vehicle_id": payload.vehicle_id,
                "payment_plan_id": payload.payment_plan_id,
                "start_date": payload.start_date,
                "end_date": payload.end_date,
                "total_amount": payload.total_amount,
            },
            db,
        )
        return StripePaymentIntentResponse(**payment_result)
