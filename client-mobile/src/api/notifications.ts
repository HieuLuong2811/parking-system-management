import type { Notification } from './clientApi';
import { getStoredSession, isExpired } from '../auth/authStorage';
import { apiClient } from './client';
import { joinUrl } from '../ultis/url';
import { EXPO_PUBLIC_API_URL } from '../constant/config';

function withAuthHeader(headers: Record<string, string> | undefined, token: string) {
  return { ...(headers ?? {}), Authorization: `Bearer ${token}` };
}

async function getValidAccessToken() {
  const session = await getStoredSession();
  if (!session) return null;
  if (isExpired(session.expiresAt)) return null;
  return session.accessToken;
}

const NOTIFICATIONS_ME_URL = joinUrl(EXPO_PUBLIC_API_URL, 'notifications/me');

export type NotificationsQuery = {
  limit?: number;
  offset?: number;
  is_read?: boolean;
  type?: string;
  created_from?: string;
  created_to?: string;
};

export async function listMyNotifications(query: NotificationsQuery = {}): Promise<Notification[]> {
  const token = await getValidAccessToken();
  if (!token) throw new Error('No valid access token');
  const res = await apiClient.get<Notification[]>(NOTIFICATIONS_ME_URL, {
    params: query,
    headers: withAuthHeader(undefined, token),
    withCredentials: true,
  });
  return res.data;
}
