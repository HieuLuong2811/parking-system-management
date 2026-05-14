from __future__ import annotations

from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.auth import AuthUser
from app.models.user_wallets_api import WalletTopUpRequest, WalletTopUpResponse
from app.service.momo_payment import MomoPaymentService
from app.enums.parking import PaymentMethod, PaymentTransactionStatus, PaymentTransactionType
from app.models.payment_transactions import PaymentTransaction
from app.models.momo_payment import MomoInfor


class UserWalletController:
    @staticmethod
    async def create_topup_payment_ctrl(
        payload: WalletTopUpRequest,
        db: AsyncSession,
        current_user: AuthUser,
    ) -> WalletTopUpResponse:
        amount = Decimal(str(payload.amount))
        if amount <= 0:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid amount")

        tx = PaymentTransaction(
            user_code=current_user.user_code,
            invoice_id=None,
            subscription_id=None,
            transaction_type=PaymentTransactionType.TOP_UP,
            payment_method=PaymentMethod.MOMO,
            amount=amount,
            status=PaymentTransactionStatus.PENDING,
            balance_before=None,
            balance_after=None,
            attempt_number=1,
        )
        db.add(tx)
        await db.flush()

        order_id = f"TOPUP-{tx.payment_transaction_id}"

        tx.provider_request_id = order_id
        await db.flush()

        momo_data = MomoPaymentService.create_momo_payment(
            MomoInfor(
                amount=float(amount),
                orderId=order_id,
                orderInfo=payload.description or "Wallet top-up",
                redirectUrl=payload.redirect_url,
                extraData="",
                lang="vi",
            )
        )

        await db.commit()

        return WalletTopUpResponse(
            payment_transaction_id=str(tx.payment_transaction_id),
            order_id=order_id,
            pay_url=momo_data.get("payUrl"),
            short_link=momo_data.get("shortLink"),
            qr_code_url=momo_data.get("qrCodeUrl"),
        )
