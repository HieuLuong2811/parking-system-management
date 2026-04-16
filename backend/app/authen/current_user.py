from fastapi import Depends, HTTPException, status
from app.models.auth import AuthUser
from app.api.deps import get_current_user

ALLOWED_ROLES = {"ADMIN", "USER", "SECURITY"}


def _normalize_roles(roles: list[str]) -> set[str]:
    return {role.strip().upper() for role in roles if role}


def is_admin_user(user: AuthUser) -> bool:
    return "ADMIN" in _normalize_roles(user.roles)


def required_roles(*roles: str):
    required = _normalize_roles(list(roles))

    async def decorator(current_user: AuthUser = Depends(get_current_user)):
        user_roles = _normalize_roles(current_user.roles)
        if not ALLOWED_ROLES & user_roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
        if required and not (required & user_roles):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient privileges")
        return current_user

    return decorator
