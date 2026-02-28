import { joinUrl } from "../utils/url";

export const VITE_DASHBOARD_URL = import.meta.env.VITE_DASHBOARD_URL;
export const VITE_CLIENT_URL = import.meta.env.VITE_CLIENT_URL;

export const URL_API_GET_EMPLOYEES = joinUrl(VITE_DASHBOARD_URL, "");