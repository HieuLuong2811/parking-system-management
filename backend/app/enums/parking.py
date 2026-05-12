from enum import Enum


class PaymentType(str, Enum):
    FULL = "FULL"
    MONTHLY = "MONTHLY"


class SubscriptionPlanType(str, Enum):
    BASIC = "BASIC"
    STARTUP = "STARTUP"
    ENTERPRISE = "ENTERPRISE"


class SubscriptionStatus(str, Enum):
    ACTIVE = "ACTIVE"
    PAYMENT_DUE = "PAYMENT_DUE"
    OVERDUE = "OVERDUE"
    SUSPENDED = "SUSPENDED"
    CANCELED = "CANCELED"
    INACTIVE = "INACTIVE"


class VehicleType(str, Enum):
    MOTORBIKE = "MOTORBIKE"
    BICYCLE = "BICYCLE"
    ELECTRIC_BICYCLE = "ELECTRIC_BICYCLE"


class PaymentMethod(str, Enum):
    CASH = "CASH"
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

class ParkingAccessCardHolderType(str, Enum):
    STUDENT = "STUDENT"
    TEACHER = "TEACHER"
    GUEST = "GUEST"

class ParkingAccessCardStatus(str, Enum):
    AVAILABLE = "AVAILABLE"
    ASSIGNED = "ASSIGNED"
    ACTIVE = "ACTIVE"
    DISABLED = "DISABLED"
    LOST = "LOST"


