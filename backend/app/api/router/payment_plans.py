from app.models.pricing import PaymentPlanPricingResponse
from app.service.plan_pricing import planPricingService
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.controller.payment_plans import PaymentPlanController
from app.db.session import get_db
from app.models.payment_plans import PaymentPlanCreate, PaymentPlanRead, PaymentPlanUpdate
from app.models.responses import DeleteResponse

router = APIRouter(prefix="/payment_plans", tags=["payment_plans"])


@router.post("", response_model=PaymentPlanRead)
async def create_payment_plan(payload: PaymentPlanCreate, db: AsyncSession = Depends(get_db)):
    return await PaymentPlanController.create_payment_plan_ctrl(payload, db)

@router.get("", response_model=list[PaymentPlanRead])
async def list_payment_plans(db: AsyncSession = Depends(get_db)):
    plans = await PaymentPlanController.get_all_payment_plans_ctrl(db)
    return plans

@router.get("/pricing", response_model=PaymentPlanPricingResponse)
async def get_payment_plans_with_pricing(
    plan_id: str,
    term_id: str,
    db: AsyncSession = Depends(get_db),
):
    return await planPricingService.get_plan_pricing(plan_id, term_id, db)

@router.get("/{plan_id}", response_model=PaymentPlanRead)
async def get_payment_plan(plan_id: str, db: AsyncSession = Depends(get_db)):
    return await PaymentPlanController.get_payment_plan_ctrl(plan_id, db)

@router.patch("/{plan_id}", response_model=PaymentPlanRead)
async def update_payment_plan(plan_id: str, payload: PaymentPlanUpdate, db: AsyncSession = Depends(get_db)):
    return await PaymentPlanController.update_payment_plan_ctrl(plan_id, payload, db)

@router.delete("/{plan_id}", response_model=DeleteResponse)
async def delete_payment_plan(plan_id: str, db: AsyncSession = Depends(get_db)):
    return await PaymentPlanController.delete_payment_plan_ctrl(plan_id, db)
