from datetime import date, datetime
from fastapi import HTTPException

from app.models.invoices import Invoice, InvoiceCreate, InvoiceUpdate, SubscriptionInvoicesRead
from app.enums.parking import InvoiceStatus
from app.service.base import CRUDService
from app.utils.pagination_db import paginate_scalars
from app.models.subscriptions import UserSubscription
from app.models.users import Users
from sqlalchemy import select, extract, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.utils.pagination import PaginatedResponse

class invoiceService:
    crud = CRUDService(Invoice)

    @staticmethod
    async def create_invoice(payload: InvoiceCreate, db: AsyncSession) -> Invoice:
        return await invoiceService.crud.create(db, payload)

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
        status: str | None = None,
    ) -> PaginatedResponse[Invoice]:
        statement = select(Invoice).where(Invoice.user_code == user_code).order_by(Invoice.created_at.desc())

        if from_time is not None:
            statement = statement.where(Invoice.created_at >= from_time)
        if to_time is not None:
            statement = statement.where(Invoice.created_at <= to_time)
        if status and status.strip():
            try:
                parsed = InvoiceStatus(status.strip())
            except ValueError:
                return {"data": [], "total": 0, "page": page, "limit": limit, "total_pages": 0}
            statement = statement.where(Invoice.status == parsed)

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

    @staticmethod
    async def get_invoices_by_subscription_id(
        subscription_id: str,
        db: AsyncSession,
    ) -> SubscriptionInvoicesRead:
        subscription_stmt = (
            select(UserSubscription, Users)
            .outerjoin(Users, Users.user_code == UserSubscription.user_code)
            .where(UserSubscription.id == subscription_id)
        )

        subscription_result = await db.execute(subscription_stmt)
        subscription_row = subscription_result.first()

        if not subscription_row:
            raise HTTPException(
                status_code=404,
                detail="SUBSCRIPTION_NOT_FOUND",
            )

        subscription, user = subscription_row

        invoice_stmt = (
            select(Invoice)
            .where(Invoice.subscription_id == subscription_id)
            .order_by(desc(Invoice.created_at))
        )

        invoice_result = await db.execute(invoice_stmt)
        invoices = invoice_result.scalars().all()

        return SubscriptionInvoicesRead(
            user_code=subscription.user_code,
            full_name=user.full_name if user else None,
            data=invoices,
        )
