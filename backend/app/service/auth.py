from __future__ import annotations

from datetime import datetime
from typing import List, Tuple

from app.core.security import create_access_token, verify_password
from app.models.auth import TokenPayload
from app.models.users import UsersUpdate
from app.service.user_roles import userRolesService
from app.service.users import userService
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession


class authService:
    @staticmethod
    async def authenticate_user( user_code: str, password: str, db: AsyncSession) -> tuple[Users, list[str]]:
        user = await userService.crud.get(db, user_code)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
                
        if user.deleted_at is not None:
            raise HTTPException(
                # Hide existence of disabled/deleted accounts.
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Tài khoản không tồn tại"
            )

        if not verify_password(password, user.password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User code or password is incorrect"
            )

        user_roles = await userRolesService.get_roles_for_user(user_code, db)
        if not user_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User has no roles assigned"
            )
        return user, user_roles

    @staticmethod
    def create_token(user_code: str, roles: List[str]) -> Tuple[str, datetime]:
        return create_access_token(user_code, roles)

    @staticmethod
    async def get_user_and_roles_from_token(payload: TokenPayload, db: AsyncSession) -> tuple[Users, List[str]]:
        user = await userService.crud.get(db, payload.user_code)
        roles = payload.roles or await userRolesService.get_roles_for_user(payload.user_code, db)
        return user, roles

    @staticmethod
    async def change_password(user_code: str, current_password: str, new_password: str, db: AsyncSession) -> None:
        user = await userService.crud.get(db, user_code)
        if not verify_password(current_password, user.password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect",
            )
        await userService.update_user(user_code, UsersUpdate(password=new_password), db)
