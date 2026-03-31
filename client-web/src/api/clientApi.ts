import axios, { AxiosResponse } from 'axios';

const API_BASE_URL = process.env.REACT_APP_CLIENT_API_URL ?? '/api/v1';

export const clientHttp = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
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

export type PaymentMethod = 'SYSTEM' | 'CASH';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED';
export type InvoiceStatus = 'PENDING' | 'PAID' | 'FAILED';
export type VehicleType = 'MOTORBIKE' | 'BICYCLE' | 'ELECTRIC_BICYCLE';
export type SubscriptionStatus = 'ACTIVE' | 'EXPIRED' | 'SUSPENDED';
export type UserType = 'GUEST' | 'STUDENT' | 'STAFF' | 'VISITOR';
export type PaymentPlanType = 'FULL' | 'MONTHLY';
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
  is_active: boolean;
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
  plan_name: string;
  price_per_day: number;
  description?: string | null;
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentPlan {
  id: string;
  plan_name: string;
  payment_type: PaymentPlanType;
  discount_percent?: number | null;
  description?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserInfo {
  user_code: string;
  full_name: string;
  email: string;
  phone_number?: string | null;
  stripe_customer_id?: string | null;
  language_use?: string | null;
  is_active: boolean;
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
  is_active?: boolean;
}

export interface UserUpdatePayload {
  full_name?: string;
  email?: string;
  phone_number?: string;
  stripe_customer_id?: string | null;
  language_use?: string;
  is_active?: boolean;
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
