from sqlalchemy.ext.asyncio import AsyncSession

from fastapi import BackgroundTasks
from app.models.auth import AuthUser
from app.models.momo_payment import MomoInfor, MomoInvoicePaymentRequest
from app.service.momo_payment import MomoPaymentService


class MomoPaymentController:
    @staticmethod
    def create_momo_payment_ctrl(momo_infor: MomoInfor):
        return MomoPaymentService.create_momo_payment(momo_infor)

    @staticmethod
    async def momo_ipn_ctrl(payload: dict, db: AsyncSession, background_tasks: BackgroundTasks | None = None):
        return await MomoPaymentService.handle_momo_ipn(payload, db, background_tasks=background_tasks)

    @staticmethod
    async def create_momo_payment_for_invoice_ctrl(
        invoice_id: str,
        payload: MomoInvoicePaymentRequest,
        db: AsyncSession,
        current_user: AuthUser,
    ):
        return await MomoPaymentService.create_momo_payment_for_invoice(
            invoice_id,
            redirect_url=payload.redirectUrl,
            order_info=payload.orderInfo,
            extra_data=payload.extraData,
            lang=payload.lang,
            user_code=current_user.user_code,
            db=db,
        )

    @staticmethod
    async def momo_confirm_ctrl(payload: dict, db: AsyncSession, current_user: AuthUser):
        return await MomoPaymentService.confirm_from_redirect(
            payload,
            user_code=current_user.user_code,
            db=db,
        )

    @staticmethod
    async def momo_confirm_with_background_ctrl(
        payload: dict,
        db: AsyncSession,
        current_user: AuthUser,
        background_tasks: BackgroundTasks | None = None,
    ):
        return await MomoPaymentService.confirm_from_redirect(
            payload,
            user_code=current_user.user_code,
            db=db,
            background_tasks=background_tasks,
        )
