import type { AxiosRequestHeaders } from 'axios';
import axios from 'axios';
import { API_BASE_URL } from '../constant/config';

export type CurrentUser = {
  user_code: string;
  full_name: string;
  email: string;
  roles: string[];
  is_active: boolean;
};

export const fetchCurrentUser = async (token?: string): Promise<CurrentUser> => {
  const headers: AxiosRequestHeaders = {} as AxiosRequestHeaders;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const response = await axios.get<CurrentUser>(`${API_BASE_URL}/auth/me`, { headers });
  return response.data;
};
