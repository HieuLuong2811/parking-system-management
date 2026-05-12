import json

from app.models.auth import AuthUser
from app.service.invoices import invoiceService
from app.models.subscriptions import UserSubscriptionCreate
from app.service.subscriptions import subscriptionService
from app.enums.parking import InvoiceStatus, PaymentMethod, SubscriptionStatus, PaymentType
from app.models.invoices import InvoiceCreate
from app.models.billing_event_logs import BillingEventLogCreate
from app.service.billing_event_logs import billingEventLogService
from app.models.plans import SubscriptionPlan
from app.models.payment_plans import PaymentPlan
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.checkout import CheckoutMomoRequest

class CheckoutService:
    @staticmethod
    async def create_invoice_for_momo(
        payload: CheckoutMomoRequest,
        db: AsyncSession,
        current_user: AuthUser,
    ):
        try:
            payment_plan = await db.get(PaymentPlan, payload.payment_plan_id)
            if not payment_plan:
                raise HTTPException(status_code=400, detail="Payment plan not found")

            plan = await db.get(SubscriptionPlan, payload.sub_plan_id)
            if not plan:
                raise HTTPException(status_code=400, detail="Subscription plan not found")

            payment_type = payment_plan.payment_type
            allow_monthly = bool(getattr(plan, "allow_monthly_payment", True))
            allow_full = bool(getattr(plan, "allow_full_payment", False))
            if payment_type == PaymentType.MONTHLY and not allow_monthly:
                raise HTTPException(status_code=400, detail="Monthly payment is not allowed for this plan")
            if payment_type == PaymentType.FULL and not allow_full:
                raise HTTPException(status_code=400, detail="Full payment is not allowed for this plan")

            # Pricing is computed externally; trust payload.amount (still validated to be > 0).
            amount = int(payload.amount or 0)
            if amount <= 0:
                raise HTTPException(status_code=400, detail="Invalid amount")

            vehicle_ids = payload.vehicle_ids or ([] if payload.vehicle_id is None else [payload.vehicle_id])
            if not vehicle_ids:
                raise HTTPException(status_code=400, detail="At least one vehicle is required")

            subscription_payload = UserSubscriptionCreate(
                user_code=current_user.user_code,
                sub_plan_id=payload.sub_plan_id,
                term_id=payload.term_id,
                payment_plan_id=payload.payment_plan_id,
                vehicle_ids=vehicle_ids,
                total_amount=int(amount),
                paid_amount=0,
                status=SubscriptionStatus.PAYMENT_DUE,
                start_date=payload.start_date,
                end_date=payload.end_date,
            )

            subscription = await subscriptionService.create_subscription(subscription_payload, db)
            await db.flush()

            invoice_payload = InvoiceCreate(
                user_code=current_user.user_code,
                subscription_id=subscription.id,
                amount=int(amount),
                payment_method=PaymentMethod.MOMO,
                status=InvoiceStatus.PENDING,
            )

            invoice = await invoiceService.create_invoice(invoice_payload, db)

            await billingEventLogService.create_log(
                BillingEventLogCreate(
                    user_code=current_user.user_code,
                    subscription_id=subscription.id,
                    event_type="invoice_created",
                    meta_data={
                        "invoice_id": str(invoice.id),
                        "amount": int(invoice.amount),
                        "payment_method": invoice.payment_method.value,
                        "sub_plan_id": str(payload.sub_plan_id),
                        "term_id": str(payload.term_id),
                        "vehicle_ids": [str(v) for v in vehicle_ids],
                        "payment_plan_id": str(payload.payment_plan_id),
                        "start_date": str(payload.start_date),
                        "end_date": str(payload.end_date),
                    },
                ),
                db,
            )

            await db.commit()
            return invoice

        except Exception as e:
            await db.rollback()
            raise e

    @staticmethod
    async def create_subscription_only(payload, db, current_user):
        try:
            vehicle_ids = getattr(payload, "vehicle_ids", None) or ([] if getattr(payload, "vehicle_id", None) is None else [payload.vehicle_id])
            subscription_payload = UserSubscriptionCreate(
                user_code=current_user.user_code,
                sub_plan_id=payload.sub_plan_id,
                term_id=payload.term_id,
                payment_plan_id=payload.payment_plan_id,
                vehicle_ids=vehicle_ids,
                total_amount=payload.amount,
                paid_amount=0,
                status=SubscriptionStatus.ACTIVE,
                start_date=payload.start_date,
                end_date=payload.end_date,
                auto_renew=True,
            )

            subscription = await subscriptionService.create_subscription(
                subscription_payload, db
            )

            await db.commit()

            return {
                "subscription_id": str(subscription.id),
                "status": subscription.status,
            }

        except Exception as e:
            await db.rollback()
            raise e
