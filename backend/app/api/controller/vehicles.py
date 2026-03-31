from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.responses import DeleteResponse, VehicleLookupResponse
from app.models.vehicles import VehicleCreate, VehicleRead, VehicleUpdate
from app.service.vehicles import vehicleService


class VehicleController:
    @staticmethod
    async def create_vehicle_ctrl(payload: VehicleCreate, db: AsyncSession) -> VehicleRead:
        return await vehicleService.create_vehicle(payload, db)

    @staticmethod
    async def get_vehicle_ctrl(vehicle_id: str, db: AsyncSession) -> VehicleRead:
        return await vehicleService.get_vehicle(vehicle_id, db)

    @staticmethod
    async def get_all_vehicles_ctrl(db: AsyncSession) -> list[VehicleRead]:
        return await vehicleService.get_all_vehicles(db)

    @staticmethod
    async def update_vehicle_ctrl(vehicle_id: str, payload: VehicleUpdate, db: AsyncSession) -> VehicleRead:
        return await vehicleService.update_vehicle(vehicle_id, payload, db)

    @staticmethod
    async def delete_vehicle_ctrl(vehicle_id: str, db: AsyncSession) -> DeleteResponse:
        await vehicleService.delete_vehicle(vehicle_id, db)
        return DeleteResponse(message="Deleted vehicle")

    @staticmethod
    async def lookup_vehicle_by_plate_ctrl(license_plate: str, db: AsyncSession) -> VehicleLookupResponse:
        try:
            vehicle, user = await vehicleService.get_by_license_plate(license_plate, db)
        except ValueError:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found")
        return VehicleLookupResponse(
            id=str(vehicle.id),
            user_code=user.user_code,
            vehicle_type=vehicle.vehicle_type.value,
            license_plate=vehicle.license_plate,
            qr_code=vehicle.qr_code,
            user_full_name=user.full_name,
            user_email=user.email,
        )
