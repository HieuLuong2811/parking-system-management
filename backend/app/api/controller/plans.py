from sqlalchemy.ext.asyncio import AsyncSession

from app.models.responses import DeleteResponse
from app.models.plans import SubscriptionPlanCreate, SubscriptionPlanRead, SubscriptionPlanUpdate
from app.service.plans import planService


class PlanController:
    @staticmethod
    async def create_plan_ctrl(plan_in: SubscriptionPlanCreate, db: AsyncSession) -> SubscriptionPlanRead:
        return await planService.create_plan(plan_in, db)

    @staticmethod
    async def get_plan_ctrl(plan_id: str, db: AsyncSession) -> SubscriptionPlanRead:
        return await planService.get_plan(plan_id, db)

    @staticmethod
    async def get_all_plans_ctrl(db: AsyncSession) -> list[SubscriptionPlanRead]:
        return await planService.get_all_plans(db)

    @staticmethod
    async def update_plan_ctrl(plan_id: str, plan_in: SubscriptionPlanUpdate, db: AsyncSession) -> SubscriptionPlanRead:
        return await planService.update_plan(plan_id, plan_in, db)

    @staticmethod
    async def delete_plan_ctrl(plan_id: str, db: AsyncSession) -> DeleteResponse:
        await planService.delete_plan(plan_id, db)
        return DeleteResponse(message="Deleted subscription plan")
