export const normalizeText = (value?: string | null) => {
  return String(value || '').trim().toUpperCase();
};

export const formatDate = (value?: string | null) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const formatCurrency = (value?: number | string | null) => {
  if (value == null || value === "") return "-";

  const numberValue = Number(value);

  if (Number.isNaN(numberValue)) {
    return String(value);
  }

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(numberValue);
};

export const toDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const toStartOfDay = (value?: string) => {
  return value ? `${value} 00:00:00` : undefined;
};

export const toEndOfDay = (value?: string) => {
  return value ? `${value} 23:59:59` : undefined;
};

export const formatShortId = (value?: string | null) => {
  if (!value) return '—';

  const text = String(value);

  if (text.length <= 14) return text;

  return `${text.slice(0, 8)}...${text.slice(-4)}`;
};

export const formatNumber = (value: number | string | null | undefined) => {
  const numberValue = Number(value || 0);
  return new Intl.NumberFormat('vi-VN').format(numberValue);
};
