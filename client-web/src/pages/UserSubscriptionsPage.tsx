import {
  Box,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { Fragment, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import useModal from "../hooks/useModal";
import SubscriptionVehicleDrawer from "../components/subscription/SubscriptionVehicleDrawer";
import SubscriptionsIcon from "@mui/icons-material/Subscriptions";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import {
  useUserSubscriptionsPaginated,
} from "../api/user_subscriptions";
import { formatCurrency } from "../ultis/formatters";
import { getStatusColor, getStatusLabel } from "../ultis/status";
import { userSubscriptionTypes } from "../constant/config";

export default function UserSubscriptionsPage() {
  const { t } = useTranslation();

  const [subscriptionPage, setSubscriptionPage] = useState(0);
  const [subscriptionRowsPerPage, setSubscriptionRowsPerPage] = useState(5);
  const [vehicleDrawerOpen, setVehicleDrawerOpen] = useState(false);
  const [drawerSubscription, setDrawerSubscription] = useState<any | null>(
    null,
  );
  const registerVehicleModal = useModal();

  const {
    data: subscriptionsPaginated,
    isLoading: subscriptionsLoading,
    isError,
  } = useUserSubscriptionsPaginated({
    page: subscriptionPage + 1,
    limit: subscriptionRowsPerPage,
  });
  
  const subscriptions = useMemo(
    () => subscriptionsPaginated?.data ?? [],
    [subscriptionsPaginated],
  );

  const subscriptionsTotal = subscriptionsPaginated?.total ?? 0;

  const getPaymentTypeLabel = (paymentType?: string | null) => {
    switch (paymentType) {
      case "MONTHLY":
        return t("profile.subscriptions.paymentTypes.monthly");
      case "FULL":
        return t("profile.subscriptions.paymentTypes.full");
      default:
        return paymentType || "—";
    }
  };

  return (
    <Box className="profile-page-shell">
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            color: "text.primary",
            mb: 0.5,
          }}
        >
          {t("profile.subscriptions.heading", {
            defaultValue: "Gói gửi xe đã đăng ký",
          })}
        </Typography>

        <Typography variant="body2" fontSize="medium" color="text.secondary">
          {t("profile.subscriptions.subtitle")}
        </Typography>
      </Box>

      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          borderRadius: 3,
          border: "1px solid #E5E7EB",
          overflow: "hidden",
          bgcolor: "#FFFFFF",
        }}
      >
        <Table>
          <TableHead>
            <TableRow
              sx={{
                bgcolor: "#F8FAFC",
                "& th": {
                  fontWeight: 700,
                  color: "#334155",
                  fontSize: 16,
                  py: 1.75,
                  borderBottom: "1px solid #E5E7EB",
                  whiteSpace: "nowrap",
                },
              }}
            >
              <TableCell>
                {t("profile.subscriptions.plan")}
              </TableCell>
              <TableCell>
                {t("profile.subscriptions.term")}
              </TableCell>
              <TableCell>
                {t("profile.subscriptions.paymentPlan")}
              </TableCell>
              <TableCell align="right">
                {t("profile.subscriptions.amount")}
              </TableCell>
              <TableCell align="center">
                {t("profile.subscriptions.status.label")}
              </TableCell>
              <TableCell align="center" sx={{ width: 72 }}>
                {t("common.actions")}
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {subscriptionsLoading ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={26} />

                  <Typography color="text.secondary" mt={1}>
                    {t("common.loading")}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                  <InfoOutlinedIcon
                    sx={{ fontSize: 44, color: "#EF4444", mb: 1 }}
                  />

                  <Typography color="error" fontWeight={700}>
                    {t("common.error")}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" mt={0.5}>
                    {t("common.tryAgainLater")}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : subscriptions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                  <SubscriptionsIcon
                    sx={{ fontSize: 48, color: "#CBD5E1", mb: 1 }}
                  />

                  <Typography fontWeight={700} color="text.primary">
                    {t("profile.subscriptions.emptyTitle", {
                      defaultValue: "Chưa có gói gửi xe",
                    })}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" mt={0.5}>
                    {t("profile.subscriptions.empty", {
                      defaultValue: "Bạn chưa đăng ký gói gửi xe nào.",
                    })}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              subscriptions.map((subscription) => {
                const paymentLabel = getPaymentTypeLabel(
                  subscription.payment?.payment_type,
                );
                const statusLabel = getStatusLabel(subscription.status ? `${t(`profile.subscriptions.status.${subscription.status.toLowerCase()}`)}` : `${t(`profile.subscriptions.status.unknown`)}`);
                const statusColor = getStatusColor(subscription.status);
                const openVehicleDrawer = () => {
                  setDrawerSubscription(subscription);
                  setVehicleDrawerOpen(true);
                };

                return (
                  <Fragment key={subscription.id}>
                    <TableRow
                      hover
                      sx={{
                        transition: "0.2s",
                        "&:hover": {
                          bgcolor: "#F9FAFB",
                        },
                        "& td": {
                          py: 1.8,
                          fontSize: 14,
                          borderBottom: "1px solid #EEF2F7",
                        },
                      }}
                    >
                      <TableCell>
                        <Stack
                          direction="row"
                          spacing={1.2}
                          alignItems="center"
                        >
                          <Box
                            sx={{
                              width: 36,
                              height: 36,
                              borderRadius: 2,
                              bgcolor: "#E0F2FE",
                              color: "#0369A1",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            <SubscriptionsIcon fontSize="small" />
                          </Box>

                          <Typography fontWeight={700}>
                            {t(`plan.cards.${subscription.plan.toLowerCase()}`)}
                          </Typography>
                        </Stack>
                      </TableCell>

                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <CalendarMonthIcon fontSize="small" color="action" />

                          <Typography fontWeight={500}>
                            {subscription.term?.term_name ?? "—"}
                          </Typography>
                        </Stack>
                      </TableCell>

                      <TableCell>
                        <Typography fontWeight={500}>{paymentLabel}</Typography>
                      </TableCell>

                      <TableCell align="right">
                        <Typography fontWeight={700}>
                          {formatCurrency(subscription.total_amount)}
                        </Typography>
                      </TableCell>

                      <TableCell align="center">
                        <Chip
                          size="small"
                          color={statusColor}
                          label={statusLabel}
                          sx={{
                            fontWeight: 700,
                            borderRadius: 999,
                            minWidth: 120,
                            textTransform: "none",
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip
                          placement="top"
                          title={t("common.viewDetails", {
                            defaultValue: "Xem chi tiết",
                          })}
                        >
                          <IconButton
                            size="small"
                            aria-label="view subscription"
                            disabled={subscription.status !== userSubscriptionTypes.ACTIVE}
                            onClick={(e) => {
                              e.stopPropagation();
                              openVehicleDrawer();
                            }}
                          > 
                          {subscription.status !== userSubscriptionTypes.ACTIVE ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  </Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={subscriptionsTotal}
        page={subscriptionPage}
        onPageChange={(_event, newPage) => {
          setSubscriptionPage(newPage);
        }}
        rowsPerPage={subscriptionRowsPerPage}
        onRowsPerPageChange={(event) => {
          setSubscriptionRowsPerPage(parseInt(event.target.value, 10));
          setSubscriptionPage(0);
        }}
        rowsPerPageOptions={[5, 10, 20, 50, 100]}
        sx={{
          "& .MuiTablePagination-toolbar": {
            justifyContent: "flex-end",
          },
          "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
            {
              color: "text.secondary",
            },
        }}
      />
      
      <SubscriptionVehicleDrawer
        open={vehicleDrawerOpen}
        subscription={drawerSubscription}
        onClose={() => setVehicleDrawerOpen(false)}
      />
    </Box>
  );
}
