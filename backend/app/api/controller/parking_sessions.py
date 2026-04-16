from datetime import datetime
from math import ceil

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.enums.parking import ParkingSessionStatus, SubscriptionStatus, UserType
from app.models.parking_sessions import (
    ParkingSessionCreate,
    ParkingSessionRead,
    ParkingSessionUpdate,
    ParkingSessionQRCheckIn,
)
from app.models.responses import DeleteResponse
from app.service.parking_sessions import parkingSessionService
from app.service.subscriptions import subscriptionService
from app.service.vehicles import vehicleService


class ParkingSessionController:
    @staticmethod
    async def create_session_ctrl(payload: ParkingSessionCreate, db: AsyncSession) -> ParkingSessionRead:
        return await parkingSessionService.create_session(payload, db)

    @staticmethod
    async def get_session_ctrl(session_id: str, db: AsyncSession) -> ParkingSessionRead:
        return await parkingSessionService.get_session(session_id, db)

    @staticmethod
    async def get_all_sessions_ctrl(db: AsyncSession) -> list[ParkingSessionRead]:
        return await parkingSessionService.get_all_sessions(db)

    @staticmethod
    async def get_sessions_by_user_ctrl(user_code: str, db: AsyncSession) -> list[ParkingSessionRead]:
        sessions = await parkingSessionService.get_sessions_by_user_code(user_code, db)
        return sessions

    @staticmethod
    async def update_session_ctrl(session_id: str, payload: ParkingSessionUpdate, db: AsyncSession) -> ParkingSessionRead:
        return await parkingSessionService.update_session(session_id, payload, db)

    @staticmethod
    async def delete_session_ctrl(session_id: str, db: AsyncSession) -> DeleteResponse:
        await parkingSessionService.delete_session(session_id, db)
        return DeleteResponse(message="Deleted parking session")

    @staticmethod
    async def create_session_via_qr_ctrl(payload: ParkingSessionQRCheckIn, db: AsyncSession) -> ParkingSessionRead:
        try:
            vehicle, user = await vehicleService.get_vehicle_with_user(str(payload.vehicle_id), db)
        except ValueError:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found")
        if (vehicle.user_code or '') != payload.user_code or (vehicle.qr_secret or '') != payload.qr_secret:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid QR payload")
        now = datetime.utcnow()
        active_session = await parkingSessionService.get_active_session_by_vehicle(payload.vehicle_id, db)

        user_type = UserType.STUDENT
        if user and user.deleted_at is None:
            user_type = user.user_type

        if not active_session:
            session_payload = ParkingSessionCreate(
                vehicle_id=vehicle.id,
                license_plate=vehicle.license_plate,
                check_in_time=now,
                user_type=user_type,
            )
            return await parkingSessionService.create_session(session_payload, db)
        amount_due = await ParkingSessionController._calculate_parking_fee(user.user_code, vehicle.id, active_session.check_in_time, now, db)
        update_payload = ParkingSessionUpdate(
            check_out_time=now,
            status=ParkingSessionStatus.DONE,
            total_amount=amount_due,
        )
        return await parkingSessionService.update_session(str(active_session.id), update_payload, db)

    @staticmethod
    async def _calculate_parking_fee(
        user_code: str,
        vehicle_id: str,
        check_in: datetime,
        check_out: datetime,
        db: AsyncSession,
    ) -> int | None:
        duration_seconds = max(0, (check_out - check_in).total_seconds())
        days = ceil(duration_seconds / 86_400) if duration_seconds else 1
        base_amount = days * 1000
        subscriptions = await subscriptionService.get_user_subscriptions_with_details(user_code, db)
        has_active_plan = any(
            subscription.status in (SubscriptionStatus.ACTIVE, SubscriptionStatus.PENDING)
            for subscription in subscriptions
        )
        if has_active_plan:
            return 0
        return base_amount
