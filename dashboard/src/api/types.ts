export type HolderType = 'STUDENT' | 'TEACHER' | 'GUEST';
export type ParkingAccessCardStatus = 'AVAILABLE' | 'ASSIGNED' | 'ACTIVE' | 'DISABLED' | 'LOST';
export type TimePreset = 'CUSTOM' | 'TODAY' | 'YESTERDAY' | 'LAST_7_DAYS';
export type SubscriptionPlanType = 'BASIC' | 'STARTUP' | 'ENTERPRISE';
export type UserSubscriptionStatus = 'ACTIVE' | 'PAYMENT_DUE' | 'OVERDUE' | 'SUSPENDED' | 'CANCELED' | 'INACTIVE';

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
  plans_type: SubscriptionPlanType;
  price_per_day: number;
  allow_monthly_payment?: boolean | null;
  allow_full_payment?: boolean | null;
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
};

export type PaymentPlanRecord = {
  id: string;
  payment_type: 'FULL' | 'MONTHLY';
  discount_percent?: number | null;
  is_active: boolean;
  is_in_use?: boolean;
  created_at: string;
  updated_at: string;
};

export type UserSubscriptionRecord = {
  id: string;
  user_code: string;
  sub_plan_id: string;
  payment_plan_id: string;
  total_amount: number;
  paid_amount: number;
  status: UserSubscriptionStatus;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
};

export type SubscriptionSearchRow = UserSubscriptionRecord & {
  user?: AdminUser;
  payment_plan?: PaymentPlanRecord;
  plan?: SubscriptionPlanRecord;
};

export type UserSubscriptionDetailRecord = {
  id: string;
  user_code: string;
  user?: AdminUser | null;
  status: UserSubscriptionStatus;
  start_date: string;
  end_date: string;
  total_amount: number;
  paid_amount: number;
  created_at: string;
  updated_at: string;
  subscription_plan?: SubscriptionPlanRecord | null;
  payment_plan?: PaymentPlanRecord | null;
  detail?: Record<string, unknown> | null;
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

export type ParkingSessionRecord = {
  id: string;
  access_card_id?: string | null;
  vehicle_mode?: string | null;
  license_plate?: string | null;
  check_in_time: string;
  check_out_time?: string | null;
  status: 'ACTIVE' | 'DONE';
  user_type: string;
  total_amount?: number | null;
  created_at: string;
  updated_at: string;
  check_in_plate_image_url?: string | null;
  check_out_plate_image_url?: string | null;
};

export type ParkingSessionAdminRow = ParkingSessionRecord & {
  user_code?: string | null;
  user_full_name?: string | null;
};

export type ParkingAccessCardAdminRow = {
  id: string;
  barcode_token: string;
  holder_type: HolderType;
  user_code?: string | null;
  user_subscription_id?: string | null;
  status: ParkingAccessCardStatus;
  current_session_id?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  user_full_name?: string | null;
  is_in_use: boolean;
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
