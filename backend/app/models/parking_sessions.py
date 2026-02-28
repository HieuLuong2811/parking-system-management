from __future__ import annotations

from datetime import datetime
from typing import Optional
import uuid

from sqlalchemy import Column as SAColumn, Enum, Integer
from sqlmodel import Field, SQLModel

from app.enums.parking import PaymentMethod


class ParkingSessionBase(SQLModel):
    vehicle_id: uuid.UUID = Field(foreign_key="vehicles.id")
    check_in_time: datetime
    check_out_time: Optional[datetime] = None
    total_days: int = Field(sa_column=SAColumn(Integer, nullable=False))
    total_amount: int = Field(sa_column=SAColumn(Integer, nullable=False))
    payment_method: PaymentMethod = Field(
        sa_column=SAColumn(Enum(PaymentMethod, name="payment_method_enum", create_type=False), nullable=False)
    )


class ParkingSession(ParkingSessionBase, table=True):
    __tablename__ = "parking_sessions"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)


class ParkingSessionCreate(ParkingSessionBase):
    pass


class ParkingSessionRead(ParkingSessionBase):
    id: uuid.UUID
    created_at: datetime


class ParkingSessionUpdate(SQLModel):
    check_out_time: Optional[datetime] = None
    total_days: Optional[int] = None
    total_amount: Optional[int] = None
    payment_method: Optional[PaymentMethod] = None
