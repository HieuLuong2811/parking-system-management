const TOKEN_KEY = "parking_admin_access_token";

export const setSessionToken = (token: string) => {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(TOKEN_KEY, token);
};

export const clearSessionToken = () => {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(TOKEN_KEY);
};

export const getSessionToken = () => {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(TOKEN_KEY);
};
