from datetime import datetime

from sqlalchemy.ext.asyncio import AsyncSession

from app.utils.pagination import PaginatedResponse
from app.models.invoices import InvoiceCreate, InvoiceRead, InvoiceUpdate
from app.service.invoices import invoiceService


class InvoiceController:
    @staticmethod
    async def create_invoice_ctrl(payload: InvoiceCreate, db: AsyncSession) -> InvoiceRead:
        return await invoiceService.create_invoice(payload, db)

    @staticmethod
    async def get_invoice_by_user_code_ctrl(user_id: str, db: AsyncSession) -> InvoiceRead:
        return await invoiceService.get_invoice_by_user_code(user_id, db)

    @staticmethod
    async def get_all_invoices_ctrl(db: AsyncSession) -> list[InvoiceRead]:
        return await invoiceService.get_all_invoices(db)

    @staticmethod
    async def get_invoices_by_user_ctrl(user_code: str, db: AsyncSession) -> list[InvoiceRead]:
        invoices = await invoiceService.get_invoices_by_user_code(user_code, db)
        return [invoice for invoice in invoices]

    @staticmethod
    async def get_invoices_by_user_paginated_ctrl(
        user_code: str,
        db: AsyncSession,
        *,
        page: int = 1,
        limit: int = 20,
        from_time: datetime | None = None,
        to_time: datetime | None = None,
    ) -> PaginatedResponse[InvoiceRead]:
        return await invoiceService.get_invoices_by_user_code_paginated(
            user_code,
            db,
            page=page,
            limit=limit,
            from_time=from_time,
            to_time=to_time,
        )

    @staticmethod
    async def update_invoice_ctrl(invoice_id: str, payload: InvoiceUpdate, db: AsyncSession) -> InvoiceRead:
        return await invoiceService.update_invoice(invoice_id, payload, db)
