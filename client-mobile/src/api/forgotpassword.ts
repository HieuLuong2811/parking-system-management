import axios from 'axios';
import {
  AUTH_FORGOT_PASSWORD_REQUEST_URL,
  AUTH_FORGOT_PASSWORD_RESET_URL,
  AUTH_FORGOT_PASSWORD_VERIFY_URL,
} from '../constant/config';

export type ForgotPasswordRequestPayload = {
  user_code: string;
  email: string;
};

export type ForgotPasswordRequestResponse = {
  expires_at: string;
  ttl_seconds: number;
  throttle_seconds: number;
};

export type ForgotPasswordVerifyPayload = {
  user_code: string;
  code: string;
};

export type ForgotPasswordVerifyResponse = {
  valid: boolean;
};

export type ForgotPasswordResetPayload = {
  user_code: string;
  code: string;
  new_password: string;
};

export async function requestForgotPassword(payload: ForgotPasswordRequestPayload) {
  const res = await axios.post<ForgotPasswordRequestResponse>(AUTH_FORGOT_PASSWORD_REQUEST_URL, payload, {
    withCredentials: true,
  });
  return res.data;
}

export async function verifyForgotPasswordCode(payload: ForgotPasswordVerifyPayload) {
  const res = await axios.post<ForgotPasswordVerifyResponse>(AUTH_FORGOT_PASSWORD_VERIFY_URL, payload, {
    withCredentials: true,
  });
  return res.data;
}

export async function resetForgotPassword(payload: ForgotPasswordResetPayload) {
  const res = await axios.post<{ detail: string }>(AUTH_FORGOT_PASSWORD_RESET_URL, payload, {
    withCredentials: true,
  });
  return res.data;
}
