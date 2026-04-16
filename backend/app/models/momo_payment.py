from typing import Optional
from pydantic import BaseModel

class MomoInfor(BaseModel):
    amount: int
    orderId: str
    orderInfo: Optional[str] = None
    redirectUrl: Optional[str] = None
    extraData: Optional[str] = None
    lang: Optional[str] = "vi"
