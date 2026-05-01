export const VITE_LOGIN_URL =
  process.env.REACT_APP_LOGIN_URL ??
  'http://localhost:5173/';
export const API_BASE_URL =
  process.env.REACT_APP_API_URL ?? 'http://localhost:8000/api/v1';

export const payment_plan = {
  RECURRING: 'recurring',
  ONE_TIME: 'one-time',
};

export const invoices_status = {
  PAID: 'PAID',
  PENDING: 'PENDING'
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

export const PLAN_TYPES = {
  LICENSED_VEHICLE: 'LICENSED_VEHICLE',
  UNLICENSED_VEHICLE: 'UNLICENSED_VEHICLE',
} as const;

export type PlanType = typeof PLAN_TYPES[keyof typeof PLAN_TYPES];