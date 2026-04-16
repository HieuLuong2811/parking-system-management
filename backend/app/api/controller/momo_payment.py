from sqlalchemy.ext.asyncio import AsyncSession

from app.models.momo_payment import MomoInfor
from app.service.momo_payment import MomoPaymentService


class MomoPaymentController:
    @staticmethod
    def create_momo_payment_ctrl(momo_infor: MomoInfor):
        return MomoPaymentService.create_momo_payment(momo_infor)

    @staticmethod
    async def momo_ipn_ctrl(payload: dict, db: AsyncSession):
        return await MomoPaymentService.handle_momo_ipn(payload, db)
