from __future__ import annotations

import logging

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

from app.scheduler.jobs import (
    cron_academic_terms_rollover,
    cron_monthly_billing_attempt_1,
    cron_monthly_billing_attempt_2,
    cron_monthly_billing_attempt_3,
)
from app.scheduler.utils import DEFAULT_TZ

logger = logging.getLogger(__name__)

_scheduler: AsyncIOScheduler | None = None


def start_scheduler() -> None:
    global _scheduler
    if _scheduler and _scheduler.running:
        return

    scheduler = AsyncIOScheduler(timezone=DEFAULT_TZ)

    scheduler.add_job(
        cron_monthly_billing_attempt_1,
        CronTrigger(hour=0, minute=0),
        id="monthly_billing_attempt_1",
        replace_existing=True,
        misfire_grace_time=60 * 15,
        coalesce=True,
        max_instances=1,
    )
    scheduler.add_job(
        cron_monthly_billing_attempt_2,
        CronTrigger(hour=9, minute=0),
        id="monthly_billing_attempt_2",
        replace_existing=True,
        misfire_grace_time=60 * 30,
        coalesce=True,
        max_instances=1,
    )
    scheduler.add_job(
        cron_monthly_billing_attempt_3,
        CronTrigger(hour=16, minute=0),
        id="monthly_billing_attempt_3",
        replace_existing=True,
        misfire_grace_time=60 * 30,
        coalesce=True,
        max_instances=1,
    )

    scheduler.add_job(
        cron_academic_terms_rollover,
        CronTrigger(month=1, day=1, hour=0, minute=0),
        id="academic_terms_rollover",
        replace_existing=True,
        misfire_grace_time=60 * 60,
        coalesce=True,
        max_instances=1,
    )

    scheduler.start()
    _scheduler = scheduler
    logger.info("APScheduler started with %d jobs", len(scheduler.get_jobs()))


def shutdown_scheduler() -> None:
    global _scheduler
    if not _scheduler:
        return
    try:
        _scheduler.shutdown(wait=False)
    finally:
        _scheduler = None
        logger.info("APScheduler stopped")

