from __future__ import annotations

from datetime import datetime
from typing import Any, Optional
import uuid

from sqlalchemy import Column as SAColumn, Enum, Integer, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlmodel import Field, SQLModel

from app.enums.parking import InvoiceStatus, PaymentMethod


class InvoiceBase(SQLModel):
    user_code: str = Field(foreign_key="users.user_code", max_length=50)
    subscription_id: uuid.UUID = Field(foreign_key="user_subscriptions.id")
    amount: int = Field(sa_column=SAColumn(Integer, nullable=False))
    payment_method: PaymentMethod = Field(
        sa_column=SAColumn(Enum(PaymentMethod, name="payment_method_enum", create_type=False), nullable=False)
    )
    status: InvoiceStatus = Field(
        sa_column=SAColumn(Enum(InvoiceStatus, name="invoice_status_enum", create_type=False), nullable=False)
    )
    metadata_: Optional[dict[str, Any]] = Field(
        default=None,
        alias="metadata",
        sa_column=SAColumn("metadata", JSONB, nullable=True),
    )
    stripe_invoice_id: Optional[str] = Field(
        default=None,
        max_length=255,
        sa_column=SAColumn(String(255), nullable=True),
    )

class Invoice(InvoiceBase, table=True):
    __tablename__ = "invoices"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)


class InvoiceCreate(InvoiceBase):
    pass


class InvoiceRead(InvoiceBase):
    id: uuid.UUID
    created_at: datetime


class InvoiceUpdate(SQLModel):
    total_amount: Optional[int] = None
    payment_method: Optional[PaymentMethod] = None
    status: Optional[InvoiceStatus] = None
    metadata_: Optional[dict[str, Any]] = Field(default=None, alias="metadata")
    stripe_invoice_id: Optional[str] = None
