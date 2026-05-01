from datetime import datetime
import base64
import secrets

from app.models.vehicles import Vehicle, VehicleCreate, VehicleUpdate
from app.models.users import Users
from app.service.base import CRUDService
from app.utils.pagination import PaginatedResponse
from app.utils.pagination_db import paginate_scalars
from fastapi import HTTPException, status
from sqlalchemy import String, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession


class vehicleService:
    crud = CRUDService(Vehicle)

    @staticmethod
    def _generate_barcode_token() -> str:
        # 60 bits -> 12 base32 chars (A-Z2-7), safe for Code128 and short enough to scan reliably.
        raw = secrets.token_bytes(8)
        return base64.b32encode(raw).decode("ascii").rstrip("=").upper()

    @staticmethod
    async def _ensure_barcode_token(vehicle: Vehicle, db: AsyncSession) -> Vehicle:
        if vehicle.barcode_token:
            return vehicle

        for _ in range(10):
            token = vehicleService._generate_barcode_token()
            statement = select(Vehicle.id).where(Vehicle.barcode_token == token)
            existing = await db.execute(statement)
            if existing.scalar_one_or_none() is None:
                vehicle = await vehicleService.crud.update(
                    db,
                    vehicle.id,
                    VehicleUpdate(barcode_token=token),
                )
                return vehicle

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to allocate barcode token",
        )

    @staticmethod
    async def create_vehicle(payload: VehicleCreate, db: AsyncSession) -> Vehicle:
        vehicle = await vehicleService.crud.create(db, payload)
        return await vehicleService._ensure_barcode_token(vehicle, db)

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
    async def get_vehicles(
        db: AsyncSession,
        *,
        user_code: str | None = None,
        search: str | None = None,
        is_deleted: bool | None = None,
        page: int = 1,
        limit: int = 20,
    ) -> PaginatedResponse[Vehicle]:
        statement = select(Vehicle).order_by(Vehicle.created_at.desc())

        if user_code and user_code.strip():
            statement = statement.where(Vehicle.user_code == user_code.strip())

        if is_deleted is not None:
            if is_deleted:
                statement = statement.where(Vehicle.deleted_at.is_not(None))
            else:
                statement = statement.where(Vehicle.deleted_at.is_(None))

        if search:
            trimmed = search.strip()
            if trimmed:
                like = f"%{trimmed.lower()}%"
                statement = statement.where(
                    or_(
                        func.lower(func.coalesce(Vehicle.user_code, "")).ilike(like),
                        func.lower(func.coalesce(Vehicle.license_plate, "")).ilike(like),
                        func.lower(func.cast(Vehicle.id, String)).ilike(like),
                        func.lower(func.cast(Vehicle.vehicle_type, String)).ilike(like),
                    )
                )

        items, total, total_pages = await paginate_scalars(db, statement, page=page, limit=limit)
        return {
            "data": items,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": total_pages,
        }

    @staticmethod
    async def get_vehicles_by_user_code(user_code: str, db: AsyncSession) -> list[Vehicle]:
        statement = select(Vehicle).where(
            Vehicle.user_code == user_code,
            Vehicle.deleted_at.is_(None),
        )
        result = await db.execute(statement)
        return result.scalars().all()

    @staticmethod
    async def get_vehicles_by_user_code_paginated(
        user_code: str,
        db: AsyncSession,
        *,
        page: int = 1,
        limit: int = 20,
        user_code_filter: str | None = None,
        license_plate: str | None = None,
        has_plate: bool | None = None,
    ) -> PaginatedResponse[Vehicle]:
        statement = (
            select(Vehicle)
            .where(
                Vehicle.user_code == user_code,
                Vehicle.deleted_at.is_(None),
            )
            .order_by(Vehicle.created_at.desc())
        )

        if user_code_filter and user_code_filter.strip():
            like = f"%{user_code_filter.strip().lower()}%"
            statement = statement.where(func.lower(func.coalesce(Vehicle.user_code, "")).ilike(like))

        if license_plate and license_plate.strip():
            like = f"%{license_plate.strip().lower()}%"
            statement = statement.where(func.lower(func.coalesce(Vehicle.license_plate, "")).ilike(like))

        if has_plate is not None:
            trimmed_plate = func.trim(func.coalesce(Vehicle.license_plate, ""))
            statement = statement.where(trimmed_plate != "") if has_plate else statement.where(trimmed_plate == "")

        items, total, total_pages = await paginate_scalars(db, statement, page=page, limit=limit)
        return {
            "data": items,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": total_pages,
        }

    @staticmethod
    async def update_vehicle(vehicle_id: str, payload: VehicleUpdate, db: AsyncSession) -> Vehicle:
        existing = await vehicleService.get_vehicle(vehicle_id, db)
        vehicle = await vehicleService.crud.update(db, vehicle_id, payload)
        return await vehicleService._ensure_barcode_token(vehicle, db)

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
    async def get_by_barcode_token(barcode_token: str, db: AsyncSession) -> tuple[Vehicle, Users]:
        normalized = barcode_token.strip().upper()
        statement = (
            select(Vehicle, Users)
            .join(Users, Users.user_code == Vehicle.user_code)
            .where(
                func.upper(func.coalesce(Vehicle.barcode_token, "")) == normalized,
                Vehicle.deleted_at.is_(None),
            )
        )
        result = await db.execute(statement)
        row = result.first()
        if row is None:
            raise ValueError("Vehicle not found")
        return row
