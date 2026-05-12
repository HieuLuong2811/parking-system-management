import axios from 'axios';
import { API_BASE_URL } from '../constant/config';

export type CurrentUser = {
  user_code: string;
  full_name: string;
  email: string;
  roles: string[];
};

export const fetchCurrentUser = async (): Promise<CurrentUser> => {
  const response = await axios.get<CurrentUser>(`${API_BASE_URL}/auth/me`, { withCredentials: true });
  return response.data;
};

export const exchangeAuthCode = async (code: string): Promise<void> => {
  await axios.post(`${API_BASE_URL}/auth/exchange-code`, { code }, { withCredentials: true });
};

export const logoutAuth = async (): Promise<void> => {
  await axios.post(`${API_BASE_URL}/auth/logout`, null, { withCredentials: true });
};