from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import Optional
import uuid

from sqlalchemy import Column as SAColumn, Enum, Numeric, String
from sqlmodel import Field, SQLModel

from app.enums.parking import (
    PaymentMethod,
    PaymentTransactionStatus,
    PaymentTransactionType,
)
from .mixins import TimestampMixin


class PaymentTransactionBase(SQLModel):
    user_code: str = Field(foreign_key="users.user_code", index=True)

    invoice_id: uuid.UUID | None = Field(
        default=None,
        foreign_key="invoices.id",
        index=True,
    )

    transaction_type: PaymentTransactionType = Field(
        sa_column=SAColumn(
            Enum(
                PaymentTransactionType,
                name="payment_transaction_type_enum",
                create_type=False,
            ),
            nullable=False,
        )
    )

    payment_method: PaymentMethod = Field(
        sa_column=SAColumn(
            Enum(PaymentMethod, name="payment_method_enum", create_type=False),
            nullable=False,
        )
    )

    amount: Decimal = Field(
        sa_column=SAColumn(Numeric(18, 2), nullable=False),
    )

    status: PaymentTransactionStatus = Field(
        sa_column=SAColumn(
            Enum(
                PaymentTransactionStatus,
                name="payment_transaction_status_enum",
                create_type=False,
            ),
            nullable=False,
        )
    )

    balance_before: Decimal | None = Field(
        default=None,
        sa_column=SAColumn(Numeric(18, 2), nullable=True),
    )
    balance_after: Decimal | None = Field(
        default=None,
        sa_column=SAColumn(Numeric(18, 2), nullable=True),
    )
    provider_request_id: str | None = Field(default=None, max_length=255)

    attempt_number: int | None = Field(default=None, sa_column=SAColumn(nullable=True))
    transaction_code: str | None = Field(default=None, max_length=255)


class PaymentTransaction(PaymentTransactionBase, TimestampMixin, table=True):
    __tablename__ = "payment_transactions"

    payment_transaction_id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
        index=True,
    )


class PaymentTransactionCreate(PaymentTransactionBase):
    pass


class PaymentTransactionRead(PaymentTransactionBase):
    payment_transaction_id: uuid.UUID
    created_at: datetime
    updated_at: datetime


class PaymentTransactionUpdate(SQLModel):
    status: Optional[PaymentTransactionStatus] = None
    provider_request_id: Optional[str] = None


class PaymentTransactionDetailRead(SQLModel):
    payment_transaction_id: uuid.UUID
    invoice_id: uuid.UUID | None
    attempt_number: int | None
    transaction_code: str | None
    transaction_type: PaymentTransactionType
    payment_method: PaymentMethod
    amount: Decimal
    status: PaymentTransactionStatus
    balance_before: Decimal | None = None
    balance_after: Decimal | None = None
    created_at: datetime

    user_code: str
    user_full_name: str | None

    invoice_amount: int | None
    invoice_payment_method: PaymentMethod | None
    invoice_status: str | None
    invoice_created_at: datetime | None
