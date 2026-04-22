import * as SecureStore from 'expo-secure-store';

export type AuthUser = {
  user_code: string;
  full_name: string;
  email: string;
  roles: string[];
  language_use?: string | null;
};

export type StoredAuthSession = {
  accessToken: string;
  expiresAt: string;
  user: AuthUser | null;
};

const AUTH_SESSION_KEY = 'auth_session_v1';
const EXPIRY_SKEW_SECONDS = 30;

let memorySession: StoredAuthSession | null | undefined = undefined;

function isIsoDateString(value: string) {
  return !Number.isNaN(Date.parse(value));
}

export function isExpired(expiresAtIso: string, skewSeconds: number = EXPIRY_SKEW_SECONDS) {
  if (!isIsoDateString(expiresAtIso)) return true;
  const nowMs = Date.now();
  const expMs = Date.parse(expiresAtIso);
  return expMs - nowMs <= skewSeconds * 1000;
}

export async function getStoredSession(): Promise<StoredAuthSession | null> {
  if (memorySession !== undefined) return memorySession;

  const raw = await SecureStore.getItemAsync(AUTH_SESSION_KEY);
  if (!raw) {
    memorySession = null;
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as StoredAuthSession;
    if (!parsed?.accessToken || !parsed?.expiresAt) {
      memorySession = null;
      return null;
    }
    memorySession = parsed;
    return parsed;
  } catch {
    memorySession = null;
    return null;
  }
}

export async function setStoredSession(session: StoredAuthSession) {
  memorySession = session;
  await SecureStore.setItemAsync(AUTH_SESSION_KEY, JSON.stringify(session));
}

export async function updateStoredUser(user: AuthUser | null) {
  const current = await getStoredSession();
  if (!current) return;
  await setStoredSession({ ...current, user });
}

export async function clearStoredSession() {
  memorySession = null;
  await SecureStore.deleteItemAsync(AUTH_SESSION_KEY);
}

export function peekStoredSession() {
  return memorySession ?? null;
}
