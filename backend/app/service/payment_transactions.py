import uuid

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
from datetime import datetime, timezone

from sqlalchemy import String, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.enums.parking import PaymentTransactionType


class paymentTransactionService:
    crud = CRUDService(PaymentTransaction)

    @staticmethod
    def _drop_tz(value: datetime | None) -> datetime | None:
        if value is None:
            return None
        if value.tzinfo is None:
            return value
        return value.astimezone(timezone.utc).replace(tzinfo=None)

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
                        func.lower(func.coalesce(PaymentTransaction.user_code, "")).ilike(like),
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
        user_code: str | None = None,
        invoice_id: str | None = None,
        transaction_code: str | None = None,
        from_time: datetime | None = None,
        to_time: datetime | None = None,
        page: int = 1,
        limit: int = 20,
    ) -> PaginatedResponse[PaymentTransactionDetailRead]:
        from_time = paymentTransactionService._drop_tz(from_time)
        to_time = paymentTransactionService._drop_tz(to_time)

        statement = (
            select(PaymentTransaction, Invoice, Users)
            .outerjoin(Invoice, Invoice.id == PaymentTransaction.invoice_id)
            .outerjoin(Users, Users.user_code == Invoice.user_code)
            .order_by(PaymentTransaction.created_at.desc())
        )

        if from_time:
            statement = statement.where(PaymentTransaction.created_at >= from_time)
        if to_time:
            statement = statement.where(PaymentTransaction.created_at <= to_time)

        if user_code and user_code.strip():
            keyword = user_code.strip().lower()
            like = f"%{keyword}%"
            statement = statement.where(
                or_(
                    func.lower(func.coalesce(PaymentTransaction.user_code, "")).ilike(like),
                    func.lower(func.coalesce(Users.user_code, "")).ilike(like),
                    func.lower(func.coalesce(Users.full_name, "")).ilike(like),
                )
            )

        if invoice_id and invoice_id.strip():
            keyword = invoice_id.strip()
            try:
                invoice_uuid = uuid.UUID(keyword)
                statement = statement.where(PaymentTransaction.invoice_id == invoice_uuid)
            except ValueError:
                like = f"%{keyword.lower()}%"
                statement = statement.where(func.lower(func.cast(PaymentTransaction.invoice_id, String)).ilike(like))

        if transaction_code and transaction_code.strip():
            keyword = transaction_code.strip()
            try:
                transaction_uuid = uuid.UUID(keyword)
                statement = statement.where(PaymentTransaction.transaction_code == transaction_uuid)
            except ValueError:
                like = f"%{keyword.lower()}%"
                statement = statement.where(func.lower(func.coalesce(PaymentTransaction.transaction_code, "")).ilike(like))

        if search:
            trimmed = search.strip()
            if trimmed:
                like = f"%{trimmed.lower()}%"
                statement = statement.where(
                    or_(
                        func.lower(func.coalesce(PaymentTransaction.transaction_code, "")).ilike(like),
                        func.lower(func.cast(PaymentTransaction.invoice_id, String)).ilike(like),
                        func.lower(func.coalesce(PaymentTransaction.user_code, "")).ilike(like),
                        func.lower(func.coalesce(Users.user_code, "")).ilike(like),
                        func.lower(func.coalesce(Users.full_name, "")).ilike(like),
                    )
                )

        rows, total, total_pages = await paginate_rows(db, statement, page=page, limit=limit)
        items: list[PaymentTransactionDetailRead] = []
        for transaction, invoice, user in rows:
            items.append(
                PaymentTransactionDetailRead(
                    payment_transaction_id=transaction.payment_transaction_id,
                    invoice_id=transaction.invoice_id,
                    attempt_number=transaction.attempt_number,
                    transaction_code=transaction.transaction_code,
                    transaction_type=transaction.transaction_type,
                    payment_method=transaction.payment_method,
                    amount=transaction.amount,
                    status=transaction.status,
                    created_at=transaction.created_at,
                    user_code=transaction.user_code,
                    user_full_name=(user.full_name if user else None),
                    invoice_amount=(invoice.amount if invoice else None),
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
    async def get_transactions_details_for_user(
        user_code: str,
        db: AsyncSession,
        *,
        invoice_id: str | None = None,
        transaction_code: str | None = None,
        transaction_type: str | None = None,
        direction: str | None = None,
        from_time: datetime | None = None,
        to_time: datetime | None = None,
        page: int = 1,
        limit: int = 20,
    ) -> PaginatedResponse[PaymentTransactionDetailRead]:
        from_time = paymentTransactionService._drop_tz(from_time)
        to_time = paymentTransactionService._drop_tz(to_time)

        statement = (
            select(PaymentTransaction, Invoice, Users)
            .outerjoin(Users, Users.user_code == Invoice.user_code)
            .where(PaymentTransaction.user_code == user_code)
            .order_by(PaymentTransaction.created_at.desc())
        )

        if from_time:
            statement = statement.where(PaymentTransaction.created_at >= from_time)
        if to_time:
            statement = statement.where(PaymentTransaction.created_at <= to_time)

        if transaction_type and transaction_type.strip():
            try:
                parsed_type = PaymentTransactionType(transaction_type.strip())
            except ValueError:
                return PaginatedResponse(data=[], total=0, page=page, limit=limit, total_pages=0)
            statement = statement.where(PaymentTransaction.transaction_type == parsed_type)

        if direction and direction.strip():
            normalized = direction.strip().upper()
            if normalized in {"IN", "INCOME"}:
                statement = statement.where(
                    PaymentTransaction.transaction_type.in_(
                        [
                            PaymentTransactionType.TOP_UP,
                            PaymentTransactionType.REFUND,
                            PaymentTransactionType.ADMIN_ADJUSTMENT,
                        ]
                    )
                )
            elif normalized in {"OUT", "EXPENSE"}:
                statement = statement.where(
                    PaymentTransaction.transaction_type.in_(
                        [
                            PaymentTransactionType.SUBSCRIPTION_FULL_PAYMENT,
                            PaymentTransactionType.MONTHLY_CHARGE,
                            PaymentTransactionType.INVOICE_DIRECT_PAYMENT,
                        ]
                    )
                )
            else:
                return PaginatedResponse(data=[], total=0, page=page, limit=limit, total_pages=0)
            
        if invoice_id and invoice_id.strip():
            keyword = invoice_id.strip()

            try:
                invoice_uuid = uuid.UUID(keyword)
            except ValueError:
                return PaginatedResponse(
                    data=[],
                    total=0,
                    page=page,
                    limit=limit,
                    total_pages=0,
                )

            statement = statement.where(PaymentTransaction.invoice_id == invoice_uuid)

        if transaction_code and transaction_code.strip():
            keyword = transaction_code.strip()
            try:
                transaction_uuid = uuid.UUID(keyword)
            except ValueError:
                return PaginatedResponse(
                    data=[],
                    total=0,
                    page=page,
                    limit=limit,
                    total_pages=0,
                )

            statement = statement.where(PaymentTransaction.transaction_code == transaction_uuid)
        rows, total, total_pages = await paginate_rows(db, statement, page=page, limit=limit)
        items: list[PaymentTransactionDetailRead] = []
        for transaction, invoice, user in rows:
            items.append(
                PaymentTransactionDetailRead(
                    payment_transaction_id=transaction.payment_transaction_id,
                    invoice_id=transaction.invoice_id,
                    attempt_number=transaction.attempt_number,
                    transaction_code=transaction.transaction_code,
                    transaction_type=transaction.transaction_type,
                    payment_method=transaction.payment_method,
                    amount=transaction.amount,
                    status=transaction.status,
                    balance_before=getattr(transaction, "balance_before", None),
                    balance_after=getattr(transaction, "balance_after", None),
                    created_at=transaction.created_at,
                    user_code=transaction.user_code,
                    user_full_name=(user.full_name if user else None),
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
