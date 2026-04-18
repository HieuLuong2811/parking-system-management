export const formatCurrency = (value?: number | null) => {
  if (value === null || value === undefined) return '-';
  return value.toLocaleString('vi-VN', { maximumFractionDigits: 2 });
};

export const formatCurrencyInvoice = (value: unknown) => {
  if (value === null || value === undefined || value === '') {
    return '-';
  }
  const normalized = Number(value);
  if (Number.isNaN(normalized)) {
    return String(value);
  }
  return normalized.toLocaleString(undefined, { maximumFractionDigits: 2 });
};

export const formatMeta = (value: unknown) => {
  if (value === null || value === undefined) {
    return '-';
  }
  if (typeof value === 'string') {
    return value;
  }
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

export function formatDateTime(value?: string | null) {
  if (!value) return '-';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  return date.toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}
