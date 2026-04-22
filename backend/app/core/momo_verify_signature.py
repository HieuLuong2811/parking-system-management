from __future__ import annotations

import hashlib
import hmac
from typing import Any, Mapping

from app.core.config import settings


def verify_signature(payload: Mapping[str, Any]) -> bool:
    raw_signature = (
        f"accessKey={settings.MOMO_ACCESS_KEY}"
        f"&amount={payload.get('amount')}"
        f"&extraData={payload.get('extraData')}"
        f"&message={payload.get('message')}"
        f"&orderId={payload.get('orderId')}"
        f"&orderInfo={payload.get('orderInfo')}"
        f"&orderType={payload.get('orderType')}"
        f"&partnerCode={payload.get('partnerCode')}"
        f"&payType={payload.get('payType')}"
        f"&requestId={payload.get('requestId')}"
        f"&responseTime={payload.get('responseTime')}"
        f"&resultCode={payload.get('resultCode')}"
        f"&transId={payload.get('transId')}"
    )

    signature = hmac.new(
        settings.MOMO_SECRET_KEY.encode(),
        raw_signature.encode(),
        hashlib.sha256,
    ).hexdigest()

    return signature == payload.get("signature")
