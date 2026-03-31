export const formatTimestamp = (value?: string | null) =>
  value ? new Date(value).toLocaleString() : '-';

export const formatCurrency = (value?: number | null) => {
  if (value === null || value === undefined) return '-';
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
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
