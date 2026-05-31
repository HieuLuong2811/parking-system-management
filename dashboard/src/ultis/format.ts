import type { SidebarItemConfig } from "../components/layout/menu";

export const formatCurrency = (value?: number | string | null) => {
  if (value === null || value === undefined || value === "") return "-";

  const numericValue =
    typeof value === "number" ? value : Number(value);

  if (Number.isNaN(numericValue)) return "-";

  return `${numericValue.toLocaleString("vi-VN", {
    maximumFractionDigits: 2,
  })} đ`;
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

  const normalized =
    typeof value === 'string' &&
    // Treat naive timestamps (no timezone offset) as UTC coming from backend TIMESTAMP WITHOUT TIME ZONE.
    !/[zZ]|[+-]\d{2}:\d{2}$/.test(value)
      ? `${value.replace(' ', 'T')}Z`
      : value;

  const date = new Date(normalized);
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

const pad2 = (value: number) => String(value).padStart(2, '0');
export const toLocalDateTimeInputValue = (date: Date) => {
  const year = date.getFullYear();
  const month = pad2(date.getMonth() + 1);
  const day = pad2(date.getDate());
  const hours = pad2(date.getHours());
  const minutes = pad2(date.getMinutes());
  const seconds = pad2(date.getSeconds());
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

export const buildItems = (items: SidebarItemConfig[], t: (key: string) => string) =>
  items.map((item) => ({
    id: item.id,
    text: t(item.translationKey),
    icon: item.icon,
    path: item.path,
  }));
