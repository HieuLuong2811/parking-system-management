from app.models.momo_payment import MomoInfor
from app.api.controller.momo_payment import MomoPaymentController
from fastapi import APIRouter

router = APIRouter(prefix="/payment/momo", tags=["MoMo"])

@router.post("/")
async def create_momo_payment(momo_infor: MomoInfor):
    return await MomoPaymentController.create_momo_payment_ctrl(momo_infor)