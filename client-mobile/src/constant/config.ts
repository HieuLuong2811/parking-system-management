import { Platform } from 'react-native';

import { joinUrl } from '../ultis/url';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const EXPO_PUBLIC_API_URL = API_URL;

export const AUTH_LOGIN_URL = joinUrl(EXPO_PUBLIC_API_URL, 'auth/login');
export const AUTH_EXCHANGE_CODE_URL = joinUrl(EXPO_PUBLIC_API_URL, 'auth/exchange-code');
export const AUTH_ME_URL = joinUrl(EXPO_PUBLIC_API_URL, 'auth/me');
export const AUTH_LOGOUT_URL = joinUrl(EXPO_PUBLIC_API_URL, 'auth/logout');

export const Role = {
  ADMIN: 'admin',
  USER: 'user',
} as const;

