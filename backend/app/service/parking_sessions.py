from __future__ import annotations

import math
from datetime import datetime, timezone

from sqlalchemy import String, and_, cast, desc, func, or_, select
from app.models.parking_sessions import (
    ParkingSession,
    ParkingSessionCreate,
    ParkingSessionAdminRead,
    ParkingSessionUpdate,
)
from app.models.vehicles import Vehicle
from app.models.users import Users
from app.enums.parking import ParkingSessionStatus, VehicleType
from app.service.base import CRUDService
from sqlalchemy.ext.asyncio import AsyncSession

from app.utils.pagination import PaginatedResponse
from app.utils.search import ilike_unaccent


class parkingSessionService:
    crud = CRUDService(ParkingSession)

    @staticmethod
    async def create_session(payload: ParkingSessionCreate, db: AsyncSession) -> ParkingSession:
        return await parkingSessionService.crud.create(db, payload)

    @staticmethod
    async def get_session(session_id: str, db: AsyncSession) -> ParkingSession:
        return await parkingSessionService.crud.get(db, session_id)

    @staticmethod
    async def get_all_sessions(db: AsyncSession) -> list[ParkingSession]:
        return await parkingSessionService.crud.get_all(db)

    @staticmethod
    def _build_admin_statement(*, ordered: bool = True):
        statement = (
            select(ParkingSession, Vehicle, Users)
            .join(Vehicle, Vehicle.id == ParkingSession.vehicle_id)
            .outerjoin(Users, Users.user_code == Vehicle.user_code)
        )
        if ordered:
            statement = statement.order_by(desc(ParkingSession.check_in_time))
        return statement

    @staticmethod
    async def get_sessions_by_user_code(user_code: str, db: AsyncSession) -> list[ParkingSession]:
        statement = (
            select(ParkingSession)
            .join(Vehicle, Vehicle.id == ParkingSession.vehicle_id)
            .where(Vehicle.user_code == user_code)
        )
        result = await db.execute(statement)
        return result.scalars().all()

    @staticmethod
    async def get_sessions_admin_paginated(
        db: AsyncSession,
        *,
        page: int = 1,
        limit: int = 5,
        user_code: str | None = None,
        vehicle_type: VehicleType | None = None,
        status: ParkingSessionStatus | None = None,
        from_time: datetime | None = None,
        to_time: datetime | None = None,
    ) -> PaginatedResponse[ParkingSessionAdminRead]:
        page = max(1, int(page or 1))
        limit = max(1, int(limit or 20))

        filters = []
        if user_code:
            filters.append(ilike_unaccent(Vehicle.user_code, user_code.strip()))
        if vehicle_type is not None:
            filters.append(Vehicle.vehicle_type == vehicle_type)
        if status is not None:
            filters.append(ParkingSession.status == status)
        if from_time is not None:
            filters.append(ParkingSession.check_in_time >= from_time)
        if to_time is not None:
            filters.append(ParkingSession.check_in_time <= to_time)

        count_statement = parkingSessionService._build_admin_statement(ordered=False)
        if filters:
            count_statement = count_statement.where(*filters)
        count_subquery = count_statement.with_only_columns(ParkingSession.id).distinct().subquery()
        total_count = await db.scalar(select(func.count()).select_from(count_subquery))
        total_count = int(total_count or 0)
        total_pages = math.ceil(total_count / limit) if total_count else 0

        statement = parkingSessionService._build_admin_statement(ordered=True)
        if filters:
            statement = statement.where(*filters)
        offset = (page - 1) * limit
        statement = statement.offset(offset).limit(limit)

        result = await db.execute(statement)
        rows = result.all()
        data: list[ParkingSessionAdminRead] = []
        for session, vehicle, user in rows:
            data.append(
                ParkingSessionAdminRead(
                    id=session.id,
                    vehicle_id=session.vehicle_id,
                    license_plate=session.license_plate,
                    check_in_time=session.check_in_time,
                    check_out_time=session.check_out_time,
                    status=session.status,
                    user_type=session.user_type,
                    total_amount=session.total_amount,
                    created_at=session.created_at,
                    updated_at=session.updated_at,
                    user_code=vehicle.user_code,
                    user_full_name=(user.full_name if user else None),
                    vehicle_type=vehicle.vehicle_type if vehicle else None,
                )
            )

        return {
            "data": data,
            "total": total_count,
            "page": page,
            "limit": limit,
            "total_pages": total_pages,
        }

    @staticmethod
    async def get_active_session_by_vehicle(vehicle_id: str, db: AsyncSession) -> ParkingSession | None:
        statement = select(ParkingSession).where(
            and_(
                ParkingSession.vehicle_id == vehicle_id,
                ParkingSession.check_out_time.is_(None),
                ParkingSession.status == ParkingSessionStatus.ACTIVE,
            )
        )
        result = await db.execute(statement)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_latest_session_by_vehicle(vehicle_id: str, db: AsyncSession) -> ParkingSession | None:
        statement = (
            select(ParkingSession)
            .where(ParkingSession.vehicle_id == vehicle_id)
            .order_by(ParkingSession.created_at.desc())
        )
        result = await db.execute(statement)
        return result.scalars().first()

    @staticmethod
    async def update_session(
        session_id: str, payload: ParkingSessionUpdate, db: AsyncSession
    ) -> ParkingSession:
        return await parkingSessionService.crud.update(db, session_id, payload)


class parkingSessionUserService:
    @staticmethod
    def _drop_tz(value: datetime | None) -> datetime | None:
        if value is None:
            return None
        if value.tzinfo is None:
            return value
        return value.astimezone(timezone.utc).replace(tzinfo=None)

    @staticmethod
    async def get_sessions_me_paginated(
        db: AsyncSession,
        *,
        user_code: str,
        page: int = 1,
        limit: int = 5,
        status: ParkingSessionStatus | None = None,
        from_time: datetime | None = None,
        to_time: datetime | None = None,
    ) -> PaginatedResponse[ParkingSession]:
        page = max(1, int(page or 1))
        limit = max(1, int(limit or 5))

        filters = [func.lower(Vehicle.user_code) == user_code.strip().lower()]
        if status is not None:
            filters.append(ParkingSession.status == status)
        if from_time is not None:
            filters.append(ParkingSession.check_in_time >= from_time)
        if to_time is not None:
            filters.append(ParkingSession.check_in_time <= to_time)

        base_statement = (
            select(ParkingSession)
            .join(Vehicle, Vehicle.id == ParkingSession.vehicle_id)
            .where(*filters)
        )

        count_subquery = base_statement.with_only_columns(ParkingSession.id).distinct().subquery()
        total_count = await db.scalar(select(func.count()).select_from(count_subquery))
        total_count = int(total_count or 0)
        total_pages = math.ceil(total_count / limit) if total_count else 0

        offset = (page - 1) * limit
        statement = base_statement.order_by(desc(ParkingSession.check_in_time)).offset(offset).limit(limit)
        result = await db.execute(statement)
        data = result.scalars().all()

        return {
            "data": data,
            "total": total_count,
            "page": page,
            "limit": limit,
            "total_pages": total_pages,
        }

    @staticmethod
    async def get_sessions_me_for_export(
        db: AsyncSession,
        *,
        user_code: str,
        query: str | None = None,
        status: ParkingSessionStatus | None = None,
        from_time: datetime | None = None,
        to_time: datetime | None = None,
    ) -> list[tuple[ParkingSession, Vehicle, Users | None]]:
        from_time = parkingSessionUserService._drop_tz(from_time)
        to_time = parkingSessionUserService._drop_tz(to_time)

        filters = [func.lower(Vehicle.user_code) == user_code.strip().lower()]
        if status is not None:
            filters.append(ParkingSession.status == status)
        if from_time is not None:
            filters.append(ParkingSession.check_in_time >= from_time)
        if to_time is not None:
            filters.append(ParkingSession.check_in_time <= to_time)

        trimmed_query = (query or "").strip()
        if trimmed_query:
            filters.append(
                or_(
                    ilike_unaccent(cast(ParkingSession.id, String), trimmed_query),
                    ilike_unaccent(cast(ParkingSession.vehicle_id, String), trimmed_query),
                    ilike_unaccent(func.coalesce(ParkingSession.license_plate, ""), trimmed_query),
                )
            )

        statement = (
            select(ParkingSession, Vehicle, Users)
            .join(Vehicle, Vehicle.id == ParkingSession.vehicle_id)
            .outerjoin(Users, Users.user_code == Vehicle.user_code)
            .where(*filters)
            .order_by(desc(ParkingSession.check_in_time))
        )
        result = await db.execute(statement)
        return result.all()
