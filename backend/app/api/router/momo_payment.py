from fastapi import APIRouter, BackgroundTasks, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.controller.momo_payment import MomoPaymentController
from app.authen.current_user import required_roles
from app.db.session import get_db
from app.models.auth import AuthUser
from app.models.momo_payment import MomoInfor, MomoInvoicePaymentRequest

router = APIRouter(prefix="/payment/momo", tags=["MoMo"])

@router.post("/")
def create_momo_payment(
    momo_infor: MomoInfor,
    current_user: AuthUser = Depends(required_roles("USER", "ADMIN")),
):
    lang = current_user.user_code
    if lang in None or lang == "":
        lang = "en"
    momo_infor.lang = lang
    return MomoPaymentController.create_momo_payment_ctrl(momo_infor)

@router.post("/ipn")
async def momo_ipn(
    payload: dict,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    return await MomoPaymentController.momo_ipn_ctrl(payload, db, background_tasks)


@router.post("/invoice/{invoice_id}")
async def create_momo_payment_for_invoice(
    invoice_id: str,
    payload: MomoInvoicePaymentRequest,
    db: AsyncSession = Depends(get_db),
    current_user: AuthUser = Depends(required_roles("USER", "ADMIN")),
):
    return await MomoPaymentController.create_momo_payment_for_invoice_ctrl(
        invoice_id,
        payload,
        db,
        current_user,
    )


@router.post("/confirm")
async def momo_confirm(
    payload: dict,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: AuthUser = Depends(required_roles("USER", "ADMIN")),
):
    return await MomoPaymentController.momo_confirm_with_background_ctrl(
        payload,
        db,
        current_user,
        background_tasks,
    )
