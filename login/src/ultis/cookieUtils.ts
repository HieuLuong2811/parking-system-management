// Hằng số
export const COOKIE_NAME = 'access_token';

/**
 * Đặt một Cookie.
 * @param name Tên của cookie.
 * @param value Giá trị của cookie (access_token).
 * @param days Số ngày cookie có hiệu lực.
 */
export const setCookie = (name: string, value: string, days: number) => {
  if (typeof document === 'undefined') return;
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = "; expires=" + date.toUTCString();
  // path=/ để cookie có sẵn trên tất cả các đường dẫn
  document.cookie = name + "=" + (value || "")  + expires + "; path=/; SameSite=Lax";
};

/**
 * Xóa một Cookie (bằng cách đặt thời gian hết hạn là quá khứ).
 * @param name Tên của cookie.
 */
export const deleteCookie = (name: string) => {
  if (typeof document === 'undefined') return;
  document.cookie = name + '=; Max-Age=-99999999; path=/; SameSite=Lax';  
};