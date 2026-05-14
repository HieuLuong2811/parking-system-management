from __future__ import annotations

from datetime import datetime
from typing import Any, Optional
import uuid

from sqlalchemy import Column as SAColumn, DateTime, Enum, Integer, String
from sqlmodel import Field, SQLModel

from app.enums.parking import InvoiceStatus, InvoiceType, PaymentMethod


class InvoiceBase(SQLModel):
    user_code: str = Field(foreign_key="users.user_code", max_length=50)
    subscription_id: uuid.UUID | None = Field(default=None, foreign_key="user_subscriptions.id")
    amount: int = Field(sa_column=SAColumn(Integer, nullable=False))
    invoice_type: InvoiceType = Field(
        default=InvoiceType.OTHER,
        sa_column=SAColumn(Enum(InvoiceType, name="invoice_type_enum", create_type=False), nullable=False),
    )
    payment_method: PaymentMethod = Field(
        sa_column=SAColumn(Enum(PaymentMethod, name="payment_method_enum", create_type=False), nullable=False)
    )
    status: InvoiceStatus = Field(
        sa_column=SAColumn(Enum(InvoiceStatus, name="invoice_status_enum", create_type=False), nullable=False)
    )
    payment_order_id: Optional[str] = Field(
        default=None,
        sa_column=SAColumn(String(120), nullable=True, unique=True, index=True),
    )
    paid_at: datetime | None = Field(
        default=None,
        sa_column=SAColumn(DateTime, nullable=True),
    )


class Invoice(InvoiceBase, table=True):
    __tablename__ = "invoices"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)


class InvoiceCreate(InvoiceBase):
    metadata_payload: Optional[dict[str, Any]] = Field(default=None, alias="metadata")


class InvoiceRead(InvoiceBase):
    id: uuid.UUID
    created_at: datetime


class InvoiceUpdate(SQLModel):
    subscription_id: Optional[uuid.UUID] = None
    total_amount: Optional[int] = None
    payment_method: Optional[PaymentMethod] = None
    status: Optional[InvoiceStatus] = None
    payment_order_id: Optional[str] = None
    paid_at: datetime | None = None
