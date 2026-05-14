from app.models.auth import AuthUser
from app.authen.current_user import required_roles
from app.api.controller.checkout import CheckoutController
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.checkout import (
    CheckoutMomoRequest,
    CheckoutPayDebtRequest,
    CheckoutRecurringRequest,
    CheckoutWalletFullRequest,
)


router = APIRouter(prefix="/checkout", tags=["checkout"])

@router.post("/momo")
async def checkout_momo(
    payload: CheckoutMomoRequest,
    db: AsyncSession = Depends(get_db),
    current_user: AuthUser = Depends(required_roles("USER", "ADMIN")),
):
    return await CheckoutController.checkout_momo_ctrl(payload, db, current_user)

@router.post("/pay-debt")
async def checkout_pay_debt(
    payload: CheckoutPayDebtRequest,
    db: AsyncSession = Depends(get_db),
    current_user: AuthUser = Depends(required_roles("USER", "ADMIN")),
):
    return await CheckoutController.checkout_pay_debt_ctrl(payload, db, current_user)

@router.post("/recurring")
async def checkout_recurring(
    payload: CheckoutRecurringRequest,
    db: AsyncSession = Depends(get_db),
    current_user: AuthUser = Depends(required_roles("USER", "ADMIN")),
):
    return await CheckoutController.checkout_recurring_ctrl(
        payload, db, current_user
    )


@router.post("/wallet-full")
async def checkout_wallet_full(
    payload: CheckoutWalletFullRequest,
    db: AsyncSession = Depends(get_db),
    current_user: AuthUser = Depends(required_roles("USER", "ADMIN")),
):
    return await CheckoutController.checkout_wallet_full_ctrl(payload, db, current_user)
