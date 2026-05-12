export const VITE_LOGIN_URL = import.meta.env.VITE_LOGIN_URL ?? 'http://localhost:5173/';
export const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1";
export const EXPANDED_SIDEBAR_WIDTH = 300;
export const COLLAPSED_SIDEBAR_WIDTH = 80;
export const REACT_APP_USE_MOCK_SUBSCRIPTIONS = import.meta.env.VITE_USE_MOCK_SUBSCRIPTIONS === false;

export const vehicleTypeOptions = {
  MOTORBIKE: 'MOTORBIKE',
  BICYCLE: 'BICYCLE',
  ELECTRIC_BICYCLE: 'ELECTRIC_BICYCLE',
};

export const paymentMethodOptions = {
    CREDIT_CARD: 'CREDIT_CARD',
    MOMO: 'MOMO',
    STRIPE: 'STRIPE',
}

export const invoiceStatusOptions = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  FAILED: 'FAILED',
};

export const userTypes = {
  STUDENT: 'STUDENT',
  GUEST: 'GUEST',
};

export const subscriptionStatusOptions = {
  ACTIVE: 'ACTIVE',
  PENDING: 'PENDING',
  EXPIRED: 'EXPIRED',
  SUSPENDED: 'SUSPENDED',
};

export const planTypeOptions = {
  BASIC: 'BASIC',
  STARTUP: 'STARTUP',
  ENTERPRISE: 'ENTERPRISE',
};
