import { Tab, Tabs } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";

export default function ProfileNavTabs() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname;

  const tabValue =
    currentPath === "/profile/subscriptions"
      ? "/profile/subscriptions"
      : currentPath === "/profile/vehicles"
        ? "/profile/vehicles"
        : "/profile";

  return (
    <Tabs
      value={tabValue}
      onChange={(_event, value) => navigate(value)}
      sx={{
        mb: 3,
        minHeight: 44,
        borderBottom: "1px solid #E5E7EB",
        "& .MuiTab-root": {
          textTransform: "none",
          fontWeight: 600,
          minHeight: 44,
          color: "text.secondary",
          fontSize: "1rem",
        },
        "& .Mui-selected": {
          color: "primary.main",
        },
        "& .MuiTabs-indicator": {
          height: 3,
          borderRadius: 999,
        },
      }}
    >
      <Tab label={t("profile.tabs.profile")} value="/profile" />
      <Tab label={t("profile.tabs.subscriptions")} value="/profile/subscriptions" />
      <Tab label={t("profile.tabs.vehicles")} value="/profile/vehicles" />
    </Tabs>
  );
}
