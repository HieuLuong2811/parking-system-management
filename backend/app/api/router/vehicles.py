from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.controller.vehicles import VehicleController
from app.authen.current_user import AuthUser, required_roles
from app.db.session import get_db
from app.models.responses import DeleteResponse, PlateLookupAction, VehicleLookupResponse
from app.models.vehicles import VehicleCreate, VehicleRead, VehicleUpdate, VehicleBarcodeVerify
from app.utils.pagination import PaginatedResponse

router = APIRouter(prefix="/vehicles", tags=["vehicles"])


@router.post("/", response_model=VehicleRead)
async def create_vehicle(payload: VehicleCreate, db: AsyncSession = Depends(get_db)):
    return await VehicleController.create_vehicle_ctrl(payload, db)


@router.get("/", response_model=PaginatedResponse[VehicleRead])
async def list_vehicles(
    user_code: str | None = Query(None, description="Filter by user code (optional)"),
    search: str | None = None,
    license_plate: str | None = None,
    vehicle_type: str | None = None,
    barcode_token: str | None = None,
    is_deleted: bool | None = None,
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(5, ge=1, le=100, description="Number of items per page"),
    db: AsyncSession = Depends(get_db),
    current_user: AuthUser = Depends(required_roles("ADMIN")),
):
    return await VehicleController.get_vehicles_ctrl(
        db=db,
        user_code=user_code,
        search=search,
        license_plate=license_plate,
        vehicle_type=vehicle_type,
        barcode_token=barcode_token,
        is_deleted=is_deleted,
        page=page,
        limit=limit,
    )


@router.get("/me", response_model=list[VehicleRead])
async def list_my_vehicles(
    db: AsyncSession = Depends(get_db),
    current_user: AuthUser = Depends(required_roles("USER", "ADMIN")),
):
    return await VehicleController.get_vehicles_by_user_ctrl(current_user.user_code, db)

@router.get("/me/paginated", response_model=PaginatedResponse[VehicleRead])
async def list_my_vehicles_paginated(
    db: AsyncSession = Depends(get_db),
    current_user: AuthUser = Depends(required_roles("USER", "ADMIN")),
    page: int = Query(1, ge=1, description="Page number (1-based)"),
    limit: int = Query(5, ge=1, le=100, description="Number of items per page"),
    user_code: str | None = Query(None, description="Filter by user code (optional)"),
    license_plate: str | None = Query(None, description="Filter by license plate (optional)"),
    has_plate: bool | None = Query(None, description="Filter by vehicles that have license plate"),
):
    return await VehicleController.get_vehicles_by_user_paginated_ctrl(
        current_user.user_code,
        db,
        page=page,
        limit=limit,
        user_code_filter=user_code,
        license_plate=license_plate,
        has_plate=has_plate,
    )


@router.post("/verify-barcode", response_model=VehicleLookupResponse)
async def verify_vehicle_barcode(
    payload: VehicleBarcodeVerify,
    db: AsyncSession = Depends(get_db)
):
    return await VehicleController.verify_vehicle_barcode_ctrl(payload, db)

@router.get("/lookup", response_model=VehicleLookupResponse)
async def lookup_vehicle_by_plate(
    license_plate: str,
    action: PlateLookupAction,
    db: AsyncSession = Depends(get_db),
):  
    print('Running lookup_vehicle_by_plate_ctrl')
    return await VehicleController.lookup_vehicle_by_plate_ctrl(
        license_plate,
        action,
        db,
    )

@router.get("/{vehicle_id}", response_model=VehicleRead)
async def get_vehicle(vehicle_id: str, db: AsyncSession = Depends(get_db)):
    return await VehicleController.get_vehicle_ctrl(vehicle_id, db)


@router.patch("/{vehicle_id}", response_model=VehicleRead)
async def update_vehicle(
    vehicle_id: str, payload: VehicleUpdate, db: AsyncSession = Depends(get_db)
):
    return await VehicleController.update_vehicle_ctrl(vehicle_id, payload, db)


@router.delete("/{vehicle_id}", response_model=DeleteResponse)
async def delete_vehicle(vehicle_id: str, db: AsyncSession = Depends(get_db)):
    return await VehicleController.delete_vehicle_ctrl(vehicle_id, db)