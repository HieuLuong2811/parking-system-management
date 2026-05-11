import type { ColumnConfig, FormField, ResourceConfig, SearchField } from '../types/admin';

const vehicleTypeOptions = [
  { value: 'MOTORBIKE', label: 'Motorbike' },
  { value: 'BICYCLE', label: 'Bicycle' },
  { value: 'ELECTRIC_BICYCLE', label: 'Electric Bicycle' },
];

const paymentMethodOptions = [
  { value: 'SYSTEM', label: 'System' },
  { value: 'CASH', label: 'Cash' },
];

const invoiceStatusOptions = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'PAID', label: 'Paid' },
  { value: 'FAILED', label: 'Failed' },
];

const paymentTypeOptions = [
  { value: 'FULL', label: 'Full' },
  { value: 'MONTHLY', label: 'Monthly' },
];

const planTypeOptions = [
  { value: 'BASIC', label: 'Basic' },
  { value: 'STARTUP', label: 'Startup' },
  { value: 'ENTERPRISE', label: 'Enterprise' },
];


const subscriptionStatusOptions = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'EXPIRED', label: 'Expired' },
  { value: 'SUSPENDED', label: 'Suspended' },
];


const makeColumn = (field: string, label: string, width?: number, render?: ColumnConfig['render']): ColumnConfig => ({
  field,
  label,
  width,
  render,
});

const makeField = (field: string, label: string, type: FormField['type'], required?: boolean, options?: FormField['options']): FormField => ({
  field,
  label,
  type,
  required,
  options,
});

const makeSearch = (field: string, label: string, type: SearchField['type'] = 'text'): SearchField => ({
  field,
  label,
  type,
});

const jsonRender: ColumnConfig['render'] = (value) => {
  if (!value) return '-';
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
};

export const resourceConfigs: ResourceConfig[] = [
  {
    id: 'users',
    label: 'Users',
    translationKey: 'resources.tables.users',
    endpoint: 'users',
    primaryKey: 'user_code',
    hasSoftDelete: true,
    allowDelete: true,
    columns: [
      makeColumn('user_code', 'User code', 180),
      makeColumn('full_name', 'Full name', 220),
      makeColumn('phone_number', 'Phone number', 140),
      makeColumn('email', 'Email', 220),
      makeColumn('deleted_at', 'Deleted at', 180),
      makeColumn('created_at', 'Created at', 180),
      makeColumn('updated_at', 'Updated at', 180),
    ],
    formFields: [
      makeField('user_code', 'User code', 'text', true),
      makeField('full_name', 'Full name', 'text', true),
      makeField('email', 'Email', 'email', true),
      makeField('phone_number', 'Phone number', 'text'),
      makeField('password', 'Password', 'text', true),
    ],
    searchFields: [makeSearch('user_code', 'User code'), makeSearch('phone_number', 'Phone number')],
  },
  {
    id: 'vehicles',
    label: 'Vehicles',
    translationKey: 'resources.tables.vehicles',
    endpoint: 'vehicles',
    primaryKey: 'id',
    hasSoftDelete: true,
    allowDelete: true,
    columns: [
      makeColumn('id', 'Vehicle ID', 220),
      makeColumn('user_code', 'User code', 160),
      makeColumn('vehicle_type', 'Vehicle type', 160),
      makeColumn('license_plate', 'License plate', 160),
      makeColumn('barcode_token', 'Barcode', 220, (value) => (value ? String(value) : '-')),
      makeColumn('created_at', 'Created at', 180),
      makeColumn('deleted_at', 'Deleted at', 180),
    ],
    formFields: [
      makeField('user_code', 'User code', 'text', true),
      makeField('vehicle_type', 'Vehicle type', 'select', true, vehicleTypeOptions),
      makeField('license_plate', 'License plate', 'text', true),
      makeField('barcode_token', 'Barcode', 'text'),
    ],
    searchFields: [makeSearch('id', 'Vehicle ID')],
  },
  {
    id: 'roles',
    label: 'Roles',
    translationKey: 'resources.tables.roles',
    endpoint: 'roles',
    primaryKey: 'id',
    columns: [
      makeColumn('id', 'Role ID', 120),
      makeColumn('role_code', 'Code', 180),
      makeColumn('created_at', 'Created at', 180),
    ],
    formFields: [
      makeField('role_code', 'Code', 'text', true),
    ],
    searchFields: [makeSearch('role_code', 'Code')],
  },
  {
    id: 'terms',
    label: 'Academic Terms',
    translationKey: 'resources.tables.terms',
    endpoint: 'terms',
    primaryKey: 'id',
    columns: [
      makeColumn('id', 'Term ID', 180),
      makeColumn('term_code', 'Code', 160),
      makeColumn('term_name', 'Name', 220),
      makeColumn('start_date', 'Start', 160),
      makeColumn('end_date', 'End', 160),
    ],
    formFields: [
      makeField('term_code', 'Code', 'text', true),
      makeField('term_name', 'Name', 'text', true),
      makeField('start_date', 'Start date', 'date', true),
      makeField('end_date', 'End date', 'date', true),
    ],
    searchFields: [makeSearch('term_code', 'Code'), makeSearch('term_name', 'Name')],
  },
  {
    id: 'plans',
    label: 'Subscription Plans',
    translationKey: 'resources.tables.plans',
    endpoint: 'plans',
    primaryKey: 'id',
    hasSoftDelete: true,
    allowDelete: true,
    columns: [
      makeColumn('id', 'Plan ID', 200),
      makeColumn('plans_type', 'Plan type', 200),
      makeColumn('price_per_day', 'Price/day', 140),
      makeColumn('deleted_at', 'Deleted at', 180),
    ],
    formFields: [
      makeField('plans_type', 'Plan type', 'select', true, planTypeOptions),
      makeField('price_per_day', 'Price per day', 'number', true),
    ],
    searchFields: [makeSearch('plans_type', 'Plan type')],
  },
  {
    id: 'subscriptions',
    label: 'User Subscriptions',
    translationKey: 'resources.tables.subscriptions',
    endpoint: 'subscriptions',
    primaryKey: 'id',
      columns: [
        makeColumn('id', 'Subscription ID', 220),
        makeColumn('user_code', 'User code', 160),
        makeColumn('sub_plan_id', 'Plan ID', 160),
        makeColumn('term_id', 'Term ID', 160),
        makeColumn('payment_type', 'Payment type', 160),
          makeColumn('start_date', 'Start date', 160),
        makeColumn('end_date', 'End date', 160),
      ],
      formFields: [
        makeField('user_code', 'User code', 'text', true),
        makeField('sub_plan_id', 'Plan ID', 'text', true),
        makeField('term_id', 'Term ID', 'text', true),
        makeField('payment_type', 'Payment type', 'select', true, paymentTypeOptions),
        makeField('status', 'Status', 'select', true, subscriptionStatusOptions),
        makeField('start_date', 'Start date', 'date'),
        makeField('end_date', 'End date', 'date'),
      ],
      searchFields: [
        makeSearch('user_code', 'User code'),
        makeSearch('sub_plan_id', 'Plan ID'),
        makeSearch('term_id', 'Term ID'),
        makeSearch('status', 'Status'),
      ],
  },
  {
    id: 'parking_sessions',
    label: 'Parking Sessions',
    translationKey: 'resources.tables.parkingSessions',
    endpoint: 'parking_sessions',
    primaryKey: 'id',
    columns: [
      makeColumn('id', 'Session ID', 220),
      makeColumn('vehicle_id', 'Vehicle ID', 180),
      makeColumn('license_plate', 'License plate', 160),
      makeColumn('check_in_time', 'Check in', 180),
      makeColumn('check_out_time', 'Check out', 180),
      makeColumn('user_type', 'User type', 140),
      makeColumn('total_amount', 'Amount', 140),
    ],
    formFields: [
      makeField('vehicle_id', 'Vehicle ID', 'text', true),
      makeField('license_plate', 'License plate', 'text'),
      makeField('check_in_time', 'Check-in', 'datetime-local', true),
      makeField('check_out_time', 'Check-out', 'datetime-local'),
      makeField('status', 'Status', 'select', true, [
        { value: 'ACTIVE', label: 'Active' },
        { value: 'DONE', label: 'Done' },
      ]),
      makeField('user_type', 'User type', 'text', true),
      makeField('total_amount', 'Total amount', 'number'),
    ],
    searchFields: [makeSearch('vehicle_id', 'Vehicle ID'), makeSearch('status', 'Status')],
  },
  {
    id: 'invoices',
    label: 'Invoices',
    translationKey: 'resources.tables.invoices',
    endpoint: 'invoices',
    primaryKey: 'id',
    columns: [
      makeColumn('id', 'Invoice ID', 220),
      makeColumn('user_code', 'User code', 160),
      makeColumn('subscription_id', 'Subscription ID', 200),
      makeColumn('total_amount', 'Amount', 140),
      makeColumn('payment_method', 'Payment method', 140),
      makeColumn('status', 'Status', 120),
      makeColumn('metadata', 'Meta data', 200, jsonRender),
    ],
    formFields: [
      makeField('user_code', 'User code', 'text', true),
      makeField('subscription_id', 'Subscription ID', 'text', true),
      makeField('total_amount', 'Total amount', 'number', true),
      makeField('payment_method', 'Payment method', 'select', true, paymentMethodOptions),
      makeField('status', 'Status', 'select', true, invoiceStatusOptions),
      makeField('metadata', 'Meta data', 'textarea'),
    ],
    searchFields: [makeSearch('user_code', 'User code'), makeSearch('status', 'Status')],
  },
  {
    id: 'payment_transactions',
    label: 'Payment Transactions',
    translationKey: 'resources.tables.paymentTransactions',
    endpoint: 'payment_transactions',
    primaryKey: 'id',
    columns: [
      makeColumn('id', 'Transaction ID', 250),
      makeColumn('invoice_id', 'Invoice ID', 220),
      makeColumn('attempt_number', 'Attempt', 100),
      makeColumn('transaction_code', 'Code', 240),
      makeColumn('response_message', 'Response', 260),
    ],
    formFields: [
      makeField('invoice_id', 'Invoice ID', 'text', true),
      makeField('attempt_number', 'Attempt', 'number'),
      makeField('transaction_code', 'Code', 'text', true),
      makeField('response_message', 'Response', 'textarea'),
    ],
    searchFields: [makeSearch('invoice_id', 'Invoice ID')],
  },
  {
    id: 'billing_event_logs',
    label: 'Billing Events',
    translationKey: 'resources.tables.billingEventLogs',
    endpoint: 'billing_event_logs',
    primaryKey: 'id',
    columns: [
      makeColumn('id', 'Event ID', 220),
      makeColumn('user_code', 'User code', 160),
      makeColumn('subscription_id', 'Subscription ID', 180),
      makeColumn('event_type', 'Type', 180),
      makeColumn('metadata', 'Meta', 240, jsonRender),
    ],
    formFields: [
      makeField('user_code', 'User code', 'text', true),
      makeField('subscription_id', 'Subscription ID', 'text', true),
      makeField('event_type', 'Event type', 'text', true),
      makeField('metadata', 'Meta data', 'textarea'),
    ],
    searchFields: [makeSearch('user_code', 'User code'), makeSearch('event_type', 'Event type')],
  },
];










