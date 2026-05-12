import type { AuthUser } from '../auth/authStorage';
import { getStoredSession, isExpired } from '../auth/authStorage';
import { AUTH_EXCHANGE_CODE_URL, AUTH_LOGIN_URL, AUTH_LOGOUT_URL, AUTH_ME_URL } from '../constant/config';
import { apiClient } from './client';

export interface LoginRequest {
  user_code: string;
  password: string;
}

export interface AuthCodeResponse {
  code: string;
  expires_at: string;
  user_code: string;
  roles: string[];
}

export interface ExchangeCodeRequest {
  code: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_at: string;
  user_code: string;
  roles: string[];
}

export interface UpdateProfilePayload {
  full_name: string;
  email: string;
  phone: string;
}

function withAuthHeader(headers: Record<string, string> | undefined, token: string) {
  return { ...(headers ?? {}), Authorization: `Bearer ${token}` };
}

async function getValidAccessToken() {
  const session = await getStoredSession();
  if (!session) return null;
  if (isExpired(session.expiresAt)) return null;
  return session.accessToken;
}

export async function loginApi(data: LoginRequest): Promise<AuthCodeResponse> {
  const res = await apiClient.post<AuthCodeResponse>(AUTH_LOGIN_URL, data, { withCredentials: true });
  return res.data;
}

export async function exchangeCodeApi(data: ExchangeCodeRequest): Promise<TokenResponse> {
  const res = await apiClient.post<TokenResponse>(AUTH_EXCHANGE_CODE_URL, data, { withCredentials: true });
  return res.data;
}

export async function meApi(): Promise<AuthUser> {
  const token = await getValidAccessToken();
  if (!token) {
    throw new Error('No valid access token');
  }
  const res = await apiClient.get<AuthUser>(AUTH_ME_URL, {
    headers: withAuthHeader(undefined, token),
    withCredentials: true,
  });
  return res.data;
}

export async function logoutApi(): Promise<void> {
  const token = await getValidAccessToken();
  await apiClient.post(
    AUTH_LOGOUT_URL,
    {},
    {
      headers: token ? withAuthHeader(undefined, token) : undefined,
      withCredentials: true,
    }
  );
}

