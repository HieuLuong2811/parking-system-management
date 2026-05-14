from __future__ import annotations

from datetime import date, datetime, time, timedelta, timezone
from zoneinfo import ZoneInfo


DEFAULT_TZ = ZoneInfo("Asia/Ho_Chi_Minh")


def is_last_day_of_month(value: date) -> bool:
    return (value + timedelta(days=1)).month != value.month


def last_day_of_month(value: date) -> date:
    """
    Return the last calendar day of the month that contains `value`.
    """
    first_next_month = (value.replace(day=1) + timedelta(days=32)).replace(day=1)
    return first_next_month - timedelta(days=1)


def last_day_next_month(value: date) -> date:
    """
    Return the last calendar day of the month immediately after `value`'s month.
    """
    first_next_month = (value.replace(day=1) + timedelta(days=32)).replace(day=1)
    return last_day_of_month(first_next_month)


def local_day_bounds_utc(day: date, tz: ZoneInfo = DEFAULT_TZ) -> tuple[datetime, datetime]:
    """
    Return UTC naive datetime bounds [start, end) for a local calendar day.
    """
    start_local = datetime.combine(day, time.min, tzinfo=tz)
    end_local = start_local + timedelta(days=1)
    start_utc = start_local.astimezone(timezone.utc).replace(tzinfo=None)
    end_utc = end_local.astimezone(timezone.utc).replace(tzinfo=None)
    return start_utc, end_utc


def add_years_safe(value: date, years: int) -> date:
    """
    Add years to a date, adjusting to the last valid day of month when needed
    (e.g. Feb 29 -> Feb 28 on non-leap years).
    """
    target_year = value.year + years
    day = value.day
    while day > 0:
        try:
            return value.replace(year=target_year, day=day)
        except ValueError:
            day -= 1
    # Should never happen; fallback to Jan 1 of target year.
    return date(target_year, 1, 1)
