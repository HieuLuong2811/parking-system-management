import { createContext } from 'react';

export type AuthStatus = 'loading' | 'unauthorized' | 'authenticated' | 'forbidden';

export interface AuthContextValue {
  user: import('../api/auth').CurrentUser | null;
  status: AuthStatus;
  refresh: () => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
