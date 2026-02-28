from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.controller.plans import PlanController
from app.db.session import get_db
from app.models.plans import SubscriptionPlanCreate, SubscriptionPlanRead, SubscriptionPlanUpdate
from app.models.responses import DeleteResponse

router = APIRouter(prefix="/plans", tags=["subscription_plans"])


@router.post("/", response_model=SubscriptionPlanRead)
async def create_plan(plan_in: SubscriptionPlanCreate, db: AsyncSession = Depends(get_db)):
    return await PlanController.create_plan_ctrl(plan_in, db)


@router.get("/", response_model=list[SubscriptionPlanRead])
async def list_plans(db: AsyncSession = Depends(get_db)):
    plans = await PlanController.get_all_plans_ctrl(db)
    if not plans:
        raise HTTPException(status_code=404, detail="No plans found")
    return plans


@router.get("/{plan_id}", response_model=SubscriptionPlanRead)
async def get_plan(plan_id: str, db: AsyncSession = Depends(get_db)):
    return await PlanController.get_plan_ctrl(plan_id, db)


@router.patch("/{plan_id}", response_model=SubscriptionPlanRead)
async def update_plan(plan_id: str, plan_in: SubscriptionPlanUpdate, db: AsyncSession = Depends(get_db)):
    return await PlanController.update_plan_ctrl(plan_id, plan_in, db)


@router.delete("/{plan_id}", response_model=DeleteResponse)
async def delete_plan(plan_id: str, db: AsyncSession = Depends(get_db)):
    return await PlanController.delete_plan_ctrl(plan_id, db)
