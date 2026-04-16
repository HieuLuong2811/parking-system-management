import hashlib
import hmac
import logging
import time
from datetime import date, datetime
from typing import Any

import requests
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.momo_verify_signature import verify_signature
from app.enums.parking import InvoiceStatus, SubscriptionStatus, TransactionStatus
from app.models.invoices import Invoice, InvoiceUpdate
from app.models.momo_payment import MomoInfor
from app.models.payment_transactions import PaymentTransactionCreate
from app.models.subscriptions import UserSubscriptionUpdate
from app.service.billing_event_logs import billingEventLogService
from app.service.invoices import invoiceService
from app.service.payment_notifications import send_payment_confirmation_email
from app.service.payment_transactions import paymentTransactionService
from app.service.subscriptions import subscriptionService
from app.service.users import userService

logger = logging.getLogger(__name__)


class MomoPaymentService:
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
            return response.json()
        except requests.RequestException as exc:
            logger.exception("Failed to create MoMo payment for order %s: %s", order_id, exc)
            raise HTTPException(
                status_code=500,
                detail=f"Failed to connect to MoMo: {exc}",
            )

    @staticmethod
    async def handle_momo_ipn(payload: dict[str, Any], db: AsyncSession) -> dict[str, Any]:
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

        user_code = metadata.get("user_code") or invoice.user_code
        subscription_update = UserSubscriptionUpdate(
            status=SubscriptionStatus.ACTIVE,
            paid_amount=invoice.amount,
        )
        subscription = await subscriptionService.update_subscription(subscription_id, subscription_update, db)

        transaction_payload = PaymentTransactionCreate(
            invoice_id=invoice.id,
            attempt_number=1,
            transaction_code=str(payload.get("transId") or ""),
            status=TransactionStatus.SUCCESS,
            response_message=str(message or "MoMo payment completed"),
        )
        await paymentTransactionService.create_transaction(transaction_payload, db)

        await invoiceService.update_invoice(
            order_id,
            InvoiceUpdate(
                status=InvoiceStatus.PAID,
                subscription_id=subscription.id,
            ),
            db,
        )

        user = await userService.crud.get(db, subscription.user_code)
        send_payment_confirmation_email(user, invoice, subscription)

        logger.info("[MoMo] SUCCESS: %s", order_id)
        return {
            "message": "payment recorded",
            "order_id": order_id,
            "invoice_id": invoice.id,
            "subscription_id": str(subscription.id),
        }
