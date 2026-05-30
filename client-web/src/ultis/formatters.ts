import { ParkingAccessCard } from "../api/parkingAccessCards";
import { parkingCardStatus } from "../constant/config";

const DEFAULT_LOCALE = "vi-VN";
const DEFAULT_EMPTY_TEXT = "—";
export const PRIMARY = '#2f9f3a';

export const numberFormatter = new Intl.NumberFormat(DEFAULT_LOCALE, {
  maximumFractionDigits: 0,
});

export const vndFormatter = new Intl.NumberFormat(DEFAULT_LOCALE, {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

export const formatNumber = (
  value?: number | null,
  fallback = DEFAULT_EMPTY_TEXT,
) => {
  if (value === null || value === undefined) {
    return fallback;
  }

  return numberFormatter.format(value);
};

export const formatCurrencyInput = (value?: number | string | null) => {
  if (value == null || value === "") return "";

  const numberOnly = String(value).replace(/\D/g, "");

  if (!numberOnly) return "";

  return Number(numberOnly).toLocaleString("vi-VN");
};

export const formatCurrency = (
  value?: number | null,
  fallback = DEFAULT_EMPTY_TEXT,
) => {
  if (value === null || value === undefined) {
    return fallback;
  }

  return vndFormatter.format(value);
};

export const formatDateTime = (
  value?: string | Date | null,
  fallback = DEFAULT_EMPTY_TEXT,
) => {
  if (!value) {
    return fallback;
  }

  const normalized =
    typeof value === "string" &&
    !/[zZ]|[+-]\d{2}:\d{2}$/.test(value)
      ? `${value.replace(" ", "T")}Z`
      : value;

  const date = value instanceof Date ? value : new Date(normalized);

  if (Number.isNaN(date.getTime())) {
    return fallback;
  }

  return date.toLocaleString(DEFAULT_LOCALE, {
    hour12: false,
  });
};

export const formatLocalDateTimeInput = (date: Date) => {
  const pad = (value: number) => String(value).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export const toStartOfDay = (value?: string) => {
  return value ? `${value}T00:00:00` : undefined;
};

export const toEndOfDay = (value?: string) => {
  return value ? `${value}T23:59:59` : undefined;
};

export const getBooleanLabel = (
  value: boolean | null | undefined,
  trueLabel: string,
  falseLabel: string,
) => ({
  enabled: Boolean(value),
  label: value ? trueLabel : falseLabel,
});

export const getPlanDisplayKey = (planType?: string | null) => {
  if (planType && planType !== "BASIC") {
    return planType.toLowerCase();
  }

  return "basic";
};

export const avatarText = (fullname: string | null | undefined) => {
  return String(fullname || '?')
    .trim()
    .split(/\s+/)
    .pop()
    ?.slice(0, 1)
    .toUpperCase() || '?';
};

export const canActivateCard = (card?: ParkingAccessCard) => {
  return card?.status === parkingCardStatus.DISABLED;
};

export const buildBarcodeUrl = (token?: string | null) => {
  const barcodeToken = token?.trim().toUpperCase();

  if (!barcodeToken) return null;

  return (
    `https://bwipjs-api.metafloor.com/` +
    `?bcid=code128` +
    `&text=${encodeURIComponent(barcodeToken)}` +
    `&scale=4` +
    `&height=14` +
    `&includetext=false` +
    `&paddingwidth=28` +
    `&paddingheight=8`
  );
};

export const getCardStatusLabel = (status?: string) => {
  switch (status) {
    case parkingCardStatus.ASSIGNED:
      return 'Đã kích hoạt'
    case parkingCardStatus.AVAILABLE:
      return 'Có sẵn';
    case parkingCardStatus.ACTIVE:
      return 'Đang hoạt động';
    case parkingCardStatus.DISABLED:
      return 'Chưa kích hoạt';
    case parkingCardStatus.LOST:
      return 'Đã báo mất';
    default:
      return status || 'Không xác định';
  }
};

export const getCardStatusColor = (status?: string) => {
  switch (status) {
    case parkingCardStatus.ACTIVE:
      return '#16a34a';
    case parkingCardStatus.DISABLED:
      return '#64748b';
    case parkingCardStatus.LOST:
      return '#dc2626';
    default:
      return '#64748b';
  }
};