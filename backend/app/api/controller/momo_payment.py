from typing import Optional
from curl_cffi import Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.service.momo_payment import MomoPaymentService

class MomoPaymentController:
    @staticmethod
    async def create_momo_payment_ctrl(request: Request) -> JSONResponse:
        return await MomoPaymentService.create_momo_payment(request)