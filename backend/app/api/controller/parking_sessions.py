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
    ParkingSessionQRCheckIn,
)
from app.models.responses import DeleteResponse
from app.service.parking_sessions import parkingSessionService, parkingSessionUserService
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
    async def get_sessions_paginated_ctrl(
        db: AsyncSession,
        *,
        page: int = 1,
        limit: int = 5,
        scope_user_code: str | None = None,
        query: str | None = None,
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
                query=query,
                status=status,
                from_time=from_time,
                to_time=to_time,
            )

        return await parkingSessionService.get_sessions_admin_paginated(
            db,
            page=page,
            limit=limit,
            query=query,
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
            resolved_user_type = getattr(user, "user_type", None)
            if resolved_user_type is not None:
                user_type = resolved_user_type

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
