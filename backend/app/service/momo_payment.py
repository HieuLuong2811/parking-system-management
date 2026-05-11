import hashlib
import hmac
import json
import logging
from typing import Any
import uuid

import requests
from fastapi import BackgroundTasks, HTTPException
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.momo_verify_signature import verify_signature
from app.enums.parking import InvoiceStatus, PaymentMethod, SubscriptionStatus
from app.models.invoices import InvoiceUpdate
from app.models.momo_payment import MomoInfor
from app.models.payment_transactions import PaymentTransaction
from app.models.notifications import NotificationCreate
from app.service.invoices import invoiceService
from app.service.notifications import notificationService
from app.service.payment_notifications import send_payment_confirmation_email
from app.service.subscriptions import subscriptionService
from app.service.users import userService
from app.db.session import AsyncSessionLocal

logger = logging.getLogger(__name__)


class MomoPaymentService:
    @staticmethod
    async def create_momo_payment_for_invoice(
        invoice_id: str,
        *,
        redirect_url: str | None,
        order_info: str | None,
        extra_data: str | None,
        lang: str | None,
        user_code: str,
        db: AsyncSession,
    ) -> dict[str, Any]:
        invoice = await invoiceService.crud.get(db, invoice_id)
        if not invoice:
            raise HTTPException(status_code=404, detail="Invoice not found")

        if invoice.user_code != user_code:
            raise HTTPException(status_code=403, detail="Forbidden")

        if invoice.payment_method != PaymentMethod.MOMO:
            raise HTTPException(status_code=400, detail="Invoice is not payable by MoMo")

        if invoice.status not in [InvoiceStatus.PENDING, InvoiceStatus.FAILED]:
            raise HTTPException(status_code=400, detail="Invoice is not payable")

        was_failed = invoice.status == InvoiceStatus.FAILED
        if invoice.status == InvoiceStatus.FAILED:
            invoice.status = InvoiceStatus.PENDING

        # Prevent duplicate "create payment" for the same invoice.
        # - If invoice is already in PENDING and has an order id, reuse it so email/web clicks converge.
        # - If invoice was FAILED (or no order id yet), generate a new order id and persist it.
        payment_order_id = invoice.payment_order_id
        if not payment_order_id or was_failed:
            payment_order_id = f"Momo-{uuid.uuid4().hex}"
            invoice.payment_order_id = payment_order_id

        db.add(invoice)
        await db.commit()
        await db.refresh(invoice)

        momo_info = MomoInfor(
            amount=invoice.amount,
            orderId=payment_order_id,
            orderInfo=order_info or f"Invoice {invoice.id}",
            redirectUrl=redirect_url,
            extraData=extra_data,
            lang=lang or "vi",
        )
        try:
            return MomoPaymentService.create_momo_payment(momo_info)
        except HTTPException:
            # If we cannot create a MoMo payment session/link, mark invoice as FAILED
            # so user can retry later (and UI can reflect the failure).
            invoice.status = InvoiceStatus.FAILED
            db.add(invoice)
            await db.commit()
            raise

    @staticmethod
    def create_momo_payment(momo_infor: MomoInfor) -> dict[str, Any]:
        amount = momo_infor.amount
        order_id = momo_infor.orderId
        if not order_id:
            raise HTTPException(status_code=400, detail="orderId is required")

        request_id = order_id
        order_info = momo_infor.orderInfo or f"Invoice {order_id}"
        redirect_url = momo_infor.redirectUrl or settings.MOMO_REDIRECT_URL
        extra_data = momo_infor.extraData or ""
        request_type = "payWithMethod"
        auto_capture = True
        lang = momo_infor.lang or "vi"

        raw_signature = (
            f"accessKey={settings.MOMO_ACCESS_KEY}"
            f"&amount={amount}"
            f"&extraData={extra_data}"
            f"&ipnUrl={settings.MOMO_IPN_URL}"
            f"&orderId={order_id}"
            f"&orderInfo={order_info}"
            f"&partnerCode={settings.MOMO_PARTNER_CODE}"
            f"&redirectUrl={redirect_url}"
            f"&requestId={request_id}"
            f"&requestType={request_type}"
        )

        signature = hmac.new(
            settings.MOMO_SECRET_KEY.encode(),
            raw_signature.encode(),
            hashlib.sha256,
        ).hexdigest()

        request_body = {
            "partnerCode": settings.MOMO_PARTNER_CODE,
            "partnerName": "Test",
            "storeId": "ParkingSystem",
            "requestId": request_id,
            "amount": amount,
            "orderId": order_id,
            "orderInfo": order_info,
            "redirectUrl": redirect_url,
            "ipnUrl": settings.MOMO_IPN_URL,
            "lang": lang,
            "requestType": request_type,
            "autoCapture": auto_capture,
            "extraData": extra_data,
            "orderGroupId": "",
            "signature": signature,
        }

        # MoMo sandbox occasionally times out on TLS handshake / slow responses.
        # Retry a few times and return a user-friendly error if still failing.
        last_exc: Exception | None = None
        for attempt in range(1, 4):
            try:
                response = requests.post(
                    settings.MOMO_ENDPOINT,
                    json=request_body,
                    headers={"Content-Type": "application/json"},
                    # (connect timeout, read timeout)
                    timeout=(10, 30),
                )
                response.raise_for_status()
                data = response.json()
                result_code = data.get("resultCode")
                if result_code is not None and str(result_code) != "0":
                    message = data.get("message") or "MoMo payment creation failed"
                    logger.warning(
                        "[MoMo] CREATE FAILED: order_id=%s resultCode=%s message=%s",
                        order_id,
                        result_code,
                        message,
                    )
                    raise HTTPException(
                        status_code=502,
                        detail=f"MoMo create failed ({result_code}): {message}",
                    )

                has_any_link = any(
                    data.get(key)
                    for key in (
                        "payUrl",
                        "shortLink",
                        "deeplink",
                        "qrCodeUrl",
                        "deeplinkWebInApp",
                        "deeplinkMiniApp",
                    )
                )
                if not has_any_link:
                    logger.warning("[MoMo] CREATE NO LINK: order_id=%s data=%s", order_id, data)
                    raise HTTPException(status_code=502, detail="MoMo did not return a payment link")

                return data
            except HTTPException:
                # Don't retry business errors from MoMo.
                raise
            except requests.RequestException as exc:
                last_exc = exc
                logger.warning(
                    "[MoMo] CREATE TIMEOUT/NETWORK: attempt=%s order_id=%s error=%s",
                    attempt,
                    order_id,
                    exc,
                )

        logger.exception("Failed to create MoMo payment for order %s: %s", order_id, last_exc)
        raise HTTPException(
            status_code=504,
            detail="Failed to connect to MoMo (timeout). Please try again.",
        )

    @staticmethod
    async def _transaction_exists(
        *,
        invoice_id: Any,
        transaction_code: str,
        db: AsyncSession,
    ) -> bool:
        if not transaction_code:
            return False
        from app.models.payment_transactions import PaymentTransaction

        statement = select(PaymentTransaction).where(
            PaymentTransaction.invoice_id == invoice_id,
            PaymentTransaction.transaction_code == transaction_code,
        ).limit(1)
        
        result = await db.execute(statement)
        return result.scalar_one_or_none() is not None
    
    @staticmethod
    async def _determine_subscription_status(
        db: AsyncSession, 
        subscription_id: str
    ) -> SubscriptionStatus:
        # Count unpaid invoices for this subscription.
        stmt = (
            select(func.count())
            .select_from(invoiceService.crud.model)
            .where(invoiceService.crud.model.subscription_id == subscription_id)
            .where(invoiceService.crud.model.status != InvoiceStatus.PAID)
        )
        result = await db.execute(stmt)
        unpaid_count = int(result.scalar_one() or 0)

        if unpaid_count == 0:
            return SubscriptionStatus.ACTIVE
        
        subscription = await subscriptionService.crud.get(db, subscription_id)
        if subscription and subscription.status in (SubscriptionStatus.OVERDUE, SubscriptionStatus.PAYMENT_DUE):
            return subscription.status

        return SubscriptionStatus.OVERDUE

    @staticmethod
    async def _create_payment_notification(*, receiver_id: str, order_id: str) -> None:
        async with AsyncSessionLocal() as session:
            await notificationService.create_notification(
                NotificationCreate(
                    actor_id=None,
                    receiver_id=receiver_id,
                    title="Payment successful",
                    content=f"Your invoice {order_id} has been paid successfully.",
                    is_read=False,
                ),
                session,
            )

    @staticmethod
    async def handle_momo_ipn(
        payload: dict[str, Any],
        db: AsyncSession,
        *,
        background_tasks: BackgroundTasks | None = None,
    ) -> dict[str, Any]:
        """
        Xử lý IPN từ MoMo - Logic Subscription Recurring
        """
        order_id = payload.get("orderId")
        result_code = payload.get("resultCode")
        message = payload.get("message")
        trans_id = str(payload.get("transId") or "")
        extra_data_raw = payload.get("extraData") or "{}"

        if not verify_signature(payload):
            logger.warning("[MoMo IPN] Invalid signature - order_id=%s", order_id)
            raise HTTPException(status_code=400, detail="Invalid signature")

        if not order_id:
            raise HTTPException(status_code=400, detail="Missing orderId")
        
        try:
            extra_data = json.loads(extra_data_raw)
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="Invalid extraData")

        invoice_id = extra_data.get("invoice_id")

        if not invoice_id:
            raise HTTPException(status_code=400, detail="Missing invoice_id in extraData")

        try:
            result_code = int(result_code)
        except (TypeError, ValueError):
            raise HTTPException(status_code=400, detail="Invalid resultCode")

        # Get invoice with row lock

        try:
            async with db.begin():

                invoice = await invoiceService.crud.get_for_update(db, invoice_id)
                if not invoice:
                    raise HTTPException(status_code=404, detail="Invoice not found")

                # Ignore delayed IPN callbacks from older payment attempts.
                # We only accept the IPN that matches the latest order id stored on the invoice.
                if invoice.payment_order_id and order_id != invoice.payment_order_id:
                    logger.info(
                        "[MoMo IPN] Ignored outdated order - order_id=%s expected=%s invoice_id=%s",
                        order_id,
                        invoice.payment_order_id,
                        invoice_id,
                    )
                    return {"message": "ignored outdated order", "order_id": order_id}

                # Idempotency check
                if invoice.status == InvoiceStatus.PAID:
                    logger.info("[MoMo IPN] Already paid - order_id=%s", order_id)
                    return {"message": "already paid", "order_id": order_id}

                if result_code != 0:
                    invoice.status = InvoiceStatus.FAILED
                    db.add(invoice)
                    
                    logger.info("[MoMo IPN] FAILED - invoice_id=%s, code=%s", invoice_id, result_code)
                    raise HTTPException(status_code=400, detail=message or f"Payment failed ({result_code})")

                if not invoice.subscription_id:
                    raise HTTPException(status_code=400, detail="Missing subscription_id")

                subscription = await subscriptionService.crud.get_for_update(db, invoice.subscription_id)

                # Create payment transaction
                if trans_id and not await MomoPaymentService._transaction_exists(
                    invoice_id=invoice.id, transaction_code=trans_id, db=db
                ):
                    db.add(PaymentTransaction(
                        invoice_id=invoice.id,
                        attempt_number=1,
                        transaction_code=trans_id,
                        response_message=str(message or "MoMo payment completed"),
                    ))

                # Mark current invoice as PAID
                invoice.status = InvoiceStatus.PAID
                db.add(invoice)
                # Ensure subsequent queries (status determination) see updated invoice status
                await db.flush()

                old_status = subscription.status
                
                if old_status == SubscriptionStatus.CANCELED:
                    new_status = SubscriptionStatus.CANCELED
                else:
                    new_status = await MomoPaymentService._determine_subscription_status(
                        db, subscription.id
                    )

                subscription.status = new_status
                subscription.paid_amount = (subscription.paid_amount or 0) + invoice.amount

                db.add(subscription)

            # Post-commit tasks
            user = await userService.crud.get(db, subscription.user_code)

            if background_tasks is not None:
                background_tasks.add_task(send_payment_confirmation_email, user, invoice, subscription)
                background_tasks.add_task(
                    MomoPaymentService._create_payment_notification,
                    receiver_id=subscription.user_code,
                    order_id=invoice_id,
                )
            else:
                send_payment_confirmation_email(user, invoice, subscription)
                await MomoPaymentService._create_payment_notification(
                    receiver_id=subscription.user_code, order_id=order_id
                )

            logger.info("[MoMo IPN] SUCCESS - order_id=%s, new_status=%s", order_id, new_status.value)

            return {
                "message": "payment recorded",
                "order_id": order_id,
                "invoice_id": str(invoice.id),
                "subscription_id": str(subscription.id),
                "subscription_status": new_status.value,
            }

        except Exception as e:
            await db.rollback()
            logger.exception("[MoMo IPN] Error processing order_id=%s", order_id)
            raise HTTPException(status_code=500, detail="Internal error processing payment")
