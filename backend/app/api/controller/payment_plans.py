from sqlalchemy.ext.asyncio import AsyncSession

from app.models.payment_plans import PaymentPlanCreate, PaymentPlanRead, PaymentPlanUpdate
from app.models.responses import DeleteResponse
from app.service.payment_plans import paymentPlanService


class PaymentPlanController:
    @staticmethod
    async def create_payment_plan_ctrl(payload: PaymentPlanCreate, db: AsyncSession) -> PaymentPlanRead:
        return await paymentPlanService.create_payment_plan(payload, db)

    @staticmethod
    async def get_payment_plan_ctrl(plan_id: str, db: AsyncSession) -> PaymentPlanRead:
        return await paymentPlanService.get_payment_plan(plan_id, db)

    @staticmethod
    async def get_all_payment_plans_ctrl(db: AsyncSession) -> list[PaymentPlanRead]:
        return await paymentPlanService.get_all_payment_plans(db)

    @staticmethod
    async def update_payment_plan_ctrl(plan_id: str, payload: PaymentPlanUpdate, db: AsyncSession) -> PaymentPlanRead:
        return await paymentPlanService.update_payment_plan(plan_id, payload, db)

    @staticmethod
    async def delete_payment_plan_ctrl(plan_id: str, db: AsyncSession) -> DeleteResponse:
        await paymentPlanService.delete_payment_plan(plan_id, db)
        return DeleteResponse(message="Deleted payment plan")
