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


class subscriptionService:
    crud = CRUDService(UserSubscription)

    @staticmethod
    async def _inactivate_existing_active_subscriptions(
        user_code: str, db: AsyncSession
    ) -> None:
        # Mark any existing ACTIVE subscriptions as INACTIVE before creating a new one.
        existing = (
            await db.execute(
                select(UserSubscription.id).where(
                    UserSubscription.user_code == user_code,
                    UserSubscription.status == SubscriptionStatus.ACTIVE,
                )
            )
        ).scalars().all()

        if not existing:
            return

        await db.execute(
            update(UserSubscription)
            .where(UserSubscription.id.in_(existing))
            .values(status=SubscriptionStatus.INACTIVE)
        )

        await db.execute(
            update(UserSubscriptionVehicle)
            .where(
                UserSubscriptionVehicle.user_subscription_id.in_(existing),
                UserSubscriptionVehicle.deleted_at.is_(None),
                UserSubscriptionVehicle.status == SubscriptionStatus.ACTIVE,
            )
            .values(status=SubscriptionStatus.INACTIVE)
        )

    @staticmethod
    async def create_subscription(payload: UserSubscriptionCreate, db: AsyncSession) -> UserSubscription:
        await subscriptionService._inactivate_existing_active_subscriptions(payload.user_code, db)

        # Backward compatible: if client still sends single `vehicle_id`, accept it.
        vehicle_ids = payload.vehicle_ids or ([] if payload.vehicle_id is None else [payload.vehicle_id])

        # Validate ownership + plan limits (new package-based policy only when configured on plan).
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

        # `vehicle_id` / `vehicle_ids` are not stored on `user_subscriptions` table anymore.
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

        # New mapping table preferred by new logic.
        if vehicle_ids:
            mappings = [
                UserSubscriptionVehicle(
                    user_subscription_id=subscription.id,
                    vehicle_id=vehicle_id,
                    status=subscription.status,
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
    def subscription_grants_parking_benefit(subscription: UserSubscription | None) -> bool:
        if not subscription:
            return False
        if subscription.status != SubscriptionStatus.ACTIVE:
            return False
        today = getattr(subscription, "start_date", None)
        # Dates on subscription are required by schema; keep defensive guards.
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
    ) -> list[UserSubscriptionAdminView]:
        filters = [UserSubscription.user_code == user_code]
        if status is not None:
            filters.append(UserSubscription.status == status)

        statement = subscriptionService._build_detail_statement(user_code, ordered=True).where(*filters)
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
    async def update_subscription_for_user(
        subscription_id: str, payload: UserSubscriptionUpdate, db: AsyncSession, current_user: AuthUser
    ) -> UserSubscription:
        subscription = await subscriptionService.crud.get(db, subscription_id)

        if is_admin_user(current_user):
            return await subscriptionService.crud.update(db, subscription_id, payload)

        if subscription.user_code != current_user.user_code:
            raise HTTPException(status_code=403, detail="Not allowed to update this subscription")

        update_data = (
            payload.model_dump(exclude_unset=True)
            if hasattr(payload, "model_dump")
            else payload.dict(exclude_unset=True)
        )
        if not update_data:
            return subscription

        allowed_fields = {"vehicle_id", "vehicle_ids"}
        if any(key not in allowed_fields for key in update_data.keys()):
            raise HTTPException(status_code=403, detail="Only vehicle_id / vehicle_ids can be updated")

        vehicle_ids = update_data.get("vehicle_ids")
        if vehicle_ids is not None:
            if not isinstance(vehicle_ids, list):
                raise HTTPException(status_code=400, detail="vehicle_ids must be a list")

            vehicle_ids = [str(v) for v in vehicle_ids if v]
            vehicle_ids = list(dict.fromkeys(vehicle_ids))

            if len(vehicle_ids) == 0:
                raise HTTPException(status_code=400, detail="vehicle_ids must not be empty")

            vehicles = (
                (await db.execute(select(Vehicle).where(Vehicle.id.in_(vehicle_ids))))
            ).scalars().all()
            if len(vehicles) != len(vehicle_ids):
                raise HTTPException(status_code=400, detail="One or more vehicles not found")
            if any(getattr(v, "deleted_at", None) is not None for v in vehicles):
                raise HTTPException(status_code=400, detail="One or more vehicles were deleted")
            if any(v.user_code != current_user.user_code for v in vehicles):
                raise HTTPException(status_code=403, detail="One or more vehicles do not belong to current user")

            plan = await db.get(SubscriptionPlan, subscription.sub_plan_id)
            if plan:
                max_licensed = int(getattr(plan, "max_licensed_vehicle", 0) or 0)
                max_unlicensed = int(getattr(plan, "max_unlicensed_vehicle", 0) or 0)

                licensed_count = sum(1 for v in vehicles if (v.license_plate or "").strip())
                unlicensed_count = len(vehicles) - licensed_count

                if max_licensed and licensed_count > max_licensed:
                    raise HTTPException(status_code=400, detail="Licensed vehicle limit exceeded for this plan")
                if max_unlicensed and unlicensed_count > max_unlicensed:
                    raise HTTPException(status_code=400, detail="Unlicensed vehicle limit exceeded for this plan")

            # Replace current ACTIVE mappings with the selected vehicles.
            await db.execute(
                update(UserSubscriptionVehicle)
                .where(
                    UserSubscriptionVehicle.user_subscription_id == subscription.id,
                    UserSubscriptionVehicle.deleted_at.is_(None),
                    UserSubscriptionVehicle.status == SubscriptionStatus.ACTIVE,
                )
                .values(status=SubscriptionStatus.INACTIVE)
            )

            db.add_all(
                [
                    UserSubscriptionVehicle(
                        user_subscription_id=subscription.id,
                        vehicle_id=vehicle.id,
                        status=SubscriptionStatus.ACTIVE,
                    )
                    for vehicle in vehicles
                ]
            )
            await db.flush()
            return subscription

        vehicle_id = update_data.get("vehicle_id")
        if not vehicle_id:
            return subscription

        if subscription.status != SubscriptionStatus.ACTIVE:
            raise HTTPException(status_code=400, detail="Can only change vehicle for active subscriptions")

        # New vehicle must exist, belong to user, and have a license plate.
        next_vehicle = await db.get(Vehicle, vehicle_id)
        if not next_vehicle or getattr(next_vehicle, "deleted_at", None) is not None:
            raise HTTPException(status_code=404, detail="Vehicle not found")
        if next_vehicle.user_code != current_user.user_code:
            raise HTTPException(status_code=403, detail="Vehicle does not belong to current user")
        if not (next_vehicle.license_plate or "").strip():
            raise HTTPException(status_code=400, detail="Vehicle must have a license plate")

        # Find current ACTIVE covered vehicles for this subscription.
        covered = (
            await db.execute(
                select(Vehicle)
                .join(UserSubscriptionVehicle, UserSubscriptionVehicle.vehicle_id == Vehicle.id)
                .where(
                    UserSubscriptionVehicle.user_subscription_id == subscription.id,
                    UserSubscriptionVehicle.deleted_at.is_(None),
                    UserSubscriptionVehicle.status == SubscriptionStatus.ACTIVE,
                    Vehicle.deleted_at.is_(None),
                )
            )
        ).scalars().all()

        # Only allow switching the licensed vehicle among the covered vehicles. Unlicensed slot stays unchanged.
        current_licensed = next((v for v in covered if (v.license_plate or "").strip()), None)
        if current_licensed is None:
            raise HTTPException(status_code=400, detail="This subscription has no licensed vehicle to change")
        if str(current_licensed.id) == str(vehicle_id):
            return subscription

        # Prevent switching to a vehicle already covered by this subscription.
        if any(str(v.id) == str(vehicle_id) for v in covered):
            raise HTTPException(status_code=400, detail="Vehicle is already covered by this subscription")

        # Enforce single-vehicle-at-a-time rule: cannot switch if another vehicle is currently using the subscription.
        conflict = await subscriptionService.get_active_session_using_subscription(
            str(subscription.id), db, exclude_vehicle_id=str(current_licensed.id)
        )
        if conflict is not None:
            raise HTTPException(status_code=400, detail="Subscription is currently being used by another vehicle")

        # Mark old mapping INACTIVE and attach new mapping ACTIVE.
        await db.execute(
            update(UserSubscriptionVehicle)
            .where(
                UserSubscriptionVehicle.user_subscription_id == subscription.id,
                UserSubscriptionVehicle.vehicle_id == current_licensed.id,
                UserSubscriptionVehicle.deleted_at.is_(None),
                UserSubscriptionVehicle.status == SubscriptionStatus.ACTIVE,
            )
            .values(status=SubscriptionStatus.INACTIVE)
        )
        db.add(
            UserSubscriptionVehicle(
                user_subscription_id=subscription.id,
                vehicle_id=vehicle_id,
                status=SubscriptionStatus.ACTIVE,
            )
        )
        await db.flush()
        return subscription

    @staticmethod
    async def delete_subscription(subscription_id: str, db: AsyncSession) -> UserSubscription:
        return await subscriptionService.crud.delete(db, subscription_id)
