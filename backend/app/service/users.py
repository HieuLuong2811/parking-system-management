from __future__ import annotations

from typing import List

from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password
from app.models.auth import UserImportEntry
from app.models.user_roles import UserRolesCreate
from app.models.users import Users, UsersCreate, UsersUpdate
from app.service.base import CRUDService
from app.service.roles import roleService
from app.service.user_roles import userRolesService


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
            is_active=user_in.is_active,
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
    async def get_all_users(db: AsyncSession) -> list[Users]:
        return await userService.crud.get_all(db)
    
    @staticmethod
    async def get_user_by_user_code(user_code: str, db: AsyncSession) -> Users:
        user = await db.get(Users, user_code)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user
    
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
        return await userService.crud.delete(db, user_code)

    @staticmethod
    async def import_users(entries: List[UserImportEntry], role_code: str, db: AsyncSession) -> List[Users]:
        normalized_code = role_code.strip().upper()
        friendly_name = normalized_code.capitalize() if normalized_code else role_code
        role = await roleService.get_or_create(normalized_code, friendly_name, db)
        imported: List[Users] = []
        for entry in entries:
            payload = UsersCreate(
                user_code=entry.user_code,
                full_name=entry.full_name,
                email=entry.email,
                password=entry.user_code,
            )
            try:
                user = await userService.create_user(payload, db)
            except HTTPException as exc:
                if exc.status_code == status.HTTP_409_CONFLICT:
                    user = await userService.crud.get(db, entry.user_code)
                else:
                    raise
            try:
                await userRolesService.assign_role(
                    UserRolesCreate(user_code=user.user_code, role_id=role.id),
                    db,
                )
            except HTTPException as exc:
                if exc.status_code != status.HTTP_409_CONFLICT:
                    raise
            imported.append(user)
        return imported
