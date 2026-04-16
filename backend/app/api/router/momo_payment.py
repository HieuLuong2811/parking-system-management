from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.controller.momo_payment import MomoPaymentController
from app.db.session import get_db
from app.models.momo_payment import MomoInfor

router = APIRouter(prefix="/payment/momo", tags=["MoMo"])

@router.post("/")
def create_momo_payment(momo_infor: MomoInfor):
    return MomoPaymentController.create_momo_payment_ctrl(momo_infor)

@router.post("/ipn")
async def momo_ipn(payload: dict, db: AsyncSession = Depends(get_db)):
    return await MomoPaymentController.momo_ipn_ctrl(payload, db)
