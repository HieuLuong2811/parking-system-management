from datetime import date, datetime
from typing import Any, Optional
from uuid import UUID

from app.models.invoices import Invoice, InvoiceCreate, InvoiceUpdate
from app.service.base import CRUDService
from app.utils.pagination_db import paginate_scalars
from sqlalchemy import select, extract
from sqlalchemy.ext.asyncio import AsyncSession

from app.utils.pagination import PaginatedResponse

class invoiceService:
    crud = CRUDService(Invoice)

    @staticmethod
    async def create_invoice(payload: InvoiceCreate, db: AsyncSession) -> Invoice:
        return await invoiceService.crud.create(db, payload)

    @staticmethod
    def _parse_subscription_metadata(metadata: dict[str, Any]) -> Optional[tuple[UUID, UUID, UUID, date, date, int]]:
        try:
            sub_plan_id = UUID(str(metadata.get("sub_plan_id")))
            term_id = UUID(str(metadata.get("term_id")))
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

        return sub_plan_id, term_id, payment_plan_id, start_date, end_date, total_amount_value

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
    async def get_invoices_by_user_code_paginated(
        user_code: str,
        db: AsyncSession,
        *,
        page: int = 1,
        limit: int = 5,
        from_time: datetime | None = None,
        to_time: datetime | None = None,
    ) -> PaginatedResponse[Invoice]:
        statement = select(Invoice).where(Invoice.user_code == user_code).order_by(Invoice.created_at.desc())

        if from_time is not None:
            statement = statement.where(Invoice.created_at >= from_time)
        if to_time is not None:
            statement = statement.where(Invoice.created_at <= to_time)

        items, total, total_pages = await paginate_scalars(db, statement, page=page, limit=limit)
        return {
            "data": items,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": total_pages,
        }

    @staticmethod
    async def find_current_month_invoice_by_subscription(
        self,
        db: AsyncSession,
        subscription_id: int | str,
        today: date,
    ):
        stmt = (
            select(Invoice)
            .where(Invoice.subscription_id == subscription_id)
            .where(extract("year", Invoice.created_at) == today.year)
            .where(extract("month", Invoice.created_at) == today.month)
            .order_by(Invoice.created_at.desc())
            .limit(1)
        )

        result = await db.execute(stmt)
        return result.scalar_one_or_none()
