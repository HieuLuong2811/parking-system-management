from datetime import date
from typing import Any, Optional
from uuid import UUID

from app.enums.parking import SubscriptionStatus
from app.models.billing_event_logs import BillingEventLogCreate
from app.models.invoices import Invoice, InvoiceCreate, InvoiceUpdate
from app.models.subscriptions import UserSubscriptionCreate, UserSubscriptionUpdate
from app.service.base import CRUDService
from app.service.billing_event_logs import billingEventLogService
from app.service.subscriptions import subscriptionService
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession


class invoiceService:
    crud = CRUDService(Invoice)

    @staticmethod
    async def create_invoice(payload: InvoiceCreate, db: AsyncSession) -> Invoice:
        metadata = payload.metadata_payload
        subscription = None
        subscription_id: Optional[UUID] = None
        if payload.subscription_id is None and isinstance(metadata, dict):
            parsed = invoiceService._parse_subscription_metadata(metadata)
            if parsed:
                sub_plan_id, term_id, vehicle_id, payment_plan_id, start_date, end_date, total_amount_value = parsed
                subscription_payload = UserSubscriptionCreate(
                    user_code=payload.user_code,
                    sub_plan_id=sub_plan_id,
                    term_id=term_id,
                    vehicle_id=vehicle_id,
                    payment_plan_id=payment_plan_id,
                    total_amount=total_amount_value,
                    paid_amount=0,
                    status=SubscriptionStatus.PENDING,
                    start_date=start_date,
                    end_date=end_date,
                )
                subscription = await subscriptionService.create_subscription(subscription_payload, db)
                await db.refresh(subscription, attribute_names=["id"])
                subscription_id = subscription.id
                payload.subscription_id = subscription_id

        payload.metadata_payload = None
        invoice = await invoiceService.crud.create(db, payload)

        if subscription and isinstance(metadata, dict) and subscription_id:
            await billingEventLogService.create_log(
                BillingEventLogCreate(
                    user_code=payload.user_code,
                    subscription_id=subscription_id,
                    event_type="invoice_created",
                    meta_data=metadata,
                ),
                db,
            )

        return invoice

    @staticmethod
    def _parse_subscription_metadata(metadata: dict[str, Any]) -> Optional[tuple[UUID, UUID, UUID, UUID, date, date, int]]:
        try:
            sub_plan_id = UUID(str(metadata.get("sub_plan_id")))
            term_id = UUID(str(metadata.get("term_id")))
            vehicle_id = UUID(str(metadata.get("vehicle_id")))
            payment_plan_id = UUID(str(metadata.get("payment_plan_id")))
        except (TypeError, ValueError):
            return None

        start_date_value = metadata.get("start_date")
        end_date_value = metadata.get("end_date")
        start_date = None
        end_date = None
        if isinstance(start_date_value, str):
            start_date = date.fromisoformat(start_date_value)
        if isinstance(end_date_value, str):
            end_date = date.fromisoformat(end_date_value)

        if not all((start_date, end_date)):
            return None

        total_amount = metadata.get("total_amount")
        if total_amount is None:
            total_amount_value = metadata.get("amount") or 0
        else:
            try:
                total_amount_value = int(total_amount)
            except (TypeError, ValueError):
                return None

        return sub_plan_id, term_id, vehicle_id, payment_plan_id, start_date, end_date, total_amount_value

    @staticmethod
    async def get_invoice_by_user_code(user_code: str, db: AsyncSession) -> Invoice:
        return await invoiceService.crud.get(db, user_code)

    @staticmethod
    async def get_all_invoices(db: AsyncSession) -> list[Invoice]:
        return await invoiceService.crud.get_all(db)

    @staticmethod
    async def update_invoice(invoice_id: str, payload: InvoiceUpdate, db: AsyncSession) -> Invoice:
        return await invoiceService.crud.update(db, invoice_id, payload)

    @staticmethod
    async def get_invoices_by_user_code(user_code: str, db: AsyncSession) -> list[Invoice]:
        statement = select(Invoice).where(Invoice.user_code == user_code)
        result = await db.execute(statement)
        return result.scalars().all()

