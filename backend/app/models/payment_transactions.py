from __future__ import annotations

from datetime import datetime
from typing import Optional
import uuid

from sqlalchemy import Column as SAColumn, Enum, Integer, String, Text
from sqlmodel import Field, SQLModel

from app.enums.parking import TransactionStatus


class PaymentTransactionBase(SQLModel):
    invoice_id: uuid.UUID = Field(foreign_key="invoices.id")
    attempt_number: int = Field(sa_column=SAColumn(Integer, nullable=False))
    transaction_code: str = Field(max_length=255, nullable=False)
    status: TransactionStatus = Field(
        sa_column=SAColumn(
            Enum(TransactionStatus, name="transaction_status_enum", create_type=False),
            nullable=False,
        )
    )
    response_message: str = Field(sa_column=SAColumn(Text, nullable=True))


class PaymentTransaction(PaymentTransactionBase, table=True):
    __tablename__ = "payment_transactions"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)


class PaymentTransactionCreate(PaymentTransactionBase):
    pass


class PaymentTransactionRead(PaymentTransactionBase):
    id: uuid.UUID
    created_at: datetime


class PaymentTransactionUpdate(SQLModel):
    attempt_number: Optional[int] = None
    status: Optional[TransactionStatus] = None
    response_message: Optional[str] = None
