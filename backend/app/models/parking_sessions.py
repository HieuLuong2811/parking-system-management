from __future__ import annotations

from datetime import datetime
from typing import Optional
import uuid

from sqlalchemy import Column as SAColumn, Enum, Integer, String
from sqlmodel import Field, SQLModel

from app.enums.parking import ParkingSessionStatus, ParkingVehicleMode, UserType
from app.models.responses import FeeBreakdown, PlateLookupAction
from .mixins import TimestampMixin


class ParkingSessionBase(SQLModel):
    license_plate: Optional[str] = Field(
        default=None,
        max_length=50,
        sa_column=SAColumn(String(50), nullable=True, index=True),
    )
    check_in_time: datetime
    check_out_time: Optional[datetime] = None
    status: ParkingSessionStatus = Field(
        sa_column=SAColumn(Enum(ParkingSessionStatus, name="parking_session_status_enum", create_type=False), nullable=False),
        default=ParkingSessionStatus.ACTIVE,
    )
    user_type: UserType = Field(
        sa_column=SAColumn(Enum(UserType, name="user_type_enum", create_type=False), nullable=False),
        default=UserType.GUEST,
    )
    total_amount: Optional[int] = Field(default=None, sa_column=SAColumn(Integer, nullable=True))
    access_card_id: uuid.UUID | None = Field(
        default=None,
        foreign_key="parking_access_cards.id",
        index=True,
    )
    vehicle_mode: ParkingVehicleMode | None = Field(
        default=None,
        sa_column=SAColumn(
            Enum(
                ParkingVehicleMode,
                name="parking_vehicle_mode_enum",
                create_type=False,
            ),
            nullable=True,
            index=True,
        ),
    )

class ParkingSession(ParkingSessionBase, TimestampMixin, table=True):
    __tablename__ = "parking_sessions"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    check_in_plate_image_url: Optional[str] = Field(
        default=None,
        max_length=500,
        sa_column=SAColumn(String(500), nullable=True),
    )
    check_out_plate_image_url: Optional[str] = Field(
        default=None,
        max_length=500,
        sa_column=SAColumn(String(500), nullable=True),
    )


class ParkingSessionCreate(ParkingSessionBase):
    check_in_plate_image_url: Optional[str] = None
    check_out_plate_image_url: Optional[str] = None


class ParkingSessionRead(ParkingSessionBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    allow_gate: bool | None = None
    message: str | None = None
    fee_breakdown: FeeBreakdown | None = None
    licensePlate: Optional[str] = None
    payment_source: str | None = None
    user_code: Optional[str] = None
    user_full_name: Optional[str] = None
    subscription_plan_code: Optional[str] = None
    subscription_status: Optional[str] = None


class ParkingSessionMeRead(ParkingSessionBase):
    """
    Slim response model for `/parking_sessions/me`.

    Avoid returning access-control enrichment fields that aren't used by the mobile app.
    """

    id: uuid.UUID
    created_at: datetime
    updated_at: datetime


class ParkingSessionAdminRead(ParkingSessionRead):
    user_code: Optional[str] = None
    user_full_name: Optional[str] = None
    check_in_plate_image_url: Optional[str] = None
    check_out_plate_image_url: Optional[str] = None

class ParkingSessionUpdate(SQLModel):
    check_out_time: Optional[datetime] = None
    status: Optional[ParkingSessionStatus] = None
    user_type: Optional[UserType] = None
    total_amount: Optional[int] = None
    check_in_plate_image_url: Optional[str] = None
    check_out_plate_image_url: Optional[str] = None


class ParkingSessionBarcodeCheckIn(SQLModel):
    barcode_token: str


class ParkingSessionPlateCheckIn(SQLModel):
    license_plate: str

class ParkingSessionPlateConfirm(SQLModel):
    license_plate: str
    action: PlateLookupAction

class ParkingSessionAccessConfirm(SQLModel):
    barcode_token: str
    action: PlateLookupAction | None = None
    vehicle_mode: ParkingVehicleMode | None = None
    license_plate: str | None = None
    payment_source: str | None = None
    plate_image_url: str | None = None
