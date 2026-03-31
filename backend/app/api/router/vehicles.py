from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.controller.vehicles import VehicleController
from app.db.session import get_db
from app.models.responses import DeleteResponse, VehicleLookupResponse
from app.models.vehicles import VehicleCreate, VehicleRead, VehicleUpdate

router = APIRouter(prefix="/vehicles", tags=["vehicles"])


@router.post("/", response_model=VehicleRead)
async def create_vehicle(payload: VehicleCreate, db: AsyncSession = Depends(get_db)):
    return await VehicleController.create_vehicle_ctrl(payload, db)


@router.get("/", response_model=list[VehicleRead])
async def list_vehicles(db: AsyncSession = Depends(get_db)):
    vehicles = await VehicleController.get_all_vehicles_ctrl(db)
    if not vehicles:
        raise HTTPException(status_code=404, detail="No vehicles found")
    return vehicles


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