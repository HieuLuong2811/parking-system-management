import hashlib
import hmac
import logging
import time
from datetime import date, datetime
from typing import Any

import requests
from fastapi import BackgroundTasks, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.momo_verify_signature import verify_signature
from app.enums.parking import InvoiceStatus, PaymentMethod, SubscriptionStatus
from app.models.invoices import Invoice, InvoiceUpdate
from app.models.momo_payment import MomoInfor
from app.models.notifications import NotificationCreate
from app.service.billing_event_logs import billingEventLogService
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
        if invoice.user_code != user_code:
            raise HTTPException(status_code=403, detail="Forbidden")
        if invoice.payment_method != PaymentMethod.MOMO:
            raise HTTPException(status_code=400, detail="Invoice is not payable by MoMo")
        if invoice.status != InvoiceStatus.PENDING:
            raise HTTPException(status_code=400, detail="Invoice is not pending")

        momo_info = MomoInfor(
            amount=invoice.amount,
            orderId=str(invoice.id),
            orderInfo=order_info or f"Invoice {invoice.id}",
            redirectUrl=redirect_url,
            extraData=extra_data,
            lang=lang or "vi",
        )
        return MomoPaymentService.create_momo_payment(momo_info)

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

        try:
            response = requests.post(
                settings.MOMO_ENDPOINT,
                json=request_body,
                headers={"Content-Type": "application/json"},
                timeout=10,
            )
            response.raise_for_status()
            data = response.json()
            result_code = data.get("resultCode")
            if result_code is not None and str(result_code) != "0":
                message = data.get("message") or "MoMo payment creation failed"
                logger.warning("[MoMo] CREATE FAILED: order_id=%s resultCode=%s message=%s", order_id, result_code, message)
                raise HTTPException(status_code=502, detail=f"MoMo create failed ({result_code}): {message}")

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
        except requests.RequestException as exc:
            logger.exception("Failed to create MoMo payment for order %s: %s", order_id, exc)
            raise HTTPException(
                status_code=500,
                detail=f"Failed to connect to MoMo: {exc}",
            )

    @staticmethod
    async def confirm_from_redirect(
        payload: dict[str, Any],
        *,
        user_code: str,
        db: AsyncSession,
        background_tasks: BackgroundTasks | None = None,
    ) -> dict[str, Any]:
        order_id = payload.get("orderId")
        if not order_id:
            raise HTTPException(status_code=400, detail="Missing orderId")

        invoice = await invoiceService.crud.get(db, order_id)
        if invoice.user_code != user_code:
            raise HTTPException(status_code=403, detail="Forbidden")

        if invoice.status == InvoiceStatus.PAID:
            return {
                "message": "already paid",
                "order_id": str(invoice.id),
                "invoice_id": str(invoice.id),
                "subscription_id": str(invoice.subscription_id) if invoice.subscription_id else None,
            }

        amount_value = payload.get("amount")
        if amount_value is not None:
            try:
                incoming_amount = int(amount_value)
            except (TypeError, ValueError):
                raise HTTPException(status_code=400, detail="Invalid amount")
            if incoming_amount != invoice.amount:
                raise HTTPException(status_code=400, detail="Amount mismatch")

        return await MomoPaymentService.handle_momo_ipn(payload, db, background_tasks=background_tasks)

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
        )
        result = await db.execute(statement)
        return result.scalar_one_or_none() is not None

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
        if not verify_signature(payload):
            raise HTTPException(status_code=400, detail="Invalid signature")

        result_code = payload.get("resultCode")
        order_id = payload.get("orderId")
        message = payload.get("message")
        if not order_id:
            raise HTTPException(status_code=400, detail="Missing orderId in MoMo notification")

        try:
            result_code = int(result_code)
        except (TypeError, ValueError):
            raise HTTPException(status_code=400, detail="Invalid resultCode in MoMo notification")

        invoice = await invoiceService.crud.get(db, order_id)

        if invoice.status == InvoiceStatus.PAID:
            return {
                "message": "already paid",
                "order_id": order_id,
                "invoice_id": str(invoice.id),
                "subscription_id": str(invoice.subscription_id) if invoice.subscription_id else None,
            }

        if result_code != 0:
            await invoiceService.update_invoice(
                order_id,
                InvoiceUpdate(status=InvoiceStatus.FAILED),
                db,
            )
            logger.info("[MoMo] FAILED: %s (%s)", order_id, result_code)
            raise HTTPException(
                status_code=400,
                detail=message or f"MoMo payment failed with code {result_code}",
            )

        subscription_id = invoice.subscription_id
        if not subscription_id:
            raise HTTPException(
                status_code=400,
                detail="Invoice missing subscription_id",
            )

        log = await billingEventLogService.get_latest_log_by_subscription(str(subscription_id), db, event_type="invoice_created")
        metadata = log.meta_data if log and isinstance(log.meta_data, dict) else None
        if not isinstance(metadata, dict):
            raise HTTPException(status_code=400, detail="Invalid invoice metadata")

        required_keys = [
            "sub_plan_id",
            "term_id",
            "vehicle_id",
            "payment_plan_id",
            "start_date",
            "end_date",
        ]
        missing = [key for key in required_keys if not metadata.get(key)]
        if missing:
            raise HTTPException(
                status_code=400,
                detail=f"Invoice metadata missing {', '.join(missing)}",
            )

        trans_id = str(payload.get("transId") or "")

        try:
            subscription = await subscriptionService.crud.get(db, subscription_id)
            subscription.status = SubscriptionStatus.ACTIVE
            subscription.paid_amount = invoice.amount
            db.add(subscription)

            if trans_id and not await MomoPaymentService._transaction_exists(
                invoice_id=invoice.id,
                transaction_code=trans_id,
                db=db,
            ):
                from app.models.payment_transactions import PaymentTransaction

                db.add(
                    PaymentTransaction(
                        invoice_id=invoice.id,
                        attempt_number=1,
                        transaction_code=trans_id,
                        response_message=str(message or "MoMo payment completed"),
                    )
                )

            invoice.status = InvoiceStatus.PAID
            invoice.subscription_id = subscription.id
            db.add(invoice)

            await db.commit()
        except Exception:
            await db.rollback()
            raise

        user = await userService.crud.get(db, subscription.user_code)

        if background_tasks is not None:
            background_tasks.add_task(send_payment_confirmation_email, user, invoice, subscription)
            background_tasks.add_task(
                MomoPaymentService._create_payment_notification,
                receiver_id=subscription.user_code,
                order_id=order_id,
            )
        else:
            send_payment_confirmation_email(user, invoice, subscription)
            await MomoPaymentService._create_payment_notification(
                receiver_id=subscription.user_code,
                order_id=order_id,
            )

        logger.info("[MoMo] SUCCESS: %s", order_id)
        return {
            "message": "payment recorded",
            "order_id": order_id,
            "invoice_id": str(invoice.id),
            "subscription_id": str(subscription.id),
        }
