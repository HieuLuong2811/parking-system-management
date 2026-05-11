import { vehicleTypeOptions } from "../constant/config";

const DEFAULT_LOCALE = "vi-VN";
const DEFAULT_EMPTY_TEXT = "—";

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

export const formatCurrency = (
  value?: number | null,
  fallback = DEFAULT_EMPTY_TEXT,
) => {
  if (value === null || value === undefined) {
    return fallback;
  }

  return vndFormatter.format(value);
};

export const formatDate = (
  value?: string | Date | null,
  fallback = DEFAULT_EMPTY_TEXT,
) => {
  if (!value) {
    return fallback;
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return fallback;
  }

  return date.toLocaleDateString(DEFAULT_LOCALE);
};

export const formatDateTime = (
  value?: string | Date | null,
  fallback = DEFAULT_EMPTY_TEXT,
) => {
  if (!value) {
    return fallback;
  }

  const date = value instanceof Date ? value : new Date(value);

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

export const getVehicleTypeLabel = (
  vehicleType: string | undefined,
  t: (key: string, options?: { defaultValue?: string }) => string,
) => {
  if (!vehicleType) {
    return DEFAULT_EMPTY_TEXT;
  }

  const translationMap: Record<string, string> = {
    [vehicleTypeOptions.MOTORBIKE]: "vehicle.modal.types.motorbike",
    [vehicleTypeOptions.BICYCLE]: "vehicle.modal.types.bicycle",
    [vehicleTypeOptions.ELECTRIC_BICYCLE]:
      "vehicle.modal.types.electricBicycle",
  };

  const key = translationMap[vehicleType];

  return key ? t(key, { defaultValue: vehicleType }) : vehicleType;
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