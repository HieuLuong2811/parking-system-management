from datetime import datetime, timezone
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.utils.pagination import PaginatedResponse
from app.models.responses import (
    DeleteResponse,
    ParkingSessionInfo,
    SubscriptionInfo,
    VehicleLookupResponse,
)
from app.models.vehicles import VehicleCreate, VehicleRead, VehicleUpdate, VehicleQRVerify
from app.service.parking_sessions import parkingSessionService
from app.service.subscriptions import subscriptionService
from app.service.vehicles import vehicleService


class VehicleController:
    @staticmethod
    async def create_vehicle_ctrl(payload: VehicleCreate, db: AsyncSession) -> VehicleRead:
        return await vehicleService.create_vehicle(payload, db)

    @staticmethod
    async def get_vehicle_ctrl(vehicle_id: str, db: AsyncSession) -> VehicleRead:
        return await vehicleService.get_vehicle(vehicle_id, db)

    @staticmethod
    async def get_vehicles_ctrl(
        db: AsyncSession,
        *,
        search: str | None = None,
        is_deleted: bool | None = None,
        page: int = 1,
        limit: int = 20,
    ) -> PaginatedResponse[VehicleRead]:
        return await vehicleService.get_vehicles(
            db,
            search=search,
            is_deleted=is_deleted,
            page=page,
            limit=limit,
        )

    @staticmethod
    async def get_vehicles_by_user_ctrl(user_code: str, db: AsyncSession) -> list[VehicleRead]:
        vehicles = await vehicleService.get_vehicles_by_user_code(user_code, db)
        return vehicles

    @staticmethod
    async def update_vehicle_ctrl(vehicle_id: str, payload: VehicleUpdate, db: AsyncSession) -> VehicleRead:
        return await vehicleService.update_vehicle(vehicle_id, payload, db)

    @staticmethod
    async def delete_vehicle_ctrl(vehicle_id: str, db: AsyncSession) -> DeleteResponse:
        await vehicleService.delete_vehicle(vehicle_id, db)
        return DeleteResponse(message="Deleted vehicle")

    @staticmethod
    async def lookup_vehicle_by_plate_ctrl(license_plate: str, db: AsyncSession) -> VehicleLookupResponse:
        try:
            vehicle, user = await vehicleService.get_by_license_plate(license_plate, db)
        except ValueError:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found")
        return await VehicleController._build_vehicle_lookup_response(vehicle, user, db)

    @staticmethod
    async def verify_vehicle_qr_ctrl(payload: VehicleQRVerify, db: AsyncSession) -> VehicleLookupResponse:
        try:
            vehicle, user = await vehicleService.get_vehicle_with_user(str(payload.vehicle_id), db)
        except ValueError:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found")
        if (
            (vehicle.user_code or '') != payload.user_code
            or (vehicle.qr_secret or '') != payload.qr_secret
        ):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid QR payload")
        return await VehicleController._build_vehicle_lookup_response(vehicle, user, db)

    @staticmethod
    async def _build_vehicle_lookup_response(vehicle, user, db: AsyncSession) -> VehicleLookupResponse:
        active_subscriptions = await subscriptionService.get_user_subscriptions_with_details(
            user.user_code, db
        )
        subscription_info = None
        if active_subscriptions:
            active = next(
                (item for item in active_subscriptions if item.status == "ACTIVE"),
                active_subscriptions[0],
            )
            subscription_info = SubscriptionInfo(
                plan_name=active.subscription_plan.plan_name if active.subscription_plan else None,
                payment_type=active.payment_plan.plan_name if active.payment_plan else None,
                status=active.status,
                paid_amount=active.paid_amount,
                total_amount=active.total_amount,
            )
        session = await parkingSessionService.get_active_session_by_vehicle(str(vehicle.id), db)
        if not session:
            session = await parkingSessionService.get_latest_session_by_vehicle(str(vehicle.id), db)
        session_info = None
        if session:
            session_info = ParkingSessionInfo(
                id=str(session.id),
                check_in_time=session.check_in_time.isoformat(),
                check_out_time=session.check_out_time.isoformat() if session.check_out_time else None,
                status=session.status.value,
                total_amount=session.total_amount,
            )
        return VehicleLookupResponse(
            id=str(vehicle.id),
            user_code=user.user_code,
            vehicle_type=vehicle.vehicle_type.value,
            license_plate=vehicle.license_plate,
            qr_code=vehicle.qr_code,
            user_full_name=user.full_name,
            user_email=user.email,
            active_subscription=subscription_info,
            active_session=session_info,
        )
