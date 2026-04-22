from app.models.payment_transactions import (
    PaymentTransaction,
    PaymentTransactionCreate,
    PaymentTransactionDetailRead,
    PaymentTransactionUpdate,
)
from app.models.invoices import Invoice
from app.models.users import Users
from app.service.base import CRUDService
from app.utils.pagination import PaginatedResponse
from app.utils.pagination_db import paginate_rows, paginate_scalars
from sqlalchemy import String, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession


class paymentTransactionService:
    crud = CRUDService(PaymentTransaction)

    @staticmethod
    async def create_transaction(payload: PaymentTransactionCreate, db: AsyncSession) -> PaymentTransaction:
        return await paymentTransactionService.crud.create(db, payload)

    @staticmethod
    async def get_transaction(transaction_id: str, db: AsyncSession) -> PaymentTransaction:
        return await paymentTransactionService.crud.get(db, transaction_id)

    @staticmethod
    async def get_all_transactions(db: AsyncSession) -> list[PaymentTransaction]:
        return await paymentTransactionService.crud.get_all(db)

    @staticmethod
    async def get_transactions(
        db: AsyncSession,
        *,
        search: str | None = None,
        page: int = 1,
        limit: int = 20,
    ) -> PaginatedResponse[PaymentTransaction]:
        statement = select(PaymentTransaction).order_by(PaymentTransaction.created_at.desc())

        if search:
            trimmed = search.strip()
            if trimmed:
                like = f"%{trimmed.lower()}%"
                statement = statement.where(
                    or_(
                        func.lower(PaymentTransaction.transaction_code).ilike(like),
                        func.lower(func.cast(PaymentTransaction.invoice_id, String)).ilike(like),
                    )
                )

        items, total, total_pages = await paginate_scalars(db, statement, page=page, limit=limit)
        return {
            "data": items,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": total_pages,
        }

    @staticmethod
    async def get_transactions_details(
        db: AsyncSession,
        *,
        search: str | None = None,
        page: int = 1,
        limit: int = 20,
    ) -> PaginatedResponse[PaymentTransactionDetailRead]:
        statement = (
            select(PaymentTransaction, Invoice, Users)
            .join(Invoice, Invoice.id == PaymentTransaction.invoice_id)
            .join(Users, Users.user_code == Invoice.user_code)
            .order_by(PaymentTransaction.created_at.desc())
        )

        if search:
            trimmed = search.strip()
            if trimmed:
                like = f"%{trimmed.lower()}%"
                statement = statement.where(
                    or_(
                        func.lower(func.coalesce(PaymentTransaction.transaction_code, "")).ilike(like),
                        func.lower(func.cast(PaymentTransaction.invoice_id, String)).ilike(like),
                        func.lower(func.coalesce(Users.user_code, "")).ilike(like),
                        func.lower(func.coalesce(Users.full_name, "")).ilike(like),
                    )
                )

        rows, total, total_pages = await paginate_rows(db, statement, page=page, limit=limit)
        items: list[PaymentTransactionDetailRead] = []
        for transaction, invoice, user in rows:
            items.append(
                PaymentTransactionDetailRead(
                    id=transaction.id,
                    invoice_id=transaction.invoice_id,
                    attempt_number=transaction.attempt_number,
                    transaction_code=transaction.transaction_code,
                    response_message=transaction.response_message,
                    created_at=transaction.created_at,
                    user_code=invoice.user_code,
                    user_full_name=user.full_name,
                    invoice_amount=invoice.amount,
                    invoice_payment_method=invoice.payment_method,
                    invoice_created_at=invoice.created_at,
                )
            )

        return {
            "data": items,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": total_pages,
        }

    @staticmethod
    async def update_transaction(
        transaction_id: str, payload: PaymentTransactionUpdate, db: AsyncSession
    ) -> PaymentTransaction:
        return await paymentTransactionService.crud.update(db, transaction_id, payload)

    @staticmethod
    async def delete_transaction(transaction_id: str, db: AsyncSession) -> PaymentTransaction:
        return await paymentTransactionService.crud.delete(db, transaction_id)
