from typing import Optional
from pydantic import BaseModel

class MomoInfor(BaseModel):
    amount: int
    orderInfo: Optional[str] = None
    orderId: Optional[str] = None
    redirectUrl: Optional[str] = None