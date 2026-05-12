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
    
class VehicleLookupResponse(SQLModel):
    id: str
    user_code: str | None = None
    user_full_name: str | None = None
    user_email: str | None = None
    vehicle_type: str
    license_plate: str | None = None
    barcode_token: str | None = None
    active_subscription: SubscriptionInfo | None = None
    active_session: ParkingSessionInfo | None = None
    fee_breakdown: FeeBreakdown | None = None
    user_type: str | None = None
    lookup_action: PlateLookupAction | None = None
    lookup_status: str | None = None
    message: str | None = None

