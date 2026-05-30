from __future__ import annotations

from decimal import Decimal

from app.models.invoices import Invoice
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.auth import AuthUser
from app.models.user_wallets_api import WalletTopUpRequest, WalletTopUpResponse
from app.service.momo_payment import MomoPaymentService
from app.enums.parking import InvoiceStatus, InvoiceType, PaymentMethod, PaymentTransactionStatus, PaymentTransactionType
from app.models.payment_transactions import PaymentTransaction
from app.models.momo_payment import MomoInfor
from sqlalchemy import select
from datetime import datetime, timedelta


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

        # Anti-spam: allow only one active pending top-up per user within a short TTL.
        # If an old pending top-up exists, expire it so user can create a new one.
        ttl = timedelta(minutes=20)
        now = datetime.utcnow()
        pending_tx_stmt = (
            select(PaymentTransaction)
            .where(PaymentTransaction.user_code == current_user.user_code)
            .where(PaymentTransaction.transaction_type == PaymentTransactionType.TOP_UP)
            .where(PaymentTransaction.payment_method == PaymentMethod.MOMO)
            .where(PaymentTransaction.status == PaymentTransactionStatus.PENDING)
            .order_by(PaymentTransaction.created_at.desc())
            .limit(1)
        )
        pending_tx = (await db.execute(pending_tx_stmt)).scalar_one_or_none()
        if pending_tx is not None:
            is_expired = (pending_tx.created_at is not None) and (pending_tx.created_at < (now - ttl))
            if not is_expired:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="You already have a pending top-up. Please complete or wait before creating a new one.",
                )

            pending_tx.status = PaymentTransactionStatus.FAILED
            pending_tx.updated_at = now
            db.add(pending_tx)

            if pending_tx.provider_request_id:
                invoice_stmt = (
                    select(Invoice)
                    .where(Invoice.payment_order_id == pending_tx.provider_request_id)
                    .limit(1)
                )
                pending_invoice = (await db.execute(invoice_stmt)).scalar_one_or_none()
                if pending_invoice is not None and pending_invoice.status == InvoiceStatus.PENDING:
                    pending_invoice.status = InvoiceStatus.FAILED
                    db.add(pending_invoice)
        
        invoice = Invoice(
            user_code=current_user.user_code,
            subscription_id=None,
            invoice_type=InvoiceType.TOP_UP,
            payment_method=PaymentMethod.MOMO,
            status=InvoiceStatus.PENDING,
            amount=amount,
            payment_order_id=None,
            paid_at=None,
        )
        db.add(invoice)
        await db.flush()

        tx = PaymentTransaction(
            user_code=current_user.user_code,
            invoice_id=invoice.id,
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
        invoice.payment_order_id = order_id
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
