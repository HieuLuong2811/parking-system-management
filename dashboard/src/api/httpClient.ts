import axios from 'axios';
import { getSessionToken } from '../ultis/tokenStorage';
import { API_BASE_URL } from '../constant/config';

const adminHttp = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

adminHttp.interceptors.request.use((config) => {
  const token = getSessionToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const httpGet = async <T>(path: string): Promise<T> => {
  const response = await adminHttp.get<T>(path);
  return response.data;
};

export const httpPost = async <T>(path: string, payload: unknown): Promise<T> => {
  const response = await adminHttp.post<T>(path, payload);
  return response.data;
};

export const httpPatch = async <T>(path: string, payload: unknown): Promise<T> => {
  const response = await adminHttp.patch<T>(path, payload);
  return response.data;
};

export const httpDelete = async (path: string): Promise<void> => {
  await adminHttp.delete(path);
};
