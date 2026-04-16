from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.models.responses import DeleteResponse
from app.models.user_roles import UserRolesCreate, UserRolesRead
from app.api.controller.user_roles import UserRolesController
router = APIRouter(prefix="/user_roles", tags=["user_roles"])

@router.post("/", response_model=UserRolesRead)
async def create_user(
    userRoles_in: UserRolesCreate,
    db: AsyncSession = Depends(get_db)
):
    return await UserRolesController.assign_user_role_ctrl(userRoles_in, db)

@router.get("/", response_model=list[UserRolesRead])
async def get_all_users(db: AsyncSession = Depends(get_db)):
    userRoles = await UserRolesController.get_all_user_roles_ctrl(db)
    return userRoles


@router.delete("/{user_code}/{role_id}", response_model=DeleteResponse)
async def revoke_user_role(user_code: str, role_id: str, db: AsyncSession = Depends(get_db)):
    return await UserRolesController.revoke_user_role_ctrl(user_code, role_id, db)
