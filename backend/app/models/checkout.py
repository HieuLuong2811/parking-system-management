from datetime import date, datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel

class CheckoutMomoRequest(BaseModel):
    sub_plan_id: UUID
    term_id: UUID
    # Backward compatible single-vehicle field
    vehicle_id: Optional[UUID] = None
    # New multi-vehicle mapping
    vehicle_ids: Optional[list[UUID]] = None
    payment_plan_id: UUID
    start_date: datetime
    end_date: datetime
    # Amount is validated/recalculated by backend; keep for backward compatibility.
    amount: float

    redirect_url: Optional[str] = None
    lang: Optional[str] = "vi"

class CheckoutRecurringRequest(BaseModel):
    sub_plan_id: str
    term_id: str
    vehicle_id: Optional[str] = None
    vehicle_ids: Optional[list[str]] = None
    payment_plan_id: str
    start_date: date
    end_date: date
    amount: float

class CheckoutPayDebtRequest(BaseModel):
    invoice_id: str
    redirect_url: str | None = None
