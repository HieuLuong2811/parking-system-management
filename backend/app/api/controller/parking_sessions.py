from io import BytesIO
from datetime import datetime, time, timedelta
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
    ParkingSessionPlateConfirm,
)
from app.models.responses import DeleteResponse
from app.service.parking_sessions import parkingSessionService, parkingSessionUserService
from app.service.subscriptions import subscriptionService
from app.service.vehicles import vehicleService
from app.models.responses import FeeBreakdown
from app.models.vehicles import Vehicle
from app.models.users import Users

GUEST_NORMAL_FEE = 2000
GUEST_AFTER_18_FEE = 5000

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
        breakdown = await ParkingSessionController._calculate_fee_breakdown_v2(
            vehicle=vehicle,
            user=user,
            check_in=active_session.check_in_time,
            check_out=now,
            db=db,
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
    async def create_session_via_plate_ctrl(
        payload: ParkingSessionPlateCheckIn,
        db: AsyncSession,
    ) -> ParkingSessionRead:
        plate = (payload.license_plate or "").strip().upper()

        if not plate:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="license_plate is required",
            )

        vehicle_user = await vehicleService.get_by_license_plate_or_none(plate, db)

        if vehicle_user is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Vehicle not found",
            )

        vehicle, user = vehicle_user

        active_session = await parkingSessionService.get_active_session_by_vehicle(
            str(vehicle.id),
            db,
        )

        if active_session:
            return await ParkingSessionController._confirm_plate_check_out(
                vehicle,
                user,
                db,
            )

        return await ParkingSessionController._confirm_plate_check_in(
            vehicle,
            user,
            db,
        )
    
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

        return FeeBreakdown(
            base_amount=0,
            after_18_amount=0,
            total_amount=0,
            has_active_subscription=True,
            subscription_benefit_applied=True,
            subscription_plan_code=None,
            fee_policy_message="Subscription active (or payment due): parking fee waived.",
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

    @staticmethod
    async def confirm_session_via_plate_ctrl(
        payload: ParkingSessionPlateConfirm,
        db: AsyncSession,
    ) -> ParkingSessionRead:
        plate = (payload.license_plate or "").strip().upper()

        if not plate:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="license_plate is required",
            )

        vehicle_user = await vehicleService.get_by_license_plate_or_none(plate, db)

        if vehicle_user is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Vehicle not found",
            )

        vehicle, user = vehicle_user

        if payload.action.value == "CHECK_IN":
            return await ParkingSessionController._confirm_plate_check_in(
                vehicle,
                user,
                db,
            )

        if payload.action.value == "CHECK_OUT":
            return await ParkingSessionController._confirm_plate_check_out(
                vehicle,
                user,
                db,
            )

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid action",
        )

    @staticmethod
    def _resolve_user_type(vehicle: Vehicle, user: Users | None) -> UserType:
        if user is None or vehicle.user_code is None:
            return UserType.GUEST

        resolved_user_type = getattr(user, "user_type", None)

        if resolved_user_type is not None:
            return resolved_user_type

        return UserType.STUDENT

    @staticmethod
    def _to_read_response(
        session,
        *,
        allow_gate: bool,
        message: str,
        fee_breakdown: FeeBreakdown | None = None,
    ) -> ParkingSessionRead:
        response = (
            ParkingSessionRead.model_validate(session)
            if hasattr(ParkingSessionRead, "model_validate")
            else session
        )

        response.allow_gate = allow_gate
        response.message = message
        response.fee_breakdown = fee_breakdown

        return response

    @staticmethod
    async def _confirm_plate_check_in(
        vehicle: Vehicle,
        user: Users | None,
        db: AsyncSession,
    ) -> ParkingSessionRead:
        now = datetime.utcnow()

        active_session = await parkingSessionService.get_active_session_by_vehicle(
            str(vehicle.id),
            db,
        )

        if active_session:
            return ParkingSessionController._to_read_response(
                active_session,
                allow_gate=False,
                message="Vehicle already has an active parking session.",
            )

        user_type = ParkingSessionController._resolve_user_type(vehicle, user)

        if user_type != UserType.GUEST:
            sub, _plan, _payment_plan = (
                await subscriptionService.get_active_subscription_covering_vehicle(
                    str(vehicle.id),
                    db,
                )
            )

            if subscriptionService.subscription_grants_parking_benefit(sub) and sub is not None:
                conflict = await subscriptionService.get_active_session_using_subscription(
                    str(sub.id),
                    db,
                    exclude_vehicle_id=str(vehicle.id),
                )

                if conflict is not None:
                    response = ParkingSessionRead(
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

                    return response

        session_payload = ParkingSessionCreate(
            vehicle_id=vehicle.id,
            license_plate=vehicle.license_plate,
            check_in_time=now,
            user_type=user_type,
        )

        created = await parkingSessionService.create_session(session_payload, db)

        return ParkingSessionController._to_read_response(
            created,
            allow_gate=True,
            message="CHECK_IN_OK",
        )

    @staticmethod
    async def _confirm_plate_check_out(
        vehicle: Vehicle,
        user: Users | None,
        db: AsyncSession,
    ) -> ParkingSessionRead:
        now = datetime.utcnow()

        active_session = await parkingSessionService.get_active_session_by_vehicle(
            str(vehicle.id),
            db,
        )

        if not active_session:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No active parking session found for this vehicle",
            )

        breakdown = await ParkingSessionController._calculate_fee_breakdown_v2(
            vehicle=vehicle,
            user=user,
            check_in=active_session.check_in_time,
            check_out=now,
            db=db,
        )

        update_payload = ParkingSessionUpdate(
            check_out_time=now,
            status=ParkingSessionStatus.DONE,
            total_amount=breakdown.total_amount if breakdown else None,
        )

        updated = await parkingSessionService.update_session(
            str(active_session.id),
            update_payload,
            db,
        )

        return ParkingSessionController._to_read_response(
            updated,
            allow_gate=True,
            message="CHECK_OUT_OK",
            fee_breakdown=breakdown,
        )

    @staticmethod
    def _count_after_18_crossings(check_in: datetime, check_out: datetime) -> int:
        if check_out <= check_in:
            return 0

        count = 0
        current_date = check_in.date()

        while current_date <= check_out.date():
            marker = datetime.combine(current_date, time(hour=18, minute=0))

            if check_in < marker <= check_out:
                count += 1

            current_date += timedelta(days=1)

        return count

    @staticmethod
    def _default_guest_fee_breakdown(
        *,
        overnight_count: int,
        message: str,
    ) -> FeeBreakdown:
        if overnight_count > 0:
            base_amount = 0
            after_18_amount = GUEST_AFTER_18_FEE * overnight_count
            total_amount = after_18_amount
        else:
            base_amount = GUEST_NORMAL_FEE
            after_18_amount = 0
            total_amount = GUEST_NORMAL_FEE

        return FeeBreakdown(
            base_amount=base_amount,
            after_18_amount=after_18_amount,
            total_amount=total_amount,
            has_active_subscription=False,
            subscription_benefit_applied=False,
            subscription_plan_code=None,
            fee_policy_message=message,
        )

    @staticmethod
    async def _calculate_fee_breakdown_v2(
        *,
        vehicle: Vehicle,
        user: Users | None,
        check_in: datetime,
        check_out: datetime,
        db: AsyncSession,
    ) -> FeeBreakdown:
        overnight_count = ParkingSessionController._count_after_18_crossings(
            check_in,
            check_out,
        )

        is_guest = user is None or vehicle.user_code is None

        if is_guest:
            return ParkingSessionController._default_guest_fee_breakdown(
                overnight_count=overnight_count,
                message="Guest parking fee applied.",
            )

        subscription, plan, _payment_plan = (
            await subscriptionService.get_subscription_covering_vehicle_for_fee(
                str(vehicle.id),
                db,
            )
        )

        if plan is None:
            return ParkingSessionController._default_guest_fee_breakdown(
                overnight_count=overnight_count,
                message="Default parking fee applied.",
            )

        price_per_day = int(getattr(plan, "price_per_day", 0) or 0)
        after_18_fee = int(getattr(plan, "after_18_fee", 0) or 0)
        waive_after_18_fee = bool(getattr(plan, "waive_after_18_fee", False))

        has_benefit = subscriptionService.subscription_grants_parking_benefit(subscription)

        if has_benefit:
            return FeeBreakdown(
                base_amount=0,
                after_18_amount=0,
                total_amount=0,
                has_active_subscription=True,
                subscription_benefit_applied=True,
                subscription_plan_code=str(getattr(plan, "plans_type", "")),
                fee_policy_message="Subscription active (or payment due): parking fee waived.",
            )

        base_amount = price_per_day
        after_18_amount = after_18_fee * overnight_count if overnight_count > 0 else 0
        total_amount = base_amount + after_18_amount

        return FeeBreakdown(
            base_amount=base_amount,
            after_18_amount=after_18_amount,
            total_amount=total_amount,
            has_active_subscription=False,
            subscription_benefit_applied=False,
            subscription_plan_code=str(getattr(plan, "plans_type", "")),
            fee_policy_message="Subscription is not eligible for parking benefit.",
        )
