from datetime import datetime

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.controller.payment_transactions import PaymentTransactionController
from app.authen.current_user import AuthUser, required_roles
from app.db.session import get_db
from app.models.responses import DeleteResponse
from app.models.payment_transactions import (
    PaymentTransactionCreate,
    PaymentTransactionDetailRead,
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
    limit: int = Query(5, ge=1, le=100, description="Number of items per page"),
    db: AsyncSession = Depends(get_db),
    current_user: AuthUser = Depends(required_roles("ADMIN")),
):
    return await PaymentTransactionController.get_transactions_ctrl(db, search=search, page=page, limit=limit)


@router.get("/details", response_model=PaginatedResponse[PaymentTransactionDetailRead])
async def list_transactions_details(
    search: str | None = None,
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(5, ge=1, le=100, description="Number of items per page"),
    from_time: datetime | None = Query(None, description="Filter by created_at (from)"),
    to_time: datetime | None = Query(None, description="Filter by created_at (to)"),
    db: AsyncSession = Depends(get_db),
    current_user: AuthUser = Depends(required_roles("ADMIN")),
):
    return await PaymentTransactionController.get_transactions_details_ctrl(
        db,
        search=search,
        from_time=from_time,
        to_time=to_time,
        page=page,
        limit=limit,
    )


@router.get("/me/details", response_model=PaginatedResponse[PaymentTransactionDetailRead])
async def list_my_transactions_details(
    invoice_id: str | None = None,
    transaction_code: str | None = None,
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(5, ge=1, le=100, description="Number of items per page"),
    from_time: datetime | None = Query(None, description="Filter by created_at (from)"),
    to_time: datetime | None = Query(None, description="Filter by created_at (to)"),
    db: AsyncSession = Depends(get_db),
    current_user: AuthUser = Depends(required_roles("USER", "ADMIN")),
):
    return await PaymentTransactionController.get_my_transactions_details_ctrl(
        current_user.user_code,
        db,
        invoice_id=invoice_id,
        transaction_code=transaction_code,
        from_time=from_time,
        to_time=to_time,
        page=page,
        limit=limit,
    )


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
