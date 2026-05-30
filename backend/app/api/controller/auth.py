from datetime import datetime

from fastapi import Response
from fastapi import HTTPException, status
from app.utils.email import generate_password_reset_code_email, send_email
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.auth import (
    AuthCodeResponse,
    AuthUser,
    ChangePasswordRequest,
    ExchangeCodeRequest,
    ForgotPasswordRequest,
    ForgotPasswordRequestResponse,
    ForgotPasswordResetRequest,
    ForgotPasswordVerifyRequest,
    LoginRequest,
    TokenResponse,
)
from app.service.auth import authService
from app.service.auth_codes import AuthCodeStore
from app.service.auth_verification_requests import authVerificationRequestService
from app.service.users import userService
import secrets
from app.models.users import UsersUpdate


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
        # Ensure the access token cookie is removed across common attribute combinations.
        # Some browsers/proxies can behave inconsistently if the deletion cookie doesn't
        # include the same attributes used when setting it (Secure/SameSite).
        response.delete_cookie(key="access_token", path="/")
        response.delete_cookie(key="access_token", path="/", samesite="none", secure=True)
        response.delete_cookie(key="access_token", path="/", samesite="lax")
        response.set_cookie(
            key="access_token",
            value="",
            httponly=True,
            samesite="None",
            secure=True,
            path="/",
            max_age=0,
            expires=0,
        )
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

    @staticmethod
    async def forgot_password_request_ctrl(
        payload: ForgotPasswordRequest,
        db: AsyncSession,
    ) -> ForgotPasswordRequestResponse:
        user_code = (payload.user_code or "").strip()
        if not user_code:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User code is required")

        user = await userService.crud.get(db, user_code)
        if not user or user.deleted_at is not None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User code or email is incorrect")

        if not user.email or user.email.strip().lower() != payload.email.strip().lower():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User code or email is incorrect")

        raw_code = f"{secrets.randbelow(1_000_000):06d}"
        created = await authVerificationRequestService.request_code(
            db,
            user_code=user.user_code,
            verification_type="RESET_PASSWORD",
            raw_code=raw_code,
        )

        email_data = generate_password_reset_code_email(
            email_to=user.email,
            user_name=user.full_name or user.user_code,
            user_code=user.user_code,
            code=raw_code,
            ttl_seconds=authVerificationRequestService.policy.ttl_seconds,
            lang=getattr(user, "language_use", None),
        )
        await send_email(user.email, email_data)

        return ForgotPasswordRequestResponse(
            expires_at=created.expires_at,
            ttl_seconds=authVerificationRequestService.policy.ttl_seconds,
            throttle_seconds=authVerificationRequestService.policy.throttle_seconds,
        )

    @staticmethod
    async def forgot_password_verify_ctrl(
        payload: ForgotPasswordVerifyRequest,
        db: AsyncSession,
    ) -> dict[str, bool]:
        ok = await authVerificationRequestService.check_code(
            db,
            user_code=payload.user_code.strip(),
            verification_type="RESET_PASSWORD",
            raw_code=payload.code.strip(),
        )
        return {"valid": ok}

    @staticmethod
    async def forgot_password_reset_ctrl(
        payload: ForgotPasswordResetRequest,
        db: AsyncSession,
    ) -> dict[str, str]:
        user_code = (payload.user_code or "").strip()
        if not user_code:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User code is required")

        ok = await authVerificationRequestService.verify_code(
            db,
            user_code=user_code,
            verification_type="RESET_PASSWORD",
            raw_code=payload.code.strip(),
        )
        if not ok:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired verification code")

        user = await userService.crud.get(db, user_code)
        if not user or user.deleted_at is not None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid user")

        await userService.update_user(user_code, UsersUpdate(password=payload.new_password), db)
        return {"detail": "password reset"}
