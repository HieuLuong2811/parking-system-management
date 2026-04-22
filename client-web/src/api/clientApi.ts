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
  const normalizedPath = path.endsWith('/') ? path : `${path}/`;
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
export type SubscriptionStatus = 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'SUSPENDED';
export type UserType = 'GUEST' | 'STUDENT' | 'STAFF' | 'VISITOR';
export type PaymentPlanType = 'FULL' | 'MONTHLY';
export type SubscriptionPlanType = 'UNLICENSED_VEHICLE' | 'LICENSED_VEHICLE';
export type ParkingSessionStatus = 'ACTIVE' | 'DONE';

export interface VehicleInfo {
  id: string;
  user_code?: string | null;
  vehicle_type: VehicleType;
  license_plate?: string | null;
  qr_code?: string | null;
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
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
  perk?: string | null;
}

export interface PaymentPlan {
  id: string;
  payment_type: PaymentPlanType;
  discount_percent?: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PlanPaymentModePricing {
  payment_plan_id: string;
  payment_type: PaymentPlanType;
  discount_percent?: number | null;
  original_amount: number;
  amount: number;
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
  payment_modes: PlanPaymentModePricing[];
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
  stripe_customer_id?: string | null;
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
  stripe_customer_id?: string | null;
  language_use?: string;
}

export interface UserUpdatePayload {
  full_name?: string;
  email?: string;
  phone_number?: string;
  stripe_customer_id?: string | null;
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
  id: string;
  license_plate?: string | null;
  vehicle_type: VehicleType;
}

export interface SubscriptionPlanSummary {
  id: string;
  plans_type: SubscriptionPlanType;
  price_per_day: number;
}

export interface PaymentPlanSummary {
  id: string;
  payment_type: PaymentPlanType;
}

export interface AcademicTermSummary {
  id: string;
  term_name: string;
}

export interface UserSubscriptionDetail {
  id: string;
  user_code: string;
  status: SubscriptionStatus;
  start_date: string;
  end_date: string;
  total_amount: number;
  paid_amount: number;
  created_at: string;
  updated_at: string;
  subscription_plan?: SubscriptionPlanSummary | null;
  payment_plan?: PaymentPlanSummary | null;
  term?: AcademicTermSummary | null;
  vehicle?: VehicleSummary | null;
}

export interface InvoiceInfo {
  id: string;
  user_code: string;
  subscription_id: string;
  amount: number;
  stripe_invoice_id?: string | null;
  payment_method: PaymentMethod;
  status: InvoiceStatus;
  created_at: string;
  metadata?: Record<string, unknown>;
}
