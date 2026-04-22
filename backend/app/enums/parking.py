from enum import Enum


class PaymentType(str, Enum):
    FULL = "FULL"
    MONTHLY = "MONTHLY"


class SubscriptionPlanType(str, Enum):
    UNLICENSED_VEHICLE = "UNLICENSED_VEHICLE"
    LICENSED_VEHICLE = "LICENSED_VEHICLE"


class SubscriptionStatus(str, Enum):
    PENDING = "PENDING"
    ACTIVE = "ACTIVE"
    EXPIRED = "EXPIRED"
    SUSPENDED = "SUSPENDED"


class VehicleType(str, Enum):
    MOTORBIKE = "MOTORBIKE"
    BICYCLE = "BICYCLE"
    ELECTRIC_BICYCLE = "ELECTRIC_BICYCLE"


class PaymentMethod(str, Enum):
    CASH = "CASH"
    STRIPE = "STRIPE"
    MOMO = "MOMO"



class InvoiceStatus(str, Enum):
    PENDING = "PENDING"
    PAID = "PAID"
    FAILED = "FAILED"

class ParkingSessionStatus(str, Enum):
    ACTIVE = "ACTIVE"
    DONE = "DONE"


class PaymentStatus(str, Enum):
    PENDING = "PENDING"
    PAID = "PAID"
    FAILED = "FAILED"


class UserType(str, Enum):
    GUEST = "GUEST"
    STUDENT = "STUDENT"
    STAFF = "STAFF"
    VISITOR = "VISITOR"
