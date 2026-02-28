from __future__ import annotations

from datetime import datetime
from typing import Optional
import uuid

from sqlalchemy import Column as SAColumn, Enum, String, Text
from sqlmodel import Field, SQLModel

from app.enums.parking import VehicleType
from .mixins import SoftDeleteMixin, TimestampMixin


class VehicleBase(SQLModel):
    user_code: str = Field(foreign_key="users.user_code", max_length=50)
    vehicle_type: VehicleType = Field(
        sa_column=SAColumn(Enum(VehicleType, name="vehicle_type_enum", create_type=False), nullable=False)
    )
    license_plate: str = Field(max_length=50, sa_column=SAColumn(String(50), nullable=False))
    qr_code: str = Field(sa_column=SAColumn(Text, nullable=False))


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
