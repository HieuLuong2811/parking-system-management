from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.models.user_roles import UserRolesCreate, UserRolesRead
from app.api.controller.use_roles import UserRolesController
import uuid
router = APIRouter(prefix="/userRoles", tags=["user_roles"])

@router.post("/", response_model=UserRolesRead)
async def create_user(
    userRoles_in: UserRolesCreate,
    db: AsyncSession = Depends(get_db)
):
    return await UserRolesController.create_user_roles_ctrl(userRoles_in, db)

@router.get("/", response_model=list[UserRolesRead])
async def get_all_users(db: AsyncSession = Depends(get_db)):
    userRoles = await UserRolesController.get_all_user_roles_ctrl(db)
    if not userRoles:
        raise HTTPException(status_code=404, detail="No user roles found")
    return userRoles
