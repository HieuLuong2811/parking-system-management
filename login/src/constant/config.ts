import { joinUrl } from "../utils/url";

const defaultDashboard = import.meta.env.VITE_DASHBOARD_URL;
const defaultApi = import.meta.env.VITE_API_URL;
const defaultLogin = import.meta.env.VITE_LOGIN_URL;
const defaultClientWeb = import.meta.env.VITE_CLIENT_WEB_URL;

const apiRelativePath = (() => {
  try {
    const parsed = new URL(defaultApi);
    return parsed.pathname.replace(/\/+$/, '') || '/';
  } catch {
    return '/api/v1';
  }
})();

export const VITE_DASHBOARD_URL = defaultDashboard;
export const VITE_API_URL = defaultApi;
export const VITE_LOGIN_URL = defaultLogin;
export const VITE_CLIENT_WEB_URL = defaultClientWeb;

export const AUTH_LOGIN_URL = import.meta.env.DEV
  ? joinUrl(apiRelativePath, "auth/login")
  : joinUrl(VITE_API_URL, "auth/login");
