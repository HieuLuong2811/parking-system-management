from app.models.billing_event_logs import (
    BillingEventLog,
    BillingEventLogCreate,
    BillingEventLogUpdate,
)
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
    async def update_log(log_id: str, payload: BillingEventLogUpdate, db: AsyncSession) -> BillingEventLog:
        return await billingEventLogService.crud.update(db, log_id, payload)

    @staticmethod
    async def delete_log(log_id: str, db: AsyncSession) -> BillingEventLog:
        return await billingEventLogService.crud.delete(db, log_id)
