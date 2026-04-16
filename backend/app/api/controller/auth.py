from datetime import datetime

from fastapi import Response
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.auth import (
    AuthCodeResponse,
    AuthUser,
    ChangePasswordRequest,
    ExchangeCodeRequest,
    LoginRequest,
    TokenResponse,
)
from app.service.auth import authService
from app.service.auth_codes import AuthCodeStore


class AuthController:
    auth_code_store: AuthCodeStore | None = None

    @classmethod
    def init_auth_code_store(cls, store: AuthCodeStore) -> None:
        cls.auth_code_store = store

    @staticmethod
    async def login_ctrl(login_in: LoginRequest, db: AsyncSession, response: Response) -> AuthCodeResponse:
        user, roles = await authService.authenticate_user(login_in.user_code, login_in.password, db)
        if not AuthController.auth_code_store:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Auth code store not initialized")
        code, code_expires_at = await AuthController.auth_code_store.create_code(user.user_code, roles)
        return AuthCodeResponse(code=code, expires_at=code_expires_at, user_code=user.user_code, roles=roles)

    @staticmethod
    async def exchange_code_ctrl(exchange_in: ExchangeCodeRequest, db: AsyncSession, response: Response) -> TokenResponse:
        if not AuthController.auth_code_store:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Auth code store not initialized")
        data = await AuthController.auth_code_store.exchange_code(exchange_in.code)
        if not data:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid code")

        access_token, expires_at = authService.create_token(data.user_code, data.roles)
        max_age = int((expires_at - datetime.utcnow()).total_seconds())
        if max_age < 0:
            max_age = 0
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            samesite="None",
            secure=True,
            path="/",
            max_age=max_age,
        )
        return TokenResponse(access_token=access_token, expires_at=expires_at, user_code=data.user_code, roles=data.roles)

    @staticmethod
    async def logout_ctrl(response: Response) -> dict[str, str]:
        response.delete_cookie("access_token", path="/")
        return {"detail": "logged out"}

    @staticmethod
    async def me_ctrl(current_user: AuthUser) -> AuthUser:
        return current_user

    @staticmethod
    async def change_password_ctrl(
        current_user: AuthUser,
        payload: ChangePasswordRequest,
        db: AsyncSession,
    ) -> dict[str, str]:
        await authService.change_password(current_user.user_code, payload.current_password, payload.new_password, db)
        return {"detail": "password updated"}
