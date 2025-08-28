from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.service.users import userService
from app.models.users import UsersCreate
import uuid

class UserController:
    @staticmethod
    async def get_all_users_ctrl(db: AsyncSession):
        return await userService.get_all_users(db)
    
    @staticmethod
    async def create_user_ctrl(user_in: UsersCreate, db: AsyncSession):
        return await userService.create_user(user_in, db)
    
    @staticmethod
    async def update_user_ctrl(id: uuid.UUID, user_in: UsersCreate, db: AsyncSession):
        return await userService.update_user(user_in, db, id)
    
    @staticmethod
    async def delete_user_ctrl(id: uuid.UUID, db: AsyncSession):
        return await userService.delete_user(id, db)
