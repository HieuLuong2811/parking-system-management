from __future__ import annotations

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import decode_access_token
from app.db.session import get_db
from app.models.auth import AuthUser, TokenPayload
from app.service.auth import authService

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)) -> AuthUser:
    payload = decode_access_token(token)
    user, roles = await authService.get_user_and_roles_from_token(payload, db)
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user")
    return AuthUser(
        user_code=user.user_code,
        full_name=user.full_name,
        email=user.email,
        roles=roles,
        is_active=user.is_active,
    )
