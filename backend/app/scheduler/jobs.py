from __future__ import annotations

import logging
from datetime import date, datetime
import re

from app.models.terms import AcademicTermUpdate
from app.service.terms import termService
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import AsyncSessionLocal
from app.enums.parking import InvoiceStatus, PaymentMethod, PaymentType, SubscriptionStatus
from app.models.invoices import InvoiceCreate
from app.models.notifications import NotificationCreate
from app.models.payment_plans import PaymentPlan
from app.models.subscriptions import UserSubscription, UserSubscriptionUpdate
from app.models.users import Users

from app.service.invoices import invoiceService
from app.service.notifications import notificationService
from app.service.subscriptions import subscriptionService
from app.service.payment_notifications import send_billing_failed_email

from app.scheduler.utils import DEFAULT_TZ, add_years_safe, is_last_day_of_month

logger = logging.getLogger(__name__)


async def cron_monthly_billing_attempt_1():
    await _run_billing(attempt=1)


async def cron_monthly_billing_attempt_2():
    await _run_billing(attempt=2)


async def cron_monthly_billing_attempt_3():
    await _run_billing(attempt=3)

async def cron_academic_terms_rollover() -> None: 
    async with AsyncSessionLocal() as db: 
        await _roll_academic_terms_forward(db)

async def _get_subscriptions(db: AsyncSession):
    stmt = (
        select(UserSubscription, Users)
        .join(PaymentPlan, PaymentPlan.id == UserSubscription.payment_plan_id)
        .join(Users, Users.user_code == UserSubscription.user_code)
        .where(UserSubscription.status.in_([
            SubscriptionStatus.ACTIVE,
            SubscriptionStatus.OVERDUE,
        ]))
        .where(PaymentPlan.payment_type == PaymentType.MONTHLY)
    )

    res = await db.execute(stmt)
    return res.all()

async def _run_billing(*, attempt: int):
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
                )
            except Exception:
                logger.exception("Billing failed sub=%s", sub.id)

async def _process_subscription(
    *,
    sub: UserSubscription,
    user: Users,
    db: AsyncSession,
    attempt: int,
):
    if sub.status == SubscriptionStatus.CANCELED:
        return

    invoice = await invoiceService.find_current_month_invoice_by_subscription(
        db, sub.id, today=datetime.now(DEFAULT_TZ).date(),
    )

    if attempt == 1:
        if invoice and invoice.status == InvoiceStatus.PENDING:
            return

        invoice = await invoiceService.create_invoice(
            InvoiceCreate(
                user_code=sub.user_code,
                subscription_id=sub.id,
                amount=sub.total_amount,
                payment_method=PaymentMethod.MOMO,
                status=InvoiceStatus.PENDING,
            ),
            db,
        )

        if sub.status != SubscriptionStatus.CANCELED:
            await subscriptionService.update_subscription(
                str(sub.id),
                UserSubscriptionUpdate(status=SubscriptionStatus.PAYMENT_DUE),
                db,
            )

        await _notify_user(sub, user, invoice, db, "Tạo hóa đơn tháng")

    else:
        if not invoice or invoice.status == InvoiceStatus.PAID:
            return

        await _notify_user(sub, user, invoice, db, f"Nhắc thanh toán lần {attempt}")

    if (
        attempt == 3 
        and invoice.status != InvoiceStatus.PAID
        and sub.status != SubscriptionStatus.CANCELED
    ):
        await subscriptionService.update_subscription(
            str(sub.id),
            UserSubscriptionUpdate(status=SubscriptionStatus.SUSPENDED),
            db,
        )

        await _notify_user(sub, user, invoice, db, "Tài khoản bị tạm ngưng")
async def _notify_user(sub, user, invoice, db, message: str):
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
        attempt_number=0,
        error_message=message,
        suspended=False,
    )

async def _roll_academic_terms_forward(db: AsyncSession) -> None: 
    today = datetime.now(DEFAULT_TZ).date() 
    current_year = today.year 
    terms = await termService.crud.get_all(db) 
    if not terms: return 
    # Idempotency: only roll forward when all terms are still for previous start years. 
    max_start_year = max(term.start_date.year for term in terms) 
    if max_start_year >= current_year: return 
    for term in terms: 
        new_start = add_years_safe(term.start_date, 1) 
        new_end = add_years_safe(term.end_date, 1) 
        new_name = _bump_years_in_term_name(term.term_name, delta=1) 
        await termService.update_term( 
            str(term.id), 
            AcademicTermUpdate(term_name=new_name, start_date=new_start, end_date=new_end), db, ) 
        logger.info("Academic terms rolled forward by 1 year (count=%s)", len(terms)) 

_TERM_YEAR_PAIR = re.compile(r"(?P<y1>\\b\\d{4}\\b)\\s*[-–]\\s*(?P<y2>\\b\\d{4}\\b)") 
_TERM_SINGLE_YEAR = re.compile(r"\\b\\d{4}\\b") 
    
def _bump_years_in_term_name(value: str, *, delta: int) -> str: 
    def repl_pair(match: re.Match[str]) -> str: 
        y1 = int(match.group("y1")) + delta 
        y2 = int(match.group("y2")) + delta 
        return f"{y1}-{y2}" 
    updated = _TERM_YEAR_PAIR.sub(repl_pair, value) 
    if updated != value: return 
    updated 
    # Fallback: bump the first year occurrence if present. 
    match = _TERM_SINGLE_YEAR.search(value) 
    if not match: 
        return value 
    year = int(match.group(0)) + delta 
    return value[: match.start()] + str(year) + value[match.end() :]