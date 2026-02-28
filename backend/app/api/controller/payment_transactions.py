from sqlalchemy.ext.asyncio import AsyncSession

from app.models.responses import DeleteResponse
from app.models.payment_transactions import (
    PaymentTransactionCreate,
    PaymentTransactionRead,
    PaymentTransactionUpdate,
)
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
    async def get_all_transactions_ctrl(db: AsyncSession) -> list[PaymentTransactionRead]:
        return await paymentTransactionService.get_all_transactions(db)

    @staticmethod
    async def update_transaction_ctrl(
        transaction_id: str, payload: PaymentTransactionUpdate, db: AsyncSession
    ) -> PaymentTransactionRead:
        return await paymentTransactionService.update_transaction(transaction_id, payload, db)

    @staticmethod
    async def delete_transaction_ctrl(transaction_id: str, db: AsyncSession) -> DeleteResponse:
        await paymentTransactionService.delete_transaction(transaction_id, db)
        return DeleteResponse(message="Deleted transaction")
