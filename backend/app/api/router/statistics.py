from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.controller.statistics import StatisticController
from app.authen.current_user import required_roles
from app.db.session import get_db
from app.models.auth import AuthUser
from app.models.statistics import DashboardCharts, DashboardRecent, DashboardSummary

router = APIRouter(prefix="/statistics", tags=["statistics"])


@router.get("/summary", response_model=DashboardSummary)
async def get_dashboard_summary(
    db: AsyncSession = Depends(get_db),
    current_user: AuthUser = Depends(required_roles("ADMIN")),
):
    return await StatisticController.get_summary_ctrl(db)


@router.get("/charts", response_model=DashboardCharts)
async def get_dashboard_charts(
    db: AsyncSession = Depends(get_db),
    current_user: AuthUser = Depends(required_roles("ADMIN")),
):
    return await StatisticController.get_charts_ctrl(db)


@router.get("/recent", response_model=DashboardRecent)
async def get_dashboard_recent(
    db: AsyncSession = Depends(get_db),
    current_user: AuthUser = Depends(required_roles("ADMIN")),
):
    return await StatisticController.get_recent_ctrl(db)