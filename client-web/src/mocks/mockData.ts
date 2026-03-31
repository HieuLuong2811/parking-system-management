import type { InvoiceInfo, ParkingSession, SubscriptionPlanRecord, UserInfo, VehicleInfo } from '../api/clientApi';

const baseTime = new Date('2026-03-29T05:00:00.000Z');
const at = (minutes: number) => new Date(baseTime.getTime() + minutes * 60 * 1000).toISOString();

export const isMockMode = process.env.REACT_APP_USE_MOCK_DATA === 'true';

const mockVehicles: VehicleInfo[] = [
  {
    id: 'veh-001',
    user_code: 'U001',
    vehicle_type: 'MOTORBIKE',
    license_plate: '29A-111.22',
    qr_code: 'QR-VEH-001',
    created_at: at(-360),
    updated_at: at(-240),
    deleted_at: null,
    is_active: true,
  },
  {
    id: 'veh-002',
    user_code: 'U002',
    vehicle_type: 'ELECTRIC_BICYCLE',
    license_plate: '30B-1234',
    qr_code: 'QR-VEH-002',
    created_at: at(-1440),
    updated_at: at(-780),
    deleted_at: null,
    is_active: true,
  },
  {
    id: 'veh-003',
    user_code: 'U001',
    vehicle_type: 'BICYCLE',
    license_plate: '1B-9999',
    qr_code: null,
    created_at: at(-2880),
    updated_at: at(-1200),
    deleted_at: null,
    is_active: false,
  },
];

const mockParkingSessions: ParkingSession[] = [
  {
    id: 'session-001',
    vehicle_id: 'veh-001',
    license_plate: '29A-111.22',
    check_in_time: at(-90),
    check_out_time: null,
    user_type: 'STAFF',
    status: 'ACTIVE',
    total_amount: null,
    created_at: at(-90),
    updated_at: at(-90),
  },
  {
    id: 'session-002',
    vehicle_id: 'veh-002',
    license_plate: '30B-1234',
    check_in_time: at(-600),
    check_out_time: at(-420),
    user_type: 'STUDENT',
    status: 'DONE',
    total_amount: 42000,
    created_at: at(-600),
    updated_at: at(-420),
  },
  {
    id: 'session-003',
    vehicle_id: 'veh-003',
    license_plate: '1B-9999',
    check_in_time: at(-1200),
    check_out_time: at(-1080),
    user_type: 'GUEST',
    status: 'DONE',
    total_amount: 23000,
    created_at: at(-1200),
    updated_at: at(-1080),
  },
];

const mockInvoices: InvoiceInfo[] = [
  {
    id: 'inv-001',
    user_code: 'U001',
    subscription_id: 'sub-002',
    amount: 120000,
    stripe_invoice_id: 'stripe_inv_001',
    payment_method: 'SYSTEM',
    status: 'PAID',
    created_at: at(-4320),
    metadata: {
      due_at: at(-4260),
      period: 'Tháng 3/2026',
    },
  },
  {
    id: 'inv-002',
    user_code: 'U002',
    subscription_id: 'sub-001',
    amount: 45000,
    stripe_invoice_id: null,
    payment_method: 'CASH',
    status: 'PENDING',
    created_at: at(-2880),
    metadata: {
      due_at: at(-2820),
      period: 'Ngày 15/3/2026',
    },
  },
];

const mockUsers: UserInfo[] = [
  {
    user_code: 'U001',
    full_name: 'Nguyễn Thị Lan',
    email: 'lan.le@parking.edu.vn',
    phone_number: '0987654321',
    stripe_customer_id: 'cus_ABC123',
    language_use: 'vi',
    is_active: true,
    created_at: at(-10000),
    updated_at: at(-5000),
    deleted_at: null,
  },
  {
    user_code: 'U002',
    full_name: 'Trần Văn Nam',
    email: 'nam.tran@parking.edu.vn',
    phone_number: '0912345678',
    stripe_customer_id: 'cus_XYZ789',
    language_use: 'en',
    is_active: true,
    created_at: at(-15000),
    updated_at: at(-4000),
    deleted_at: null,
  },
];

const mockSubscriptionPlans: SubscriptionPlanRecord[] = [
  {
    id: 'plan-semester',
    plan_name: 'Gói học kỳ',
    price_per_day: 4500,
    description: 'Sử dụng không giới hạn trong một học kỳ, thanh toán một lần.',
    deleted_at: null,
    created_at: at(-20000),
    updated_at: at(-10000),
  },
  {
    id: 'plan-monthly',
    plan_name: 'Gói tháng',
    price_per_day: 5200,
    description: 'Gia hạn hàng tháng, tự động trừ phí qua thẻ.',
    deleted_at: null,
    created_at: at(-18000),
    updated_at: at(-9000),
  },
];

export { mockVehicles, mockParkingSessions, mockInvoices, mockUsers, mockSubscriptionPlans };
