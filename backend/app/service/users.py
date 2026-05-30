from __future__ import annotations

from datetime import datetime
import math
from typing import List

from app.models.roles import Roles
from app.scripts.seeds import DEFAULT_USERS, DEFAULT_ROLES
from app.utils.pagination import PaginatedResponse
from app.utils.common import build_user_with_roles_stmt, map_users_with_roles
from app.utils.validations import is_valid_domain, normalize_phone_text
from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password
from app.models.auth import UserImportEntry
from app.models.user_roles import UserRoles, UserRolesCreate
from app.models.users import UserWithRoles, Users, UsersCreate, UsersRead, UsersUpdate
from app.service.base import CRUDService
from app.service.roles import roleService
from app.service.user_roles import userRolesService
from app.utils.search import ilike_unaccent
from app.service.parking_access_cards import parkingAccessCardService
from app.enums.parking import ParkingAccessCardHolderType, ParkingAccessCardStatus, UserRoleType
from app.models.parking_access_cards import ParkingAccessCard
from app.models.subscriptions import UserSubscription
from app.enums.parking import SubscriptionStatus

class userService:
    crud = CRUDService(Users, pk_field="user_code")

    @staticmethod
    async def create_user(user_in: UsersCreate, db: AsyncSession) -> Users:

        existing_user = await db.get(Users, user_in.user_code)

        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail={"field": "user_code", "message": f"User code {user_in.user_code} already exists"},
            )

        # Check duplicates for email / phone_number (ignore soft-deleted users)
        email_value = (user_in.email or "").strip() if user_in.email is not None else ""
        if email_value:
            email_stmt = (
                select(Users.user_code)
                .where(Users.deleted_at.is_(None))
                .where(func.lower(Users.email) == func.lower(email_value))
                .limit(1)
            )
            email_existing = (await db.execute(email_stmt)).scalar_one_or_none()
            if email_existing:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail={"field": "email", "message": "Email already exists"},
                )

        phone_value = (user_in.phone_number or "").strip() if user_in.phone_number is not None else ""
        if phone_value:
            phone_stmt = (
                select(Users.user_code)
                .where(Users.deleted_at.is_(None))
                .where(Users.phone_number == phone_value)
                .limit(1)
            )
            phone_existing = (await db.execute(phone_stmt)).scalar_one_or_none()
            if phone_existing:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail={"field": "phone_number", "message": "Phone number already exists"},
                )

        hashed_password = hash_password(user_in.password)

        user = Users(
            user_code=user_in.user_code,
            full_name=user_in.full_name,
            phone_number=user_in.phone_number,
            language_use=user_in.language_use,
            email=user_in.email,
            password=hashed_password,
        )

        db.add(user)

        try:
            await db.flush()
            await parkingAccessCardService.ensure_user_access_card(
                user_code=user_in.user_code,
                db=db,
                holder_type=ParkingAccessCardHolderType.STUDENT,
                initial_status=ParkingAccessCardStatus.DISABLED,
            )

            await db.commit()
        except IntegrityError:
            await db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail={"field": "user_code", "message": "User already exists"},
            )
        
        except Exception as e:
            await db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail={"field": "user_code", "message": "Failed to create user"},
            )

        await db.refresh(user)
        return user
    
    @staticmethod
    async def seed_users(db: AsyncSession) -> list[Users]:
        seeded_users: list[Users] = []
        try:
            role_map: dict[str, Roles] = {}
            for role_def in DEFAULT_ROLES:
                role = await roleService.get_by_code(role_def["role_code"], db)
                if not role:
                    role = Roles(role_code=role_def["role_code"])
                    db.add(role)
                    await db.flush()
                role_map[role.role_code] = role

            for user_def in DEFAULT_USERS:
                existing_user = await db.get(Users, user_def["user_code"])
                password_value = hash_password(user_def["password"])
                if existing_user:
                    existing_user.full_name = user_def["full_name"]
                    existing_user.email = user_def["email"]
                    existing_user.language_use = user_def["language_use"]
                    existing_user.password = password_value
                    user = existing_user
                else:
                    user = Users(
                        user_code=user_def["user_code"],
                        full_name=user_def["full_name"],
                        email=user_def["email"],
                        language_use=user_def["language_use"],
                        password=password_value,
                    )
                    db.add(user)
                    await db.flush()
                
                role_codes = set(user_def.get("roles", []))

                desired_role_ids = [
                    role.id for code, role in role_map.items() if code in role_codes
                ]

                if desired_role_ids:
                    existing_roles_stmt = (
                        select(UserRoles.role_id)
                        .where(UserRoles.user_code == user.user_code)
                        .where(UserRoles.role_id.in_(desired_role_ids))
                    )
                    existing_role_ids = set((await db.execute(existing_roles_stmt)).scalars().all())

                    for role_id in desired_role_ids:
                        if role_id in existing_role_ids:
                            continue
                        db.add(UserRoles(user_code=user.user_code, role_id=role_id))

                if UserRoleType.USER in role_codes:
                    await parkingAccessCardService.ensure_user_access_card(
                        user_code=user.user_code,
                        db=db,
                        holder_type=ParkingAccessCardHolderType.STUDENT,
                        initial_status=ParkingAccessCardStatus.DISABLED,
                    )
                    
                seeded_users.append(user)

            await db.commit()
            for user in seeded_users:
                await db.refresh(user)
            return seeded_users
        except IntegrityError as e:
            await db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Integrity error during seeding: {str(e)}"
            )
        except Exception as e:
            await db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Unexpected error during seeding: {str(e)}"
            )
        
    @staticmethod
    async def get_users(
        db: AsyncSession,
        users_code: str | None = None,
        nameOrEmail: str | None = None,
        phone: str | None = None,
        role: str | None = None,
        is_deleted: bool | None = None,
        page: int = 1,
        limit: int = 5,
    ) -> PaginatedResponse[UserWithRoles]:

        statement = build_user_with_roles_stmt().order_by(Users.user_code)

        filters = []

        if nameOrEmail:
            trimmed = nameOrEmail.strip()
            if trimmed:
                like = f"%{trimmed.lower()}%"
                filters.append(
                    or_(
                        ilike_unaccent(Users.full_name, trimmed),
                        ilike_unaccent(Users.email, like),
                    )
                )

        if users_code:
            filters.append(ilike_unaccent(Users.user_code, users_code))

        if phone:
            normalized = normalize_phone_text(phone)
            if normalized:
                phone_expr = func.coalesce(Users.phone_number, "")
                for symbol in [" ", "-", ".", "(", ")"]:
                    phone_expr = func.replace(phone_expr, symbol, "")
                filters.append(phone_expr.ilike(f"%{normalized}%"))

        if role:
            filters.append(func.lower(Roles.role_code) == role.lower())

        if is_deleted is not None:
            filters.append(
                Users.deleted_at.is_not(None) if is_deleted else Users.deleted_at.is_(None)
            )

        if filters:
            statement = statement.where(*filters)

        # count
        count_stmt = select(func.count()).select_from(statement.subquery())
        total_count = await db.scalar(count_stmt)

        # pagination
        offset = (page - 1) * limit
        statement = statement.offset(offset).limit(limit)

        result = await db.execute(statement)
        rows = result.all()

        users_list = map_users_with_roles(rows)

        return {
            "data": users_list,
            "total": total_count,
            "page": page,
            "limit": limit,
            "total_pages": math.ceil(total_count / limit) or 0,
        }

    @staticmethod
    async def get_user_by_user_code(
        user_code: str, db: AsyncSession
    ) -> UsersRead | None:

        statement = (
            build_user_with_roles_stmt()
            .where(Users.user_code == user_code)
        )

        result = await db.execute(statement)
        rows = result.all()

        if not rows:
            return None

        mapped = map_users_with_roles(rows)[0]

        user = mapped["user"]
        roles = mapped["roles"]

        return UsersRead(
            user_code=user.user_code,
            full_name=user.full_name,
            email=user.email,
            phone_number=user.phone_number,
            language_use=user.language_use,
            roles=roles,
            deleted_at=user.deleted_at,
        )    

    @staticmethod
    async def get_users_by_user_codes(
        user_codes: list[str],
        db: AsyncSession,
    ) -> dict[str, Users]:
        """
        Bulk lookup users by user_code.

        Returns dict keyed by user_code.
        """
        normalized = [c.strip() for c in (user_codes or []) if c and c.strip()]
        if not normalized:
            return {}

        statement = select(Users).where(Users.user_code.in_(normalized))
        result = await db.execute(statement)
        users = result.scalars().all()
        return {u.user_code: u for u in users}

    @staticmethod
    async def get_users_by_emails(
        emails: list[str],
        db: AsyncSession,
    ) -> dict[str, str]:
        """
        Bulk lookup users by email.

        Returns dict keyed by lowercased email -> user_code.
        """
        normalized = [e.strip().lower() for e in (emails or []) if e and e.strip()]
        if not normalized:
            return {}

        statement = select(Users.user_code, Users.email).where(
            Users.deleted_at.is_(None),
            func.lower(func.coalesce(Users.email, "")).in_(normalized),
        )
        result = await db.execute(statement)
        rows = result.all()
        mapping: dict[str, str] = {}
        for user_code, email in rows:
            if not email:
                continue
            mapping[str(email).strip().lower()] = str(user_code)
        return mapping
    
    @staticmethod
    async def update_user(user_code: str, user_in: UsersUpdate, db: AsyncSession) -> Users:
        user = await userService.crud.get(db, user_code)
        update_data = user_in.dict(exclude_unset=True, exclude_none=True)
        if 'password' in update_data:
            update_data['password'] = hash_password(update_data.pop('password'))
        for field, value in update_data.items():
            setattr(user, field, value)
        await db.commit()
        await db.refresh(user)
        return user

    @staticmethod
    async def delete_user(user_code: str, db: AsyncSession) -> Users:
        user = await userService.crud.get(db, user_code)
        if user.deleted_at is None:
            now = datetime.utcnow()
            user.deleted_at = now

            # Soft-delete / disable access cards for this user
            await db.execute(
                ParkingAccessCard.__table__.update()
                .where(ParkingAccessCard.user_code == user_code)
                .values(
                    deleted_at=now,
                    status=ParkingAccessCardStatus.DISABLED,
                )
            )

            # Mark user subscriptions as INACTIVE
            await db.execute(
                UserSubscription.__table__.update()
                .where(UserSubscription.user_code == user_code)
                .values(status=SubscriptionStatus.INACTIVE)
            )

            await db.commit()
            await db.refresh(user)
        return user

    @staticmethod
    async def reactivate_user(user_code: str, db: AsyncSession) -> Users:
        user = await userService.crud.get(db, user_code)
        if user.deleted_at is not None:
            user.deleted_at = None

            # Restore ONLY the most recent soft-deleted access card for this user
            latest_deleted_card_id = await db.scalar(
                select(ParkingAccessCard.id)
                .where(ParkingAccessCard.user_code == user_code)
                .where(ParkingAccessCard.deleted_at.is_not(None))
                .order_by(ParkingAccessCard.updated_at.desc(), ParkingAccessCard.created_at.desc())
                .limit(1)
            )
            if latest_deleted_card_id:
                await db.execute(
                    ParkingAccessCard.__table__.update()
                    .where(ParkingAccessCard.id == latest_deleted_card_id)
                    .values(
                        deleted_at=None,
                        status=ParkingAccessCardStatus.ASSIGNED,
                    )
                )

            # Reactivate ONLY the most recent INACTIVE subscription for this user
            latest_inactive_sub_id = await db.scalar(
                select(UserSubscription.id)
                .where(UserSubscription.user_code == user_code)
                .where(UserSubscription.status == SubscriptionStatus.INACTIVE)
                .order_by(UserSubscription.updated_at.desc(), UserSubscription.created_at.desc())
                .limit(1)
            )
            if latest_inactive_sub_id:
                await db.execute(
                    UserSubscription.__table__.update()
                    .where(UserSubscription.id == latest_inactive_sub_id)
                    .values(status=SubscriptionStatus.ACTIVE)
                )

            await db.commit()
            await db.refresh(user)
        return user

    @staticmethod
    async def import_users(entries: List[UserImportEntry], role_code: str, db: AsyncSession) -> List[Users]:
        normalized_code = (role_code or "").strip().lower() or "user"
        role = await roleService.get_or_create(normalized_code, db)
        user_role = await userService._ensure_user_role(db)
        user_role_id = user_role.id
        role_id = role.id
        imported: List[Users] = []
        skipped = 0

        if not entries:
            return imported

        existing_users_by_email = await userService.get_users_by_emails(
            [entry.email for entry in entries],
            db,
        )
        existing_users_by_code = await userService.get_users_by_user_codes(
            [entry.user_code for entry in entries],
            db,
        )

        for entry in entries:
            user_code = entry.user_code.strip()
            if not user_code:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User code is required")
            if not entry.email:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email is required")

            email = entry.email.strip()
            phone_number = entry.phone_number.strip() if entry.phone_number else None
            if not is_valid_domain(email):
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid domain for {email}")

            lower_email = email.lower()
            user = existing_users_by_code.get(user_code)
            conflict_user_code = existing_users_by_email.get(lower_email) if user is None else None
            if conflict_user_code and conflict_user_code != user_code:
                skipped += 1
                continue 

            payload = UsersCreate(
                user_code=user_code,
                full_name=entry.full_name.strip() or user_code,
                email=email,
                phone_number=phone_number,
                password=user_code,
            )
            user = await userService.create_user(payload, db)
            existing_users_by_code[user_code] = user
            existing_users_by_email[lower_email] = user

            if phone_number:
                user.phone_number = phone_number
            user_identifier = user.user_code
            for target_role_id in (role_id, user_role_id):
                try:
                    await userRolesService.assign_role(
                        UserRolesCreate(user_code=user_identifier, role_id=target_role_id),
                        db,
                    )
                except HTTPException as exc:
                    if exc.status_code != status.HTTP_409_CONFLICT:
                        raise
            imported.append(user)
        return imported

    @staticmethod
    async def _ensure_user_role(db: AsyncSession) -> Roles:
        """
        Ensure the baseline USER role exists.

        Import flow assigns both the requested role (e.g. "student") and the baseline "user" role.
        """
        return await roleService.get_or_create("user", db)
