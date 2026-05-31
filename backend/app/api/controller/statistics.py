from sqlalchemy.ext.asyncio import AsyncSession

from app.models.statistics import ConsoleSummary, DashboardCharts, DashboardRecent, DashboardSummary
from app.service.statistics import statisticService


class StatisticController:
    @staticmethod
    async def get_summary_ctrl(db: AsyncSession) -> DashboardSummary:
        return await statisticService.get_summary(db)

    @staticmethod
    async def get_console_summary_ctrl(db: AsyncSession) -> ConsoleSummary:
        return await statisticService.get_console_summary(db)

    @staticmethod
    async def get_charts_ctrl(db: AsyncSession) -> DashboardCharts:
        return await statisticService.get_charts(db)

    @staticmethod
    async def get_recent_ctrl(db: AsyncSession) -> DashboardRecent:
        return await statisticService.get_recent(db)
