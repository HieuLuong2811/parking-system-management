import math

from app.mappers.subscription_mapper import SubscriptionMapper
from fastapi import HTTPException
from sqlalchemy import String, func, or_, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.authen.current_user import AuthUser, is_admin_user
from app.enums.parking import PaymentType, SubscriptionPlanType, SubscriptionStatus
from app.enums.parking import ParkingSessionStatus
from app.models.plans import SubscriptionPlan
from app.models.payment_plans import PaymentPlan
from app.models.subscriptions import (
    UserSubscription,
    UserSubscriptionAdminView,
    UserSubscriptionClientView,
    UserSubscriptionCreate,
    UserSubscriptionUpdate
)
from app.models.user_subscription_vehicles import UserSubscriptionVehicle
from app.models.users import Users
from app.models.terms import AcademicTerm
from app.models.vehicles import Vehicle
from app.models.parking_sessions import ParkingSession
from app.service.base import CRUDService
from app.utils.pagination import PaginatedResponse
from app.utils.search import ilike_unaccent

REPLACED_STATUSES = [
    SubscriptionStatus.ACTIVE,
    SubscriptionStatus.PAYMENT_DUE,
    SubscriptionStatus.OVERDUE,
    SubscriptionStatus.SUSPENDED,
]
class subscriptionService:
    crud = CRUDService(UserSubscription)

    @staticmethod
    async def _inactivate_existing_active_subscriptions(
        user_code: str, db: AsyncSession
    ) -> None:

        cancelable_statuses = [
            SubscriptionStatus.ACTIVE,
            SubscriptionStatus.PAYMENT_DUE,
            SubscriptionStatus.OVERDUE,
        ]

        inactive_statuses = [
            SubscriptionStatus.SUSPENDED,
        ]

        affected_ids = (
            await db.execute(
                select(UserSubscription.id).where(
                    UserSubscription.user_code == user_code,
                    UserSubscription.status.in_(
                        cancelable_statuses + inactive_statuses
                    ),
                )
            )
        ).scalars().all()

        if not affected_ids:
            return

        await db.execute(
            update(UserSubscription)
            .where(
                UserSubscription.id.in_(affected_ids),
                UserSubscription.status.in_(cancelable_statuses),
            )
            .values(status=SubscriptionStatus.CANCELED)
        )

        await db.execute(
            update(UserSubscription)
            .where(
                UserSubscription.id.in_(affected_ids),
                UserSubscription.status.in_(inactive_statuses),
            )
            .values(status=SubscriptionStatus.INACTIVE)
        )

        await db.execute(
            update(UserSubscriptionVehicle)
            .where(
                UserSubscriptionVehicle.user_subscription_id.in_(affected_ids),
                UserSubscriptionVehicle.deleted_at.is_(None),
                UserSubscriptionVehicle.status == SubscriptionStatus.ACTIVE,
            )
            .values(status=SubscriptionStatus.INACTIVE)
        )

    @staticmethod
    async def create_subscription(payload: UserSubscriptionCreate, db: AsyncSession) -> UserSubscription:
        await subscriptionService._inactivate_existing_active_subscriptions(payload.user_code, db)

        vehicle_ids = payload.vehicle_ids or ([] if payload.vehicle_id is None else [payload.vehicle_id])

        plan = await db.get(SubscriptionPlan, payload.sub_plan_id)
        if vehicle_ids:
            vehicles = (await db.execute(select(Vehicle).where(Vehicle.id.in_(vehicle_ids)))).scalars().all()
            if len(vehicles) != len(vehicle_ids):
                raise HTTPException(status_code=400, detail="One or more vehicles not found")
            if any(v.user_code != payload.user_code for v in vehicles):
                raise HTTPException(status_code=400, detail="One or more vehicles do not belong to subscription owner")

            if plan:
                max_licensed = int(getattr(plan, "max_licensed_vehicle", 0) or 0)
                max_unlicensed = int(getattr(plan, "max_unlicensed_vehicle", 0) or 0)

                licensed_count = sum(1 for v in vehicles if (v.license_plate or "").strip())
                unlicensed_count = len(vehicles) - licensed_count

                if max_licensed and licensed_count > max_licensed:
                    raise HTTPException(status_code=400, detail="Licensed vehicle limit exceeded for this plan")
                if max_unlicensed and unlicensed_count > max_unlicensed:
                    raise HTTPException(status_code=400, detail="Unlicensed vehicle limit exceeded for this plan")
        create_payload = (
            payload.model_copy(update={"vehicle_id": None, "vehicle_ids": None})
            if hasattr(payload, "model_copy")
            else payload
        )
        if hasattr(create_payload, "vehicle_id"):
            create_payload.vehicle_id = None
        if hasattr(create_payload, "vehicle_ids"):
            create_payload.vehicle_ids = None

        subscription = await subscriptionService.crud.create(db, create_payload)
        await db.flush()

        if vehicle_ids:
            mappings = [
                UserSubscriptionVehicle(
                    user_subscription_id=subscription.id,
                    vehicle_id=vehicle_id,
                    status=SubscriptionStatus.ACTIVE,
                )
                for vehicle_id in vehicle_ids
            ]
            db.add_all(mappings)
        return subscription

    @staticmethod
    async def _get_covered_vehicles_by_subscription_ids(
        subscription_ids: list, db: AsyncSession
    ) -> dict[str, list[Vehicle]]:
        if not subscription_ids:
            return {}
        statement = (
            select(UserSubscriptionVehicle.user_subscription_id, Vehicle)
            .join(Vehicle, Vehicle.id == UserSubscriptionVehicle.vehicle_id)
            .where(
                UserSubscriptionVehicle.deleted_at.is_(None),
                UserSubscriptionVehicle.status == SubscriptionStatus.ACTIVE,
                UserSubscriptionVehicle.user_subscription_id.in_(subscription_ids),
            )
        )
        result = await db.execute(statement)
        mapping: dict[str, list[Vehicle]] = {}
        for subscription_id, vehicle in result.all():
            mapping.setdefault(str(subscription_id), []).append(vehicle)
        return mapping

    @staticmethod
    async def get_active_subscription_covering_vehicle(
        vehicle_id: str, db: AsyncSession
    ) -> tuple[UserSubscription | None, SubscriptionPlan | None, PaymentPlan | None]:
        # Prefer new join table.
        statement = (
            select(UserSubscription, SubscriptionPlan, PaymentPlan)
            .join(UserSubscriptionVehicle, UserSubscriptionVehicle.user_subscription_id == UserSubscription.id)
            .outerjoin(SubscriptionPlan, SubscriptionPlan.id == UserSubscription.sub_plan_id)
            .outerjoin(PaymentPlan, PaymentPlan.id == UserSubscription.payment_plan_id)
            .where(
                UserSubscriptionVehicle.deleted_at.is_(None),
                UserSubscriptionVehicle.status == SubscriptionStatus.ACTIVE,
                UserSubscriptionVehicle.vehicle_id == vehicle_id,
                UserSubscription.status == SubscriptionStatus.ACTIVE,
            )
            .order_by(UserSubscription.created_at.desc())
        )
        row = (await db.execute(statement)).first()
        if row:
            return row[0], row[1], row[2]
        return None, None, None

    @staticmethod
    def subscription_grants_parking_benefit(
        subscription: UserSubscription | None,
    ) -> bool:
        if not subscription:
            return False

        if subscription.status not in {
            SubscriptionStatus.ACTIVE,
            SubscriptionStatus.PAYMENT_DUE,
        }:
            return False

        if subscription.start_date and subscription.end_date:
            from datetime import date as _date

            now = _date.today()
            if now < subscription.start_date or now > subscription.end_date:
                return False

        return True

    @staticmethod
    async def get_active_session_using_subscription(
        subscription_id: str, db: AsyncSession, *, exclude_vehicle_id: str | None = None
    ) -> ParkingSession | None:
        statement = (
            select(ParkingSession)
            .join(UserSubscriptionVehicle, UserSubscriptionVehicle.vehicle_id == ParkingSession.vehicle_id)
            .where(
                UserSubscriptionVehicle.user_subscription_id == subscription_id,
                UserSubscriptionVehicle.deleted_at.is_(None),
                UserSubscriptionVehicle.status == SubscriptionStatus.ACTIVE,
                ParkingSession.check_out_time.is_(None),
                ParkingSession.status == ParkingSessionStatus.ACTIVE,
            )
        )
        if exclude_vehicle_id is not None:
            statement = statement.where(ParkingSession.vehicle_id != exclude_vehicle_id)
        result = await db.execute(statement)
        return result.scalars().first()

    @staticmethod
    def _build_detail_statement(user_code: str | None = None, *, ordered: bool = True):
        statement = (
            select(
                UserSubscription,
                Users,
                PaymentPlan,
                AcademicTerm,
                SubscriptionPlan,
            )
            .outerjoin(Users, Users.user_code == UserSubscription.user_code)
            .outerjoin(PaymentPlan, PaymentPlan.id == UserSubscription.payment_plan_id)
            .outerjoin(AcademicTerm, AcademicTerm.id == UserSubscription.term_id)
            .outerjoin(SubscriptionPlan, SubscriptionPlan.id == UserSubscription.sub_plan_id)
        )
        if ordered:
            statement = statement.order_by(UserSubscription.created_at.desc())
        if user_code:
            statement = statement.where(UserSubscription.user_code == user_code)
        return statement

    @staticmethod
    async def get_user_subscriptions_with_details_paginated(
        db: AsyncSession,
        *,
        user_code: str,
        status: SubscriptionStatus | None = None,
        page: int = 1,
        limit: int = 5,
    ) -> PaginatedResponse[UserSubscriptionClientView]:
        page = max(1, int(page or 1))
        limit = max(1, int(limit or 5))

        filters = [UserSubscription.user_code == user_code]
        if status is not None:
            filters.append(UserSubscription.status == status)

        count_statement = subscriptionService._build_detail_statement(user_code, ordered=False).where(*filters)
        count_subquery = count_statement.with_only_columns(UserSubscription.id).distinct().subquery()
        total_count = await db.scalar(select(func.count()).select_from(count_subquery))
        total_count = int(total_count or 0)
        total_pages = math.ceil(total_count / limit) if total_count else 0

        statement = subscriptionService._build_detail_statement(user_code, ordered=True).where(*filters)
        offset = (page - 1) * limit
        statement = statement.offset(offset).limit(limit)

        result = await db.execute(statement)
        rows = result.all()
        details: list[UserSubscriptionClientView] = []
        covered_vehicle_map = await subscriptionService._get_covered_vehicles_by_subscription_ids(
            [str(sub.id) for sub, *_ in rows], db
        )

        for subscription, _user, payment_plan, term, subscription_plan in rows:
            details.append(
                SubscriptionMapper.to_client_view(
                    subscription,
                    None,
                    payment_plan,
                    subscription_plan,
                    term,
                    covered_vehicle_map.get(str(subscription.id)),
                )
            )
        return {
            "data": details,
            "total": total_count,
            "page": page,
            "limit": limit,
            "total_pages": total_pages,
        }

    @staticmethod
    async def get_user_subscriptions_with_details(
        db: AsyncSession,
        *,
        user_code: str,
        status: SubscriptionStatus | None = None,
        statuses: list[SubscriptionStatus] | None = None,
    ) -> list[UserSubscriptionAdminView]:
        filters = [UserSubscription.user_code == user_code]

        billing_related_statuses = [
            SubscriptionStatus.ACTIVE,
            SubscriptionStatus.PAYMENT_DUE,
            SubscriptionStatus.OVERDUE,
            SubscriptionStatus.CANCELED,
        ]

        if statuses:
            filters.append(UserSubscription.status.in_(statuses))
        elif status is not None:
            filters.append(UserSubscription.status == status)
        else:
            filters.append(UserSubscription.status.in_(billing_related_statuses))

        statement = (
            subscriptionService
            ._build_detail_statement(user_code, ordered=True)
            .where(*filters)
        )

        result = await db.execute(statement)
        rows = result.all()

        covered_vehicle_map = await subscriptionService._get_covered_vehicles_by_subscription_ids(
            [str(sub.id) for sub, *_ in rows],
            db,
        )

        details: list[UserSubscriptionAdminView] = []

        for subscription, user, payment_plan, term, subscription_plan in rows:
            details.append(
                SubscriptionMapper.to_admin_view(
                    subscription,
                    user,
                    None,
                    payment_plan,
                    term,
                    subscription_plan,
                    covered_vehicle_map.get(str(subscription.id)),
                )
            )

        return details

    @staticmethod
    async def get_all_subscriptions_with_details_paginated(
        db: AsyncSession,
        *,
        search: str | None = None,
        user_code: str | None = None,
        full_name: str | None = None,
        plan_type: SubscriptionPlanType | None = None,
        payment_type: PaymentType | None = None,
        status: SubscriptionStatus | None = None,
        page: int = 1,
        limit: int = 5,
    ) -> PaginatedResponse[UserSubscriptionAdminView]:
        page = max(1, int(page or 1))
        limit = max(1, int(limit or 5))

        filters = []
        if status is not None:
            filters.append(UserSubscription.status == status)

        trimmed_user_code = (user_code or "").strip()
        if trimmed_user_code:
            filters.append(ilike_unaccent(UserSubscription.user_code, trimmed_user_code))

        trimmed_full_name = (full_name or "").strip()
        if trimmed_full_name:
            filters.append(ilike_unaccent(Users.full_name, trimmed_full_name))

        if plan_type is not None:
            filters.append(SubscriptionPlan.plans_type == plan_type)

        if payment_type is not None:
            filters.append(PaymentPlan.payment_type == payment_type)

        trimmed_search = (search or "").strip()
        if trimmed_search:
            filters.append(
                or_(
                    ilike_unaccent(UserSubscription.user_code, trimmed_search),
                    ilike_unaccent(Users.full_name, trimmed_search),
                    ilike_unaccent(func.cast(SubscriptionPlan.plans_type, String), trimmed_search),
                    ilike_unaccent(func.cast(PaymentPlan.payment_type, String), trimmed_search),
                    ilike_unaccent(AcademicTerm.term_name, trimmed_search),
                )
            )

        count_statement = subscriptionService._build_detail_statement(None, ordered=False)
        if filters:
            count_statement = count_statement.where(*filters)

        count_subquery = count_statement.with_only_columns(UserSubscription.id).distinct().subquery()
        total_count = await db.scalar(select(func.count()).select_from(count_subquery))
        total_count = int(total_count or 0)
        total_pages = math.ceil(total_count / limit) if total_count else 0

        statement = subscriptionService._build_detail_statement(None, ordered=True)
        if filters:
            statement = statement.where(*filters)

        offset = (page - 1) * limit
        statement = statement.offset(offset).limit(limit)

        result = await db.execute(statement)
        rows = result.all()
        details: list[UserSubscriptionAdminView] = []
        covered_vehicle_map = await subscriptionService._get_covered_vehicles_by_subscription_ids(
            [str(sub.id) for sub, *_ in rows], db
        )

        for subscription, user, payment_plan, term, subscription_plan in rows:
            details.append(
                SubscriptionMapper.to_admin_view(
                    subscription,
                    user,
                    None,
                    payment_plan,
                    term,
                    subscription_plan,
                    covered_vehicle_map.get(str(subscription.id)),
                )
            )

        return {
            "data": details,
            "total": total_count,
            "page": page,
            "limit": limit,
            "total_pages": total_pages,
        }

    @staticmethod
    async def update_subscription(
        subscription_id: str, payload: UserSubscriptionUpdate, db: AsyncSession
    ) -> UserSubscription:
        return await subscriptionService.crud.update(db, subscription_id, payload)

    @staticmethod
    async def delete_subscription(subscription_id: str, db: AsyncSession) -> UserSubscription:
        return await subscriptionService.crud.delete(db, subscription_id)

    async def update_subscription_vehicles_for_user(
        subscription_id: str,
        vehicle_ids: list[str],
        db: AsyncSession,
        current_user: AuthUser,
    ) -> UserSubscription:
        subscription = await subscriptionService.crud.get(db, subscription_id)

        if not subscription:
            raise HTTPException(status_code=404, detail="Subscription not found")

        if not is_admin_user(current_user) and subscription.user_code != current_user.user_code:
            raise HTTPException(
                status_code=403,
                detail="Not allowed to update this subscription",
            )

        normalized_vehicle_ids = subscriptionService._normalize_vehicle_ids(vehicle_ids)

        vehicles = await subscriptionService._get_valid_user_vehicles(
            vehicle_ids=normalized_vehicle_ids,
            db=db,
            current_user=current_user,
        )

        await subscriptionService._validate_vehicle_limit(
            subscription=subscription,
            vehicles=vehicles,
            db=db,
        )

        await subscriptionService._sync_subscription_vehicles(
            subscription_id=str(subscription.id),
            vehicles=vehicles,
            db=db,
        )

        await db.commit()
        await db.refresh(subscription)  

        return subscription

    @staticmethod
    def _normalize_vehicle_ids(vehicle_ids: list[str]) -> list[str]:
        normalized = [str(vehicle_id).strip() for vehicle_id in vehicle_ids if vehicle_id]
        normalized = list(dict.fromkeys(normalized))

        if not normalized:
            raise HTTPException(
                status_code=400,
                detail="vehicle_ids must not be empty",
            )

        return normalized

    @staticmethod
    async def _get_valid_user_vehicles(
        vehicle_ids: list[str],
        db: AsyncSession,
        current_user: AuthUser,
    ) -> list[Vehicle]:
        vehicles = (
            await db.execute(
                select(Vehicle).where(
                    Vehicle.id.in_(vehicle_ids),
                    Vehicle.deleted_at.is_(None),
                )
            )
        ).scalars().all()

        if len(vehicles) != len(vehicle_ids):
            raise HTTPException(
                status_code=400,
                detail="One or more vehicles not found",
            )

        if not is_admin_user(current_user):
            invalid_owner = any(
                vehicle.user_code != current_user.user_code
                for vehicle in vehicles
            )

            if invalid_owner:
                raise HTTPException(
                    status_code=403,
                    detail="One or more vehicles do not belong to current user",
                )

        return vehicles

    @staticmethod
    async def _validate_vehicle_limit(
        subscription: UserSubscription,
        vehicles: list[Vehicle],
        db: AsyncSession,
    ) -> None:
        plan = await db.get(SubscriptionPlan, subscription.sub_plan_id)

        if not plan:
            raise HTTPException(
                status_code=400,
                detail="Subscription plan not found",
            )

        max_licensed = int(getattr(plan, "max_licensed_vehicle", 0) or 0)
        max_unlicensed = int(getattr(plan, "max_unlicensed_vehicle", 0) or 0)

        licensed_count = sum(
            1 for vehicle in vehicles
            if (vehicle.license_plate or "").strip()
        )

        unlicensed_count = len(vehicles) - licensed_count

        if licensed_count > max_licensed:
            raise HTTPException(
                status_code=400,
                detail="Licensed vehicle limit exceeded for this plan",
            )

        if unlicensed_count > max_unlicensed:
            raise HTTPException(
                status_code=400,
                detail="Unlicensed vehicle limit exceeded for this plan",
            )

    @staticmethod
    async def _sync_subscription_vehicles(
        subscription_id: str,
        vehicles: list[Vehicle],
        db: AsyncSession,
    ) -> None:
        next_vehicle_ids = {str(vehicle.id) for vehicle in vehicles}

        current_mappings = (
            await db.execute(
                select(UserSubscriptionVehicle).where(
                    UserSubscriptionVehicle.user_subscription_id == subscription_id,
                    UserSubscriptionVehicle.deleted_at.is_(None),
                    UserSubscriptionVehicle.status == SubscriptionStatus.ACTIVE,
                )
            )
        ).scalars().all()

        current_vehicle_ids = {
            str(mapping.vehicle_id)
            for mapping in current_mappings
        }

        vehicle_ids_to_deactivate = current_vehicle_ids - next_vehicle_ids
        vehicle_ids_to_create = next_vehicle_ids - current_vehicle_ids

        if vehicle_ids_to_deactivate:
            await db.execute(
                update(UserSubscriptionVehicle)
                .where(
                    UserSubscriptionVehicle.user_subscription_id == subscription_id,
                    UserSubscriptionVehicle.vehicle_id.in_(vehicle_ids_to_deactivate),
                    UserSubscriptionVehicle.deleted_at.is_(None),
                    UserSubscriptionVehicle.status == SubscriptionStatus.ACTIVE,
                )
                .values(status=SubscriptionStatus.INACTIVE)
            )

        if vehicle_ids_to_create:
            db.add_all(
                [
                    UserSubscriptionVehicle(
                        user_subscription_id=subscription_id,
                        vehicle_id=vehicle_id,
                        status=SubscriptionStatus.ACTIVE,
                    )
                    for vehicle_id in vehicle_ids_to_create
                ]
            )

    @staticmethod
    async def get_subscription_covering_vehicle_for_fee(
        vehicle_id: str,
        db: AsyncSession,
    ) -> tuple[UserSubscription | None, SubscriptionPlan | None, PaymentPlan | None]:
        statement = (
            select(UserSubscription, SubscriptionPlan, PaymentPlan)
            .join(
                UserSubscriptionVehicle,
                UserSubscriptionVehicle.user_subscription_id == UserSubscription.id,
            )
            .outerjoin(SubscriptionPlan, SubscriptionPlan.id == UserSubscription.sub_plan_id)
            .outerjoin(PaymentPlan, PaymentPlan.id == UserSubscription.payment_plan_id)
            .where(
                UserSubscriptionVehicle.deleted_at.is_(None),
                UserSubscriptionVehicle.vehicle_id == vehicle_id,
            )
            .order_by(UserSubscription.created_at.desc())
        )

        row = (await db.execute(statement)).first()

        if row:
            return row[0], row[1], row[2]

        return None, None, None