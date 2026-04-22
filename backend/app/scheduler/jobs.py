from __future__ import annotations

import logging
import re
import uuid
from datetime import date, datetime
from typing import Optional

import stripe
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.stripe_client import ensure_stripe_configured, stripe_client
from app.db.session import AsyncSessionLocal
from app.enums.parking import InvoiceStatus, PaymentMethod, PaymentType, SubscriptionStatus
from app.models.invoices import Invoice, InvoiceCreate, InvoiceUpdate
from app.models.notifications import NotificationCreate
from app.models.payment_plans import PaymentPlan
from app.models.payment_transactions import PaymentTransactionCreate
from app.models.subscriptions import UserSubscription, UserSubscriptionUpdate
from app.models.terms import AcademicTerm, AcademicTermUpdate
from app.models.users import Users
from app.service.invoices import invoiceService
from app.service.notifications import notificationService
from app.service.payment_notifications import (
    send_billing_failed_email,
    send_billing_success_email,
)
from app.service.payment_transactions import paymentTransactionService
from app.service.subscriptions import subscriptionService
from app.service.terms import termService
from app.scheduler.utils import DEFAULT_TZ, add_years_safe, is_last_day_of_month, local_day_bounds_utc

logger = logging.getLogger(__name__)


async def cron_monthly_billing_attempt_1() -> None:
    await _run_monthly_billing(attempt_number=1, suspend_on_failure=False)


async def cron_monthly_billing_attempt_2() -> None:
    await _run_monthly_billing(attempt_number=2, suspend_on_failure=False)


async def cron_monthly_billing_attempt_3() -> None:
    await _run_monthly_billing(attempt_number=3, suspend_on_failure=True)


async def cron_academic_terms_rollover() -> None:
    async with AsyncSessionLocal() as db:
        await _roll_academic_terms_forward(db)


async def _run_monthly_billing(*, attempt_number: int, suspend_on_failure: bool) -> None:
    now_local = datetime.now(DEFAULT_TZ)
    today = now_local.date()
    if not is_last_day_of_month(today):
        return

    async with AsyncSessionLocal() as db:
        subscriptions = await _get_active_monthly_subscriptions(db)
        logger.info(
            "Monthly billing run attempt=%s subscriptions=%s date=%s",
            attempt_number,
            len(subscriptions),
            today.isoformat(),
        )
        for subscription, user in subscriptions:
            try:
                await _process_subscription_monthly_billing(
                    subscription=subscription,
                    user=user,
                    db=db,
                    today=today,
                    attempt_number=attempt_number,
                    suspend_on_failure=suspend_on_failure,
                )
            except Exception:
                logger.exception(
                    "Monthly billing attempt=%s failed for subscription=%s user=%s",
                    attempt_number,
                    getattr(subscription, "id", None),
                    getattr(user, "user_code", None),
                )


async def _get_active_monthly_subscriptions(db: AsyncSession) -> list[tuple[UserSubscription, Users]]:
    statement = (
        select(UserSubscription, Users)
        .join(PaymentPlan, PaymentPlan.id == UserSubscription.payment_plan_id)
        .join(Users, Users.user_code == UserSubscription.user_code)
        .where(UserSubscription.status == SubscriptionStatus.ACTIVE)
        .where(PaymentPlan.payment_type == PaymentType.MONTHLY)
        .where(Users.deleted_at.is_(None))
        .order_by(UserSubscription.created_at.desc())
    )
    result = await db.execute(statement)
    return [(sub, user) for sub, user in result.all()]


async def _process_subscription_monthly_billing(
    *,
    subscription: UserSubscription,
    user: Users,
    db: AsyncSession,
    today: date,
    attempt_number: int,
    suspend_on_failure: bool,
) -> None:
    if subscription.status != SubscriptionStatus.ACTIVE:
        return

    day_start_utc, day_end_utc = local_day_bounds_utc(today)

    today_invoice = await _get_latest_invoice_for_subscription(
        db,
        subscription_id=subscription.id,
        created_from=day_start_utc,
        created_to=day_end_utc,
    )

    # Attempt 1 creates the day's invoice; retries re-use it.
    if attempt_number == 1:
        if today_invoice is not None:
            # Idempotency: do not create/re-charge again on the same day.
            return
        latest_invoice = await _get_latest_invoice_for_subscription(db, subscription_id=subscription.id)
        if latest_invoice and latest_invoice.status == InvoiceStatus.PAID:
            # Already paid recently; still allow billing next month only.
            pass
        amount_to_charge = subscription.total_amount
        if latest_invoice and latest_invoice.status != InvoiceStatus.PAID:
            amount_to_charge += int(latest_invoice.amount or 0)

        invoice = await invoiceService.create_invoice(
            InvoiceCreate(
                user_code=subscription.user_code,
                subscription_id=subscription.id,
                amount=amount_to_charge,
                payment_method=PaymentMethod.STRIPE,
                status=InvoiceStatus.PENDING,
            ),
            db,
        )
    else:
        if today_invoice is None:
            return
        if today_invoice.status == InvoiceStatus.PAID:
            return
        invoice = today_invoice

    await _attempt_stripe_charge(
        subscription=subscription,
        user=user,
        invoice=invoice,
        db=db,
        attempt_number=attempt_number,
        suspend_on_failure=suspend_on_failure,
    )


async def _get_latest_invoice_for_subscription(
    db: AsyncSession,
    *,
    subscription_id: uuid.UUID,
    created_from: datetime | None = None,
    created_to: datetime | None = None,
) -> Optional[Invoice]:
    statement = select(Invoice).where(Invoice.subscription_id == subscription_id)
    if created_from is not None:
        statement = statement.where(Invoice.created_at >= created_from)
    if created_to is not None:
        statement = statement.where(Invoice.created_at < created_to)
    statement = statement.order_by(Invoice.created_at.desc()).limit(1)
    result = await db.execute(statement)
    return result.scalars().first()


def _stripe_default_payment_method_id(customer_id: str) -> str | None:
    customer = stripe_client.Customer.retrieve(
        customer_id,
        expand=["invoice_settings.default_payment_method"],
    )
    invoice_settings = customer.get("invoice_settings") if hasattr(customer, "get") else getattr(customer, "invoice_settings", None)
    if hasattr(invoice_settings, "get"):
        default_pm = invoice_settings.get("default_payment_method")
    elif isinstance(invoice_settings, dict):
        default_pm = invoice_settings.get("default_payment_method")
    else:
        default_pm = getattr(invoice_settings, "default_payment_method", None)
    if not default_pm:
        return None
    if isinstance(default_pm, str):
        return default_pm
    return getattr(default_pm, "id", None)


async def _attempt_stripe_charge(
    *,
    subscription: UserSubscription,
    user: Users,
    invoice: Invoice,
    db: AsyncSession,
    attempt_number: int,
    suspend_on_failure: bool,
) -> None:
    ensure_stripe_configured()

    customer_id = user.stripe_customer_id
    if not customer_id:
        await _record_failed_attempt(
            subscription=subscription,
            user=user,
            invoice=invoice,
            db=db,
            attempt_number=attempt_number,
            error_message="Missing Stripe customer_id",
            suspend_on_failure=suspend_on_failure,
        )
        return

    payment_method_id = _stripe_default_payment_method_id(customer_id)
    if not payment_method_id:
        await _record_failed_attempt(
            subscription=subscription,
            user=user,
            invoice=invoice,
            db=db,
            attempt_number=attempt_number,
            error_message="Missing default Stripe payment method",
            suspend_on_failure=suspend_on_failure,
        )
        return

    try:
        payment_intent = stripe_client.PaymentIntent.create(
            amount=int(invoice.amount),
            currency="vnd",
            customer=customer_id,
            payment_method=payment_method_id,
            off_session=True,
            confirm=True,
            metadata={"invoice_id": str(invoice.id), "subscription_id": str(subscription.id), "attempt": str(attempt_number)},
        )
    except stripe.error.StripeError as exc:
        await _record_failed_attempt(
            subscription=subscription,
            user=user,
            invoice=invoice,
            db=db,
            attempt_number=attempt_number,
            error_message=str(getattr(exc, "user_message", None) or str(exc)),
            suspend_on_failure=suspend_on_failure,
        )
        return

    # Success path
    await paymentTransactionService.create_transaction(
        PaymentTransactionCreate(
            invoice_id=invoice.id,
            attempt_number=attempt_number,
            transaction_code=payment_intent.id,
            response_message=f"PaymentIntent {payment_intent.status}",
        ),
        db,
    )

    await invoiceService.update_invoice(
        str(invoice.id),
        InvoiceUpdate(status=InvoiceStatus.PAID, stripe_invoice_id=payment_intent.id),
        db,
    )

    # Track paid amount on the subscription.
    await subscriptionService.update_subscription(
        str(subscription.id),
        UserSubscriptionUpdate(paid_amount=int(subscription.paid_amount or 0) + int(invoice.amount)),
        db,
    )

    await notificationService.create_notification(
        NotificationCreate(
            actor_id=None,
            receiver_id=subscription.user_code,
            title="Thanh toán thành công",
            content=f"Thanh toán tự động thành công cho hóa đơn {invoice.id} ({invoice.amount:,} VND).",
            is_read=False,
        ),
        db,
    )

    send_billing_success_email(user=user, invoice=invoice, subscription=subscription)


async def _record_failed_attempt(
    *,
    subscription: UserSubscription,
    user: Users,
    invoice: Invoice,
    db: AsyncSession,
    attempt_number: int,
    error_message: str,
    suspend_on_failure: bool,
) -> None:
    await paymentTransactionService.create_transaction(
        PaymentTransactionCreate(
            invoice_id=invoice.id,
            attempt_number=attempt_number,
            transaction_code=f"FAILED-{uuid.uuid4()}",
            response_message=error_message,
        ),
        db,
    )
    await invoiceService.update_invoice(
        str(invoice.id),
        InvoiceUpdate(status=InvoiceStatus.FAILED),
        db,
    )

    if suspend_on_failure:
        await subscriptionService.update_subscription(
            str(subscription.id),
            UserSubscriptionUpdate(status=SubscriptionStatus.SUSPENDED),
            db,
        )

    send_billing_failed_email(
        user=user,
        invoice=invoice,
        subscription=subscription,
        attempt_number=attempt_number,
        error_message=error_message,
        suspended=suspend_on_failure,
    )


async def _roll_academic_terms_forward(db: AsyncSession) -> None:
    today = datetime.now(DEFAULT_TZ).date()
    current_year = today.year

    terms = await termService.crud.get_all(db)
    if not terms:
        return

    # Idempotency: only roll forward when all terms are still for previous start years.
    max_start_year = max(term.start_date.year for term in terms)
    if max_start_year >= current_year:
        return

    for term in terms:
        new_start = add_years_safe(term.start_date, 1)
        new_end = add_years_safe(term.end_date, 1)
        new_name = _bump_years_in_term_name(term.term_name, delta=1)
        await termService.update_term(
            str(term.id),
            AcademicTermUpdate(term_name=new_name, start_date=new_start, end_date=new_end),
            db,
        )

    logger.info("Academic terms rolled forward by 1 year (count=%s)", len(terms))


_TERM_YEAR_PAIR = re.compile(r"(?P<y1>\\b\\d{4}\\b)\\s*[-–]\\s*(?P<y2>\\b\\d{4}\\b)")
_TERM_SINGLE_YEAR = re.compile(r"\\b\\d{4}\\b")


def _bump_years_in_term_name(value: str, *, delta: int) -> str:
    def repl_pair(match: re.Match[str]) -> str:
        y1 = int(match.group("y1")) + delta
        y2 = int(match.group("y2")) + delta
        return f"{y1}-{y2}"

    updated = _TERM_YEAR_PAIR.sub(repl_pair, value)
    if updated != value:
        return updated

    # Fallback: bump the first year occurrence if present.
    match = _TERM_SINGLE_YEAR.search(value)
    if not match:
        return value
    year = int(match.group(0)) + delta
    return value[: match.start()] + str(year) + value[match.end() :]
