import {
  Box,
  Button,
  CircularProgress,
  Drawer,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { formatCurrency, formatDate } from "../../ultis/formatters";

type Props = {
  open: boolean;
  subscription: any | null;
  vehicles: any[];
  isUpdating: boolean;
  onClose: () => void;
  onAddVehicle: () => void;
  onUpdateVehicles: (
    subscriptionId: string,
    vehicleIds: string[],
  ) => Promise<void>;
};

export default function SubscriptionVehicleDrawer({
  open,
  subscription,
  vehicles,
  isUpdating,
  onClose,
  onAddVehicle,
  onUpdateVehicles,
}: Props) {
  const { t } = useTranslation();

  const [licensedVehicleId, setLicensedVehicleId] = useState("");
  const [unlicensedVehicleId, setUnlicensedVehicleId] = useState("");

  useEffect(() => {
    if (!subscription) {
      setLicensedVehicleId("");
      setUnlicensedVehicleId("");
      return;
    }

    const covered = subscription.covered_vehicles ?? [];

    const licensed = covered.find((v: any) =>
      Boolean((v.license_plate || "").trim()),
    );

    const unlicensed = covered.find(
      (v: any) => !Boolean((v.license_plate || "").trim()),
    );

    setLicensedVehicleId(licensed?.id ?? "");
    setUnlicensedVehicleId(unlicensed?.id ?? "");
  }, [subscription]);

const useVehicleOptions = (vehicles: any[], licensed: boolean) =>
  useMemo(
    () =>
      (vehicles ?? [])
        .filter((v: any) => !v.deleted_at)
        .filter((v: any) =>
          licensed
            ? Boolean((v.license_plate || "").trim())
            : !Boolean((v.license_plate || "").trim())
        ),
    [vehicles, licensed],
  );

  const selectedVehicleIds = useMemo(() => {
    const selectedIds = [licensedVehicleId, unlicensedVehicleId].filter(
      Boolean,
    ) as string[];

    return Array.from(new Set(selectedIds));
  }, [licensedVehicleId, unlicensedVehicleId]);

  const coveredVehicles = subscription?.covered_vehicles ?? [];

  const licensedVehicles = coveredVehicles.filter((v: any) =>
    Boolean((v.license_plate || "").trim()),
  );

  const unlicensedVehicles = coveredVehicles.filter(
    (v: any) => !Boolean((v.license_plate || "").trim()),
  );

  const handleUpdateVehicles = async () => {
    if (!subscription || selectedVehicleIds.length === 0) return;

    await onUpdateVehicles(subscription.id, selectedVehicleIds);
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box
        sx={{
          width: { xs: 320, sm: 440 },
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box sx={{ p: 2, borderBottom: "1px solid #E5E7EB" }}>
          <Typography variant="h6" fontWeight={700}>
            {t("profile.subscriptions.drawer.title", {
              defaultValue: "Chi tiết gói đăng ký",
            })}
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {subscription
              ? t("profile.subscriptions.drawer.subtitle", {
                  defaultValue: `Mã gói: ${subscription.id}`,
                })
              : "—"}
          </Typography>
        </Box>

        <Box sx={{ p: 2, overflow: "auto", flex: 1 }}>
          <Stack spacing={2}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: "#FFFFFF",
                border: "1px solid #E5E7EB",
              }}
            >
              <Typography variant="caption" color="text.secondary">
                {t("profile.subscriptions.drawer.overview", {
                  defaultValue: "Thông tin gói",
                })}
              </Typography>

              <Stack spacing={0.75} sx={{ mt: 1 }}>
                <Typography fontWeight={700}>
                  {subscription?.plan ?? "—"}
                </Typography>

                <Typography color="text.secondary">
                  {t("profile.subscriptions.drawer.term", {
                    defaultValue: `Học kỳ: ${subscription?.term?.term_name ?? "—"}`,
                  })}
                </Typography>

                <Typography color="text.secondary">
                  {t("profile.subscriptions.drawer.paymentType", {
                    defaultValue: `Thanh toán: ${subscription?.payment?.payment_type ?? "—"}`,
                  })}
                </Typography>

                <Typography color="text.secondary">
                  {t("profile.subscriptions.drawer.status", {
                    defaultValue: `Trạng thái: ${subscription?.status ?? "—"}`,
                  })}
                </Typography>

                <Typography color="text.secondary">
                  {t("profile.subscriptions.drawer.period", {
                    defaultValue: `Thời gian: ${formatDate(subscription?.start_date)} – ${formatDate(subscription?.end_date)}`,
                  })}
                </Typography>

                <Typography color="text.secondary">
                  {t("profile.subscriptions.drawer.paidAmount", {
                    defaultValue: `Đã thanh toán: ${formatCurrency(subscription?.paid_amount)}`,
                  })}
                </Typography>

                <Typography color="text.secondary">
                  {t("profile.subscriptions.drawer.createdAt", {
                    defaultValue: `Ngày đăng ký: ${formatDate(String(subscription?.created_at ?? ""))}`,
                  })}
                </Typography>
              </Stack>
            </Box>

            <Stack spacing={2}>
              <Box>
                <Typography fontWeight={700} sx={{ mb: 0.5 }}>
                  {t("profile.subscriptions.drawer.licensed", {
                    defaultValue: "Xe có biển số",
                  })}
                </Typography>

                {licensedVehicles.length === 0 ? (
                  <Typography color="text.secondary">—</Typography>
                ) : (
                  <Stack spacing={1}>
                    {licensedVehicles.map((v: any) => (
                      <Box
                        key={v.id}
                        sx={{
                          p: 1.25,
                          borderRadius: 2,
                          border: "1px solid #E5E7EB",
                          bgcolor: "#FFFFFF",
                        }}
                      >
                        <Typography fontWeight={700}>
                          {v.license_plate}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                )}
              </Box>

              <Box>
                <Typography fontWeight={700} sx={{ mb: 0.5 }}>
                  {t("profile.subscriptions.drawer.unlicensed", {
                    defaultValue: "Xe không biển số",
                  })}
                </Typography>

                {unlicensedVehicles.length === 0 ? (
                  <Typography color="text.secondary">—</Typography>
                ) : (
                  <Stack spacing={1}>
                    {unlicensedVehicles.map((v: any) => (
                      <Box
                        key={v.id}
                        sx={{
                          p: 1.25,
                          borderRadius: 2,
                          border: "1px solid #E5E7EB",
                          bgcolor: "#FFFFFF",
                        }}
                      >
                        <Typography fontWeight={700}>
                          {v.qr_code || v.id}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                )}
              </Box>
            </Stack>
          </Stack>
        </Box>

        <Box sx={{ p: 2, borderTop: "1px solid #E5E7EB" }}>
          <Stack spacing={1.25}>
            <Typography fontWeight={700}>
              {t("profile.subscriptions.drawer.chooseVehicles", {
                defaultValue: "Đăng ký phương tiện cho gói",
              })}
            </Typography>

            <Select
              fullWidth
              size="small"
              displayEmpty
              value={licensedVehicleId}
              onChange={(e) => setLicensedVehicleId(e.target.value as string)}
            >
              <MenuItem value="">
                {t("profile.subscriptions.drawer.selectLicensed", {
                  defaultValue: "Chọn xe có biển số",
                })}
              </MenuItem>

              {useVehicleOptions(vehicles, true).map((v: any) => (
                <MenuItem key={v.id} value={v.id}>
                  {v.license_plate}
                </MenuItem>
              ))}
            </Select>

            <Select
              fullWidth
              size="small"
              displayEmpty
              value={unlicensedVehicleId}
              onChange={(e) => setUnlicensedVehicleId(e.target.value as string)}
            >
              <MenuItem value="">
                {t("profile.subscriptions.drawer.selectUnlicensed", {
                  defaultValue: "Chọn xe không biển số",
                })}
              </MenuItem>

              {useVehicleOptions(vehicles, false).map((v: any) => (
                <MenuItem key={v.id} value={v.id}>
                  {v.qr_code || v.id}
                </MenuItem>
              ))}
            </Select>

            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                fullWidth
                sx={{ textTransform: "none" }}
                onClick={onAddVehicle}
              >
                {t("profile.subscriptions.drawer.addVehicle", {
                  defaultValue: "+ Thêm xe",
                })}
              </Button>

              <Button
                variant="contained"
                fullWidth
                sx={{ textTransform: "none" }}
                disabled={
                  !subscription || selectedVehicleIds.length === 0 || isUpdating
                }
                onClick={handleUpdateVehicles}
              >
                {isUpdating ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  t("profile.subscriptions.drawer.registerVehicles", {
                    defaultValue: "Đăng ký phương tiện",
                  })
                )}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Box>
    </Drawer>
  );
}
