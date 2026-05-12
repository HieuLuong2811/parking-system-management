import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Drawer,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import DirectionsBikeIcon from "@mui/icons-material/DirectionsBike";
import TwoWheelerIcon from "@mui/icons-material/TwoWheeler";
import PaymentsIcon from "@mui/icons-material/Payments";
import EventIcon from "@mui/icons-material/Event";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { formatCurrency, formatDate } from "../../ultis/formatters";
import { canUpdateSubscriptionVehicles } from "../../constant/config";

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

const hasLicensePlate = (vehicle: any) =>
  Boolean((vehicle?.license_plate || "").trim());

const getVehicleTypeLabel = (vehicleType?: string | null) => {
  if (!vehicleType) return "—";

  const normalized = String(vehicleType).toUpperCase();

  switch (normalized) {
    case "MOTORBIKE":
      return "Xe máy";
    case "BICYCLE":
      return "Xe đạp";
    case "CAR":
      return "Ô tô";
    default:
      return vehicleType;
  }
};

const getVehicleDisplayName = (vehicle: any) => {
  const type = getVehicleTypeLabel(vehicle?.vehicle_type);

  if (hasLicensePlate(vehicle)) {
    return `${type} - ${vehicle.license_plate}`;
  }

  return type;
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

    const licensed = covered.find((v: any) => hasLicensePlate(v));
    const unlicensed = covered.find((v: any) => !hasLicensePlate(v));

    setLicensedVehicleId(licensed?.id ?? "");
    setUnlicensedVehicleId(unlicensed?.id ?? "");
  }, [subscription]);

  const licensedVehicleOptions = useMemo(
    () =>
      (vehicles ?? [])
        .filter((v: any) => !v.deleted_at)
        .filter((v: any) => hasLicensePlate(v)),
    [vehicles],
  );

  const unlicensedVehicleOptions = useMemo(
    () =>
      (vehicles ?? [])
        .filter((v: any) => !v.deleted_at)
        .filter((v: any) => !hasLicensePlate(v)),
    [vehicles],
  );

  const canUpdateVehicles = canUpdateSubscriptionVehicles(subscription?.status);

  const selectedVehicleIds = useMemo(() => {
    const selectedIds = [licensedVehicleId, unlicensedVehicleId].filter(
      Boolean,
    ) as string[];

    return Array.from(new Set(selectedIds));
  }, [licensedVehicleId, unlicensedVehicleId]);

  const coveredVehicles = subscription?.covered_vehicles ?? [];

  const licensedVehicles = coveredVehicles.filter((v: any) =>
    hasLicensePlate(v),
  );

  const unlicensedVehicles = coveredVehicles.filter(
    (v: any) => !hasLicensePlate(v),
  );

  const paymentTypeLabel = subscription?.payment?.payment_type
    ? t(
        `profile.subscriptions.paymentTypes.${subscription.payment.payment_type.toLowerCase()}`,
        {
          defaultValue: subscription.payment.payment_type,
        },
      )
    : "—";

  const statusLabel = subscription?.status
    ? t(`profile.subscriptions.status.${subscription.status.toLowerCase()}`, {
        defaultValue: subscription.status,
      })
    : "—";

  const totalAmount = Number(subscription?.total_amount || 0);
  const paidAmount = Number(subscription?.paid_amount || 0);
  const remainingAmount = Math.max(totalAmount - paidAmount, 0);

  const handleUpdateVehicles = async () => {
    if (!subscription || selectedVehicleIds.length === 0) return;

    await onUpdateVehicles(subscription.id, selectedVehicleIds);
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box
        sx={{
          width: { xs: 340, sm: 460 },
          height: "100%",
          display: "flex",
          flexDirection: "column",
          bgcolor: "#F8FAFC",
        }}
      >
        <Box
          sx={{
            p: 2.25,
            borderBottom: "1px solid #E5E7EB",
            bgcolor: "#FFFFFF",
          }}
        >
          <Typography variant="h6" fontWeight={700}>
            {t("profile.subscriptions.drawer.title", {
              defaultValue: "Chi tiết gói đăng ký",
            })}
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {t("profile.subscriptions.drawer.subtitle", {
              id: subscription?.id ?? "—",
              defaultValue: "Mã gói: {{id}}",
            })}
          </Typography>
        </Box>

        <Box sx={{ p: 2, overflow: "auto", flex: 1 }}>
          <Stack spacing={2}>
            <Box
              sx={{
                p: 2,
                borderRadius: 3,
                bgcolor: "#FFFFFF",
                border: "1px solid #E5E7EB",
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
                <EventIcon sx={{ fontSize: 20 }} />
                <Typography fontWeight={700}>
                  {t("profile.subscriptions.drawer.planInfo", {
                    defaultValue: "Thông tin đăng ký",
                  })}
                </Typography>
              </Stack>

              <Stack spacing={1.15}>
                <InfoLine
                  label={t("profile.subscriptions.term")}
                  value={subscription?.term?.term_name ?? "—"}
                />

                <InfoLine
                  label={t("profile.subscriptions.paymentPlan")}
                  value={paymentTypeLabel}
                />

                <InfoLine
                  label={t("profile.subscriptions.status.label")}
                  value={
                    <Chip
                      size="small"
                      label={statusLabel}
                      sx={{
                        height: 24,
                        fontWeight: 700,
                        borderRadius: 999,
                        bgcolor: "#DCFCE7",
                        color: "#166534",
                      }}
                    />
                  }
                />

                <InfoLine
                  label={t("profile.subscriptions.drawer.periodLabel", {
                    defaultValue: "Thời gian",
                  })}
                  value={`${formatDate(subscription?.start_date)} – ${formatDate(
                    subscription?.end_date,
                  )}`}
                />

                <InfoLine
                  label={t("profile.subscriptions.drawer.createdAtLabel", {
                    defaultValue: "Ngày đăng ký",
                  })}
                  value={formatDate(String(subscription?.created_at ?? ""))}
                />
              </Stack>
            </Box>

            <Box
              sx={{
                p: 2,
                borderRadius: 3,
                bgcolor: "#FFFFFF",
                border: "1px solid #E5E7EB",
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
                <PaymentsIcon sx={{ fontSize: 20 }} />
                <Typography fontWeight={700}>
                  {t("profile.subscriptions.drawer.paymentSummary", {
                    defaultValue: "Tổng quan thanh toán",
                  })}
                </Typography>
              </Stack>

              <Stack spacing={1.15}>
                <InfoLine
                  label={t("profile.subscriptions.amount")}
                  value={formatCurrency(totalAmount)}
                  strong
                />

                <InfoLine
                  label={t("profile.subscriptions.drawer.paidAmountLabel", {
                    defaultValue: "Đã thanh toán",
                  })}
                  value={formatCurrency(paidAmount)}
                />

                <InfoLine
                  label={t("profile.subscriptions.drawer.remainingAmount", {
                    defaultValue: "Còn thiếu",
                  })}
                  value={formatCurrency(remainingAmount)}
                  strong
                  valueColor={remainingAmount > 0 ? "#DC2626" : "#16A34A"}
                />
              </Stack>
            </Box>

            <VehicleSection
              title={t("profile.subscriptions.drawer.licensed", {
                defaultValue: "Xe có biển số",
              })}
              vehicles={licensedVehicles}
              emptyText={t("profile.subscriptions.drawer.noLicensedVehicle", {
                defaultValue: "Chưa có xe có biển số.",
              })}
            />

            <VehicleSection
              title={t("profile.subscriptions.drawer.unlicensed", {
                defaultValue: "Xe không biển số",
              })}
              vehicles={unlicensedVehicles}
              emptyText={t("profile.subscriptions.drawer.noUnlicensedVehicle", {
                defaultValue: "Chưa có xe không biển số.",
              })}
            />
          </Stack>
        </Box>

        {canUpdateVehicles && (
          <Box
            sx={{
              p: 2,
              borderTop: "1px solid #E5E7EB",
              bgcolor: "#FFFFFF",
            }}
          >
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

                {licensedVehicleOptions.map((v: any) => (
                  <MenuItem key={v.id} value={v.id}>
                    {getVehicleDisplayName(v)}
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

                {unlicensedVehicleOptions.map((v: any) => (
                  <MenuItem key={v.id} value={v.id}>
                    {getVehicleDisplayName(v)}
                  </MenuItem>
                ))}
              </Select>

              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  fullWidth
                  sx={{
                    height: 40,
                    textTransform: "none",
                    fontWeight: 700,
                    borderRadius: 2,
                  }}
                  onClick={onAddVehicle}
                >
                  {t("profile.subscriptions.drawer.addVehicle", {
                    defaultValue: "+ Thêm xe",
                  })}
                </Button>

                <Button
                  variant="contained"
                  fullWidth
                  sx={{
                    height: 40,
                    textTransform: "none",
                    fontWeight: 700,
                    borderRadius: 2,
                    bgcolor: "#2563EB",
                    boxShadow: "none",
                    "&:hover": {
                      bgcolor: "#1D4ED8",
                      boxShadow: "none",
                    },
                  }}
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
        )}
      </Box>
    </Drawer>
  );
}

function InfoLine({
  label,
  value,
  strong = false,
  valueColor,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  strong?: boolean;
  valueColor?: string;
}) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      spacing={1.5}
    >
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>

      <Typography
        component="div"
        variant="body2"
        fontWeight={strong ? 700 : 600}
        color={valueColor || "#0F172A"}
        textAlign="right"
      >
        {value}
      </Typography>
    </Stack>
  );
}

function VehicleSection({
  title,
  vehicles,
  emptyText,
}: {
  title: string;
  vehicles: any[];
  emptyText: string;
}) {
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 3,
        bgcolor: "#FFFFFF",
        border: "1px solid #E5E7EB",
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1} mb={1.25}>
        <Typography fontWeight={700} color="#0F172A">
          {title}
        </Typography>
      </Stack>

      {vehicles.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          {emptyText}
        </Typography>
      ) : (
        <Stack spacing={1}>
          {vehicles.map((vehicle: any) => (
            <Box
              key={vehicle.id}
              sx={{
                p: 1.25,
                borderRadius: 2,
                border: "1px solid #E5E7EB",
                bgcolor: "#F8FAFC",
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                {hasLicensePlate(vehicle) ? (
                  <TwoWheelerIcon sx={{ fontSize: 18 }} />
                ) : (
                  <DirectionsBikeIcon sx={{ fontSize: 18 }} />
                )}

                <Box sx={{ minWidth: 0 }}>
                  <Typography fontWeight={700} color="#0F172A" noWrap>
                    {getVehicleDisplayName(vehicle)}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
}
