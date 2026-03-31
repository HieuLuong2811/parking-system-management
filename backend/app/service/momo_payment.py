import hmac
import hashlib
import time
import requests

from fastapi import HTTPException
from app.core.config import settings


class MomoPaymentService:

    @staticmethod
    def create_momo_payment(payload: dict):
        amount = payload.get("amount")
        order_info = payload.get("orderInfo", "pay with MoMo")
        client_order_id = payload.get("orderId")
        client_redirect_url = payload.get("redirectUrl")

        if not amount:
            raise HTTPException(status_code=400, detail="Amount is required")

        order_id = client_order_id or f"{settings.MOMO_PARTNER_CODE}{int(time.time() * 1000)}"
        request_id = order_id
        redirect_url = client_redirect_url or settings.MOMO_REDIRECT_URL

        request_type = "payWithMethod"
        extra_data = ""
        auto_capture = True
        lang = "vi"

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
            hashlib.sha256
        ).hexdigest()

        request_body = {
            "partnerCode": settings.MOMO_PARTNER_CODE,
            "partnerName": "Test",
            "storeId": "MomoTestStore",
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
                timeout=10
            )

            response.raise_for_status()
            return response.json()

        except requests.RequestException as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to connect to MoMo: {str(e)}"
            )