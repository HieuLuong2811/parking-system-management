import logging

from app.models.vehicles import Vehicle, VehicleCreate, VehicleUpdate
from app.models.users import Users
from app.service.base import CRUDService
from sqlalchemy import select
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
        if await vehicleService.crud.get(db, vehicle_id) is None:
            logging.warning("Attempting to delete a non-existent vehicle with ID: %s", vehicle_id)
            raise ValueError("Vehicle not found")
        return await vehicleService.crud.delete(db, vehicle_id)

    @staticmethod
    async def get_by_license_plate(license_plate: str, db: AsyncSession) -> tuple[Vehicle, Users]:
        statement = (
            select(Vehicle, Users)
            .join(Users, Users.user_code == Vehicle.user_code)
            .where(Vehicle.license_plate == license_plate)
        )
        result = await db.execute(statement)
        row = result.first()
        if row is None:
            raise ValueError("Vehicle not found")
        return row
