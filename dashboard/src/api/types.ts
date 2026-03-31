export type AdminUser = {
  user_code: string;
  full_name: string;
  email: string;
  language_use?: string | null;
  phone_number?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
};

export type SubscriptionPlanRecord = {
  id: string;
  plan_name: string;
  price_per_day: number;
  description?: string | null;
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
};

export type AcademicTermRecord = {
  id: string;
  term_name: string;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
};

export type PaymentPlanRecord = {
  id: string;
  plan_name: string;
  payment_type: 'FULL' | 'MONTHLY';
  discount_percent?: number | null;
  description?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type VehicleRecord = {
  id: string;
  user_code?: string | null;
  vehicle_type: string;
  license_plate?: string | null;
  qr_code?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
  is_active: boolean;
};

export type UserSubscriptionRecord = {
  id: string;
  user_code: string;
  sub_plan_id: string;
  term_id: string;
  vehicle_id: string;
  payment_plan_id: string;
  total_amount: number;
  paid_amount: number;
  status: 'ACTIVE' | 'EXPIRED' | 'SUSPENDED';
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
};

export type SubscriptionSearchRow = UserSubscriptionRecord & {
  user?: AdminUser;
  vehicle?: VehicleRecord;
  payment_plan?: PaymentPlanRecord;
  plan?: SubscriptionPlanRecord;
};

export type InvoiceAdminRecord = {
  id: string;
  user_code: string;
  subscription_id: string;
  amount: number;
  payment_method: string;
  status: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

export type InvoiceSearchRow = InvoiceAdminRecord & {
  user?: AdminUser;
};

export type ParkingSessionRecord = {
  id: string;
  vehicle_id: string;
  license_plate?: string | null;
  check_in_time: string;
  check_out_time?: string | null;
  status: 'ACTIVE' | 'DONE';
  user_type: string;
  total_amount?: number | null;
  created_at: string;
  updated_at: string;
};

export type RoleRecord = {
  id: string;
  role_code: string;
  role_name: string;
  created_at: string;
};

export type UserRoleRecord = {
  id: string;
  user_code: string;
  role_id: string;
  created_at: string;
};

export type PaymentTransactionRecord = {
  id: string;
  invoice_id: string;
  attempt_number: number;
  transaction_code: string;
  status: 'SUCCESS' | 'FAILED';
  response_message: string;
  created_at: string;
};

export type BillingEventLogRecord = {
  id: string;
  user_code: string;
  subscription_id: string;
  event_type: string;
  meta_data?: Record<string, unknown> | null;
  created_at: string;
};
