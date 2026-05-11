export type AdminUser = {
  user_code: string;
  full_name: string;
  email: string;
  language_use?: string | null;
  phone_number?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
};

export type SubscriptionPlanRecord = {
  id: string;
  plans_type: 'BASIC' | 'STARTUP' | 'ENTERPRISE';
  price_per_day: number;
  allow_monthly_payment?: boolean | null;
  allow_full_payment?: boolean | null;
  max_licensed_vehicle?: number | null;
  max_unlicensed_vehicle?: number | null;
  after_18_fee?: number | null;
  waive_after_18_fee?: boolean | null;
  status?: string | null;
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
  is_in_use?: boolean;
};

export type AcademicTermRecord = {
  id: string;
  term_name: string;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
  is_in_use?: boolean;
};

export type PaymentPlanRecord = {
  id: string;
  payment_type: 'FULL' | 'MONTHLY';
  discount_percent?: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type VehicleRecord = {
  id: string;
  user_code?: string | null;
  vehicle_type: string;
  license_plate?: string | null;
  barcode_token?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
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

export type UserSubscriptionDetailRecord = {
  id: string;
  user_code: string;
  user?: AdminUser | null;
  status: 'ACTIVE' | 'EXPIRED' | 'SUSPENDED';
  start_date: string;
  end_date: string;
  total_amount: number;
  paid_amount: number;
  created_at: string;
  updated_at: string;
  subscription_plan?: SubscriptionPlanRecord | null;
  payment_plan?: PaymentPlanRecord | null;
  term?: AcademicTermRecord | null;
  vehicle?: VehicleRecord | null;
  detail?: {
    covered_vehicles?: VehicleRecord[] | null;
  } | null;
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

export type ParkingSessionAdminRow = ParkingSessionRecord & {
  user_code?: string | null;
  user_full_name?: string | null;
  vehicle_type?: string | null;
};

export type RoleRecord = {
  id: string;
  role_code: string;
  created_at: string;
};

export type UserRoleRecord = {
  id: string;
  user_code: string;
  role_id: string;
  created_at: string;
};

export type RoleSummary = {
  id: string;
  role_code: string;
};

export type UserWithRoles = {
  user: AdminUser;
  roles: RoleSummary[];
};

export type PaymentTransactionRecord = {
  id: string;
  invoice_id: string;
  attempt_number: number;
  transaction_code: string;
  response_message: string;
  created_at: string;
};

export type PaymentTransactionDetailRecord = PaymentTransactionRecord & {
  user_code: string;
  user_full_name: string;
  invoice_amount: number;
  invoice_payment_method: string;
  invoice_created_at: string;
};

export type BillingEventLogRecord = {
  id: string;
  user_code: string;
  subscription_id: string;
  event_type: string;
  meta_data?: Record<string, unknown> | null;
  created_at: string;
};

export type PaginatedResponse<T = unknown> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
};
