from fastapi import APIRouter, Depends, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.controller.auth import AuthController
from app.api.deps import get_current_user
from app.db.session import get_db
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

router = APIRouter(tags=["Authentication"])


@router.post("/auth/login", response_model=AuthCodeResponse)
async def login(
    login_in: LoginRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    return await AuthController.login_ctrl(login_in, db, response)

@router.post("/auth/exchange-code", response_model=TokenResponse)
async def exchange_code(
    exchange_in: ExchangeCodeRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    return await AuthController.exchange_code_ctrl(exchange_in, db, response)


@router.get("/auth/me", response_model=AuthUser)
async def me(current_user: AuthUser = Depends(get_current_user)):
    return await AuthController.me_ctrl(current_user)


@router.post("/auth/logout")
async def logout(
    response: Response,
    current_user: AuthUser = Depends(get_current_user),
) -> dict[str, str]:
    return await AuthController.logout_ctrl(response)


@router.post("/auth/change-password")
async def change_password(
    payload: ChangePasswordRequest,
    current_user: AuthUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await AuthController.change_password_ctrl(current_user, payload, db)


@router.post("/auth/forgot-password/request", response_model=ForgotPasswordRequestResponse)
async def forgot_password_request(
    payload: ForgotPasswordRequest,
    db: AsyncSession = Depends(get_db),
):
    return await AuthController.forgot_password_request_ctrl(payload, db)


@router.post("/auth/forgot-password/verify")
async def forgot_password_verify(
    payload: ForgotPasswordVerifyRequest,
    db: AsyncSession = Depends(get_db),
):
    return await AuthController.forgot_password_verify_ctrl(payload, db)


@router.post("/auth/forgot-password/reset")
async def forgot_password_reset(
    payload: ForgotPasswordResetRequest,
    db: AsyncSession = Depends(get_db),
):
    return await AuthController.forgot_password_reset_ctrl(payload, db)
