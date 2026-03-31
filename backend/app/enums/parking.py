from enum import Enum


class PaymentType(str, Enum):
    FULL = "FULL"
    MONTHLY = "MONTHLY"


class SubscriptionStatus(str, Enum):
    ACTIVE = "ACTIVE"
    EXPIRED = "EXPIRED"
    SUSPENDED = "SUSPENDED"


class VehicleType(str, Enum):
    MOTORBIKE = "MOTORBIKE"
    BICYCLE = "BICYCLE"
    ELECTRIC_BICYCLE = "ELECTRIC_BICYCLE"


class PaymentMethod(str, Enum):
    SYSTEM = "SYSTEM"
    CASH = "CASH"


class InvoiceStatus(str, Enum):
    PENDING = "PENDING"
    PAID = "PAID"
    FAILED = "FAILED"


class TransactionStatus(str, Enum):
    SUCCESS = "SUCCESS"
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
