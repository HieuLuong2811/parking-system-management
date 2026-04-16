from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.controller.billing_event_logs import BillingEventLogController
from app.db.session import get_db
from app.models.billing_event_logs import (
    BillingEventLogCreate,
    BillingEventLogRead,
    BillingEventLogUpdate,
)
from app.models.responses import DeleteResponse

router = APIRouter(prefix="/billing_event_logs", tags=["billing_event_logs"])


@router.post("/", response_model=BillingEventLogRead)
async def create_log(payload: BillingEventLogCreate, db: AsyncSession = Depends(get_db)):
    return await BillingEventLogController.create_log_ctrl(payload, db)


@router.get("/", response_model=list[BillingEventLogRead])
async def list_logs(db: AsyncSession = Depends(get_db)):
    logs = await BillingEventLogController.get_all_logs_ctrl(db)
    return logs


@router.get("/{log_id}", response_model=BillingEventLogRead)
async def get_log(log_id: str, db: AsyncSession = Depends(get_db)):
    return await BillingEventLogController.get_log_ctrl(log_id, db)


@router.patch("/{log_id}", response_model=BillingEventLogRead)
async def update_log(
    log_id: str, payload: BillingEventLogUpdate, db: AsyncSession = Depends(get_db)
):
    return await BillingEventLogController.update_log_ctrl(log_id, payload, db)


@router.delete("/{log_id}", response_model=DeleteResponse)
async def delete_log(log_id: str, db: AsyncSession = Depends(get_db)):
    return await BillingEventLogController.delete_log_ctrl(log_id, db)
