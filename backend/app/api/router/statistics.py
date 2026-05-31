import os

from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.controller.statistics import StatisticController
from app.authen.current_user import required_roles
from app.db.session import get_db
from app.models.auth import AuthUser
from app.models.statistics import ConsoleSummary, DashboardCharts, DashboardRecent, DashboardSummary

router = APIRouter(prefix="/statistics", tags=["statistics"])


@router.get("/summary", response_model=DashboardSummary)
async def get_dashboard_summary(
    db: AsyncSession = Depends(get_db),
    current_user: AuthUser = Depends(required_roles("ADMIN")),
):
    return await StatisticController.get_summary_ctrl(db)


@router.get("/summary_console", response_model=ConsoleSummary)
async def get_console_summary(
    db: AsyncSession = Depends(get_db),
    x_console_key: str | None = Header(default=None, alias="X-Console-Key"),
):
    """
    Summary endpoint for local security console/banner.

    If `SECURITY_CONSOLE_KEY` is set on the backend, clients must send `X-Console-Key`.
    """
    required_key = (os.getenv("SECURITY_CONSOLE_KEY") or "").strip()
    if required_key and (x_console_key or "").strip() != required_key:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
    return await StatisticController.get_console_summary_ctrl(db)


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
