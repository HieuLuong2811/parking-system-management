from __future__ import annotations

from datetime import date, datetime, timedelta

from sqlalchemy import desc, distinct, extract, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.enums.parking import (
    InvoiceStatus,
    ParkingSessionStatus,
    SubscriptionStatus,
)
from app.models.invoices import Invoice
from app.models.parking_access_cards import ParkingAccessCard
from app.models.parking_sessions import ParkingSession
from app.models.statistics import (
    ChartPoint,
    DashboardCharts,
    DashboardRecent,
    DashboardSummary,
    MonthlyParkingSessionPoint,
    MonthlyRevenuePoint,
    MonthlySubscriptionPoint,
    RecentInvoiceItem,
    RecentParkingSessionItem,
    StatusDistributionPoint,
)
from app.models.subscriptions import UserSubscription
from app.models.users import Users


def _enum_value(value) -> str:
    if value is None:
        return ""
    return getattr(value, "value", str(value))


class statisticService:
    @staticmethod
    async def get_summary(db: AsyncSession) -> DashboardSummary:
        today = date.today()
        start_of_today = datetime.combine(today, datetime.min.time())
        end_of_today = datetime.combine(today, datetime.max.time())
        start_of_month = datetime(today.year, today.month, 1)
        expiring_to = today + timedelta(days=7)

        active_like_statuses = [
            SubscriptionStatus.ACTIVE,
            SubscriptionStatus.PAYMENT_DUE,
            SubscriptionStatus.OVERDUE,
        ]

        total_users = await db.scalar(
            select(func.count())
            .select_from(Users)
            .where(Users.deleted_at.is_(None))
        )

        registered_users = await db.scalar(
            select(func.count(distinct(UserSubscription.user_code)))
            .select_from(UserSubscription)
            .where(UserSubscription.status.in_(active_like_statuses))
        )

        active_subscriptions = await db.scalar(
            select(func.count())
            .select_from(UserSubscription)
            .where(UserSubscription.status == SubscriptionStatus.ACTIVE)
        )

        vehicles_in_parking = await db.scalar(
            select(func.count())
            .select_from(ParkingSession)
            .where(ParkingSession.status == ParkingSessionStatus.ACTIVE)
        )

        today_checkins = await db.scalar(
            select(func.count())
            .select_from(ParkingSession)
            .where(ParkingSession.check_in_time >= start_of_today)
            .where(ParkingSession.check_in_time <= end_of_today)
        )

        today_checkouts = await db.scalar(
            select(func.count())
            .select_from(ParkingSession)
            .where(ParkingSession.check_out_time.is_not(None))
            .where(ParkingSession.check_out_time >= start_of_today)
            .where(ParkingSession.check_out_time <= end_of_today)
        )

        today_revenue = await db.scalar(
            select(func.coalesce(func.sum(Invoice.amount), 0))
            .select_from(Invoice)
            .where(Invoice.status == InvoiceStatus.PAID)
            .where(Invoice.created_at >= start_of_today)
            .where(Invoice.created_at <= end_of_today)
        )

        monthly_revenue = await db.scalar(
            select(func.coalesce(func.sum(Invoice.amount), 0))
            .select_from(Invoice)
            .where(Invoice.status == InvoiceStatus.PAID)
            .where(Invoice.created_at >= start_of_month)
        )

        pending_invoices = await db.scalar(
            select(func.count())
            .select_from(Invoice)
            .where(Invoice.status == InvoiceStatus.PENDING)
        )

        active_subscription_users = await db.scalar(
            select(func.count(distinct(UserSubscription.user_code)))
            .select_from(UserSubscription)
            .where(UserSubscription.status.in_(active_like_statuses))
        )

        expiring_subscriptions = await db.scalar(
            select(func.count())
            .select_from(UserSubscription)
            .where(UserSubscription.status.in_(active_like_statuses))
            .where(UserSubscription.end_date >= today)
            .where(UserSubscription.end_date <= expiring_to)
        )

        total_users = int(total_users or 0)
        registered_users = int(registered_users or 0)
        unregistered_users = max(total_users - registered_users, 0)

        registration_rate = (
            round((registered_users / total_users) * 100, 2)
            if total_users
            else 0
        )

        return DashboardSummary(
            vehicles_in_parking=int(vehicles_in_parking or 0),
            today_checkins=int(today_checkins or 0),
            today_checkouts=int(today_checkouts or 0),
            today_revenue=int(today_revenue or 0),
            monthly_revenue=int(monthly_revenue or 0),
            pending_invoices=int(pending_invoices or 0),
            active_subscription_users=int(active_subscription_users or 0),
            expiring_subscriptions=int(expiring_subscriptions or 0),
            # backward-compatible
            total_users=total_users,
            registered_users=registered_users,
            unregistered_users=unregistered_users,
            registration_rate=registration_rate,
            active_subscriptions=int(active_subscriptions or 0),
            today_sessions=int(today_checkins or 0),
        )

    @staticmethod
    async def get_charts(db: AsyncSession) -> DashboardCharts:
        return DashboardCharts(
            subscription_adoption=await statisticService._get_subscription_adoption(db),
            monthly_subscriptions=await statisticService._get_monthly_subscriptions(db),
            monthly_revenue=await statisticService._get_monthly_revenue(db),
            monthly_parking_sessions=await statisticService._get_monthly_parking_sessions(db),
            invoice_status_distribution=await statisticService._get_invoice_status_distribution(db),
            subscription_status_distribution=await statisticService._get_subscription_status_distribution(db),
        )

    @staticmethod
    async def get_recent(db: AsyncSession) -> DashboardRecent:
        return DashboardRecent(
            invoices=await statisticService._get_recent_invoices(db),
            sessions=await statisticService._get_recent_sessions(db),
        )

    @staticmethod
    async def _get_subscription_adoption(db: AsyncSession) -> list[ChartPoint]:
        active_like_statuses = [
            SubscriptionStatus.ACTIVE,
            SubscriptionStatus.PAYMENT_DUE,
            SubscriptionStatus.OVERDUE,
        ]

        total_users = await db.scalar(
            select(func.count())
            .select_from(Users)
            .where(Users.deleted_at.is_(None))
        )

        registered_users = await db.scalar(
            select(func.count(distinct(UserSubscription.user_code)))
            .select_from(UserSubscription)
            .where(UserSubscription.status.in_(active_like_statuses))
        )

        total_users = int(total_users or 0)
        registered_users = int(registered_users or 0)
        unregistered_users = max(total_users - registered_users, 0)

        return [
            ChartPoint(label="Đã đăng ký", value=registered_users),
            ChartPoint(label="Chưa đăng ký", value=unregistered_users),
        ]

    @staticmethod
    async def _get_monthly_subscriptions(
        db: AsyncSession,
        months: int = 12,
    ) -> list[MonthlySubscriptionPoint]:
        today = date.today()
        result: list[MonthlySubscriptionPoint] = []

        for index in range(months - 1, -1, -1):
            month = today.month - index
            year = today.year

            while month <= 0:
                month += 12
                year -= 1

            count = await db.scalar(
                select(func.count())
                .select_from(UserSubscription)
                .where(extract("year", UserSubscription.created_at) == year)
                .where(extract("month", UserSubscription.created_at) == month)
            )

            result.append(
                MonthlySubscriptionPoint(
                    month=f"{month:02d}/{year}",
                    new_subscriptions=int(count or 0),
                )
            )

        return result

    @staticmethod
    async def _get_monthly_revenue(
        db: AsyncSession,
        months: int = 12,
    ) -> list[MonthlyRevenuePoint]:
        today = date.today()
        result: list[MonthlyRevenuePoint] = []

        for index in range(months - 1, -1, -1):
            month = today.month - index
            year = today.year

            while month <= 0:
                month += 12
                year -= 1

            revenue = await db.scalar(
                select(func.coalesce(func.sum(Invoice.amount), 0))
                .select_from(Invoice)
                .where(Invoice.status == InvoiceStatus.PAID)
                .where(extract("year", Invoice.created_at) == year)
                .where(extract("month", Invoice.created_at) == month)
            )

            result.append(
                MonthlyRevenuePoint(
                    month=f"{month:02d}/{year}",
                    revenue=int(revenue or 0),
                )
            )

        return result

    @staticmethod
    async def _get_monthly_parking_sessions(
        db: AsyncSession,
        months: int = 12,
    ) -> list[MonthlyParkingSessionPoint]:
        today = date.today()
        result: list[MonthlyParkingSessionPoint] = []

        for index in range(months - 1, -1, -1):
            month = today.month - index
            year = today.year

            while month <= 0:
                month += 12
                year -= 1

            sessions = await db.scalar(
                select(func.count())
                .select_from(ParkingSession)
                .where(extract("year", ParkingSession.check_in_time) == year)
                .where(extract("month", ParkingSession.check_in_time) == month)
            )

            result.append(
                MonthlyParkingSessionPoint(
                    month=f"{month:02d}/{year}",
                    sessions=int(sessions or 0),
                )
            )

        return result

    @staticmethod
    async def _get_invoice_status_distribution(
        db: AsyncSession,
    ) -> list[StatusDistributionPoint]:
        rows = await db.execute(
            select(Invoice.status, func.count())
            .select_from(Invoice)
            .group_by(Invoice.status)
        )

        return [
            StatusDistributionPoint(
                status=_enum_value(status),
                count=int(count or 0),
            )
            for status, count in rows.all()
        ]

    @staticmethod
    async def _get_subscription_status_distribution(
        db: AsyncSession,
    ) -> list[StatusDistributionPoint]:
        rows = await db.execute(
            select(UserSubscription.status, func.count())
            .select_from(UserSubscription)
            .group_by(UserSubscription.status)
        )

        return [
            StatusDistributionPoint(
                status=_enum_value(status),
                count=int(count or 0),
            )
            for status, count in rows.all()
        ]

    @staticmethod
    async def _get_recent_invoices(
        db: AsyncSession,
        limit: int = 5,
    ) -> list[RecentInvoiceItem]:
        rows = await db.execute(
            select(Invoice, Users)
            .outerjoin(Users, Users.user_code == Invoice.user_code)
            .order_by(desc(Invoice.created_at))
            .limit(limit)
        )

        result: list[RecentInvoiceItem] = []

        for invoice, user in rows.all():
            result.append(
                RecentInvoiceItem(
                    id=str(invoice.id),
                    user_code=invoice.user_code,
                    user_full_name=user.full_name if user else None,
                    amount=int(invoice.amount or 0),
                    status=_enum_value(invoice.status),
                    payment_method=_enum_value(invoice.payment_method),
                    created_at=invoice.created_at,
                )
            )

        return result

    @staticmethod
    async def _get_recent_sessions(
        db: AsyncSession,
        limit: int = 5,
    ) -> list[RecentParkingSessionItem]:
        rows = await db.execute(
            select(ParkingSession, ParkingAccessCard, Users)
            .outerjoin(ParkingAccessCard, ParkingAccessCard.id == ParkingSession.access_card_id)
            .outerjoin(Users, Users.user_code == ParkingAccessCard.user_code)
            .order_by(desc(ParkingSession.check_in_time))
            .limit(limit)
        )

        result: list[RecentParkingSessionItem] = []

        for session, card, user in rows.all():
            result.append(
                RecentParkingSessionItem(
                    id=str(session.id),
                    user_code=card.user_code if card else None,
                    user_full_name=user.full_name if user else None,
                    license_plate=session.license_plate,
                    status=_enum_value(session.status),
                    check_in_time=session.check_in_time,
                    check_out_time=session.check_out_time,
                )
            )

        return result
