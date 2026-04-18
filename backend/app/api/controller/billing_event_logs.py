from sqlalchemy.ext.asyncio import AsyncSession

from app.models.responses import DeleteResponse
from app.models.billing_event_logs import (
    BillingEventLogCreate,
    BillingEventLogRead,
    BillingEventLogUpdate,
)
from app.utils.pagination import PaginatedResponse
from app.service.billing_event_logs import billingEventLogService


class BillingEventLogController:
    @staticmethod
    async def create_log_ctrl(payload: BillingEventLogCreate, db: AsyncSession) -> BillingEventLogRead:
        return await billingEventLogService.create_log(payload, db)

    @staticmethod
    async def get_log_ctrl(log_id: str, db: AsyncSession) -> BillingEventLogRead:
        return await billingEventLogService.get_log(log_id, db)

    @staticmethod
    async def get_logs_ctrl(
        db: AsyncSession,
        *,
        search: str | None = None,
        page: int = 1,
        limit: int = 20,
    ) -> PaginatedResponse[BillingEventLogRead]:
        return await billingEventLogService.get_logs(db, search=search, page=page, limit=limit)

    @staticmethod
    async def update_log_ctrl(log_id: str, payload: BillingEventLogUpdate, db: AsyncSession) -> BillingEventLogRead:
        return await billingEventLogService.update_log(log_id, payload, db)

    @staticmethod
    async def delete_log_ctrl(log_id: str, db: AsyncSession) -> DeleteResponse:
        await billingEventLogService.delete_log(log_id, db)
        return DeleteResponse(message="Deleted billing event log")
