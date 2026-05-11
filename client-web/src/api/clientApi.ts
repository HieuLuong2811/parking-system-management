import axios, { AxiosResponse } from 'axios';
import { API_BASE_URL } from '../constant/config';

export const clientHttp = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

clientHttp.interceptors.request.use((config) => {
  if (!config.url) {
    return config;
  }
  const hasQuery = config.url.includes('?');
  const [path, query = ''] = config.url.split('?');
  const normalizedPath = path !== '/' && path.endsWith('/') ? path.slice(0, -1) : path;
  config.url = hasQuery ? `${normalizedPath}?${query}` : normalizedPath;
  return config;
});

export interface ApiErrorPayload {
  detail?: string;
  message?: string;
  [key: string]: unknown;
}

export class ApiRequestError extends Error {
  status?: number;
  payload?: ApiErrorPayload;

  constructor(message: string, status?: number, payload?: ApiErrorPayload) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.payload = payload;
  }
}

export const requestWithContext = async <T>(
  request: Promise<AxiosResponse<T>>,
  label?: string
): Promise<T> => {
  try {
    const response = await request;
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const payload = error.response?.data as ApiErrorPayload | undefined;
      const detail = payload?.detail ?? payload?.message ?? error.message.replace(/\s+/g, ' ').trim();
      const message = label ? `${label} failed (${status ?? 'unknown'}): ${detail}` : detail;
      throw new ApiRequestError(message, status, payload);
    }
    throw error;
  }
};

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
};

export type PaymentMethod = 'MOMO' | 'STRIPE' | 'CASH';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED';
export type InvoiceStatus = 'PENDING' | 'PAID' | 'FAILED';
export type VehicleType = 'MOTORBIKE' | 'BICYCLE' | 'ELECTRIC_BICYCLE';
export type SubscriptionStatus = 'ACTIVE' | 'PAYMENT_DUE' | 'OVERDUE' | 'SUSPENDED' | 'CANCELED' | 'INACTIVE';
export type UserType = 'GUEST' | 'STUDENT' | 'STAFF' | 'VISITOR';
export type PaymentPlanType = 'FULL' | 'MONTHLY';
export type SubscriptionPlanType = 'BASIC' | 'STARTUP' | 'ENTERPRISE';
export type ParkingSessionStatus = 'ACTIVE' | 'DONE';
export type SubscriptionPlanStatus = 'ACTIVE' | 'INACTIVE';

export interface VehicleInfo {
  id: string;
  user_code?: string | null;
  vehicle_type: VehicleType;
  license_plate?: string | null;
  barcode_token?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface ParkingSession {
  id: string;
  vehicle_id: string;
  license_plate?: string | null;
  check_in_time: string;
  check_out_time?: string | null;
  user_type: UserType;
  status: ParkingSessionStatus;
  total_amount?: number | null;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  actor_id?: string | null;
  receiver_id: string;
  title: string;
  content: string;
  is_read: boolean;
  created_at: string;
  deleted_at?: string | null;
}

export interface AcademicTerm {
  id: string;
  term_name: string;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionPlan {
  id: string;
  label: string;
  description: string;
  duration: string;
  perk: string;
  price: string;
  features: string[];
}

export interface SubscriptionPlanRecord {
  id: string;
  plans_type: SubscriptionPlanType;
  price_per_day: number;

  allow_monthly_payment?: boolean | null;
  allow_full_payment?: boolean | null;

  max_licensed_vehicle?: number | null;
  max_unlicensed_vehicle?: number | null;

  after_18_fee?: number | null;
  waive_after_18_fee?: boolean | null;

  status?: SubscriptionPlanStatus | string | null;

  deleted_at?: string | null;
  created_at: string;
  updated_at: string;

  is_in_use: boolean;
}
export interface PaymentPlan {
  id: string;
  payment_type: PaymentPlanType;
  discount_percent?: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PlanPricing {
  plan_id: string;
  term_id: string;
  price_per_day: number;
  start_date: string;
  end_date: string;
  working_days: number;
  holiday_days: number;
  sundays_skipped: number;
  total_amount: number;
}

export interface PaymentPlanPricingDetail {
  payment_plan_id: string;
  payment_type: PaymentPlanType;
  discount_percent?: number | null;
  is_active: boolean;
  original_amount: number;
  amount: number;
}

export interface PaymentPlanPricingResponse extends PlanPricing {
  payment_plan_details: PaymentPlanPricingDetail[];
}
export interface UserInfo {
  user_code: string;
  full_name: string;
  email: string;
  phone_number?: string | null;
  language_use?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface UserCreatePayload {
  user_code: string;
  password: string;
  full_name: string;
  email: string;
  phone_number?: string;
  language_use?: string;
}

export interface UserUpdatePayload {
  full_name?: string;
  email?: string;
  phone_number?: string;
  language_use?: string;
  password?: string;
  deleted_at?: string | null;
}

export interface UserSubscriptionInfo {
  id: string;
  user_code: string;
  sub_plan_id: string;
  term_id: string;
  vehicle_id: string;
  payment_plan_id: string;
  total_amount: number;
  paid_amount: number;
  status: SubscriptionStatus;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
}

export interface UserSubscriptionPayload {
  user_code: string;
  sub_plan_id: string;
  term_id: string;
  vehicle_id: string;
  payment_plan_id: string;
  total_amount: number;
  paid_amount: number;
  status: SubscriptionStatus;
  start_date: string;
  end_date: string;
}

export interface VehicleSummary {
  id?: string | null;
  vehicle_type: VehicleType;
  license_plate?: string | null;
  qr_code?: string | null;
}

export interface SubscriptionPlanSummary {
  plans_type: SubscriptionPlanType;
}

export interface PaymentPlanSummary {
  payment_type: PaymentPlanType;
}

export interface AcademicTermSummary {
  term_name: string;
}

export interface UserSubscriptionClientView{
  id: string
  status: SubscriptionStatus
  start_date: string;
  end_date: string;
  total_amount: number;
  paid_amount: number;
  created_at: string;
  vehicle: VehicleSummary | null
  plan: SubscriptionPlanType
  payment: PaymentPlanSummary | null;
  term: AcademicTermSummary | null
  covered_vehicles?: VehicleSummary[] | null;
}

export interface InvoiceInfo {
  id: string;
  user_code: string;
  subscription_id: string;
  amount: number;
  payment_method: PaymentMethod;
  status: InvoiceStatus;
  created_at: string;
  metadata?: Record<string, unknown>;
}
