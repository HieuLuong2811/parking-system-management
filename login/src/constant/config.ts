import { joinUrl } from "../ultis/url";

const defaultDashboard = import.meta.env.VITE_DASHBOARD_URL;
const defaultApi = import.meta.env.VITE_API_URL;
const defaultLogin = import.meta.env.VITE_LOGIN_URL;
const defaultClientWeb = import.meta.env.VITE_CLIENT_WEB_URL;

// const apiRelativePath = (() => {
//   try {
//     const parsed = new URL(defaultApi);
//     const path = parsed.pathname.replace(/\/+$/, "");
//     return path || "/api/v1";
//   } catch {
//     return "/api/v1";
//   }
// })();

export const VITE_DASHBOARD_URL = defaultDashboard;
export const VITE_API_URL = defaultApi;
export const VITE_LOGIN_URL = defaultLogin;
export const VITE_CLIENT_WEB_URL = defaultClientWeb;

export const AUTH_LOGIN_URL = joinUrl(VITE_API_URL, "auth/login");

export const AUTH_ME_URL = joinUrl(VITE_API_URL, "auth/me");

export const Role = {
  ADMIN: "admin",
  USER: "user",
} as const;
