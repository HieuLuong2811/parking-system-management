from fastapi import Depends, HTTPException, status
from app.models.auth import AuthUser
from app.api.deps import get_current_user

ADMIN = "admin"
USER = "user"
SECURITY = "security"

ALLOWED_ROLES = {ADMIN, USER, SECURITY}

def required_roles(*roles: str):
    allowed_roles = set(roles or ALLOWED_ROLES)

    async def decorator(current_user: AuthUser = Depends(get_current_user)):
        if not allowed_roles & set(current_user.roles):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
        return current_user
    return decorator