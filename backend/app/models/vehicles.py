from __future__ import annotations

from datetime import datetime
from typing import Optional
import uuid

from sqlalchemy import Column as SAColumn, Enum, ForeignKey, String, Text
from sqlmodel import Field, SQLModel

from app.enums.parking import VehicleType
from .mixins import SoftDeleteMixin, TimestampMixin


class VehicleBase(SQLModel):
    user_code: Optional[str] = Field(
        default=None,
        max_length=50,
        sa_column=SAColumn(
            String(50),
            ForeignKey("users.user_code"),
            nullable=True,
        ),
    )
    vehicle_type: VehicleType = Field(
        sa_column=SAColumn(Enum(VehicleType, name="vehicle_type_enum", create_type=False), nullable=False)
    )
    license_plate: Optional[str] = Field(
        default=None, max_length=50, sa_column=SAColumn(String(50), nullable=True)
    )
    barcode_payload: Optional[str] = Field(default=None, sa_column=SAColumn(Text, nullable=True))
    barcode_token: Optional[str] = Field(
        default=None,
        max_length=64,
        sa_column=SAColumn(String(64), nullable=True),
    )


class Vehicle(VehicleBase, TimestampMixin, SoftDeleteMixin, table=True):
    __tablename__ = "vehicles"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)


class VehicleCreate(VehicleBase):
    pass


class VehicleRead(VehicleBase):
    id: uuid.UUID
    deleted_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime


class VehicleUpdate(SQLModel):
    vehicle_type: Optional[VehicleType] = None
    license_plate: Optional[str] = Field(default=None, max_length=50)
    barcode_token: Optional[str] = Field(default=None, max_length=64)
    deleted_at: Optional[datetime] = None


class VehicleBarcodeVerify(SQLModel):
    barcode_token: str
