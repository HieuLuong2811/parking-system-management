from __future__ import annotations

from datetime import datetime
from typing import Optional
import uuid

from sqlalchemy import Column as SAColumn, Enum, Integer, String, Text
from sqlmodel import Field, SQLModel

from app.enums.parking import InvoiceStatus, PaymentMethod


class PaymentTransactionBase(SQLModel):
    invoice_id: uuid.UUID = Field(foreign_key="invoices.id")
    attempt_number: int = Field(sa_column=SAColumn(Integer, nullable=False))
    transaction_code: str = Field(max_length=255, nullable=False)
    response_message: str = Field(sa_column=SAColumn(Text, nullable=False))


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
    response_message: Optional[str] = None


class PaymentTransactionDetailRead(SQLModel):
    id: uuid.UUID
    invoice_id: uuid.UUID
    attempt_number: int
    transaction_code: str
    response_message: str
    created_at: datetime

    user_code: str
    user_full_name: str

    invoice_amount: int
    invoice_payment_method: PaymentMethod
    invoice_status: InvoiceStatus
    invoice_created_at: datetime
