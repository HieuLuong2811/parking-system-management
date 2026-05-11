import { normalizeText } from "./format";

export const getPlanMeta = (type: string) => {
  const normalized = normalizeText(type);

  if (normalized.includes("BASIC") || normalized.includes("CƠ BẢN")) {
    return {
      labelKey: "plans.basic",
      icon: "shield-star-outline" as const,
      dark: true,
      borderColor: "#facc15",
    };
  }

  if (normalized.includes("STARTUP") || normalized.includes("KHỞI")) {
    return {
      labelKey: "plans.startup",
      icon: "rocket-launch-outline" as const,
      dark: false,
      borderColor: "#dbeafe",
    };
  }

  if (normalized.includes("ENTERPRISE") || normalized.includes("DOANH")) {
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
