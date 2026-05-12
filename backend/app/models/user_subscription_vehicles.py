from __future__ import annotations

from datetime import datetime
from typing import Optional
import uuid

from sqlalchemy import Column as SAColumn, Enum, String
from sqlmodel import Field, SQLModel
from pydantic import BaseModel, Field as PydanticField
from app.enums.parking import SubscriptionStatus
from .mixins import SoftDeleteMixin, TimestampMixin


class UserSubscriptionVehicleBase(SQLModel):
    user_subscription_id: uuid.UUID = Field(foreign_key="user_subscriptions.id", index=True)
    vehicle_id: uuid.UUID = Field(foreign_key="vehicles.id", index=True)
    status: SubscriptionStatus = Field(
        sa_column=SAColumn(Enum(SubscriptionStatus, name="subscription_status_enum", create_type=False), nullable=False)
    )


class UserSubscriptionVehicle(UserSubscriptionVehicleBase, TimestampMixin, SoftDeleteMixin, table=True):
    __tablename__ = "user_subscription_vehicles"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)


class UserSubscriptionVehicleCreate(UserSubscriptionVehicleBase):
    pass


class UserSubscriptionVehicleRead(UserSubscriptionVehicleBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime]


class UserSubscriptionVehicleUpdate(SQLModel):
    status: Optional[SubscriptionStatus] = None
    deleted_at: Optional[datetime] = None

class UserSubscriptionVehiclesUpdate(BaseModel):
    vehicle_ids: list[str] = PydanticField(default_factory=list)