from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.controller.user_wallets import UserWalletController
from app.authen.current_user import required_roles
from app.db.session import get_db
from app.models.auth import AuthUser
from app.models.user_wallets_api import WalletTopUpRequest, WalletTopUpResponse
from app.service.user_wallets import userWalletService
from app.models.user_wallets import UserWallet


router = APIRouter(prefix="/wallets", tags=["wallets"])


@router.get("/me", response_model=UserWallet)
async def get_my_wallet(
    db: AsyncSession = Depends(get_db),
    current_user: AuthUser = Depends(required_roles("USER", "ADMIN")),
):
    wallet = await userWalletService.get_or_create_wallet_for_update(
        user_code=current_user.user_code,
        db=db,
    )
    await db.commit()
    await db.refresh(wallet)
    return wallet


@router.post("/topup", response_model=WalletTopUpResponse)
async def create_wallet_topup(
    payload: WalletTopUpRequest,
    db: AsyncSession = Depends(get_db),
    current_user: AuthUser = Depends(required_roles("USER", "ADMIN")),
):
    return await UserWalletController.create_topup_payment_ctrl(payload, db, current_user)
