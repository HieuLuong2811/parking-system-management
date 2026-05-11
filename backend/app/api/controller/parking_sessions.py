from io import BytesIO
from datetime import datetime
from math import ceil

from fastapi import HTTPException, status
from fastapi.responses import StreamingResponse
from openpyxl import Workbook
from openpyxl.styles import Alignment, Font
from sqlalchemy.ext.asyncio import AsyncSession

from app.enums.parking import ParkingSessionStatus, SubscriptionStatus, UserType, VehicleType
from app.utils.pagination import PaginatedResponse
from app.models.parking_sessions import (
    ParkingSessionCreate,
    ParkingSessionAdminRead,
    ParkingSessionRead,
    ParkingSessionUpdate,
    ParkingSessionBarcodeCheckIn,
    ParkingSessionPlateCheckIn,
)
from app.models.responses import DeleteResponse
from app.service.parking_sessions import parkingSessionService, parkingSessionUserService
from app.service.subscriptions import subscriptionService
from app.service.vehicles import vehicleService
from app.models.responses import FeeBreakdown


class ParkingSessionController:
    @staticmethod
    async def create_session_ctrl(payload: ParkingSessionCreate, db: AsyncSession) -> ParkingSessionRead:
        return await parkingSessionService.create_session(payload, db)

    @staticmethod
    async def get_session_ctrl(session_id: str, db: AsyncSession) -> ParkingSessionRead:
        return await parkingSessionService.get_session(session_id, db)

    @staticmethod
    async def get_sessions_paginated_ctrl(
        db: AsyncSession,
        *,
        page: int = 1,
        limit: int = 5,
        scope_user_code: str | None = None,
        user_code: str | None = None,
        vehicle_type: VehicleType | None = None,
        status: ParkingSessionStatus | None = None,
        from_time: datetime | None = None,
        to_time: datetime | None = None,
    ) -> PaginatedResponse[ParkingSessionAdminRead] | PaginatedResponse[ParkingSessionRead]:
        if scope_user_code:
            return await parkingSessionUserService.get_sessions_me_paginated(
                db,
                user_code=scope_user_code,
                page=page,
                limit=limit,
                status=status,
                from_time=from_time,
                to_time=to_time,
            )

        return await parkingSessionService.get_sessions_admin_paginated(
            db,
            page=page,
            limit=limit,
            user_code=user_code,
            vehicle_type=vehicle_type,
            status=status,
            from_time=from_time,
            to_time=to_time,
        )

    @staticmethod
    async def update_session_ctrl(session_id: str, payload: ParkingSessionUpdate, db: AsyncSession) -> ParkingSessionRead:
        return await parkingSessionService.update_session(session_id, payload, db)

    @staticmethod
    async def delete_session_ctrl(session_id: str, db: AsyncSession) -> DeleteResponse:
        await parkingSessionService.delete_session(session_id, db)
        return DeleteResponse(message="Deleted parking session")

    @staticmethod
    async def create_session_via_barcode_ctrl(payload: ParkingSessionBarcodeCheckIn, db: AsyncSession) -> ParkingSessionRead:
        try:
            vehicle, user = await vehicleService.get_by_barcode_token(payload.barcode_token, db)
        except ValueError:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found")
        now = datetime.utcnow()
        active_session = await parkingSessionService.get_active_session_by_vehicle(str(vehicle.id), db)

        user_type = UserType.STUDENT
        if user and user.deleted_at is None:
            resolved_user_type = getattr(user, "user_type", None)
            if resolved_user_type is not None:
                user_type = resolved_user_type

        if not active_session:
            sub, plan, _payment_plan = await subscriptionService.get_active_subscription_covering_vehicle(str(vehicle.id), db)
            if subscriptionService.subscription_grants_parking_benefit(sub) and sub is not None:
                conflict = await subscriptionService.get_active_session_using_subscription(
                    str(sub.id), db, exclude_vehicle_id=str(vehicle.id)
                )
                if conflict is not None:
                    return ParkingSessionRead(
                        id=conflict.id,
                        vehicle_id=vehicle.id,
                        license_plate=vehicle.license_plate,
                        check_in_time=now,
                        check_out_time=None,
                        status=ParkingSessionStatus.ACTIVE,
                        user_type=user_type,
                        total_amount=None,
                        created_at=now,
                        updated_at=now,
                        allow_gate=False,
                        message="Subscription is currently being used by another vehicle.",
                        fee_breakdown=FeeBreakdown(
                            has_active_subscription=True,
                            subscription_benefit_applied=False,
                            subscription_plan_code=None,
                            fee_policy_message="Subscription is currently being used by another vehicle.",
                        ),
                    )
            session_payload = ParkingSessionCreate(
                vehicle_id=vehicle.id,
                license_plate=vehicle.license_plate,
                check_in_time=now,
                user_type=user_type,
            )
            created = await parkingSessionService.create_session(session_payload, db)
            return ParkingSessionRead.model_validate(created, update={"allow_gate": True, "message": "OK"}) if hasattr(ParkingSessionRead, "model_validate") else created
        breakdown = await ParkingSessionController._calculate_fee_breakdown(user.user_code, str(vehicle.id), active_session.check_in_time, now, db)
        update_payload = ParkingSessionUpdate(
            check_out_time=now,
            status=ParkingSessionStatus.DONE,
            total_amount=breakdown.total_amount if breakdown else None,
        )
        updated = await parkingSessionService.update_session(str(active_session.id), update_payload, db)
        response = ParkingSessionRead.model_validate(updated) if hasattr(ParkingSessionRead, "model_validate") else updated
        response.allow_gate = True
        response.message = "OK"
        response.fee_breakdown = breakdown
        return response

    @staticmethod
    async def create_session_via_plate_ctrl(payload: ParkingSessionPlateCheckIn, db: AsyncSession) -> ParkingSessionRead:
        plate = (payload.license_plate or "").strip().upper()
        if not plate:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="license_plate is required")
        try:
            vehicle, user = await vehicleService.get_by_license_plate(plate, db)
        except ValueError:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found")

        now = datetime.utcnow()
        active_session = await parkingSessionService.get_active_session_by_vehicle(str(vehicle.id), db)

        user_type = UserType.STUDENT
        if user and user.deleted_at is None:
            resolved_user_type = getattr(user, "user_type", None)
            if resolved_user_type is not None:
                user_type = resolved_user_type

        if not active_session:
            sub, plan, _payment_plan = await subscriptionService.get_active_subscription_covering_vehicle(str(vehicle.id), db)
            if subscriptionService.subscription_grants_parking_benefit(sub) and sub is not None:
                conflict = await subscriptionService.get_active_session_using_subscription(
                    str(sub.id), db, exclude_vehicle_id=str(vehicle.id)
                )
                if conflict is not None:
                    return ParkingSessionRead(
                        id=conflict.id,
                        vehicle_id=vehicle.id,
                        license_plate=vehicle.license_plate,
                        check_in_time=now,
                        check_out_time=None,
                        status=ParkingSessionStatus.ACTIVE,
                        user_type=user_type,
                        total_amount=None,
                        created_at=now,
                        updated_at=now,
                        allow_gate=False,
                        message="Subscription is currently being used by another vehicle.",
                        fee_breakdown=FeeBreakdown(
                            has_active_subscription=True,
                            subscription_benefit_applied=False,
                            subscription_plan_code=None,
                            fee_policy_message="Subscription is currently being used by another vehicle.",
                        ),
                    )
            session_payload = ParkingSessionCreate(
                vehicle_id=vehicle.id,
                license_plate=vehicle.license_plate,
                check_in_time=now,
                user_type=user_type,
            )
            created = await parkingSessionService.create_session(session_payload, db)
            return ParkingSessionRead.model_validate(created, update={"allow_gate": True, "message": "OK"}) if hasattr(ParkingSessionRead, "model_validate") else created

        breakdown = await ParkingSessionController._calculate_fee_breakdown(
            user.user_code, str(vehicle.id), active_session.check_in_time, now, db
        )
        update_payload = ParkingSessionUpdate(
            check_out_time=now,
            status=ParkingSessionStatus.DONE,
            total_amount=breakdown.total_amount if breakdown else None,
        )
        updated = await parkingSessionService.update_session(str(active_session.id), update_payload, db)
        response = ParkingSessionRead.model_validate(updated) if hasattr(ParkingSessionRead, "model_validate") else updated
        response.allow_gate = True
        response.message = "OK"
        response.fee_breakdown = breakdown
        return response

    @staticmethod
    async def _calculate_fee_breakdown(
        user_code: str,
        vehicle_id: str,
        check_in: datetime,
        check_out: datetime,
        db: AsyncSession,
    ) -> FeeBreakdown:
        duration_seconds = max(0, (check_out - check_in).total_seconds())
        days = ceil(duration_seconds / 86_400) if duration_seconds else 1
        normal_base_amount = days * 1000

        subscription, plan, _payment_plan = await subscriptionService.get_active_subscription_covering_vehicle(vehicle_id, db)
        has_active_subscription = subscriptionService.subscription_grants_parking_benefit(subscription)
        if not has_active_subscription or plan is None:
            return FeeBreakdown(
                base_amount=normal_base_amount,
                after_18_amount=0,
                total_amount=normal_base_amount,
                has_active_subscription=False,
                subscription_benefit_applied=False,
                subscription_plan_code=None,
                fee_policy_message="Normal parking fee applied.",
            )

        price_per_day = int(getattr(plan, "price_per_day", 0) or 0)
        after_18_fee = int(getattr(plan, "after_18_fee", 0) or 0)
        waive_after_18_fee = bool(getattr(plan, "waive_after_18_fee", False))

        base_amount = days * price_per_day
        after_18_amount = 0
        if not waive_after_18_fee and check_out.hour >= 18:
            after_18_amount = days * after_18_fee

        total_amount = base_amount + after_18_amount
        return FeeBreakdown(
            base_amount=base_amount,
            after_18_amount=after_18_amount,
            total_amount=total_amount,
            has_active_subscription=True,
            subscription_benefit_applied=True,
            subscription_plan_code=None,
            fee_policy_message="Subscription fee policy applied.",
        )

    @staticmethod
    async def export_my_sessions_xlsx_ctrl(
        db: AsyncSession,
        *,
        user_code: str,
        query: str | None = None,
        status: ParkingSessionStatus | None = None,
        from_time: datetime | None = None,
        to_time: datetime | None = None,
    ) -> StreamingResponse:
        rows = await parkingSessionUserService.get_sessions_me_for_export(
            db,
            user_code=user_code,
            query=query,
            status=status,
            from_time=from_time,
            to_time=to_time,
        )

        workbook = Workbook()
        sheet = workbook.active
        sheet.title = "Sessions"

        headers = [
            "User code",
            "Full name",
            "Phone",
            "Vehicle type",
            "License plate",
            "Check-in time",
            "Check-out time",
            "Status",
            "User type",
            "Amount (VND)",
            "Session ID",
        ]
        sheet.append(headers)
        header_font = Font(bold=True)
        for cell in sheet[1]:
            cell.font = header_font
            cell.alignment = Alignment(horizontal="center", vertical="center")

        for session, vehicle, user in rows:
            sheet.append(
                [
                    vehicle.user_code,
                    getattr(user, "full_name", None) if user else None,
                    getattr(user, "phone_number", None) if user else None,
                    str(getattr(vehicle, "vehicle_type", "") or ""),
                    session.license_plate or vehicle.license_plate or "",
                    session.check_in_time.isoformat(sep=" ", timespec="seconds") if session.check_in_time else "",
                    session.check_out_time.isoformat(sep=" ", timespec="seconds") if session.check_out_time else "",
                    str(getattr(session, "status", "") or ""),
                    str(getattr(session, "user_type", "") or ""),
                    int(session.total_amount or 0),
                    str(session.id),
                ]
            )

        # Auto-size columns (simple heuristic)
        for column_cells in sheet.columns:
            max_len = 0
            col_letter = column_cells[0].column_letter
            for cell in column_cells:
                value = cell.value
                if value is None:
                    continue
                max_len = max(max_len, len(str(value)))
            sheet.column_dimensions[col_letter].width = min(max(10, max_len + 2), 40)

        buffer = BytesIO()
        workbook.save(buffer)
        buffer.seek(0)

        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        filename = f"parking_sessions_{user_code}_{timestamp}.xlsx"
        headers = {"Content-Disposition": f'attachment; filename="{filename}"'}
        return StreamingResponse(
            buffer,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers=headers,
        )
