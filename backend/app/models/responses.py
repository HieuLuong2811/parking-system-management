from enum import Enum

from sqlmodel import SQLModel


class DeleteResponse(SQLModel):
    message: str


class FeeBreakdown(SQLModel):
    base_amount: int | None = None
    after_18_amount: int | None = None
    total_amount: int | None = None
    has_active_subscription: bool | None = None
    subscription_benefit_applied: bool | None = None
    subscription_plan_code: str | None = None
    fee_policy_message: str | None = None


class SubscriptionInfo(SQLModel):
    plans_type: str | None = None
    plan_code: str | None = None
    payment_type: str | None = None
    status: str | None = None
    paid_amount: int | None = None
    total_amount: int | None = None


class ParkingSessionInfo(SQLModel):
    id: str
    check_in_time: str
    status: str
    check_out_time: str | None = None
    total_amount: int | None = None

class PlateLookupAction(str, Enum):
    CHECK_IN = "CHECK_IN"
    CHECK_OUT = "CHECK_OUT"