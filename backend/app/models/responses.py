from sqlmodel import SQLModel


class DeleteResponse(SQLModel):
    message: str


class SubscriptionInfo(SQLModel):
    plans_type: str | None = None
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


class VehicleLookupResponse(SQLModel):
    id: str
    user_code: str
    vehicle_type: str
    license_plate: str | None = None
    barcode_token: str | None = None
    user_full_name: str
    user_email: str
    active_subscription: SubscriptionInfo | None = None
    active_session: ParkingSessionInfo | None = None
