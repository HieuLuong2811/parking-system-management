from app.utils.pagination import PaginatedResponse
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.models.auth import UserBulkImportRequest
from app.models.responses import DeleteResponse
from app.models.users import UsersCreate, UsersRead, UsersUpdate, UserWithRoles
from app.api.controller.users import UserController
router = APIRouter(prefix="/users", tags=["users"])

@router.post("/", response_model=UsersRead)
async def create_user(
    user_in: UsersCreate,
    db: AsyncSession = Depends(get_db)
):
    return await UserController.create_user_ctrl(user_in, db)

@router.post("/seed", response_model=list[UsersRead])
async def seed_users(
    db: AsyncSession = Depends(get_db)
):
    return await UserController.seed_users_ctrl(db)


@router.post("/import/{role_code}", response_model=list[UsersRead])
async def import_users(
    role_code: str,
    payload: UserBulkImportRequest,
    db: AsyncSession = Depends(get_db),
):
    return await UserController.import_users_ctrl(role_code, payload, db)


@router.get("/", response_model=PaginatedResponse[UserWithRoles])
async def get_all_users(
    search: str | None = None,
    phone: str | None = None,
    role: str | None = None,
    is_deleted: bool | None = None,
    page: int = Query(1, ge=1, description='Page number'),
    limit: int = Query(5, ge=1, le=100, description='Number of items per page'),
    db: AsyncSession = Depends(get_db),
):
    users = await UserController.get_all_users_ctrl(
        db=db,
        search=search,
        phone=phone,
        role=role,
        is_deleted=is_deleted,
        page=page,
        limit=limit
    )
    return users


@router.patch("/{user_code}", response_model=UsersRead)
async def update_user(user_code: str, user_in: UsersUpdate, db: AsyncSession = Depends(get_db)):
    return await UserController.update_user_ctrl(user_code, user_in, db)


@router.delete("/{user_code}", response_model=DeleteResponse)
async def delete_user(user_code: str, db: AsyncSession = Depends(get_db)):
    return await UserController.delete_user_ctrl(user_code, db)
