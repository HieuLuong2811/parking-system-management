export const VITE_LOGIN_URL =
  process.env.REACT_APP_LOGIN_URL ??
  'http://localhost:5173/';
export const API_BASE_URL =
  process.env.REACT_APP_API_URL ?? 'https://hjzhlhh8-8000.asse.devtunnels.ms/api/v1';

export const payment_plan = {
  RECURRING: 'recurring',
  ONE_TIME: 'one-time',
};

export const invoices_status = {
  PAID: 'PAID',
  PENDING: 'PENDING',
  FAILED: 'FAILED'
}

export const vehicles_tab = {
  withoutPlate: 'withoutPlate',
  withPlate: 'withPlate',
}

export const vehicleTypeOptions = {
  ELECTRIC_BICYCLE: 'ELECTRIC_BICYCLE',
  MOTORBIKE: 'MOTORBIKE',
  BICYCLE: 'BICYCLE',
};

export const userSubscriptionTypes = {
  ACTIVE: "ACTIVE",
  PAYMENT_DUE: "PAYMENT_DUE",
  OVERDUE: "OVERDUE",
  SUSPENDED: "SUSPENDED",
  CANCELED: "CANCELED",
  INACTIVE: "INACTIVE",
} as const;

export const subscriptionPlanTypes = {
  BASIC: "BASIC",
  STARTUP: "STARTUP",
  ENTERPRISE: "ENTERPRISE",
}

export const PLAN_TYPES = {
  BASIC: 'BASIC',
  STARTUP: 'STARTUP',
  ENTERPRISE: 'ENTERPRISE',
} as const;


export type PlanType = typeof PLAN_TYPES[keyof typeof PLAN_TYPES];

export const LAST_7_DAYS = 7 * 24 * 60 * 60 * 1000; 
