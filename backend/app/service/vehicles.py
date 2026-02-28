from app.models.vehicles import Vehicle, VehicleCreate, VehicleUpdate
from app.service.base import CRUDService
from sqlalchemy.ext.asyncio import AsyncSession


class vehicleService:
    crud = CRUDService(Vehicle)

    @staticmethod
    async def create_vehicle(payload: VehicleCreate, db: AsyncSession) -> Vehicle:
        return await vehicleService.crud.create(db, payload)

    @staticmethod
    async def get_vehicle(vehicle_id: str, db: AsyncSession) -> Vehicle:
        return await vehicleService.crud.get(db, vehicle_id)

    @staticmethod
    async def get_all_vehicles(db: AsyncSession) -> list[Vehicle]:
        return await vehicleService.crud.get_all(db)

    @staticmethod
    async def update_vehicle(vehicle_id: str, payload: VehicleUpdate, db: AsyncSession) -> Vehicle:
        return await vehicleService.crud.update(db, vehicle_id, payload)

    @staticmethod
    async def delete_vehicle(vehicle_id: str, db: AsyncSession) -> Vehicle:
        return await vehicleService.crud.delete(db, vehicle_id)
