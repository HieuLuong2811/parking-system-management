import { UserSubscriptionDetail } from "../api/clientApi";
import { InvoiceStatus, ParkingSessionStatus, SubscriptionPlanType } from "../constant/types";
import { normalizeText } from "./format";

export const getPlanMeta = (type: string) => {
  const normalized = normalizeText(type);

  if (normalized.includes(SubscriptionPlanType.BASIC)) {
    return {
      labelKey: "plans.basic",
      icon: "shield-star-outline" as const,
      dark: true,
      borderColor: "#facc15",
    };
  }

  if (normalized.includes(SubscriptionPlanType.STARTUP)) {
    return {
      labelKey: "plans.startup",
      icon: "rocket-launch-outline" as const,
      dark: false,
      borderColor: "#dbeafe",
    };
  }

  if (normalized.includes(SubscriptionPlanType.ENTERPRISE)) {
    return {
      labelKey: "plans.enterprise",
      icon: "diamond-stone" as const,
      dark: false,
      borderColor: "#dbeafe",
    };
  }

  return {
    labelKey: "",
    icon: "parking" as const,
    dark: false,
    borderColor: "#dbeafe",
  };
};

export const getPlanNameKey = (plansType?: string | null) => {
  const normalized = normalizeText(plansType);

  if (normalized.includes(SubscriptionPlanType.BASIC)) return "plans.basic";
  if (normalized.includes(SubscriptionPlanType.STARTUP)) return "plans.startup";
  if (normalized.includes(SubscriptionPlanType.ENTERPRISE)) return "plans.enterprise";
  return "";
};

export const getVehicleDisplayName = (
  vehicle?: UserSubscriptionDetail["vehicle"] | null,
  fallback?: string,
) => {
  if (!vehicle) return fallback || "—";

  const licensePlate = vehicle.license_plate?.trim();

  if (licensePlate) {
    return licensePlate;
  }

  return fallback || vehicle.id || "—";
};


export const getParkingStatusColor = (status?: string | null) => {
  const normalized = normalizeText(status);

  if (normalized === ParkingSessionStatus.ACTIVE) {
    return {
      bg: "#dcfce7",
      text: "#15803d",
      dot: "#16a34a",
      border: "#bbf7d0",
    };
  }

  if (normalized === ParkingSessionStatus.DONE) {
    return {
      bg: "#dbeafe",
      text: "#1d4ed8",
      dot: "#2563eb",
      border: "#bfdbfe",
    };
  }

  return {
    bg: "#f1f5f9",
    text: "#475569",
    dot: "#94a3b8",
    border: "#e2e8f0",
  };
};

export const getInvoiceStatus = (status?: string | null) => {
  const normalized = normalizeText(status);

  if (normalized === InvoiceStatus.PAID) {
    return {
      bg: "#dcfce7",
      text: "#15803d",
      border: "#bbf7d0",
      dot: "#16a34a",
      icon: "checkmark-circle-outline" as const,
    };
  }

  if (normalized === InvoiceStatus.PENDING) {
    return {
      bg: "#fef3c7",
      text: "#b45309",
      border: "#fde68a",
      dot: "#f59e0b",
      icon: "time-outline" as const,
    };
  }

  if (normalized === InvoiceStatus.FAILED) {
    return {
      bg: "#fee2e2",
      text: "#b91c1c",
      border: "#fecaca",
      dot: "#ef4444",
      icon: "alert-circle-outline" as const,
    };
  }

  return {
    bg: "#f1f5f9",
    text: "#475569",
    border: "#e2e8f0",
    dot: "#94a3b8",
    icon: "help-circle-outline" as const,
  };
};

export const getInvoiceStatusLabelKey = (status?: string | null) => {
  const normalized = normalizeText(status);

  if (normalized === InvoiceStatus.PAID) return "invoices.status.paid";
  if (normalized === InvoiceStatus.PENDING) return "invoices.status.pending";
  if (normalized === InvoiceStatus.FAILED) return "invoices.status.failed";

  return "";
};

export const getUserSubscriptionStatusColor = (status?: string | null) => {
  const normalized = normalizeText(status);

  switch (normalized) {
    case "ACTIVE":
      return {
        bg: "#dcfce7",
        text: "#15803d",
        border: "#bbf7d0",
      };

    case "PAYMENT_DUE":
      return {
        bg: "#fef3c7",
        text: "#b45309",
        border: "#fde68a",
      };

    case "OVERDUE":
      return {
        bg: "#fee2e2",
        text: "#dc2626",
        border: "#fecaca",
      };

    case "CANCELED":
      return {
        bg: "#f1f5f9",
        text: "#475569",
        border: "#cbd5e1",
      };

    case "SUSPENDED":
      return {
        bg: "#fce7f3",
        text: "#be185d",
        border: "#fbcfe8",
      };

    case "INACTIVE":
      return {
        bg: "#f3f4f6",
        text: "#6b7280",
        border: "#e5e7eb",
      };

    default:
      return {
        bg: "#eff6ff",
        text: "#2563eb",
        border: "#bfdbfe",
      };
  }
};
