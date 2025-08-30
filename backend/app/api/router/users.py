from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.models.users import UsersCreate, UsersRead, DeleteReponse
from app.api.controller.users import UserController
import uuid
router = APIRouter(prefix="/users", tags=["users"])

@router.post("/", response_model=UsersRead)
async def create_user(
    user_in: UsersCreate,
    db: AsyncSession = Depends(get_db)
):
    return await UserController.create_user_ctrl(user_in, db)

@router.get("/", response_model=list[UsersRead])
async def get_all_users(db: AsyncSession = Depends(get_db)):
    users = await UserController.get_all_users_ctrl(db)
    if not users:
        raise HTTPException(status_code=404, detail="No users found")
    return users

@router.patch("/{id}", response_model=UsersRead)
async def update_user(id: uuid.UUID, user_in: UsersCreate, db: AsyncSession = Depends(get_db)):
    return await UserController.update_user_ctrl(id, user_in, db)

@router.delete("/{id}", response_model=DeleteReponse)
async def delete_user(id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    return await UserController.delete_user_ctrl(id, db)