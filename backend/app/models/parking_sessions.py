from __future__ import annotations

from datetime import datetime
from typing import Optional
import uuid

from sqlalchemy import Column as SAColumn, Enum, Integer, String
from sqlmodel import Field, SQLModel

from app.enums.parking import ParkingSessionStatus, UserType
from .mixins import TimestampMixin


class ParkingSessionBase(SQLModel):
    vehicle_id: uuid.UUID = Field(foreign_key="vehicles.id")
    license_plate: Optional[str] = Field(
        default=None, max_length=50, sa_column=SAColumn(String(50), nullable=True)
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


class ParkingSession(ParkingSessionBase, TimestampMixin, table=True):
    __tablename__ = "parking_sessions"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)


class ParkingSessionCreate(ParkingSessionBase):
    pass


class ParkingSessionRead(ParkingSessionBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime


class ParkingSessionUpdate(SQLModel):
    check_out_time: Optional[datetime] = None
    status: Optional[ParkingSessionStatus] = None
    user_type: Optional[UserType] = None
    total_amount: Optional[int] = None
