from fastapi import APIRouter
from app.api.router import users, rolers, user_roles, detect, training
router = APIRouter()

router.include_router(users.router)
router.include_router(rolers.router)
router.include_router(user_roles.router)
router.include_router(detect.router)
router.include_router(training.router)
