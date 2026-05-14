from __future__ import annotations

from decimal import Decimal
from pydantic import BaseModel, Field


class WalletTopUpRequest(BaseModel):
    amount: Decimal = Field(gt=0)
    redirect_url: str | None = None
    description: str | None = None


class WalletTopUpResponse(BaseModel):
    payment_transaction_id: str
    order_id: str
    pay_url: str | None = None
    short_link: str | None = None
    qr_code_url: str | None = None

