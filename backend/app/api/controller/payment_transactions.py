from sqlalchemy.ext.asyncio import AsyncSession

from app.models.responses import DeleteResponse
from app.models.payment_transactions import (
    PaymentTransactionCreate,
    PaymentTransactionDetailRead,
    PaymentTransactionRead,
    PaymentTransactionUpdate,
)
from app.utils.pagination import PaginatedResponse
from app.service.payment_transactions import paymentTransactionService


class PaymentTransactionController:
    @staticmethod
    async def create_transaction_ctrl(
        payload: PaymentTransactionCreate, db: AsyncSession
    ) -> PaymentTransactionRead:
        return await paymentTransactionService.create_transaction(payload, db)

    @staticmethod
    async def get_transaction_ctrl(transaction_id: str, db: AsyncSession) -> PaymentTransactionRead:
        return await paymentTransactionService.get_transaction(transaction_id, db)

    @staticmethod
    async def get_transactions_ctrl(
        db: AsyncSession,
        *,
        search: str | None = None,
        page: int = 1,
        limit: int = 5,
    ) -> PaginatedResponse[PaymentTransactionRead]:
        return await paymentTransactionService.get_transactions(db, search=search, page=page, limit=limit)

    @staticmethod
    async def get_transactions_details_ctrl(
        db: AsyncSession,
        *,
        search: str | None = None,
        page: int = 1,
        limit: int = 5,
    ) -> PaginatedResponse[PaymentTransactionDetailRead]:
        return await paymentTransactionService.get_transactions_details(db, search=search, page=page, limit=limit)

    @staticmethod
    async def update_transaction_ctrl(
        transaction_id: str, payload: PaymentTransactionUpdate, db: AsyncSession
    ) -> PaymentTransactionRead:
        return await paymentTransactionService.update_transaction(transaction_id, payload, db)

    @staticmethod
    async def delete_transaction_ctrl(transaction_id: str, db: AsyncSession) -> DeleteResponse:
        await paymentTransactionService.delete_transaction(transaction_id, db)
        return DeleteResponse(message="Deleted transaction")
