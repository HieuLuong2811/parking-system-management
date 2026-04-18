from __future__ import annotations

from datetime import date
import logging
import uuid

import stripe
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.stripe_client import ensure_stripe_configured, stripe_client
from app.enums.parking import InvoiceStatus, PaymentMethod, SubscriptionStatus, TransactionStatus
from app.models.invoices import InvoiceCreate, InvoiceUpdate
from app.models.payment_transactions import PaymentTransactionCreate
from app.models.subscriptions import UserSubscriptionCreate
from app.models.users import UsersUpdate
from app.service.invoices import invoiceService
from app.service.payment_notifications import send_payment_confirmation_email
from app.service.payment_transactions import paymentTransactionService
from app.service.subscriptions import subscriptionService
from app.service.users import userService

logger = logging.getLogger(__name__)


async def get_or_create_customer(user_code: str, db: AsyncSession) -> str:
    user = await userService.crud.get(db, user_code)
    if user.stripe_customer_id:
        return user.stripe_customer_id

    customer = stripe_client.Customer.create(name=user.full_name, email=user.email)
    await userService.update_user(user.user_code, UsersUpdate(stripe_customer_id=customer.id), db)
    return customer.id


class StripePaymentService:
    @staticmethod
    async def charge(invoice_payload: dict[str, object], db: AsyncSession) -> dict[str, object]:
        ensure_stripe_configured()

        user_code = invoice_payload["user_code"]
        payment_method_id = invoice_payload["payment_method_id"]
        amount = int(invoice_payload["amount"])
        sub_plan_id = uuid.UUID(str(invoice_payload["sub_plan_id"]))
        term_id = uuid.UUID(str(invoice_payload["term_id"]))
        vehicle_id = uuid.UUID(str(invoice_payload["vehicle_id"]))
        payment_plan_id = uuid.UUID(str(invoice_payload["payment_plan_id"]))
        start_date = invoice_payload["start_date"]  # expect date
        end_date = invoice_payload["end_date"]  # expect date
        if isinstance(start_date, str):
            start_date = date.fromisoformat(start_date)
        if isinstance(end_date, str):
            end_date = date.fromisoformat(end_date)
        total_amount = invoice_payload.get("total_amount")
        if total_amount is None:
            total_amount_value = amount
        else:
            total_amount_value = int(total_amount)

        customer_id = await get_or_create_customer(user_code, db)
        try:
            stripe_client.Customer.modify(
                customer_id,
                invoice_settings={"default_payment_method": payment_method_id},
            )
        except stripe.error.StripeError as exc:
            logger.exception("Failed to update Stripe customer %s", customer_id)
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY, detail="Unable to save payment method"
            ) from exc

        metadata = {
            "user_code": user_code,
            "sub_plan_id": str(sub_plan_id),
            "term_id": str(term_id),
            "vehicle_id": str(vehicle_id),
            "payment_plan_id": str(payment_plan_id),
            "total_amount": total_amount_value,
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
        }

        invoice = await invoiceService.create_invoice(
            InvoiceCreate(
                user_code=user_code,
                subscription_id=None,
                amount=amount,
                payment_method=PaymentMethod.STRIPE,
                status=InvoiceStatus.PENDING,
                metadata=metadata,
            ),
            db,
        )

        try:
            payment_intent = stripe_client.PaymentIntent.create(
                amount=amount,
                currency="vnd",
                customer=customer_id,
                payment_method=payment_method_id,
                off_session=True,
                confirm=True,
                setup_future_usage="off_session",
                metadata={"invoice_id": str(invoice.id)},
            )
        except stripe.error.StripeError as exc:
            await invoiceService.update_invoice(
                invoice.id,
                InvoiceUpdate(status=InvoiceStatus.FAILED),
                db,
            )
            logger.exception("Stripe PaymentIntent creation failed for invoice %s", invoice.id)
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY, detail="Unable to process payment with Stripe"
            ) from exc

        subscription_payload = UserSubscriptionCreate(
            user_code=user_code,
            sub_plan_id=sub_plan_id,
            term_id=term_id,
            vehicle_id=vehicle_id,
            payment_plan_id=payment_plan_id,
            total_amount=total_amount_value,
            paid_amount=amount,
            status=SubscriptionStatus.ACTIVE,
            start_date=start_date,
            end_date=end_date,
        )
        subscription = await subscriptionService.create_subscription(subscription_payload, db)

        await paymentTransactionService.create_transaction(
            PaymentTransactionCreate(
                invoice_id=invoice.id,
                attempt_number=1,
                transaction_code=payment_intent.id,
                status=TransactionStatus.SUCCESS,
                response_message=f"PaymentIntent {payment_intent.status}",
            ),
            db,
        )

        invoice = await invoiceService.update_invoice(
            invoice.id,
            InvoiceUpdate(
                status=InvoiceStatus.PAID,
                subscription_id=subscription.id,
                stripe_invoice_id=payment_intent.id,
            ),
            db,
        )

        user = await userService.crud.get(db, user_code)
        send_payment_confirmation_email(user, invoice, subscription)

        return {
            "invoice_id": str(invoice.id),
            "subscription_id": str(subscription.id),
            "payment_intent_id": payment_intent.id,
            "status": payment_intent.status,
        }
