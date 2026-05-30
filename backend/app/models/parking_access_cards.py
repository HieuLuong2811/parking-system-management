from __future__ import annotations

from datetime import datetime
from typing import Optional
import uuid

from sqlalchemy import Column as SAColumn, Enum, String
from sqlmodel import Field, SQLModel

from app.enums.parking import (
    ParkingAccessCardHolderType,
    ParkingAccessCardStatus,
)
from .mixins import SoftDeleteMixin, TimestampMixin


class ParkingAccessCardBase(SQLModel):
    barcode_token: str = Field(
        sa_column=SAColumn(String(64), nullable=False, unique=True, index=True)
    )

    holder_type: ParkingAccessCardHolderType = Field(
        sa_column=SAColumn(
            Enum(
                ParkingAccessCardHolderType,
                name="parking_access_card_holder_type_enum",
                create_type=False,
            ),
            nullable=False,
        )
    )

    user_code: Optional[str] = Field(
        default=None,
        foreign_key="users.user_code",
        index=True,
    )

    user_subscription_id: Optional[uuid.UUID] = Field(
        default=None,
        foreign_key="user_subscriptions.id",
        index=True,
    )

    status: ParkingAccessCardStatus = Field(
        default=ParkingAccessCardStatus.ASSIGNED,
        sa_column=SAColumn(
            Enum(
                ParkingAccessCardStatus,
                name="parking_access_card_status_enum",
                create_type=False,
            ),
            nullable=False,
        ),
    )

    current_session_id: Optional[uuid.UUID] = Field(default=None, index=True)


class ParkingAccessCard(
    ParkingAccessCardBase,
    TimestampMixin,
    SoftDeleteMixin,
    table=True,
):
    __tablename__ = "parking_access_cards"

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
        index=True,
    )


class ParkingAccessCardCreate(ParkingAccessCardBase):
    pass


class ParkingAccessCardRead(ParkingAccessCardBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None


class ParkingAccessCardAdminRead(ParkingAccessCardRead):
    user_full_name: Optional[str] = None
    is_in_use: bool = False


class ParkingAccessCardUpdate(SQLModel):
    barcode_token: Optional[str] = None
    holder_type: Optional[ParkingAccessCardHolderType] = None
    user_code: Optional[str] = None
    user_subscription_id: Optional[uuid.UUID] = None
    status: Optional[ParkingAccessCardStatus] = None
    current_session_id: Optional[uuid.UUID] = None
