from __future__ import annotations

from datetime import datetime
import math
import re
from typing import List

from app.models.roles import Roles, RolesCreate
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
from app.models.users import UserWithRoles, Users, UsersCreate, UsersRead, UsersUpdate, RoleSummary
from app.service.base import CRUDService
from app.service.roles import roleService
from app.service.user_roles import userRolesService
from app.utils.search import ilike_unaccent
from app.service.parking_access_cards import parkingAccessCardService
from app.enums.parking import ParkingAccessCardHolderType, ParkingAccessCardStatus, UserRoleType

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

                for role_code in role_codes:
                    role = role_map.get(role_code)
                    if not role:
                        continue
                    user_role_result = await db.execute(
                        select(UserRoles).where(
                            UserRoles.user_code == user.user_code,
                            UserRoles.role_id == role.id,
                        )
                    )
                    if user_role_result.scalar_one_or_none():
                        continue
                    db.add(UserRoles(user_code=user.user_code, role_id=role.id))

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
    async def get_users_by_user_codes(
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
            user.deleted_at = datetime.utcnow()
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
            if user is None:
                conflict_user_code = existing_users_by_email.get(lower_email)
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
