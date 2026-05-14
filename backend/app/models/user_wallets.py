from __future__ import annotations

import uuid
from decimal import Decimal

from sqlalchemy import CheckConstraint, Column as SAColumn, Enum, Numeric, String, UniqueConstraint
from sqlmodel import Field, SQLModel

from app.enums.parking import WalletStatus
from .mixins import TimestampMixin


class UserWalletBase(SQLModel):
    user_code: str = Field(
        foreign_key="users.user_code",
        nullable=False,
        index=True,
    )

    balance: Decimal = Field(
        default=Decimal("0"),
        sa_column=SAColumn(Numeric(18, 2), nullable=False),
    )

    currency: str = Field(
        default="VND",
        sa_column=SAColumn(String(10), nullable=False),
    )

    status: WalletStatus = Field(
        default=WalletStatus.ACTIVE,
        sa_column=SAColumn(
            Enum(WalletStatus, name="wallet_status_enum", create_type=False),
            nullable=False,
        ),
    )


class UserWallet(UserWalletBase, TimestampMixin, table=True):
    __tablename__ = "user_wallets"
    __table_args__ = (
        UniqueConstraint("user_code", name="uq_user_wallets_user_code"),
        CheckConstraint("balance >= 0", name="ck_user_wallets_balance_non_negative"),
    )

    wallet_id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
        index=True,
    )

