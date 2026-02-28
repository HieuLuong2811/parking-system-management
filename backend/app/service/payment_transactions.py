from app.models.payment_transactions import (
    PaymentTransaction,
    PaymentTransactionCreate,
    PaymentTransactionUpdate,
)
from app.service.base import CRUDService
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
    async def update_transaction(
        transaction_id: str, payload: PaymentTransactionUpdate, db: AsyncSession
    ) -> PaymentTransaction:
        return await paymentTransactionService.crud.update(db, transaction_id, payload)

    @staticmethod
    async def delete_transaction(transaction_id: str, db: AsyncSession) -> PaymentTransaction:
        return await paymentTransactionService.crud.delete(db, transaction_id)
