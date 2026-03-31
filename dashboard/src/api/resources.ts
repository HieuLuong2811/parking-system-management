import { httpPost } from './httpClient';
import type { AdminUser } from './types';

export type UserImportEntry = {
  user_code: string;
  full_name: string;
  email: string;
};

export type ImportUsersPayload = {
  entries: UserImportEntry[];
};

export const importUsers = (roleCode: string, payload: ImportUsersPayload): Promise<AdminUser[]> => {
  return httpPost<AdminUser[]>(`/users/import/${roleCode}`, payload);
};
