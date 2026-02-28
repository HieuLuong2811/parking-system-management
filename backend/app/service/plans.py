from app.models.plans import SubscriptionPlan, SubscriptionPlanCreate, SubscriptionPlanUpdate
from app.service.base import CRUDService
from sqlalchemy.ext.asyncio import AsyncSession


class planService:
    crud = CRUDService(SubscriptionPlan)

    @staticmethod
    async def create_plan(plan_in: SubscriptionPlanCreate, db: AsyncSession) -> SubscriptionPlan:
        return await planService.crud.create(db, plan_in)

    @staticmethod
    async def get_all_plans(db: AsyncSession) -> list[SubscriptionPlan]:
        return await planService.crud.get_all(db)

    @staticmethod
    async def get_plan(plan_id: str, db: AsyncSession) -> SubscriptionPlan:
        return await planService.crud.get(db, plan_id)

    @staticmethod
    async def update_plan(plan_id: str, plan_in: SubscriptionPlanUpdate, db: AsyncSession) -> SubscriptionPlan:
        return await planService.crud.update(db, plan_id, plan_in)

    @staticmethod
    async def delete_plan(plan_id: str, db: AsyncSession) -> SubscriptionPlan:
        return await planService.crud.delete(db, plan_id)
