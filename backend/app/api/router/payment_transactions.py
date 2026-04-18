from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.controller.payment_transactions import PaymentTransactionController
from app.db.session import get_db
from app.models.responses import DeleteResponse
from app.models.payment_transactions import (
    PaymentTransactionCreate,
    PaymentTransactionRead,
    PaymentTransactionUpdate,
)
from app.utils.pagination import PaginatedResponse

router = APIRouter(prefix="/payment_transactions", tags=["payment_transactions"])


@router.post("/", response_model=PaymentTransactionRead)
async def create_transaction(payload: PaymentTransactionCreate, db: AsyncSession = Depends(get_db)):
    return await PaymentTransactionController.create_transaction_ctrl(payload, db)


@router.get("/", response_model=PaginatedResponse[PaymentTransactionRead])
async def list_transactions(
    search: str | None = None,
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Number of items per page"),
    db: AsyncSession = Depends(get_db),
):
    return await PaymentTransactionController.get_transactions_ctrl(db, search=search, page=page, limit=limit)


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
