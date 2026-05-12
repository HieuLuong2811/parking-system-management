import { joinUrl } from '../ultis/url';

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const RENDER_QR_CODE_URL = process.env.EXPO_PUBLIC_RENDER_QR_CODE_URL;

export const EXPO_PUBLIC_API_URL = API_URL;
export const EXPO_RENDER_QR_CODE_URL = RENDER_QR_CODE_URL;

export const AUTH_LOGIN_URL = joinUrl(EXPO_PUBLIC_API_URL, 'auth/login');
export const AUTH_EXCHANGE_CODE_URL = joinUrl(EXPO_PUBLIC_API_URL, 'auth/exchange-code');
export const AUTH_ME_URL = joinUrl(EXPO_PUBLIC_API_URL, 'auth/me');
export const AUTH_LOGOUT_URL = joinUrl(EXPO_PUBLIC_API_URL, 'auth/logout');
export const AUTH_FORGOT_PASSWORD_REQUEST_URL = joinUrl(EXPO_PUBLIC_API_URL, 'auth/forgot-password/request');
export const AUTH_FORGOT_PASSWORD_VERIFY_URL = joinUrl(EXPO_PUBLIC_API_URL, 'auth/forgot-password/verify');
export const AUTH_FORGOT_PASSWORD_RESET_URL = joinUrl(EXPO_PUBLIC_API_URL, 'auth/forgot-password/reset');
export const RENDER_QR_CODE = joinUrl(EXPO_RENDER_QR_CODE_URL, '?size=320x320&data=');

export const Role = {
  ADMIN: 'admin',
  USER: 'user',
  SECURITY: 'security',
} as const;
