from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.controller.auth import AuthController
from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.auth import AuthUser, LoginRequest, TokenResponse

router = APIRouter(tags=["Authentication"])


@router.post("/auth/login", response_model=TokenResponse)
async def login(login_in: LoginRequest, db: AsyncSession = Depends(get_db)):
    return await AuthController.login_ctrl(login_in, db)


@router.get("/auth/me", response_model=AuthUser)
async def me(current_user: AuthUser = Depends(get_current_user)):
    return await AuthController.me_ctrl(current_user)
