import { Box, Paper, Tabs, Tab, Typography, Chip, IconButton, Tooltip, Stack, TablePagination } from "@mui/material";
import { useParams } from "react-router-dom";
import { useState } from "react";
import { useUserDetail } from "../api/users";
import { FormInput } from "../components/common/FormInput";
import { useTranslation } from "react-i18next";
import { PageHeader } from "../components/common/PageHeader";
import { useSubscriptionDetailsPaginated } from "../api/subscriptions";
import { SoftDataGrid } from "../components/common/SoftDataGrid";
import type { GridColDef } from "@mui/x-data-grid";
import type { UserSubscriptionDetailRecord } from "../api/types";
import { formatCurrency, formatDateTime } from "../ultis/format";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import { useNavigate } from "react-router-dom";

export const UserProfilePage = () => {
  const { userCode } = useParams();
  const [tab, setTab] = useState(0);
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: user } = useUserDetail(userCode!);
  const [subPage, setSubPage] = useState(0);
  const [subRowsPerPage, setSubRowsPerPage] = useState(5);

  const { data: subscriptionsPaginated, isLoading: subscriptionsLoading } =
    useSubscriptionDetailsPaginated({
      user_code: userCode,
      page: subPage + 1,
      limit: subRowsPerPage,
    });

  const subscriptionRows = subscriptionsPaginated?.data ?? [];
  const subscriptionTotal = subscriptionsPaginated?.total ?? 0;

  const statusColorMap: Record<string, "success" | "warning" | "info" | "default"> =
    {
      ACTIVE: "success",
      PENDING: "default",
      EXPIRED: "warning",
      SUSPENDED: "info",
    };

  const columns = [
    {
      field: "subscription_plan",
      headerName: t("subscriptionsPage.columns.plan", "Plan"),
      minWidth: 160,
      flex: 1,
      renderCell: (params) => (
        <Typography>{params.row.subscription_plan?.plans_type ?? "—"}</Typography>
      ),
    },
    {
      field: "payment_plan",
      headerName: t("subscriptionsPage.columns.paymentPlan", "Payment plan"),
      minWidth: 140,
      renderCell: (params) => (
        <Typography>
          {t(`common.paymentPlan.${params.row.payment_plan?.payment_type}`, {
            defaultValue: params.row.payment_plan?.payment_type ?? "—",
          })}
        </Typography>
      ),
    },
    {
      field: "term",
      headerName: t("subscriptionsPage.columns.term", "Term"),
      minWidth: 120,
      renderCell: (params) => (
        <Typography>{params.row.term?.term_name ?? "—"}</Typography>
      ),
    },
    {
      field: "period",
      headerName: t("subscriptionsPage.columns.period", "Period"),
      minWidth: 220,
      flex: 1,
      renderCell: (params) => (
        <Stack spacing={0.25}>
          <Typography variant="body2">
            {formatDateTime(params.row.start_date)} – {formatDateTime(params.row.end_date)}
          </Typography>
        </Stack>
      ),
    },
    {
      field: "amount",
      headerName: t("subscriptionsPage.columns.amount", "Amount"),
      minWidth: 160,
      renderCell: (params) => (
        <Stack direction="column" spacing={0.25}>
          <Typography>{formatCurrency(params.row.total_amount)}</Typography>
          <Typography variant="caption" color="text.secondary">
            {t("subscriptionsPage.columns.paid", { defaultValue: "Paid" })}:{" "}
            {formatCurrency(params.row.paid_amount)}
          </Typography>
        </Stack>
      ),
    },
    {
      field: "status",
      headerName: t("subscriptionsPage.columns.status", "Status"),
      minWidth: 120,
      renderCell: (params) => (
        <Chip
          label={t(`common.subscriptionStatus.${params.row.status}`, {
            defaultValue: params.row.status,
          })}
          color={statusColorMap[params.row.status] ?? "default"}
          size="small"
        />
      ),
    },
    {
      field: "actions",
      headerName: t("subscriptionsPage.columns.actions", "Actions"),
      minWidth: 100,
      sortable: false,
      renderCell: (params) => (
        <Tooltip title={t("subscriptionsPage.viewInvoicesTooltip", { defaultValue: "View invoices" })}>
          <IconButton
            size="small"
            onClick={() => navigate(`/subscriptions/${params.row.id}/invoices`)}
          >
            <FormatListBulletedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ] as GridColDef<UserSubscriptionDetailRecord>[];

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <PageHeader
        title={t("userProfilePage.title", { defaultValue: "User detail" })}
        subtitle={t("userProfilePage.description", { defaultValue: "Review the selected user's profile and related records." })}
      />

      <Box display="flex" gap={2} flexWrap="wrap">
      <Box flex={{ xs: "100%", md: "0 0 320px" }}>
        <Paper sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
          <FormInput
            label="User Code"
            name="user_code"
            value={user?.user_code ?? ""}
            onChange={() => {}}
            disabled
          />

          <FormInput
            label="Full Name"
            name="full_name"
            value={user?.full_name ?? ""}
            onChange={() => {}}
            disabled
          />

          <FormInput
            label="Email"
            name="email"
            value={user?.email ?? ""}
            onChange={() => {}}
            disabled
          />

          <FormInput
            label="Phone Number"
            name="phone_number"
            value={user?.phone_number ?? ""}
            onChange={() => {}}
            disabled
          />
        </Paper>
      </Box>

      <Box flex="1 1 0">
        <Paper>
          <Tabs value={tab} onChange={(_, v) => setTab(v)}>
            <Tab label="Subscriptions" />
          </Tabs>

          <Box sx={{ p: 2 }}>
            {tab === 0 && (
              <Box>
                <SoftDataGrid
                  rows={subscriptionRows}
                  columns={columns}
                  loading={subscriptionsLoading}
                  maxHeight={420}
                />
                <TablePagination
                  component="div"
                  count={subscriptionTotal}
                  page={subPage}
                  onPageChange={(_, newPage) => setSubPage(newPage)}
                  rowsPerPage={subRowsPerPage}
                  onRowsPerPageChange={(event) => {
                    setSubRowsPerPage(parseInt(event.target.value, 10));
                    setSubPage(0);
                  }}
                  rowsPerPageOptions={[5, 10, 20, 50]}
                />
              </Box>
            )}
          </Box>
        </Paper>
      </Box>
      </Box>
    </Box>
  );
};
