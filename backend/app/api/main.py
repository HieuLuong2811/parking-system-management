from fastapi import APIRouter
from app.api.router import users, rolers
router = APIRouter()

router.include_router(users.router)
router.include_router(rolers.router)
