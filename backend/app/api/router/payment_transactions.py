from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.controller.payment_transactions import PaymentTransactionController
from app.db.session import get_db
from app.models.responses import DeleteResponse
from app.models.payment_transactions import (
    PaymentTransactionCreate,
    PaymentTransactionRead,
    PaymentTransactionUpdate,
)

router = APIRouter(prefix="/payment_transactions", tags=["payment_transactions"])


@router.post("/", response_model=PaymentTransactionRead)
async def create_transaction(payload: PaymentTransactionCreate, db: AsyncSession = Depends(get_db)):
    return await PaymentTransactionController.create_transaction_ctrl(payload, db)


@router.get("/", response_model=list[PaymentTransactionRead])
async def list_transactions(db: AsyncSession = Depends(get_db)):
    transactions = await PaymentTransactionController.get_all_transactions_ctrl(db)
    return transactions


@router.get("/{transaction_id}", response_model=PaymentTransactionRead)
async def get_transaction(transaction_id: str, db: AsyncSession = Depends(get_db)):
    return await PaymentTransactionController.get_transaction_ctrl(transaction_id, db)


@router.patch("/{transaction_id}", response_model=PaymentTransactionRead)
async def update_transaction(
    transaction_id: str, payload: PaymentTransactionUpdate, db: AsyncSession = Depends(get_db)
):
    return await PaymentTransactionController.update_transaction_ctrl(transaction_id, payload, db)


@router.delete("/{transaction_id}", response_model=DeleteResponse)
async def delete_transaction(transaction_id: str, db: AsyncSession = Depends(get_db)):
    return await PaymentTransactionController.delete_transaction_ctrl(transaction_id, db)
