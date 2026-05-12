import json

from app.service.checkout import CheckoutService
from app.service.momo_payment import MomoPaymentService


class CheckoutController:
    @staticmethod
    async def checkout_momo_ctrl(payload, db, current_user):
        invoice = await CheckoutService.create_invoice_for_momo(
            payload, db, current_user
        )

        return await MomoPaymentService.create_momo_payment_for_invoice(
            invoice_id=str(invoice.id),
            redirect_url=payload.redirect_url,
            order_info=f"Invoice {invoice.id}",
            extra_data=json.dumps({
                "invoice_id": str(invoice.id),
                "payment_reason": "pay invoice",
            }),
            lang=payload.lang,
            user_code=current_user.user_code,
            db=db,
        )
    
    @staticmethod
    async def checkout_pay_debt_ctrl(payload, db, current_user):
        return await MomoPaymentService.create_momo_payment_for_invoice(
            invoice_id=str(payload.invoice_id),
            redirect_url=payload.redirect_url,
            order_info=f"Pay debt invoice {payload.invoice_id}",
            extra_data=json.dumps({
                "invoice_id": str(payload.invoice_id),
                "payment_reason": "pay_debt",
            }),
            lang=None,
            user_code=current_user.user_code,
            db=db,
        )

    @staticmethod
    async def checkout_recurring_ctrl(payload, db, current_user):
        return await CheckoutService.create_subscription_only(
            payload, db, current_user
        )
