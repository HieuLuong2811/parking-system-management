from datetime import date, datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel

class CheckoutMomoRequest(BaseModel):
    sub_plan_id: UUID
    term_id: UUID
    payment_plan_id: UUID
    payment_type: str
    start_date: datetime
    end_date: datetime
    # Amount is validated/recalculated by backend; keep for backward compatibility.
    amount: float

    redirect_url: Optional[str] = None
    lang: Optional[str] = "vi"

class CheckoutRecurringRequest(BaseModel):
    sub_plan_id: str
    term_id: str
    payment_plan_id: str
    start_date: date
    end_date: date
    amount: float

class CheckoutPayDebtRequest(BaseModel):
    invoice_id: str
    redirect_url: str | None = None


class CheckoutWalletFullRequest(BaseModel):
    sub_plan_id: UUID
    term_id: UUID
    payment_plan_id: UUID
    start_date: datetime
    end_date: datetime
    amount: float
