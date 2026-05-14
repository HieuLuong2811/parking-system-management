import {
  Box,
  Chip,
  Drawer,
  Stack,
  Typography,
} from "@mui/material";
import PaymentsIcon from "@mui/icons-material/Payments";
import EventIcon from "@mui/icons-material/Event";
import { useTranslation } from "react-i18next";
import { formatCurrency, formatDate } from "../../ultis/formatters";

type Props = {
  open: boolean;
  subscription: any | null;
  onClose: () => void;
};

export default function SubscriptionVehicleDrawer({
  open,
  subscription,
  onClose,
}: Props) {
  const { t } = useTranslation();

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
          </Stack>
        </Box>
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
