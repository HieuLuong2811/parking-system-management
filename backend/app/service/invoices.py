from app.models.invoices import Invoice, InvoiceCreate, InvoiceUpdate
from app.service.base import CRUDService
from sqlalchemy.ext.asyncio import AsyncSession


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
