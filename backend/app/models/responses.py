from sqlmodel import SQLModel


class DeleteResponse(SQLModel):
    message: str


class VehicleLookupResponse(SQLModel):
    id: str
    user_code: str
    vehicle_type: str
    license_plate: str
    qr_code: str
    user_full_name: str
    user_email: str
