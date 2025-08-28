from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.models.roles import RolesCreate, RolesRead
from app.api.controller.roles import RoleController
import uuid

router = APIRouter(prefix="/roles", tags=["roles"])

@router.post("/", response_model=RolesRead)
async def create_role(role_in: RolesCreate, db: AsyncSession = Depends(get_db)):
    return await RoleController.create_role_ctrl(role_in, db)

@router.get("/", response_model=list[RolesRead])
async def get_all_roles(db: AsyncSession = Depends(get_db)):
    roles = await RoleController.get_all_roles_ctrl(db)
    if not roles:
        raise HTTPException(status_code=404, detail="No roles found")
    return roles