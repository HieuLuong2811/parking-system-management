from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.controller.vehicles import VehicleController
from app.authen.current_user import AuthUser, required_roles
from app.db.session import get_db
from app.models.responses import DeleteResponse, VehicleLookupResponse
from app.models.vehicles import VehicleCreate, VehicleRead, VehicleUpdate, VehicleQRVerify

router = APIRouter(prefix="/vehicles", tags=["vehicles"])


@router.post("/", response_model=VehicleRead)
async def create_vehicle(payload: VehicleCreate, db: AsyncSession = Depends(get_db)):
    return await VehicleController.create_vehicle_ctrl(payload, db)


@router.get("/", response_model=list[VehicleRead])
async def list_vehicles(
    db: AsyncSession = Depends(get_db),
    current_user: AuthUser = Depends(required_roles("ADMIN")),
):
    return await VehicleController.get_all_vehicles_ctrl(db)


@router.get("/me", response_model=list[VehicleRead])
async def list_my_vehicles(
    db: AsyncSession = Depends(get_db),
    current_user: AuthUser = Depends(required_roles("USER", "ADMIN")),
):
    return await VehicleController.get_vehicles_by_user_ctrl(current_user.user_code, db)


@router.post("/verify-qr", response_model=VehicleLookupResponse)
async def verify_vehicle_qr(
    payload: VehicleQRVerify,
    db: AsyncSession = Depends(get_db)
):
    return await VehicleController.verify_vehicle_qr_ctrl(payload, db)


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

@router.get("/lookup", response_model=VehicleLookupResponse)
async def lookup_vehicle_by_plate(license_plate: str, db: AsyncSession = Depends(get_db)):
    return await VehicleController.lookup_vehicle_by_plate_ctrl(license_plate, db)
