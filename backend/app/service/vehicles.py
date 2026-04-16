from datetime import datetime
import json
import secrets

from app.models.vehicles import Vehicle, VehicleCreate, VehicleUpdate
from app.models.users import Users
from app.service.base import CRUDService
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession


class vehicleService:
    crud = CRUDService(Vehicle)

    @staticmethod
    def _generate_secret() -> str:
        return secrets.token_urlsafe(24)

    @staticmethod
    def _build_qr_payload(user_code: str | None, vehicle_id: str, qr_secret: str | None) -> str:
        return json.dumps(
            {
                "user_code": user_code or "",
                "vehicle_id": vehicle_id,
                "qr_secret": qr_secret or "",
            }
        )
    @staticmethod
    async def create_vehicle(payload: VehicleCreate, db: AsyncSession) -> Vehicle:
        if not payload.qr_secret:
            payload.qr_secret = vehicleService._generate_secret()
        vehicle = await vehicleService.crud.create(db, payload)
        return await vehicleService._refresh_qr(vehicle, db)

    @staticmethod
    async def get_vehicle(vehicle_id: str, db: AsyncSession) -> Vehicle:
        vehicle = await vehicleService.crud.get(db, vehicle_id)
        if vehicle.deleted_at is not None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found")
        return vehicle

    @staticmethod
    async def get_all_vehicles(db: AsyncSession) -> list[Vehicle]:
        statement = select(Vehicle).where(Vehicle.deleted_at.is_(None))
        result = await db.execute(statement)
        return result.scalars().all()

    @staticmethod
    async def get_vehicles_by_user_code(user_code: str, db: AsyncSession) -> list[Vehicle]:
        statement = select(Vehicle).where(
            Vehicle.user_code == user_code,
            Vehicle.deleted_at.is_(None),
        )
        result = await db.execute(statement)
        return result.scalars().all()

    @staticmethod
    async def update_vehicle(vehicle_id: str, payload: VehicleUpdate, db: AsyncSession) -> Vehicle:
        existing = await vehicleService.get_vehicle(vehicle_id, db)
        if payload.qr_secret is None:
            payload.qr_secret = existing.qr_secret or vehicleService._generate_secret()
        vehicle = await vehicleService.crud.update(db, vehicle_id, payload)
        return await vehicleService._refresh_qr(vehicle, db)

    @staticmethod
    async def delete_vehicle(vehicle_id: str, db: AsyncSession) -> Vehicle:
        vehicle = await vehicleService.crud.get(db, vehicle_id)
        if vehicle.deleted_at is not None:
            return vehicle
        vehicle.deleted_at = datetime.utcnow()
        await db.commit()
        await db.refresh(vehicle)
        return vehicle

    @staticmethod
    async def get_by_license_plate(license_plate: str, db: AsyncSession) -> tuple[Vehicle, Users]:
        statement = (
            select(Vehicle, Users)
            .join(Users, Users.user_code == Vehicle.user_code)
            .where(
                Vehicle.license_plate == license_plate,
                Vehicle.deleted_at.is_(None),
            )
        )
        result = await db.execute(statement)
        row = result.first()
        if row is None:
            raise ValueError("Vehicle not found")
        return row

    @staticmethod
    async def get_vehicle_with_user(vehicle_id: str, db: AsyncSession) -> tuple[Vehicle, Users]:
        statement = (
            select(Vehicle, Users)
            .join(Users, Users.user_code == Vehicle.user_code)
            .where(
                Vehicle.id == vehicle_id,
                Vehicle.deleted_at.is_(None),
            )
        )
        result = await db.execute(statement)
        row = result.first()
        if row is None:
            raise ValueError("Vehicle not found")
        return row

    @staticmethod
    async def _refresh_qr(vehicle: Vehicle, db: AsyncSession) -> Vehicle:
        payload = vehicleService._build_qr_payload(vehicle.user_code, str(vehicle.id), vehicle.qr_secret)
        return await vehicleService.crud.update(db, vehicle.id, VehicleUpdate(qr_code=payload))
