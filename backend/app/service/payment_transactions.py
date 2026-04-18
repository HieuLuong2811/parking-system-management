from app.models.payment_transactions import (
    PaymentTransaction,
    PaymentTransactionCreate,
    PaymentTransactionUpdate,
)
from app.service.base import CRUDService
from app.utils.pagination import PaginatedResponse
from app.utils.pagination_db import paginate_scalars
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
                        func.lower(PaymentTransaction.status).ilike(like),
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
    async def update_transaction(
        transaction_id: str, payload: PaymentTransactionUpdate, db: AsyncSession
    ) -> PaymentTransaction:
        return await paymentTransactionService.crud.update(db, transaction_id, payload)

    @staticmethod
    async def delete_transaction(transaction_id: str, db: AsyncSession) -> PaymentTransaction:
        return await paymentTransactionService.crud.delete(db, transaction_id)
