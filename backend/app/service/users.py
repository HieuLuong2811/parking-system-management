from __future__ import annotations

from datetime import datetime
import math
import re
from typing import List

from app.models.roles import Roles, RolesCreate
from app.scripts.seeds import DEFAULT_USERS, DEFAULT_ROLES
from app.utils.pagination import PaginatedResponse
from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password
from app.models.auth import UserImportEntry
from app.models.user_roles import UserRoles, UserRolesCreate
from app.models.users import UserWithRoles, Users, UsersCreate, UsersUpdate, RoleSummary
from app.service.base import CRUDService
from app.service.roles import roleService
from app.service.user_roles import userRolesService
from app.utils.search import ilike_unaccent

DOMAIN_REGEX = re.compile(r"^[a-z0-9-]+(?:\.[a-z0-9-]+)+$")


def is_valid_domain(email: str) -> bool:
    domain_part = email.split("@", 1)[-1].strip().lower()
    return bool(domain_part and DOMAIN_REGEX.fullmatch(domain_part))


def normalize_phone_text(value: str) -> str:
    return "".join(ch for ch in value if ch.isdigit())


class userService:
    crud = CRUDService(Users, pk_field="user_code")

    @staticmethod
    async def create_user(user_in: UsersCreate, db: AsyncSession) -> Users:

        existing_user = await db.get(Users, user_in.user_code)

        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"User with code {user_in.user_code} already exists"
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
            await db.commit()
        except IntegrityError:
            await db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="User already exists"
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
                    role = Roles(role_code=role_def["role_code"], role_name=role_def["role_name"])
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

                for role_code in user_def.get("roles", []):
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
    async def get_all_users(db: AsyncSession) -> list[Users]:
        return await userService.get_users(db)

    @staticmethod
    async def get_users(
        db: AsyncSession,
        search: str | None = None,
        phone: str | None = None,
        role: str | None = None,
        is_deleted: bool | None = None,
        page: int = 1,
        limit: int = 5,
    ) -> PaginatedResponse[UserWithRoles]:
        statement = (
            select(Users, Roles)
            .join(UserRoles, UserRoles.user_code == Users.user_code)
            .join(Roles, Roles.id == UserRoles.role_id)
            .order_by(Users.user_code)
        )

        filters = []
        if search:
            trimmed_search = search.strip()
            if trimmed_search:
                like_pattern = f"%{trimmed_search.lower()}%"
                filters.append(
                    or_(
                        func.lower(Users.user_code).ilike(like_pattern),
                        ilike_unaccent(Users.full_name, trimmed_search),
                        func.lower(Users.email).ilike(like_pattern),
                    )
                )
        if phone:
            normalized_phone = normalize_phone_text(phone)
            if normalized_phone:
                phone_expr = func.coalesce(Users.phone_number, "")
                for symbol in [" ", "-", ".", "(", ")"]:
                    phone_expr = func.replace(phone_expr, symbol, "")
                filters.append(phone_expr.ilike(f"%{normalized_phone}%"))
        if role:
            filters.append(func.lower(Roles.role_code) == role.lower())
        if is_deleted is not None:
            if is_deleted:
                filters.append(Users.deleted_at.is_not(None))
            else:
                filters.append(Users.deleted_at.is_(None))

        if filters:
            statement = statement.where(*filters)
        
        count_stmt = select(func.count()).select_from(statement.subquery())
        total_count = await db.scalar(count_stmt)
        offset = (page - 1) * limit
        statement = statement.offset(offset).limit(limit)

        result = await db.execute(statement)
        rows = result.all()

        users_dict = {}
        for user, role in rows:
            if user.user_code not in users_dict:
                users_dict[user.user_code] = {"user": user, "roles": []}
            users_dict[user.user_code]["roles"].append(RoleSummary(id=role.id, role_code=role.role_code))

        users_list = list(users_dict.values())
        total_pages = math.ceil(total_count / limit) or 0
        
        return {
            "data": users_list,
            "total": total_count,
            "page": page,
            "limit": limit,
            "total_pages": total_pages
        }
    
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
    async def get_users_by_emails(emails: List[str], db: AsyncSession) -> dict[str, str]:
        normalized_emails = {email.strip().lower() for email in emails if email and email.strip()}
        if not normalized_emails:
            return {}
        statement = select(Users.user_code, Users.email).where(func.lower(Users.email).in_(normalized_emails))
        result = await db.execute(statement)
        return {email.lower(): user_code for user_code, email in result.all()}

    @staticmethod
    async def get_users_by_user_codes(user_codes: List[str], db: AsyncSession) -> dict[str, Users]:
        normalized_codes = {code.strip() for code in user_codes if code and code.strip()}
        if not normalized_codes:
            return {}
        statement = select(Users).where(Users.user_code.in_(normalized_codes))
        result = await db.execute(statement)
        return {user.user_code: user for user in result.scalars().all()}

    @staticmethod
    async def _ensure_user_role(db: AsyncSession) -> Roles:
        existing_role = await roleService.get_by_code("user", db)
        if existing_role:
            return existing_role
        return await roleService.create_role(RolesCreate(role_code="user", role_name="User"), db)

    @staticmethod
    async def import_users(entries: List[UserImportEntry], role_code: str, db: AsyncSession) -> List[Users]:
        normalized_code = (role_code or "").strip().lower() or "user"
        friendly_name = "User" if normalized_code == "user" else normalized_code.capitalize()
        role = await roleService.get_or_create(normalized_code, friendly_name, db)
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
