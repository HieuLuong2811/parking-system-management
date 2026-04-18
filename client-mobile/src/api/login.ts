import axios from "axios";
import { AUTH_LOGIN_URL } from "../constant/config";

export interface LoginRequest {
  user_code: string;
  password: string;
}

export interface LoginResponse {
  code: string;
  expires_at: string;
  user_code: string;
  roles: string[];
}

export const loginApi = async (data: LoginRequest): Promise<LoginResponse> => {
  const res = await axios.post(`${AUTH_LOGIN_URL}`, data, { withCredentials: true });
  return res.data;
};
