from enum import Enum

class UserRoleType(str, Enum):
    USER = "USER"
    ADMIN = "ADMIN"
    SECURITY = "SECURITY"

class PaymentType(str, Enum):
    FULL = "FULL"
    MONTHLY = "MONTHLY"


class UserSubscriptionPaymentType(str, Enum):
    FULL_PAYMENT = "FULL_PAYMENT"
    MONTHLY_PAYMENT = "MONTHLY_PAYMENT"


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
    WALLET = "WALLET"
    SYSTEM = "SYSTEM"


class InvoiceStatus(str, Enum):
    PENDING = "PENDING"
    PAID = "PAID"
    FAILED = "FAILED"


class InvoiceType(str, Enum):
    SUBSCRIPTION_FULL = "SUBSCRIPTION_FULL"
    TOP_UP = "TOP_UP"
    OTHER = "OTHER"

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


class ParkingVehicleMode(str, Enum):
    LICENSED = "LICENSED"
    UNLICENSED = "UNLICENSED"


class WalletStatus(str, Enum):
    ACTIVE = "ACTIVE"
    LOCKED = "LOCKED"


class PaymentTransactionType(str, Enum):
    TOP_UP = "TOP_UP"
    SUBSCRIPTION_FULL_PAYMENT = "SUBSCRIPTION_FULL_PAYMENT"
    MONTHLY_CHARGE = "MONTHLY_CHARGE"
    INVOICE_DIRECT_PAYMENT = "INVOICE_DIRECT_PAYMENT"
    REFUND = "REFUND"
    ADMIN_ADJUSTMENT = "ADMIN_ADJUSTMENT"


class PaymentTransactionStatus(str, Enum):
    PENDING = "PENDING"
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"
