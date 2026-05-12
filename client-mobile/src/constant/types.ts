export enum PaymentType {
  FULL = "FULL",
  MONTHLY = "MONTHLY",
}

export enum SubscriptionPlanType {
  BASIC = "BASIC",
  STARTUP = "STARTUP",
  ENTERPRISE = "ENTERPRISE",
}

export enum SubscriptionStatus {
  ACTIVE = "ACTIVE",
  PAYMENT_DUE = "PAYMENT_DUE",
  OVERDUE = "OVERDUE",
  SUSPENDED = "SUSPENDED",
  CANCELED = "CANCELED",
  INACTIVE = "INACTIVE",
}

export enum VehicleType {
  MOTORBIKE = "MOTORBIKE",
  BICYCLE = "BICYCLE",
  ELECTRIC_BICYCLE = "ELECTRIC_BICYCLE",
}

export enum PaymentMethod {
  CASH = "CASH",
  MOMO = "MOMO",
}

export enum InvoiceStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  FAILED = "FAILED",
}

export enum ParkingSessionStatus {
  ACTIVE = "ACTIVE",
  DONE = "DONE",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  FAILED = "FAILED",
}

export enum UserType {
  GUEST = "GUEST",
  STUDENT = "STUDENT",
  STAFF = "STAFF",
  VISITOR = "VISITOR",
}
