from sqlalchemy import String, func, or_, select

from app.models.billing_event_logs import (
    BillingEventLog,
    BillingEventLogCreate,
    BillingEventLogUpdate,
)
from app.utils.pagination import PaginatedResponse
from app.utils.pagination_db import paginate_scalars
from app.service.base import CRUDService
from sqlalchemy.ext.asyncio import AsyncSession


class billingEventLogService:
    crud = CRUDService(BillingEventLog)

    @staticmethod
    async def create_log(payload: BillingEventLogCreate, db: AsyncSession) -> BillingEventLog:
        return await billingEventLogService.crud.create(db, payload)

    @staticmethod
    async def get_log(log_id: str, db: AsyncSession) -> BillingEventLog:
        return await billingEventLogService.crud.get(db, log_id)

    @staticmethod
    async def get_all_logs(db: AsyncSession) -> list[BillingEventLog]:
        return await billingEventLogService.crud.get_all(db)

    @staticmethod
    async def get_logs(
        db: AsyncSession,
        *,
        search: str | None = None,
        page: int = 1,
        limit: int = 20,
    ) -> PaginatedResponse[BillingEventLog]:
        statement = select(BillingEventLog).order_by(BillingEventLog.created_at.desc())

        if search:
            trimmed = search.strip()
            if trimmed:
                like = f"%{trimmed.lower()}%"
                statement = statement.where(
                    or_(
                        func.lower(BillingEventLog.user_code).ilike(like),
                        func.lower(BillingEventLog.event_type).ilike(like),
                        func.lower(func.cast(BillingEventLog.subscription_id, String)).ilike(like),
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
    async def update_log(log_id: str, payload: BillingEventLogUpdate, db: AsyncSession) -> BillingEventLog:
        return await billingEventLogService.crud.update(db, log_id, payload)

    @staticmethod
    async def delete_log(log_id: str, db: AsyncSession) -> BillingEventLog:
        return await billingEventLogService.crud.delete(db, log_id)

    @staticmethod
    async def get_latest_log_by_subscription(subscription_id: str, db: AsyncSession, event_type: str | None = None) -> BillingEventLog | None:
        statement = select(BillingEventLog).where(BillingEventLog.subscription_id == subscription_id)
        if event_type:
            statement = statement.where(BillingEventLog.event_type == event_type)
        statement = statement.order_by(BillingEventLog.created_at.desc()).limit(1)
        result = await db.execute(statement)
        return result.scalars().first()
