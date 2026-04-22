from __future__ import annotations

import math
from typing import TypeVar

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql import Select

T = TypeVar("T")


async def paginate_scalars(
    db: AsyncSession,
    statement: Select,
    *,
    page: int,
    limit: int,
) -> tuple[list[T], int, int]:
    """
    Paginate a SELECT that returns a single entity (scalars()).

    Returns: (items, total, total_pages)
    """
    count_stmt = select(func.count()).select_from(statement.order_by(None).subquery())
    total = await db.scalar(count_stmt) or 0
    total_pages = math.ceil(total / limit) if total else 0

    offset = (page - 1) * limit
    result = await db.execute(statement.offset(offset).limit(limit))
    return result.scalars().all(), total, total_pages


async def paginate_rows(
    db: AsyncSession,
    statement: Select,
    *,
    page: int,
    limit: int,
) -> tuple[list[tuple], int, int]:
    """
    Paginate a SELECT that returns multiple columns/entities (result.all()).

    Returns: (rows, total, total_pages)
    """
    count_stmt = select(func.count()).select_from(statement.order_by(None).subquery())
    total = await db.scalar(count_stmt) or 0
    total_pages = math.ceil(total / limit) if total else 0

    offset = (page - 1) * limit
    result = await db.execute(statement.offset(offset).limit(limit))
    return result.all(), total, total_pages
