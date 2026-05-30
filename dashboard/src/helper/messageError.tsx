import type { TFunction } from "i18next";

export const getApiErrorMessage = (
  err: unknown,
  t: TFunction<'translation', [key: string, options?: unknown]>,
  errorBaseKey: string,
  fallback: string,
) => {
  const error = err as {
    response?: {
      data?: {
        detail?: unknown;
      };
    };
    message?: string;
  };

  const detail = error.response?.data?.detail;

  if (typeof detail === 'string') {
    return t(`${errorBaseKey}.${detail}`, {
      defaultValue: fallback,
    });
  }

  if (Array.isArray(detail)) {
    return detail
      .map((item) => item?.msg)
      .filter(Boolean)
      .join(', ');
  }

  return fallback;
};