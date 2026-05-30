import json

from app.models.auth import AuthUser
from app.service.invoices import invoiceService
from app.models.subscriptions import UserSubscriptionCreate
from app.service.subscriptions import subscriptionService
from app.enums.parking import InvoiceStatus, InvoiceType, PaymentMethod, SubscriptionStatus, PaymentType
from app.models.invoices import Invoice, InvoiceCreate
from app.models.billing_event_logs import BillingEventLogCreate
from app.service.billing_event_logs import billingEventLogService
from app.models.plans import SubscriptionPlan
from app.models.payment_plans import PaymentPlan
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.checkout import CheckoutMomoRequest
from app.service.user_wallets import userWalletService
from app.models.payment_transactions import PaymentTransaction
from app.enums.parking import PaymentTransactionStatus, PaymentTransactionType
from decimal import Decimal
from datetime import datetime

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

            subscription_payload = UserSubscriptionCreate(
                user_code=current_user.user_code,
                sub_plan_id=payload.sub_plan_id,
                term_id=payload.term_id,
                payment_plan_id=payload.payment_plan_id,
                payment_type=payload.payment_type,
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
                invoice_type=(
                    InvoiceType.SUBSCRIPTION_FULL
                    if payment_type == PaymentType.FULL
                    else InvoiceType.OTHER
                ),
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
            amount = int(payload.amount or 0)
            if amount <= 0:
                raise HTTPException(status_code=400, detail="Invalid amount")

            # SQLAlchemy AsyncSession uses "autobegin": a transaction may already be started
            # by earlier implicit work on the same session. Use a nested transaction in that case.
            tx_ctx = db.begin_nested() if db.in_transaction() else db.begin()
            async with tx_ctx:
                wallet = await userWalletService.get_or_create_wallet_for_update(
                    user_code=current_user.user_code,
                    db=db,
                )
                userWalletService.ensure_wallet_can_change_balance(wallet)

                before = Decimal(str(wallet.balance or 0))
                required = Decimal(str(amount))
                if before < required:
                    raise HTTPException(status_code=400, detail="insufficient_balance")

                wallet.balance = before - required
                wallet.updated_at = datetime.utcnow()
                db.add(wallet)
                await db.flush()

                subscription_payload = UserSubscriptionCreate(
                    user_code=current_user.user_code,
                    sub_plan_id=payload.sub_plan_id,
                    term_id=payload.term_id,
                    payment_plan_id=payload.payment_plan_id,
                    total_amount=amount,
                    paid_amount=amount,
                    status=SubscriptionStatus.ACTIVE,
                    start_date=payload.start_date,
                    end_date=payload.end_date,
                )

                subscription = await subscriptionService.create_subscription_in_tx(
                    subscription_payload,
                    db,
                )
                await db.flush()

                invoice = Invoice(
                    user_code=current_user.user_code,
                    subscription_id=subscription.id,
                    amount=amount,
                    invoice_type=InvoiceType.OTHER,
                    payment_method=PaymentMethod.WALLET,
                    status=InvoiceStatus.PAID,
                )
                db.add(invoice)
                await db.flush()

                tx = PaymentTransaction(
                    user_code=current_user.user_code,
                    invoice_id=invoice.id,
                    subscription_id=subscription.id,
                    transaction_type=PaymentTransactionType.MONTHLY_CHARGE,
                    payment_method=PaymentMethod.WALLET,
                    amount=Decimal(str(amount)),
                    status=PaymentTransactionStatus.SUCCESS,
                    balance_before=before,
                    balance_after=Decimal(str(wallet.balance)),
                    attempt_number=1,
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow(),
                )
                db.add(tx)

            # When using `db.begin()` / `db.begin_nested()`, commit is handled by the context.
            # Keep an explicit commit only if there is no transaction (shouldn't happen here).
            if not db.in_transaction():
                await db.commit()

            return {
                "subscription_id": str(subscription.id),
                "invoice_id": str(invoice.id),
                "payment_transaction_id": str(tx.payment_transaction_id),
                "wallet_balance_after": str(wallet.balance),
                "status": subscription.status,
            }

        except Exception as e:
            await db.rollback()
            raise e

    @staticmethod
    async def create_subscription_full_paid_by_wallet(
        payload,
        db: AsyncSession,
        current_user: AuthUser,
    ):
        try:
            amount = int(payload.amount or 0)
            if amount <= 0:
                raise HTTPException(status_code=400, detail="Invalid amount")

            async with db.begin():
                wallet = await userWalletService.get_or_create_wallet_for_update(
                    user_code=current_user.user_code,
                    db=db,
                )
                userWalletService.ensure_wallet_can_change_balance(wallet)

                before = Decimal(str(wallet.balance or 0))
                required = Decimal(str(amount))
                if before < required:
                    raise HTTPException(
                        status_code=400,
                        detail="insufficient_balance",
                    )

                wallet.balance = before - required
                wallet.updated_at = datetime.utcnow()
                db.add(wallet)
                await db.flush()

                subscription_payload = UserSubscriptionCreate(
                    user_code=current_user.user_code,
                    sub_plan_id=payload.sub_plan_id,
                    term_id=payload.term_id,
                    payment_plan_id=payload.payment_plan_id,
                    total_amount=int(amount),
                    paid_amount=int(amount),
                    status=SubscriptionStatus.ACTIVE,
                    start_date=payload.start_date,
                    end_date=payload.end_date,
                )

                subscription = await subscriptionService.create_subscription_in_tx(subscription_payload, db)
                await db.flush()

                invoice = Invoice(
                    user_code=current_user.user_code,
                    subscription_id=subscription.id,
                    amount=int(amount),
                    invoice_type=InvoiceType.SUBSCRIPTION_FULL,
                    payment_method=PaymentMethod.WALLET,
                    status=InvoiceStatus.PAID,
                )
                db.add(invoice)
                await db.flush()

                tx = PaymentTransaction(
                    user_code=current_user.user_code,
                    invoice_id=invoice.id,
                    subscription_id=subscription.id,
                    transaction_type=PaymentTransactionType.SUBSCRIPTION_FULL_PAYMENT,
                    payment_method=PaymentMethod.WALLET,
                    amount=Decimal(str(amount)),
                    status=PaymentTransactionStatus.SUCCESS,
                    balance_before=before,
                    balance_after=Decimal(str(wallet.balance)),
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow(),
                )
                db.add(tx)

            await db.commit()
            return {
                "subscription_id": str(subscription.id),
                "invoice_id": str(invoice.id),
                "payment_transaction_id": str(tx.payment_transaction_id),
                "wallet_balance_after": str(wallet.balance),
                "status": subscription.status,
            }

        except Exception as e:
            await db.rollback()
            raise e
