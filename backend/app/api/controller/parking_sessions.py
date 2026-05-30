from __future__ import annotations

import os
from io import BytesIO
from datetime import datetime, time, timedelta, timezone
from zoneinfo import ZoneInfo
from decimal import Decimal

from fastapi import HTTPException, status
from fastapi.responses import StreamingResponse
from openpyxl import Workbook
from openpyxl.styles import Alignment, Font
from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.utils.common import _resolve_user_type_from_card
from app.enums.parking import (
    InvoiceStatus,
    InvoiceType,
    ParkingAccessCardHolderType,
    ParkingAccessCardStatus,
    PaymentMethod,
    PaymentTransactionStatus,
    PaymentTransactionType,
    ParkingSessionStatus,
    ParkingVehicleMode,
    SubscriptionStatus
)
from app.models.parking_access_cards import ParkingAccessCard
from app.models.invoices import InvoiceCreate
from app.models.payment_transactions import PaymentTransactionCreate
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
from app.models.user_wallets import UserWallet
from app.models.users import Users
from app.service.invoices import invoiceService
from app.service.parking_access_cards import parkingAccessCardService
from app.service.parking_sessions import parkingSessionService, parkingSessionUserService
from app.service.payment_transactions import paymentTransactionService
from app.service.subscriptions import subscriptionService
from app.service.user_wallets import userWalletService
from app.utils.pagination import PaginatedResponse
from app.utils.barcode import normalize_barcode_token


GUEST_NORMAL_FEE = 2000
GUEST_AFTER_18_FEE = 5000


class ParkingSessionController:
    _LOCAL_TZ = ZoneInfo("Asia/Ho_Chi_Minh")

    @staticmethod
    def _now_local_naive() -> datetime:
        # Store local time (naive) so clients can display exactly what backend stored
        # without adding/subtracting timezone offsets.
        return datetime.now(timezone.utc).astimezone(ParkingSessionController._LOCAL_TZ).replace(tzinfo=None)
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
        status: ParkingSessionStatus | None = None,
        from_time: datetime | None = None,
        to_time: datetime | None = None,
        vehicle_mode: ParkingVehicleMode | None = None,
        license_plate: str | None = None,
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
                vehicle_mode=vehicle_mode,
                license_plate=license_plate,
            )

        return await parkingSessionService.get_sessions_admin_paginated(
            db,
            page=page,
            limit=limit,
            user_code=user_code,
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
    async def _get_current_active_session(
        card: ParkingAccessCard,
        db: AsyncSession,
    ):
        return await parkingSessionService.get_active_session_by_access_card(
            str(card.id),
            db,
        )
    
    @staticmethod
    def _enum_value(value) -> str | None:
        if value is None:
            return None
        return str(getattr(value, "value", value))

    @staticmethod
    def _fee_to_dict(fee_breakdown: FeeBreakdown | None) -> dict | None:
        if fee_breakdown is None:
            return None

        if hasattr(fee_breakdown, "model_dump"):
            return fee_breakdown.model_dump()

        if hasattr(fee_breakdown, "dict"):
            return fee_breakdown.dict()

        return {
            "base_amount": getattr(fee_breakdown, "base_amount", None),
            "after_18_amount": getattr(fee_breakdown, "after_18_amount", None),
            "total_amount": getattr(fee_breakdown, "total_amount", None),
            "has_active_subscription": getattr(fee_breakdown, "has_active_subscription", None),
            "subscription_benefit_applied": getattr(fee_breakdown, "subscription_benefit_applied", None),
            "subscription_plan_code": getattr(fee_breakdown, "subscription_plan_code", None),
            "fee_policy_message": getattr(fee_breakdown, "fee_policy_message", None),
        }

    @staticmethod
    async def _get_active_session_for_access_preview(
        card: ParkingAccessCard,
        db: AsyncSession,
    ):
        if not card.current_session_id:
            return None

        try:
            session = await parkingSessionService.get_session(str(card.current_session_id), db)
        except HTTPException as exc:
            if exc.status_code == status.HTTP_404_NOT_FOUND:
                return None
            raise

        if session is None or session.status != ParkingSessionStatus.ACTIVE:
            return None

        return session

    @staticmethod
    async def _enrich_access_preview_dict(
        result: dict,
        card: ParkingAccessCard,
        db: AsyncSession,
    ) -> dict:
        try:
            user_code = getattr(card, "user_code", None)
            subscription_id = getattr(card, "user_subscription_id", None)

            if not user_code and not subscription_id:
                return result

            statement = (
                select(Users, UserSubscription, SubscriptionPlan)
                .outerjoin(
                    Users,
                    and_(
                        Users.user_code == user_code,
                        Users.deleted_at.is_(None),
                    ),
                )
                .outerjoin(
                    UserSubscription,
                    UserSubscription.id == subscription_id,
                )
                .outerjoin(
                    SubscriptionPlan,
                    SubscriptionPlan.id == UserSubscription.sub_plan_id,
                )
            )

            row = (await db.execute(statement)).first()
            if not row:
                return result

            user, subscription, plan = row

            if user is not None:
                result["user_code"] = str(getattr(user, "user_code", "") or "")
                result["user_full_name"] = str(getattr(user, "full_name", "") or "")

            if subscription is not None:
                status_val = getattr(subscription, "status", "") or ""
                result["subscription_status"] = str(getattr(status_val, "value", status_val) or "")
                result["subscription_in_valid_period"] = subscriptionService.subscription_grants_parking_benefit(
                    subscription,
                    at_date=datetime.utcnow().date(),
                )

            if plan is not None:
                plan_val = getattr(plan, "plans_type", "") or ""
                result["subscription_plan_code"] = str(getattr(plan_val, "value", plan_val) or "")
        except Exception:
            pass

        return result

    @staticmethod
    async def _should_auto_confirm_access(
        card: ParkingAccessCard,
        *,
        fee_breakdown: FeeBreakdown | None,
        db: AsyncSession,
    ) -> bool:
        # Legacy helper (kept for backward compatibility in older clients).
        if card.holder_type == ParkingAccessCardHolderType.GUEST:
            return False

        if not getattr(card, "user_subscription_id", None):
            return False

        subscription = await subscriptionService.crud.get(
            db,
            str(card.user_subscription_id),
        )

        if subscription is None:
            return False

        subscription_status = getattr(subscription, "status", None)

        if subscription_status not in {
            SubscriptionStatus.ACTIVE,
            SubscriptionStatus.PAYMENT_DUE,
        }:
            return False

        has_parking_benefit = subscriptionService.subscription_grants_parking_benefit(
            subscription,
            at_date=datetime.utcnow().date(),
        )

        if not has_parking_benefit:
            return False

        total_amount = 0
        if fee_breakdown is not None:
            try:
                total_amount = int(getattr(fee_breakdown, "total_amount", 0) or 0)
            except Exception:
                total_amount = 0

        return total_amount <= 0

    @staticmethod
    def _is_student_or_teacher(card: ParkingAccessCard) -> bool:
        return card.holder_type in {
            ParkingAccessCardHolderType.STUDENT,
            ParkingAccessCardHolderType.TEACHER,
        }

    @staticmethod
    async def _get_subscription_for_card(
        card: ParkingAccessCard,
        db: AsyncSession,
    ) -> UserSubscription | None:
        sub_id = getattr(card, "user_subscription_id", None)
        if not sub_id:
            return None
        try:
            return await subscriptionService.crud.get(db, str(sub_id))
        except Exception:
            return None

    @staticmethod
    def _subscription_is_valid_for_free_exit(subscription: UserSubscription | None) -> bool:
        if subscription is None:
            return False

        subscription_status = getattr(subscription, "status", None)
        if subscription_status not in {SubscriptionStatus.ACTIVE, SubscriptionStatus.PAYMENT_DUE}:
            return False

        return subscriptionService.subscription_grants_parking_benefit(
            subscription,
            at_date=datetime.utcnow().date(),
        )

    @staticmethod
    async def _get_wallet_balance_preview(
        *,
        user_code: str | None,
        db: AsyncSession,
    ) -> Decimal:
        # Preview endpoint must not lock wallet rows.
        if not user_code:
            return Decimal("0")

        result = await db.execute(select(UserWallet).where(UserWallet.user_code == user_code))
        wallet = result.scalar_one_or_none()
        if wallet is None:
            return Decimal("0")

        try:
            return Decimal(str(wallet.balance or 0))
        except Exception:
            return Decimal("0")

    @staticmethod
    async def preview_session_via_access_ctrl(
        payload: ParkingSessionAccessConfirm,
        db: AsyncSession,
    ) -> dict:
        barcode_token = normalize_barcode_token(payload.barcode_token)

        if not barcode_token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="barcode_token is required",
            )

        card = await parkingAccessCardService.get_by_barcode_token(barcode_token, db)

        if card.status in {
            ParkingAccessCardStatus.DISABLED,
            ParkingAccessCardStatus.LOST,
        }:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Thẻ gửi xe đang bị khóa hoặc đã báo mất.",
            )

        active_session = await ParkingSessionController._get_current_active_session(
            card,
            db,
        )

        if active_session is not None:
            result = await ParkingSessionController._preview_access_check_out(
                card,
                payload,
                active_session,
                db,
            )
        else:
            result = await ParkingSessionController._preview_access_check_in(
                card,
                payload,
                db,
            )

        result = await ParkingSessionController._enrich_access_preview_dict(
            result,
            card,
            db,
        )

        return result

    @staticmethod
    async def _preview_access_check_in(
        card: ParkingAccessCard,
        payload: ParkingSessionAccessConfirm,
        db: AsyncSession,
    ) -> dict:
        now = ParkingSessionController._now_local_naive()

        if payload.vehicle_mode is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Loại xe là bắt buộc khi check-in.",
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
            if card.status not in {
                ParkingAccessCardStatus.AVAILABLE,
                ParkingAccessCardStatus.ASSIGNED,
                ParkingAccessCardStatus.ACTIVE,
            }:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Thẻ khách không khả dụng.",
                )

        return {
            "action": "CHECK_IN",
            "allow_gate": True,
            "can_confirm": True,
            "auto_confirm": True,
            "requires_guard_confirm": False,
            "message": "Cho phép xe vào",
            "barcode_token": card.barcode_token,
            "access_card_id": str(card.id),
            "vehicle_mode": ParkingSessionController._enum_value(payload.vehicle_mode),
            "license_plate": license_plate,
            "check_in_plate_image_url": getattr(payload, "plate_image_url", None),
            "check_out_plate_image_url": None,
            "check_in_time": now.isoformat(),
            "check_out_time": None,
            "status": ParkingSessionController._enum_value(ParkingSessionStatus.ACTIVE),
            "total_amount": 0,
            "fee_breakdown": None,
        }

    @staticmethod
    async def _preview_access_check_out(
        card: ParkingAccessCard,
        payload: ParkingSessionAccessConfirm,
        session,
        db: AsyncSession,
    ) -> dict:
        now = ParkingSessionController._now_local_naive()

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
                    detail={
                        "message": (
                            "Biển số check-out không khớp với biển số check-in. "
                            f"Check-in: {session_plate}, hiện tại: {detected_plate}."
                        ),
                        "check_in_plate_image_url": getattr(session, "check_in_plate_image_url", None),
                        "check_out_plate_image_url": getattr(payload, "plate_image_url", None),
                        "check_in_plate": session_plate,
                        "check_out_plate": detected_plate,
                    },
                )

        breakdown = await ParkingSessionController._calculate_access_fee_breakdown(
            card=card,
            session=session,
            check_out=now,
            db=db,
        )

        total_amount = int(getattr(breakdown, "total_amount", 0) or 0)

        subscription = await ParkingSessionController._get_subscription_for_card(card, db)
        subscription_ok = ParkingSessionController._subscription_is_valid_for_free_exit(subscription)

        payment_source = "SYSTEM"
        requires_guard_confirm = False
        auto_confirm = True
        message = "Cho phép xe ra"

        wallet_balance = None
        wallet_balance_after = None

        if card.holder_type == ParkingAccessCardHolderType.GUEST:
            payment_source = "CASH"
            requires_guard_confirm = True
            auto_confirm = False
            message = "Thu tiền mặt"

        elif ParkingSessionController._is_student_or_teacher(card) and subscription_ok:
            total_amount = 0
            payment_source = "SUBSCRIPTION"
            requires_guard_confirm = False
            auto_confirm = True
            message = "Cho phép xe ra"

        else:
            user_code = str(getattr(card, "user_code", "") or "")
            wallet_balance_decimal = await ParkingSessionController._get_wallet_balance_preview(
                user_code=user_code,
                db=db,
            )

            wallet_balance = int(wallet_balance_decimal)

            if total_amount <= 0:
                payment_source = "SYSTEM"
                requires_guard_confirm = False
                auto_confirm = True
                message = "Cho phép xe ra"

            elif wallet_balance_decimal >= Decimal(str(total_amount)):
                payment_source = "WALLET"
                requires_guard_confirm = False
                auto_confirm = True
                wallet_balance_after = int(wallet_balance_decimal - Decimal(str(total_amount)))
                message = "Đã trừ ví - Cho phép xe ra"

            else:
                payment_source = "CASH"
                requires_guard_confirm = True
                auto_confirm = False
                wallet_balance_after = None
                message = "Ví không đủ số dư, vui lòng thanh toán tiền mặt"

        return {
            "action": "CHECK_OUT",
            "allow_gate": True,
            "can_confirm": True,
            "auto_confirm": auto_confirm,
            "requires_guard_confirm": requires_guard_confirm,
            "message": message,
            "payment_source": payment_source,
            "wallet_balance": wallet_balance,
            "wallet_balance_after": wallet_balance_after,
            "barcode_token": card.barcode_token,
            "access_card_id": str(card.id),
            "session_id": str(session.id),
            "vehicle_mode": ParkingSessionController._enum_value(session.vehicle_mode),
            "license_plate": session.license_plate,
            "check_in_plate_image_url": getattr(session, "check_in_plate_image_url", None),
            "check_out_plate_image_url": getattr(payload, "plate_image_url", None),
            "check_in_time": session.check_in_time.isoformat() if session.check_in_time else None,
            "check_out_time": now.isoformat(),
            "status": ParkingSessionController._enum_value(ParkingSessionStatus.DONE),
            "total_amount": total_amount,
            "fee_breakdown": ParkingSessionController._fee_to_dict(breakdown),
        }    
    
    @staticmethod
    async def confirm_session_via_access_ctrl(
        payload: ParkingSessionAccessConfirm,
        db: AsyncSession,
    ) -> dict:
        barcode_token = normalize_barcode_token(payload.barcode_token)

        if not barcode_token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="barcode_token is required",
            )

        card = await parkingAccessCardService.get_by_barcode_token(barcode_token, db)

        if card.status in {
            ParkingAccessCardStatus.DISABLED,
            ParkingAccessCardStatus.LOST,
        }:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Thẻ gửi xe đang bị khóa hoặc đã báo mất.",
            )

        active_session = await ParkingSessionController._get_current_active_session(
            card,
            db,
        )

        if active_session is not None:
            response = await ParkingSessionController._confirm_access_check_out(
                card,
                payload,
                active_session,
                db,
            )
        else:
            # Nếu card bị stale: status ACTIVE nhưng không có active session thật,
            # reset lại trạng thái trước khi tạo check-in mới.
            if card.status == ParkingAccessCardStatus.ACTIVE:
                if card.holder_type == ParkingAccessCardHolderType.GUEST:
                    card.status = ParkingAccessCardStatus.AVAILABLE
                else:
                    card.status = ParkingAccessCardStatus.ASSIGNED

                card.current_session_id = None
                card.updated_at = datetime.utcnow()
                await db.flush()

            response = await ParkingSessionController._confirm_access_check_in(
                card,
                payload,
                db,
            )

        try:
            if getattr(card, "user_code", None):
                user = await db.get(Users, str(card.user_code))
                if user is not None and getattr(user, "deleted_at", None) is None:
                    response.user_code = str(getattr(user, "user_code", "") or "")
                    response.user_full_name = str(getattr(user, "full_name", "") or "")

            if getattr(card, "user_subscription_id", None):
                subscription = await subscriptionService.crud.get(
                    db,
                    str(card.user_subscription_id),
                )
                if subscription is not None:
                    status_val = getattr(subscription, "status", "") or ""
                    response.subscription_status = str(
                        getattr(status_val, "value", status_val) or ""
                    )

                    if getattr(subscription, "sub_plan_id", None):
                        plan = await db.get(SubscriptionPlan, subscription.sub_plan_id)
                        if plan is not None:
                            plan_val = getattr(plan, "plans_type", "") or ""
                            response.subscription_plan_code = str(
                                getattr(plan_val, "value", plan_val) or ""
                            )
        except Exception:
            pass

        try:
            base = response.model_dump() if hasattr(response, "model_dump") else dict(response)
        except Exception:
            base = {}

        if active_session is not None:
            base["check_in_plate_image_url"] = getattr(active_session, "check_in_plate_image_url", None)
            base["check_out_plate_image_url"] = getattr(payload, "plate_image_url", None)
        else:
            base["check_in_plate_image_url"] = getattr(payload, "plate_image_url", None)
            base["check_out_plate_image_url"] = None

        await db.commit()
        return base

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
        now = ParkingSessionController._now_local_naive()

        active_session = await ParkingSessionController._get_current_active_session(
            card,
            db,
        )

        if active_session is not None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Thẻ này đang có phiên gửi xe hoạt động.",
            )

        if payload.vehicle_mode is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Loại xe là bắt buộc khi check-in.",
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
            license_plate=license_plate,
            check_in_plate_image_url=getattr(payload, "plate_image_url", None),
        )

        created = await parkingSessionService.create_session(session_payload, db)
        await db.flush()

        card.status = ParkingAccessCardStatus.ACTIVE
        card.current_session_id = created.id
        card.updated_at = now
        await db.flush()

        return ParkingSessionController._to_read_response(
            created,
            allow_gate=True,
            message="Cho phép xe vào",
        )

    @staticmethod
    async def _confirm_access_check_out(
        card: ParkingAccessCard,
        payload: ParkingSessionAccessConfirm,
        session,
        db: AsyncSession,
    ) -> ParkingSessionRead:
        now = ParkingSessionController._now_local_naive()

        if session is None or session.status != ParkingSessionStatus.ACTIVE:
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
                    detail={
                        "message": (
                            "Biển số check-out không khớp với biển số check-in. "
                            f"Check-in: {session_plate}, hiện tại: {detected_plate}."
                        ),
                        "check_in_plate_image_url": getattr(session, "check_in_plate_image_url", None),
                        "check_out_plate_image_url": getattr(payload, "plate_image_url", None),
                        "check_in_plate": session_plate,
                        "check_out_plate": detected_plate,
                    },
                )

        breakdown = await ParkingSessionController._calculate_access_fee_breakdown(
            card=card,
            session=session,
            check_out=now,
            db=db,
        )

        total_amount = int(getattr(breakdown, "total_amount", 0) or 0)
        user_code = str(getattr(card, "user_code", "") or "")

        subscription = await ParkingSessionController._get_subscription_for_card(card, db)
        subscription_ok = ParkingSessionController._subscription_is_valid_for_free_exit(subscription)

        invoice_payment_method = PaymentMethod.SYSTEM
        result_message = "Cho phép xe ra"
        wallet_balance_before = None
        wallet_balance_after = None

        if card.holder_type == ParkingAccessCardHolderType.GUEST:
            invoice_payment_method = PaymentMethod.CASH
            result_message = "Đã thu tiền mặt - Cho phép xe ra"

        elif ParkingSessionController._is_student_or_teacher(card) and subscription_ok:
            total_amount = 0
            invoice_payment_method = PaymentMethod.SYSTEM
            result_message = "Cho phép xe ra"

        else:
            if total_amount > 0:
                wallet = await userWalletService.get_or_create_wallet_for_update(
                    user_code=user_code,
                    db=db,
                )
                userWalletService.ensure_wallet_can_change_balance(wallet)

                wallet_balance_before = Decimal(str(wallet.balance or 0))
                required = Decimal(str(total_amount))

                if wallet_balance_before >= required:
                    wallet.balance = wallet_balance_before - required
                    wallet.updated_at = now
                    db.add(wallet)
                    await db.flush()

                    wallet_balance_after = Decimal(str(wallet.balance or 0))
                    invoice_payment_method = PaymentMethod.WALLET
                    result_message = "Đã trừ ví - Cho phép xe ra"
                else:
                    # Trường hợp này xảy ra khi preview đã báo ví không đủ,
                    # bảo vệ thu tiền mặt rồi bấm SPACE confirm.
                    invoice_payment_method = PaymentMethod.CASH
                    result_message = "Đã thu tiền mặt - Cho phép xe ra"
            else:
                invoice_payment_method = PaymentMethod.SYSTEM
                result_message = "Cho phép xe ra"

        invoice = None
        if total_amount > 0:
            invoice = await invoiceService.create_invoice(
                InvoiceCreate(
                    user_code=user_code if user_code else settings.GUEST_USER_CODE or None,
                    subscription_id=getattr(card, "user_subscription_id", None),
                    amount=int(total_amount or 0),
                    invoice_type=InvoiceType.OTHER,
                    payment_method=invoice_payment_method,
                    status=InvoiceStatus.PAID,
                    paid_at=now,
                ),
                db,
            )
            await db.flush()

        if invoice and invoice_payment_method == PaymentMethod.WALLET and total_amount > 0:
            await paymentTransactionService.create_transaction(
                PaymentTransactionCreate(
                    user_code=user_code,
                    invoice_id=invoice.id,
                    transaction_type=PaymentTransactionType.INVOICE_DIRECT_PAYMENT,
                    payment_method=PaymentMethod.WALLET,
                    amount=Decimal(str(total_amount)),
                    status=PaymentTransactionStatus.SUCCESS,
                    balance_before=wallet_balance_before,
                    balance_after=wallet_balance_after,
                ),
                db,
            )
            await db.flush()

        update_payload = ParkingSessionUpdate(
            check_out_time=now,
            status=ParkingSessionStatus.DONE,
            total_amount=int(total_amount or 0),
            check_out_plate_image_url=getattr(payload, "plate_image_url", None),
        )
        updated = await parkingSessionService.update_session(str(session.id), update_payload, db)

        if card.holder_type == ParkingAccessCardHolderType.GUEST:
            card.status = ParkingAccessCardStatus.AVAILABLE
        else:
            card.status = ParkingAccessCardStatus.ASSIGNED

        card.current_session_id = None
        card.updated_at = now
        await db.flush()

        response = ParkingSessionController._to_read_response(
            updated,
            allow_gate=True,
            message=result_message,
            fee_breakdown=breakdown,
        )

        response.payment_source = str(getattr(invoice_payment_method, "value", invoice_payment_method) or "")
        response.total_amount = int(total_amount or 0)

        return response

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

        subscription = await ParkingSessionController._get_subscription_for_card(card, db)

        plan: SubscriptionPlan | None = None

        if subscription and subscription.sub_plan_id:
            plan = await db.get(SubscriptionPlan, subscription.sub_plan_id)

        if subscription is None or plan is None:
            return ParkingSessionController._default_guest_fee_breakdown(
                overnight_count=overnight_count,
                message="Default parking fee applied for user without active parking package.",
            )

        price_per_day = int(getattr(plan, "price_per_day", 0) or 0)
        after_18_fee = int(getattr(plan, "after_18_fee", 0) or 0)
        waive_after_18_fee = bool(getattr(plan, "waive_after_18_fee", False))

        has_benefit = subscriptionService.subscription_grants_parking_benefit(
            subscription,
            at_date=session.check_in_time.date() if getattr(session, "check_in_time", None) else None,
        )

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
