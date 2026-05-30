from __future__ import annotations

import math
from datetime import datetime, timezone

from sqlalchemy import String, and_, cast, desc, func, or_, select
from app.models.parking_sessions import (
    ParkingSession,
    ParkingSessionCreate,
    ParkingSessionAdminRead,
    ParkingSessionMeRead,
    ParkingSessionRead,
    ParkingSessionUpdate,
)
from app.models.users import Users
from app.enums.parking import ParkingSessionStatus, ParkingVehicleMode
from app.service.base import CRUDService
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.parking_access_cards import ParkingAccessCard
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
            select(ParkingSession, ParkingAccessCard, Users)
            .outerjoin(
                ParkingAccessCard,
                ParkingAccessCard.id == ParkingSession.access_card_id,
            )
            .outerjoin(Users, Users.user_code == ParkingAccessCard.user_code)
        )
        if ordered:
            statement = statement.order_by(desc(ParkingSession.check_in_time))
        return statement

    @staticmethod
    async def get_sessions_by_user_code(user_code: str, db: AsyncSession) -> list[ParkingSession]:
        statement = (
            select(ParkingSession)
            .join(ParkingAccessCard, ParkingAccessCard.id == ParkingSession.access_card_id)
            .where(ParkingAccessCard.user_code == user_code)
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
        status: ParkingSessionStatus | None = None,
        from_time: datetime | None = None,
        to_time: datetime | None = None,
    ) -> PaginatedResponse[ParkingSessionAdminRead]:
        page = max(1, int(page or 1))
        limit = max(1, int(limit or 20))

        filters = []
        if user_code:
            filters.append(ilike_unaccent(ParkingAccessCard.user_code, user_code.strip()))
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
        for session, card, user in rows:
            data.append(
                ParkingSessionAdminRead(
                    id=session.id,
                    license_plate=session.license_plate,
                    check_in_time=session.check_in_time,
                    check_out_time=session.check_out_time,
                    status=session.status,
                    user_type=session.user_type,
                    total_amount=session.total_amount,
                    created_at=session.created_at,
                    updated_at=session.updated_at,
                    access_card_id=getattr(session, "access_card_id", None),
                    vehicle_mode=getattr(session, "vehicle_mode", None),
                    user_code=(card.user_code if card else None),
                    user_full_name=(user.full_name if user else None),
                    check_in_plate_image_url=getattr(session, "check_in_plate_image_url", None),
                    check_out_plate_image_url=getattr(session, "check_out_plate_image_url", None),
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
    async def update_session(
        session_id: str, payload: ParkingSessionUpdate, db: AsyncSession
    ) -> ParkingSession:
        return await parkingSessionService.crud.update(db, session_id, payload)
    
    @staticmethod
    async def get_active_session_by_access_card(
        access_card_id: str,
        db: AsyncSession,
    ) -> ParkingSession | None:
        statement = select(ParkingSession).where(
            and_(
                ParkingSession.access_card_id == access_card_id,
                ParkingSession.check_out_time.is_(None),
                ParkingSession.status == ParkingSessionStatus.ACTIVE,
            )
        )

        result = await db.execute(statement)
        return result.scalar_one_or_none()


    @staticmethod
    async def get_latest_session_by_access_card(
        access_card_id: str,
        db: AsyncSession,
    ) -> ParkingSession | None:
        statement = (
            select(ParkingSession)
            .where(ParkingSession.access_card_id == access_card_id)
            .order_by(ParkingSession.created_at.desc())
        )

        result = await db.execute(statement)
        return result.scalars().first()


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
        vehicle_mode: ParkingVehicleMode | None = None,
        license_plate: str | None = None,
    ) -> PaginatedResponse[ParkingSessionMeRead]:
        page = max(1, int(page or 1))
        limit = max(1, int(limit or 5))

        filters = [
            func.lower(ParkingAccessCard.user_code) == user_code.strip().lower()
        ]

        if status is not None:
            filters.append(ParkingSession.status == status)
        if from_time is not None:
            filters.append(ParkingSession.check_in_time >= from_time)
        if to_time is not None:
            filters.append(ParkingSession.check_in_time <= to_time)
        if vehicle_mode is not None:
            filters.append(ParkingSession.vehicle_mode == vehicle_mode)
        if license_plate:
            trimmed_plate = license_plate.strip()
            if trimmed_plate:
                filters.append(
                    ilike_unaccent(
                        func.coalesce(ParkingSession.license_plate, ""),
                        trimmed_plate,
                    )
                )

        base_statement = (
            select(ParkingSession)
            .join(
                ParkingAccessCard,
                ParkingAccessCard.id == ParkingSession.access_card_id,
            )
            .where(*filters)
        )

        count_subquery = (
            base_statement
            .with_only_columns(ParkingSession.id)
            .distinct()
            .subquery()
        )

        total_count = await db.scalar(
            select(func.count()).select_from(count_subquery)
        )
        total_count = int(total_count or 0)
        total_pages = math.ceil(total_count / limit) if total_count else 0

        offset = (page - 1) * limit

        statement = (
            base_statement
            .order_by(desc(ParkingSession.check_in_time))
            .offset(offset)
            .limit(limit)
        )

        result = await db.execute(statement)
        sessions = result.scalars().all()

        data: list[ParkingSessionMeRead] = []

        for session in sessions:
            if hasattr(ParkingSessionMeRead, "model_validate"):
                data.append(ParkingSessionMeRead.model_validate(session))
            else:
                data.append(
                    ParkingSessionMeRead(
                        id=session.id,
                        access_card_id=getattr(session, "access_card_id", None),
                        vehicle_mode=getattr(session, "vehicle_mode", None),
                        license_plate=getattr(session, "license_plate", None),
                        check_in_time=session.check_in_time,
                        check_out_time=session.check_out_time,
                        status=session.status,
                        user_type=session.user_type,
                        total_amount=session.total_amount,
                        created_at=session.created_at,
                        updated_at=session.updated_at,
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
    async def get_sessions_me_for_export(
        db: AsyncSession,
        *,
        user_code: str,
        query: str | None = None,
        status: ParkingSessionStatus | None = None,
        from_time: datetime | None = None,
        to_time: datetime | None = None,
    ) -> list[tuple[ParkingSession, ParkingAccessCard | None, Users | None]]:
        from_time = parkingSessionUserService._drop_tz(from_time)
        to_time = parkingSessionUserService._drop_tz(to_time)

        filters = [
            func.lower(ParkingAccessCard.user_code) == user_code.strip().lower()
        ]

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
                    ilike_unaccent(cast(ParkingSession.access_card_id, String), trimmed_query),
                    ilike_unaccent(func.coalesce(ParkingSession.license_plate, ""), trimmed_query),
                )
            )

        statement = (
            select(ParkingSession, ParkingAccessCard, Users)
            .join(
                ParkingAccessCard,
                ParkingAccessCard.id == ParkingSession.access_card_id,
            )
            .outerjoin(
                Users,
                Users.user_code == ParkingAccessCard.user_code,
            )
            .where(*filters)
            .order_by(desc(ParkingSession.check_in_time))
        )

        result = await db.execute(statement)
        return result.all()
