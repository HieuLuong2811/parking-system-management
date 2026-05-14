from __future__ import annotations

from io import BytesIO
from datetime import datetime, time, timedelta

from fastapi import HTTPException, status
from fastapi.responses import StreamingResponse
from openpyxl import Workbook
from openpyxl.styles import Alignment, Font
from sqlalchemy.ext.asyncio import AsyncSession

from app.utils.common import _resolve_user_type_from_card
from app.enums.parking import (
    ParkingAccessCardHolderType,
    ParkingAccessCardStatus,
    ParkingSessionStatus,
    ParkingVehicleMode,
    VehicleType,
)
from app.models.parking_access_cards import ParkingAccessCard
from app.models.parking_sessions import (
    ParkingSessionCreate,
    ParkingSessionAdminRead,
    ParkingSessionRead,
    ParkingSessionUpdate,
    ParkingSessionAccessConfirm,
)
from app.models.responses import DeleteResponse, FeeBreakdown
from app.models.plans import SubscriptionPlan
from app.models.subscriptions import UserSubscription
from app.service.parking_access_cards import parkingAccessCardService
from app.service.parking_sessions import parkingSessionService, parkingSessionUserService
from app.service.subscriptions import subscriptionService
from app.utils.pagination import PaginatedResponse


GUEST_NORMAL_FEE = 2000
GUEST_AFTER_18_FEE = 5000


class ParkingSessionController:
    @staticmethod
    async def create_session_ctrl(
        payload: ParkingSessionCreate,
        db: AsyncSession,
    ) -> ParkingSessionRead:
        return await parkingSessionService.create_session(payload, db)

    @staticmethod
    async def get_session_ctrl(
        session_id: str,
        db: AsyncSession,
    ) -> ParkingSessionRead:
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
    async def update_session_ctrl(
        session_id: str,
        payload: ParkingSessionUpdate,
        db: AsyncSession,
    ) -> ParkingSessionRead:
        return await parkingSessionService.update_session(session_id, payload, db)

    @staticmethod
    async def delete_session_ctrl(
        session_id: str,
        db: AsyncSession,
    ) -> DeleteResponse:
        await parkingSessionService.delete_session(session_id, db)
        return DeleteResponse(message="Deleted parking session")

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

        for session, access_card, user in rows:
            sheet.append(
                [
                    access_card.user_code if access_card else None,
                    getattr(user, "full_name", None) if user else None,
                    getattr(user, "phone_number", None) if user else None,
                    str(getattr(session, "vehicle_type", "") or ""),
                    session.license_plate or "",
                    session.check_in_time.isoformat(sep=" ", timespec="seconds")
                    if session.check_in_time
                    else "",
                    session.check_out_time.isoformat(sep=" ", timespec="seconds")
                    if session.check_out_time
                    else "",
                    str(getattr(session, "status", "") or ""),
                    str(getattr(session, "user_type", "") or ""),
                    int(session.total_amount or 0),
                    str(session.id),
                ]
            )

        for col in sheet.columns:
            max_length = 0
            column_letter = col[0].column_letter
            for cell in col:
                try:
                    max_length = max(max_length, len(str(cell.value)))
                except Exception:
                    pass
            sheet.column_dimensions[column_letter].width = min(50, max_length + 2)

        output = BytesIO()
        workbook.save(output)
        output.seek(0)

        return StreamingResponse(
            output,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": 'attachment; filename="sessions.xlsx"'},
        )

    @staticmethod
    async def confirm_session_via_access_ctrl(
        payload: ParkingSessionAccessConfirm,
        db: AsyncSession,
    ) -> ParkingSessionRead:
        barcode_token = (payload.barcode_token or "").strip().upper()

        if not barcode_token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="barcode_token is required",
            )

        card = await parkingAccessCardService.get_by_barcode_token(barcode_token, db)

        if card.status in {ParkingAccessCardStatus.DISABLED, ParkingAccessCardStatus.LOST}:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Thẻ gửi xe đang bị khóa hoặc đã báo mất.",
            )

        if card.status == ParkingAccessCardStatus.ACTIVE and card.current_session_id:
            response = await ParkingSessionController._confirm_access_check_out(
                card,
                payload,
                db,
            )
        else:
            response = await ParkingSessionController._confirm_access_check_in(
                card,
                payload,
                db,
            )

        await db.commit()
        return response

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
    async def _confirm_access_check_in(
        card: ParkingAccessCard,
        payload: ParkingSessionAccessConfirm,
        db: AsyncSession,
    ) -> ParkingSessionRead:
        now = datetime.utcnow()

        if card.status == ParkingAccessCardStatus.ACTIVE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Thẻ này đang có phiên gửi xe hoạt động.",
            )

        if payload.vehicle_mode is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="vehicle_mode is required for check-in",
            )

        if payload.vehicle_type is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="vehicle_type is required for check-in",
            )

        license_plate = (payload.license_plate or "").strip().upper() or None

        if payload.vehicle_mode == ParkingVehicleMode.LICENSED and not license_plate:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Chưa nhận diện được biển số xe.",
            )

        if payload.vehicle_mode == ParkingVehicleMode.UNLICENSED:
            license_plate = None

        if card.holder_type == ParkingAccessCardHolderType.GUEST:
            if card.status != ParkingAccessCardStatus.AVAILABLE:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Thẻ khách không khả dụng.",
                )

        user_type = _resolve_user_type_from_card(card)

        session_payload = ParkingSessionCreate(
            check_in_time=now,
            user_type=user_type,
            access_card_id=card.id,
            vehicle_mode=payload.vehicle_mode,
            vehicle_type=payload.vehicle_type,
            license_plate=license_plate,
        )

        created = await parkingSessionService.create_session(session_payload, db)
        await db.flush()

        card.status = ParkingAccessCardStatus.ACTIVE
        card.current_session_id = created.id
        card.issued_at = now
        card.returned_at = None
        card.updated_at = now
        await db.flush()

        return ParkingSessionController._to_read_response(
            created,
            allow_gate=True,
            message="CHECK_IN_OK",
        )

    @staticmethod
    async def _confirm_access_check_out(
        card: ParkingAccessCard,
        payload: ParkingSessionAccessConfirm,
        db: AsyncSession,
    ) -> ParkingSessionRead:
        now = datetime.utcnow()

        if not card.current_session_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Không tìm thấy phiên gửi xe đang hoạt động cho thẻ này.",
            )

        session = await parkingSessionService.get_session(str(card.current_session_id), db)

        if not session or session.status != ParkingSessionStatus.ACTIVE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Không tìm thấy phiên gửi xe đang hoạt động cho thẻ này.",
            )

        if session.check_out_time is not None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Phiên gửi xe này đã hoàn tất.",
            )

        if session.vehicle_mode == ParkingVehicleMode.LICENSED:
            detected_plate = (payload.license_plate or "").strip().upper()
            session_plate = (session.license_plate or "").strip().upper()

            if not detected_plate:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Chưa nhận diện được biển số xe khi check-out.",
                )

            if detected_plate != session_plate:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        f"Biển số check-out không khớp. "
                        f"Check-in: {session_plate}, hiện tại: {detected_plate}."
                    ),
                )

        breakdown = await ParkingSessionController._calculate_access_fee_breakdown(
            card=card,
            session=session,
            check_out=now,
            db=db,
        )

        update_payload = ParkingSessionUpdate(
            check_out_time=now,
            status=ParkingSessionStatus.DONE,
            total_amount=breakdown.total_amount if breakdown else None,
        )
        updated = await parkingSessionService.update_session(str(session.id), update_payload, db)

        if card.holder_type == ParkingAccessCardHolderType.GUEST:
            card.status = ParkingAccessCardStatus.AVAILABLE
        else:
            card.status = ParkingAccessCardStatus.ASSIGNED

        card.current_session_id = None
        card.returned_at = now
        card.updated_at = now
        await db.flush()

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
        end_date = check_out.date()

        while current_date <= end_date:
            cutoff = datetime.combine(current_date, time(18, 0))
            if check_in < cutoff <= check_out:
                count += 1
            current_date = current_date + timedelta(days=1)

        return count

    @staticmethod
    def _default_guest_fee_breakdown(
        *,
        overnight_count: int,
        message: str,
    ) -> FeeBreakdown:
        base_amount = GUEST_NORMAL_FEE
        after_18_amount = GUEST_AFTER_18_FEE * overnight_count if overnight_count else 0
        total_amount = base_amount + after_18_amount

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
    async def _get_card_subscription(
        card: ParkingAccessCard,
        db: AsyncSession,
    ) -> UserSubscription:
        if not card.user_subscription_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Thẻ chưa liên kết gói gửi xe.",
            )

        subscription = await subscriptionService.crud.get(db, str(card.user_subscription_id))

        if not subscription:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Không tìm thấy gói gửi xe của thẻ.",
            )

        return subscription

    @staticmethod
    async def _calculate_access_fee_breakdown(
        *,
        card: ParkingAccessCard,
        session,
        check_out: datetime,
        db: AsyncSession,
    ) -> FeeBreakdown:
        overnight_count = ParkingSessionController._count_after_18_crossings(
            session.check_in_time,
            check_out,
        )

        if card.holder_type == ParkingAccessCardHolderType.GUEST:
            return ParkingSessionController._default_guest_fee_breakdown(
                overnight_count=overnight_count,
                message="Guest parking fee applied.",
            )

        subscription = await ParkingSessionController._get_card_subscription(card, db)

        plan: SubscriptionPlan | None = None
        if subscription and subscription.sub_plan_id:
            plan = await db.get(SubscriptionPlan, subscription.sub_plan_id)

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
        after_18_amount = 0 if waive_after_18_fee else after_18_fee * overnight_count
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
