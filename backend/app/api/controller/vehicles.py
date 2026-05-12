from datetime import datetime
from app.enums.parking import UserType
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.utils.pagination import PaginatedResponse
from app.models.responses import (
    DeleteResponse,
    ParkingSessionInfo,
    PlateLookupAction,
    SubscriptionInfo,
    VehicleLookupResponse,
)
from app.models.vehicles import VehicleCreate, VehicleRead, VehicleUpdate, VehicleBarcodeVerify
from app.service.parking_sessions import parkingSessionService
from app.service.subscriptions import subscriptionService
from app.service.vehicles import vehicleService
from app.api.controller.parking_sessions import ParkingSessionController


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
        license_plate: str | None = None,
        vehicle_type: str | None = None,
        barcode_token: str | None = None,
        is_deleted: bool | None = None,
        page: int = 1,
        limit: int = 5,
        user_code: str | None = None,
    ) -> PaginatedResponse[VehicleRead]:
        return await vehicleService.get_vehicles(
            db,
            user_code=user_code,
            search=search,
            license_plate=license_plate,
            vehicle_type=vehicle_type,
            barcode_token=barcode_token,
            is_deleted=is_deleted,
            page=page,
            limit=limit,
        )

    @staticmethod
    async def get_vehicles_by_user_ctrl(user_code: str, db: AsyncSession) -> list[VehicleRead]:
        vehicles = await vehicleService.get_vehicles_by_user_code(user_code, db)
        return vehicles

    @staticmethod
    async def get_vehicles_by_user_paginated_ctrl(
        user_code: str,
        db: AsyncSession,
        *,
        page: int = 1,
        limit: int = 5,
        user_code_filter: str | None = None,
        license_plate: str | None = None,
        has_plate: bool | None = None,
    ) -> PaginatedResponse[VehicleRead]:
        return await vehicleService.get_vehicles_by_user_code_paginated(
            user_code,
            db,
            page=page,
            limit=limit,
            user_code_filter=user_code_filter,
            license_plate=license_plate,
            has_plate=has_plate,
        )

    @staticmethod
    async def update_vehicle_ctrl(vehicle_id: str, payload: VehicleUpdate, db: AsyncSession) -> VehicleRead:
        return await vehicleService.update_vehicle(vehicle_id, payload, db)

    @staticmethod
    async def delete_vehicle_ctrl(vehicle_id: str, db: AsyncSession) -> DeleteResponse:
        await vehicleService.delete_vehicle(vehicle_id, db)
        return DeleteResponse(message="Deleted vehicle")

    @staticmethod
    async def lookup_vehicle_by_plate_ctrl(
        license_plate: str,
        action: PlateLookupAction,
        db: AsyncSession,
    ) -> VehicleLookupResponse:
        normalized_plate = license_plate.strip().upper()

        print('normalized_plate', normalized_plate)

        vehicle_user = await vehicleService.get_by_license_plate_or_none(
            normalized_plate,
            db,
        )

        if vehicle_user is None:
            if action == PlateLookupAction.CHECK_IN:
                vehicle = await vehicleService.create_guest_vehicle_by_plate(
                    normalized_plate,
                    db,
                )
                await db.commit()
                await db.refresh(vehicle)

                return await VehicleController._build_vehicle_lookup_response(
                    vehicle,
                    None,
                    db,
                    user_type="GUEST",
                    action=action,
                )

            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Vehicle not found",
            )

        vehicle, user = vehicle_user

        user_type = UserType.GUEST if user is None or vehicle.user_code is None else UserType.STUDENT
        
        return await VehicleController._build_vehicle_lookup_response(
            vehicle,
            user,
            db,
            user_type=user_type,
            action=action,
        )

    @staticmethod
    async def verify_vehicle_barcode_ctrl(payload: VehicleBarcodeVerify, db: AsyncSession) -> VehicleLookupResponse:
        try:
            vehicle, user = await vehicleService.get_by_barcode_token(payload.barcode_token, db)
        except ValueError:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found")
        return await VehicleController._build_vehicle_lookup_response(vehicle, user, db)

    @staticmethod
    async def _build_vehicle_lookup_response(
        vehicle,
        user,
        db: AsyncSession,
        *,
        user_type: UserType | str = UserType.STUDENT,
        action: PlateLookupAction | None = None,
    ) -> VehicleLookupResponse:
        user_code = user.user_code if user else None
        user_full_name = user.full_name if user else None
        user_email = user.email if user else None

        subscription, plan, payment_plan = (
            await subscriptionService.get_subscription_covering_vehicle_for_fee(
                str(vehicle.id),
                db,
            )
        )

        subscription_info = None

        if subscription is not None:
            subscription_info = SubscriptionInfo(
                plans_type=str(getattr(plan, "plans_type", None)) if plan else None,
                plan_code=None,
                payment_type=str(payment_plan.payment_type) if payment_plan else None,
                status=str(subscription.status)
                if getattr(subscription, "status", None)
                else None,
                paid_amount=getattr(subscription, "paid_amount", None),
                total_amount=getattr(subscription, "total_amount", None),
            )

        session = await parkingSessionService.get_active_session_by_vehicle(
            str(vehicle.id),
            db,
        )

        if not session:
            session = await parkingSessionService.get_latest_session_by_vehicle(
                str(vehicle.id),
                db,
            )

        session_info = None

        if session:
            session_info = ParkingSessionInfo(
                id=str(session.id),
                check_in_time=session.check_in_time.isoformat(),
                check_out_time=session.check_out_time.isoformat()
                if session.check_out_time
                else None,
                status=session.status.value,
                total_amount=session.total_amount,
            )

        fee_breakdown = None

        if (
            action == PlateLookupAction.CHECK_OUT
            and session
            and session.check_out_time is None
        ):
            fee_breakdown = await ParkingSessionController._calculate_fee_breakdown_v2(
                vehicle=vehicle,
                user=user,
                check_in=session.check_in_time,
                check_out=datetime.utcnow().replace(tzinfo=None),
                db=db,
            )
        lookup_status = "GUEST_CREATED" if user_type == UserType.GUEST else "FOUND"

        return VehicleLookupResponse(
            id=str(vehicle.id),
            user_code=user_code,
            user_full_name=user_full_name,
            user_email=user_email,
            user_type=user_type,
            lookup_action=action,
            lookup_status=lookup_status,
            message=None,
            vehicle_type=(
                vehicle.vehicle_type.value
                if hasattr(vehicle.vehicle_type, "value")
                else str(vehicle.vehicle_type)
            ),
            license_plate=vehicle.license_plate,
            barcode_token=vehicle.barcode_token,
            active_subscription=subscription_info,
            active_session=session_info,
            fee_breakdown=fee_breakdown,
        )
