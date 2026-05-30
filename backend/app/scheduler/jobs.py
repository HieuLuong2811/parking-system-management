from __future__ import annotations

import logging
import re
from datetime import datetime
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import AsyncSessionLocal
from app.enums.parking import (
    InvoiceStatus,
    InvoiceType,
    PaymentMethod,
    PaymentTransactionStatus,
    PaymentTransactionType,
    PaymentType,
    SubscriptionStatus,
)
from app.models.invoices import InvoiceCreate, Invoice
from app.models.notifications import NotificationCreate
from app.models.payment_plans import PaymentPlan
from app.models.payment_transactions import PaymentTransaction
from app.models.subscriptions import UserSubscription, UserSubscriptionUpdate
from app.models.terms import AcademicTermUpdate
from app.models.users import Users
from app.scheduler.utils import (
    DEFAULT_TZ,
    add_years_safe,
    is_last_day_of_month,
    last_day_next_month,
)
from app.service.admin_billing_reports import (
    build_unpaid_subscription_excel,
    get_admin_emails,
    get_unpaid_subscription_rows,
)
from app.service.invoices import invoiceService
from app.service.notifications import notificationService
from app.service.payment_notifications import (
    send_admin_billing_report_email,
    send_admin_billing_failure_alert_email,
    send_billing_failed_email,
    send_billing_success_email,
)
from app.service.subscriptions import subscriptionService
from app.service.terms import termService
from app.service.user_wallets import userWalletService

logger = logging.getLogger(__name__)


MONTHLY_BILLING_STATUSES = [SubscriptionStatus.ACTIVE, SubscriptionStatus.PAYMENT_DUE]


async def cron_monthly_billing_attempt_1() -> None:
    await _run_billing(attempt=1)


async def cron_monthly_billing_attempt_2() -> None:
    await _run_billing(attempt=2)


async def cron_monthly_billing_attempt_3() -> None:
    await _run_billing(attempt=3)


async def cron_academic_terms_rollover() -> None:
    async with AsyncSessionLocal() as db:
        await _roll_academic_terms_forward(db)
        await db.commit()


async def _get_subscriptions(db: AsyncSession):
    stmt = (
        select(UserSubscription, Users)
        .join(PaymentPlan, PaymentPlan.id == UserSubscription.payment_plan_id)
        .join(Users, Users.user_code == UserSubscription.user_code)
        .where(UserSubscription.status.in_(MONTHLY_BILLING_STATUSES))
        .where(PaymentPlan.payment_type == PaymentType.MONTHLY)
    )

    res = await db.execute(stmt)
    return res.all()


async def _run_billing(*, attempt: int) -> None:
    today = datetime.now(DEFAULT_TZ).date()

    if not is_last_day_of_month(today):
        return

    async with AsyncSessionLocal() as db:
        subs = await _get_subscriptions(db)

        for sub, user in subs:
            try:
                await _process_subscription(
                    sub=sub,
                    user=user,
                    db=db,
                    attempt=attempt,
                    today=today,
                )
                await db.commit()
            except Exception:
                await db.rollback()
                logger.exception("Billing failed sub=%s", sub.id)

        # End-of-day report to admins (best-effort).
        if attempt == 3:
            try:
                await _send_admin_billing_report(db)
                await db.commit()
            except Exception:
                await db.rollback()
                logger.exception("Failed to send admin billing report")


async def _process_subscription(
    *,
    sub: UserSubscription,
    user: Users,
    db: AsyncSession,
    attempt: int,
    today,
) -> None:
    invoice = await invoiceService.find_current_month_invoice_by_subscription(
        db,
        sub.id,
        today=today,
    )

    if invoice and invoice.status == InvoiceStatus.PAID:
        await _handle_paid_invoice(sub=sub, db=db)
        return

    invoice = await _ensure_pending_invoice(sub=sub, invoice=invoice, db=db)

    if sub.status == SubscriptionStatus.ACTIVE:
        await subscriptionService.update_subscription(
            str(sub.id),
            UserSubscriptionUpdate(status=SubscriptionStatus.PAYMENT_DUE),
            db,
        )

    await _attempt_wallet_charge(
        sub=sub,
        user=user,
        invoice=invoice,
        db=db,
        attempt=attempt,
        today=today,
    )


async def _ensure_pending_invoice(
    *,
    sub: UserSubscription,
    invoice: Invoice | None,
    db: AsyncSession,
) -> Invoice:
    if invoice:
        return invoice

    return await invoiceService.create_invoice(
        InvoiceCreate(
            user_code=sub.user_code,
            subscription_id=sub.id,
            amount=sub.total_amount,
            invoice_type=InvoiceType.OTHER,
            payment_method=PaymentMethod.WALLET,
            status=InvoiceStatus.PENDING,
        ),
        db,
    )


async def _handle_paid_invoice(
    *,
    sub: UserSubscription,
    db: AsyncSession,
) -> None:
    if sub.status == SubscriptionStatus.PAYMENT_DUE:
        await subscriptionService.update_subscription(
            str(sub.id),
            UserSubscriptionUpdate(status=SubscriptionStatus.ACTIVE),
            db,
        )


async def _attempt_wallet_charge(
    *,
    sub: UserSubscription,
    user: Users,
    invoice: Invoice,
    db: AsyncSession,
    attempt: int,
    today,
) -> None:
    wallet = await userWalletService.get_or_create_wallet_for_update(user_code=sub.user_code, db=db)
    userWalletService.ensure_wallet_can_change_balance(wallet)

    amount = Decimal(str(invoice.amount or 0))
    current_balance = wallet.balance or Decimal("0")

    if amount > 0 and current_balance >= amount:
        balance_before = current_balance
        wallet.balance = balance_before - amount
        wallet.updated_at = datetime.utcnow()

        invoice.status = InvoiceStatus.PAID
        invoice.paid_at = datetime.utcnow()
        invoice.attempt_count = max(int(invoice.attempt_count or 0), attempt)
        invoice.payment_method = PaymentMethod.WALLET

        sub.next_billing_date = last_day_next_month(today)
        sub.billing_attempt_count = 0

        db.add(
            PaymentTransaction(
                user_code=sub.user_code,
                wallet_id=wallet.wallet_id,
                invoice_id=invoice.id,
                subscription_id=sub.id,
                transaction_type=PaymentTransactionType.MONTHLY_CHARGE,
                payment_method=PaymentMethod.WALLET,
                amount=amount,
                status=PaymentTransactionStatus.SUCCESS,
                balance_before=balance_before,
                balance_after=wallet.balance,
                description="Monthly wallet charge",
                attempt_number=attempt,
                response_message="SUCCESS",
            )
        )

        await subscriptionService.update_subscription(
            str(sub.id),
            UserSubscriptionUpdate(status=SubscriptionStatus.ACTIVE),
            db,
        )

        await _notify_user_success(sub=sub, user=user, invoice=invoice, db=db)
        send_billing_success_email(user=user, invoice=invoice, subscription=sub)
        return

    # Insufficient funds: record failed attempt, keep invoice pending until attempt 3.
    invoice.attempt_count = max(int(invoice.attempt_count or 0), attempt)
    sub.billing_attempt_count = attempt

    db.add(
        PaymentTransaction(
            user_code=sub.user_code,
            wallet_id=wallet.wallet_id,
            invoice_id=invoice.id,
            subscription_id=sub.id,
            transaction_type=PaymentTransactionType.MONTHLY_CHARGE,
            payment_method=PaymentMethod.WALLET,
            amount=amount,
            status=PaymentTransactionStatus.FAILED,
            balance_before=current_balance,
            balance_after=current_balance,
            description="Monthly wallet charge failed: insufficient balance",
            attempt_number=attempt,
            response_message="insufficient_balance",
        )
    )

    suspended = attempt >= 3
    if suspended:
        invoice.status = InvoiceStatus.FAILED
        await subscriptionService.update_subscription(
            str(sub.id),
            UserSubscriptionUpdate(status=SubscriptionStatus.SUSPENDED),
            db,
        )
        try:
            admin_emails = await get_admin_emails(db)
            send_admin_billing_failure_alert_email(
                admin_emails=admin_emails,
                user=user,
                invoice=invoice,
                subscription=sub,
                amount_vnd=int(invoice.amount or 0),
                lang="vi",
            )
        except Exception:
            logger.exception("Failed to send admin billing failure alert for invoice=%s", invoice.id)

    await _notify_user_failed(sub=sub, user=user, invoice=invoice, db=db, attempt=attempt, suspended=suspended)


async def _notify_user_success(*, sub: UserSubscription, user: Users, invoice: Invoice, db: AsyncSession) -> None:
    await notificationService.create_notification(
        NotificationCreate(
            receiver_id=sub.user_code,
            title="Thanh toán hóa đơn",
            content=f"Thanh toán thành công - Invoice {invoice.id}",
            is_read=False,
        ),
        db,
    )


async def _notify_user_failed(
    *,
    sub: UserSubscription,
    user: Users,
    invoice: Invoice,
    db: AsyncSession,
    attempt: int,
    suspended: bool,
) -> None:
    message = "Số dư ví không đủ để thanh toán vé gửi xe hàng tháng"
    await notificationService.create_notification(
        NotificationCreate(
            receiver_id=sub.user_code,
            title="Thanh toán hóa đơn",
            content=f"{message} - Invoice {invoice.id}",
            is_read=False,
        ),
        db,
    )

    send_billing_failed_email(
        user=user,
        invoice=invoice,
        subscription=sub,
        attempt_number=attempt,
        error_message=message,
        suspended=suspended,
    )


async def _roll_academic_terms_forward(db: AsyncSession) -> None:
    today = datetime.now(DEFAULT_TZ).date()
    current_year = today.year
    terms = await termService.crud.get_all(db)

    if not terms:
        return

    max_start_year = max(term.start_date.year for term in terms)

    if max_start_year >= current_year:
        return

    for term in terms:
        new_start = add_years_safe(term.start_date, 1)
        new_end = add_years_safe(term.end_date, 1)
        new_name = _bump_years_in_term_name(term.term_name, delta=1)

        await termService.update_term(
            str(term.id),
            AcademicTermUpdate(
                term_name=new_name,
                start_date=new_start,
                end_date=new_end,
            ),
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

    match = _TERM_SINGLE_YEAR.search(value)

    if not match:
        return value

    year = int(match.group(0)) + delta

    return value[: match.start()] + str(year) + value[match.end() :]


async def _send_admin_billing_report(db: AsyncSession) -> None:
    rows = await get_unpaid_subscription_rows(db)

    if not rows:
        logger.info("No unpaid subscriptions found for admin billing report")
        return

    admin_emails = await get_admin_emails(db)

    if not admin_emails:
        logger.warning("No admin emails found for admin billing report")
        return

    excel_bytes = build_unpaid_subscription_excel(rows)

    filename = (
        "bao-cao-sinh-vien-chua-thanh-toan-gui-xe"
        f"{datetime.now(DEFAULT_TZ).strftime('%Y%m%d')}.xlsx"
    )

    send_admin_billing_report_email(
        admin_emails=admin_emails,
        report_rows_count=len(rows),
        excel_bytes=excel_bytes,
        filename=filename,
        lang="vi",
    )
