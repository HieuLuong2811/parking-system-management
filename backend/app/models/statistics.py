from __future__ import annotations

from datetime import datetime
from sqlmodel import SQLModel


class DashboardSummary(SQLModel):
    # Preferred KPIs for school parking operations
    vehicles_in_parking: int
    today_checkins: int
    today_checkouts: int
    today_revenue: int | float
    monthly_revenue: int | float
    pending_invoices: int
    active_subscription_users: int
    expiring_subscriptions: int

    # Backward-compatible fields (dashboard v1)
    total_users: int = 0
    registered_users: int = 0
    unregistered_users: int = 0
    registration_rate: float = 0
    active_subscriptions: int = 0
    today_sessions: int = 0


class ConsoleSummary(SQLModel):
    vehicles_in_parking: int
    today_checkins: int
    today_checkouts: int


class ChartPoint(SQLModel):
    label: str
    value: int | float


class MonthlySubscriptionPoint(SQLModel):
    month: str
    new_subscriptions: int


class MonthlyRevenuePoint(SQLModel):
    month: str
    revenue: int | float


class MonthlyParkingSessionPoint(SQLModel):
    month: str
    sessions: int


class StatusDistributionPoint(SQLModel):
    status: str
    count: int


class DashboardCharts(SQLModel):
    subscription_adoption: list[ChartPoint]
    monthly_subscriptions: list[MonthlySubscriptionPoint]
    monthly_revenue: list[MonthlyRevenuePoint]
    monthly_parking_sessions: list[MonthlyParkingSessionPoint]
    invoice_status_distribution: list[StatusDistributionPoint]
    subscription_status_distribution: list[StatusDistributionPoint]


class RecentInvoiceItem(SQLModel):
    id: str
    user_code: str | None = None
    user_full_name: str | None = None
    amount: int | float
    status: str
    payment_method: str | None = None
    created_at: datetime


class RecentParkingSessionItem(SQLModel):
    id: str
    user_code: str | None = None
    user_full_name: str | None = None
    license_plate: str | None = None
    status: str
    check_in_time: datetime | None = None
    check_out_time: datetime | None = None


class DashboardRecent(SQLModel):
    invoices: list[RecentInvoiceItem]
    sessions: list[RecentParkingSessionItem]
