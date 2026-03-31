from __future__ import annotations

from datetime import datetime
from typing import Optional
import uuid

from sqlalchemy import Column as SAColumn, Boolean, Enum, ForeignKey, String, Text
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
    qr_code: Optional[str] = Field(default=None, sa_column=SAColumn(Text, nullable=True))
    qr_secret: Optional[str] = Field(
        default=None,
        max_length=255,
        sa_column=SAColumn(String(255), nullable=True),
    )
    is_active: bool = Field(
        default=True,
        sa_column=SAColumn(Boolean(), nullable=False),
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
    qr_code: Optional[str] = None
    deleted_at: Optional[datetime] = None
    is_active: Optional[bool] = None
