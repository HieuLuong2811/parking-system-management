from datetime import datetime

from app.models.parking_sessions import (
    ParkingSession,
    ParkingSessionCreate,
    ParkingSessionStatus,
    ParkingSessionUpdate,
)
from app.models.vehicles import Vehicle
from app.service.base import CRUDService
from sqlalchemy import and_, desc, select
from sqlalchemy.ext.asyncio import AsyncSession


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
    async def get_sessions_by_user_code(user_code: str, db: AsyncSession) -> list[ParkingSession]:
        statement = (
            select(ParkingSession)
            .join(Vehicle, Vehicle.id == ParkingSession.vehicle_id)
            .where(Vehicle.user_code == user_code)
        )
        result = await db.execute(statement)
        return result.scalars().all()

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
