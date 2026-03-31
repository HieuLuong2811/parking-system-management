from app.models.payment_plans import PaymentPlan, PaymentPlanCreate, PaymentPlanUpdate
from app.service.base import CRUDService
from sqlalchemy.ext.asyncio import AsyncSession


class paymentPlanService:
    crud = CRUDService(PaymentPlan)

    @staticmethod
    async def create_payment_plan(payload: PaymentPlanCreate, db: AsyncSession) -> PaymentPlan:
        return await paymentPlanService.crud.create(db, payload)

    @staticmethod
    async def get_payment_plan(plan_id: str, db: AsyncSession) -> PaymentPlan:
        return await paymentPlanService.crud.get(db, plan_id)

    @staticmethod
    async def get_all_payment_plans(db: AsyncSession) -> list[PaymentPlan]:
        return await paymentPlanService.crud.get_all(db)

    @staticmethod
    async def update_payment_plan(plan_id: str, payload: PaymentPlanUpdate, db: AsyncSession) -> PaymentPlan:
        return await paymentPlanService.crud.update(db, plan_id, payload)

    @staticmethod
    async def delete_payment_plan(plan_id: str, db: AsyncSession) -> PaymentPlan:
        return await paymentPlanService.crud.delete(db, plan_id)
