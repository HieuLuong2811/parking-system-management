from sqlalchemy.ext.asyncio import AsyncSession

from app.models.auth import AuthUser, LoginRequest, TokenResponse
from app.service.auth import authService


class AuthController:
    @staticmethod
    async def login_ctrl(login_in: LoginRequest, db: AsyncSession) -> TokenResponse:
        user, roles = await authService.authenticate_user(login_in.user_code, login_in.password, db)
        access_token, expires_at = authService.create_token(user.user_code, roles)
        return TokenResponse(
            access_token=access_token,
            expires_at=expires_at,
            user_code=user.user_code,
            roles=roles,
        )

    @staticmethod
    async def me_ctrl(current_user: AuthUser) -> AuthUser:
        return current_user
