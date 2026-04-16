# main.py
from fastapi import FastAPI
from fastapi.routing import APIRoute
from sqlalchemy import text
from starlette.middleware.cors import CORSMiddleware

from app.core import stripe_client
from app.core.config import settings
from app.api.main import router  
from app.api.controller.auth import AuthController
from app.db.session import engine
from app.service.auth_codes import AuthCodeStore

def custom_generate_unique_id(route: APIRoute) -> str:
    tag = route.tags[0] if route.tags else "default"
    return f"{tag}-{route.name}"


app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url="/openapi.json",
    docs_url="/docs",
    root_path=settings.API_V1_STR,
)

# CORS
if settings.all_cors_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.all_cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Import router
app.include_router(router)

@app.on_event("startup")
async def initialize_auth_code_store():
    auth_code_store = AuthCodeStore(settings.AUTH_CODE_EXPIRE_SECONDS)
    AuthController.init_auth_code_store(auth_code_store)


@app.on_event("startup")
async def ensure_unaccent_extension():
    async with engine.begin() as conn:
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS unaccent"))
