import { createContext } from 'react';

export const AUTH_STATUS = {
  LOADING: 'loading',
  UNAUTHORIZED: 'unauthorized',
  AUTHENTICATED: 'authenticated',
  FORBIDDEN: 'forbidden',
} as const;

export type AuthStatus = typeof AUTH_STATUS[keyof typeof AUTH_STATUS];

export interface AuthContextValue {
  user: import('../api/auth').CurrentUser | null;
  status: AuthStatus;
  refresh: () => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);