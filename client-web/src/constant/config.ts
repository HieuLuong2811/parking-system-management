export const VITE_LOGIN_URL =
  process.env.REACT_APP_LOGIN_URL ??
  'http://localhost:5173/';
export const API_BASE_URL =
  process.env.REACT_APP_API_URL ?? 'http://localhost:8000/api/v1';
export const VITE_CLIENT_WEB_APP_ID =
  process.env.REACT_APP_CLIENT_WEB_APP_ID ?? 'client_web';

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
