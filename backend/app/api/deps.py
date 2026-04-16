from __future__ import annotations

from fastapi import Cookie, Depends, Header, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import decode_access_token
from app.db.session import get_db
from app.models.auth import AuthUser
from app.service.auth import authService


def _extract_token_from_header(authorization: str | None) -> str | None:
    if not authorization:
        return None
    try:
        scheme, token = authorization.split(" ", 1)
    except ValueError:
        print("Malformed authorization header:", authorization)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Malformed authorization header")
    if scheme.lower() != "bearer":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication scheme")
    return token


async def get_access_token(
    authorization: str | None = Header(None),
    access_token: str | None = Cookie(None),
) -> str:
    token = _extract_token_from_header(authorization)
    if token:
        return token
    if access_token:
        return access_token
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")


async def get_current_user(token: str = Depends(get_access_token), db: AsyncSession = Depends(get_db)) -> AuthUser:
    payload = decode_access_token(token)
    user, roles = await authService.get_user_and_roles_from_token(payload, db)
    if user.deleted_at is not None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Deleted user")
    return AuthUser(
        user_code=user.user_code,
        full_name=user.full_name,
        email=user.email,
        roles=roles,
    )
