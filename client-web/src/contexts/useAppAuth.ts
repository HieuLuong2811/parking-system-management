import { useContext } from 'react';
import { AppAuthContext, AppAuthContextValue } from './AppAuthContext';

export const useAppAuth = (): AppAuthContextValue => {
  const value = useContext(AppAuthContext);
  if (!value) {
    throw new Error('useAppAuth must be used within AppAuthProvider');
  }
  return value;
};
