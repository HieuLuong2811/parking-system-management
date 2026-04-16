import axios from 'axios';
import { API_BASE_URL } from '../constant/config';

export const adminHttp = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export const httpGet = async <T>(path: string): Promise<T> => {
  try {
    const response = await adminHttp.get<T>(path);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return ([] as unknown) as T;
    }
    throw error;
  }
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
