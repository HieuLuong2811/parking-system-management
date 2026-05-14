from __future__ import annotations

from decimal import Decimal
from datetime import datetime

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user_wallets import UserWallet
from app.enums.parking import WalletStatus


class userWalletService:
    @staticmethod
    async def get_or_create_wallet_for_update(
        *,
        user_code: str,
        db: AsyncSession,
    ) -> UserWallet:
        result = await db.execute(
            select(UserWallet)
            .where(UserWallet.user_code == user_code)
            .with_for_update()
        )
        wallet = result.scalar_one_or_none()
        if wallet:
            return wallet

        wallet = UserWallet(
            user_code=user_code,
            balance=Decimal("0"),
            currency="VND",
            status=WalletStatus.ACTIVE,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        db.add(wallet)
        await db.flush()
        return wallet

    @staticmethod
    def ensure_wallet_can_change_balance(wallet: UserWallet) -> None:
        if wallet.status != WalletStatus.ACTIVE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Wallet is locked",
            )

