import React, { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Paper,
  Snackbar,
  Stack,
  TablePagination,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";
import { SoftDataGrid } from "../components/common/SoftDataGrid";
import { usePaymentTransactions } from "../api/paymentTransactions";
import type {
  PaginatedResponse,
  PaymentTransactionDetailRecord,
  TimePreset,
} from "../api/types";
import { UserIdentityCell } from "../components/common/UserIdentityCell";
import { formatCurrency, formatDateTime } from "../ultis/format";
import { useTranslation } from "react-i18next";
import { PageHeader } from "../components/common/PageHeader";
import FilterListIcon from "@mui/icons-material/FilterList";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { TimeRangePopoverFilter } from "../components/common/TimeRangePopoverFilter";

export const PaymentTransactionsPage: React.FC = () => {
  const { t } = useTranslation();
  const [filters, setFilters] = useState({
    userCode: "",
    invoiceId: "",
    transactionCode: "",
    timePreset: "CUSTOM" as TimePreset,
    from: "",
    to: "",
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const debouncedFilters = useDebouncedValue(filters, 400);

  const formatDateOnly = (value?: string | null) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("vi-VN", { year: "numeric", month: "2-digit", day: "2-digit" });
  };
  const dateToFromTime = (dateValue: string) => `${dateValue}T00:00:00`;
  const dateToToTime = (dateValue: string) => `${dateValue}T23:59:59`;

  const {
    data: paginated,
    isLoading,
    isError,
    error,
  } = usePaymentTransactions({
    user_code: debouncedFilters.userCode.trim() || undefined,
    invoice_id: debouncedFilters.invoiceId.trim() || undefined,
    transaction_code: debouncedFilters.transactionCode.trim() || undefined,
    from_time: debouncedFilters.from ? dateToFromTime(debouncedFilters.from) : undefined,
    to_time: debouncedFilters.to ? dateToToTime(debouncedFilters.to) : undefined,
    page: page + 1,
    limit: rowsPerPage,
  }) as unknown as {
    data: PaginatedResponse<PaymentTransactionDetailRecord> | undefined;
    isLoading: boolean;
    isError: boolean;
    error: unknown;
  };

  const rows = useMemo(() => paginated?.data ?? [], [paginated]);
  const total = paginated?.total ?? 0;
  const errorMessage = useMemo(() => {
    if (!isError) return "";
    if (error instanceof Error) return error.message;
    return String(error ?? "");
  }, [error, isError]);
  
  const columns = useMemo<GridColDef<PaymentTransactionDetailRecord>[]>(() => {
    return [
      {
        field: "user_code",
        headerName: t("paymentTransactionsPage.columns.user"),
        minWidth: 180,
        flex: 1,
        sortable: false,
        renderCell: (params) => (
          <UserIdentityCell
            fullName={params.row.user_full_name}
            userCode={params.row.user_code}
          />
        ),
      },
      {
        field: "invoice_id",
        headerName: t("paymentTransactionsPage.columns.invoice"),
        minWidth: 250,
        flex: 1,
        sortable: true,
        renderCell: (params) => (
          <Stack spacing={0.25}>
            <Tooltip title={t("paymentTransactionsPage.tooltips.invoice_id", { defaultValue: "Invoice ID" })} placement="top" arrow>
              <Typography variant="body2">
                {params.row.invoice_id}
              </Typography>
            </Tooltip>
            <Tooltip title={t("paymentTransactionsPage.tooltips.invoice_createdAt", { defaultValue: "Invoice created at" })} placement="top" arrow>
              <Typography variant="caption" color="text.secondary">
                {formatDateTime(params.row.invoice_created_at)}
              </Typography>
            </Tooltip>
          </Stack>
        ),
      },
      {
        field: "invoice_amount",
        headerName: t("paymentTransactionsPage.columns.amount"),
        width: 160,
        sortable: true,
        renderCell: (params) => (
          <span>{formatCurrency(params.row.invoice_amount)}</span>
        ),
      },
      {
        field: "invoice_payment_method",
        headerName: t("paymentTransactionsPage.columns.paymentMethod"),
        width: 180,
        sortable: true,
        valueGetter: (_value, row) => row.invoice_payment_method,
      },
      {
        field: "attempt_number",
        headerName: t("paymentTransactionsPage.columns.attempt"),
        width: 100,
        sortable: true,
      },
      {
        field: "transaction_code",
        headerName: t("paymentTransactionsPage.columns.code"),
        width: 100,
        sortable: true,
      },
      {
        field: "created_at",
        headerName: t("paymentTransactionsPage.columns.createdAt"),
        width: 200,
        sortable: true,
        renderCell: (params) => formatDateTime(params.row.created_at),
      },
    ];
  }, [t]);

  const handleClearFilters = () => {
    setFilters({
      userCode: "",
      invoiceId: "",
      transactionCode: "",
      timePreset: "CUSTOM",
      from: "",
      to: "",
    });
    setPage(0);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <PageHeader
        title={t("resources.tables.paymentTransactions")}
        subtitle={t("paymentTransactionsPage.description")}
      />
      <Stack spacing={0.5} style={{ display: "none" }}>
        <Typography variant="h5">
          {t("resources.tables.paymentTransactions")}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t("paymentTransactionsPage.description", {
            defaultValue: "Lịch sử giao dịch thanh toán.",
          })}
        </Typography>
      </Stack>

      <Stack
        direction="row"
        flexWrap="wrap"
        gap={2}
        alignItems="center"
      >
        <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
          <FilterListIcon color="action" />
          <Typography variant="body2">{t("common.filters.search")}</Typography>
        </Box>
        <TextField
          size="small"
          label={t("paymentTransactionsPage.filters.userCode.label", { defaultValue: "User code" })}
          placeholder={t("paymentTransactionsPage.filters.userCode.placeholder", { defaultValue: "Enter user code" })}
          value={filters.userCode}
          onChange={(event) => {
            setFilters((prev) => ({ ...prev, userCode: event.target.value }));
            setPage(0);
          }}
        />

        <TextField
          size="small"
          label={t("paymentTransactionsPage.filters.invoiceId.label", { defaultValue: "Invoice" })}
          placeholder={t("paymentTransactionsPage.filters.invoiceId.placeholder", { defaultValue: "Invoice id" })}
          value={filters.invoiceId}
          onChange={(event) => {
            setFilters((prev) => ({ ...prev, invoiceId: event.target.value }));
            setPage(0);
          }}
          sx={{ minWidth: 220 }}
        />

        <TextField
          size="small"
          label={t("paymentTransactionsPage.filters.transactionCode.label", { defaultValue: "Transaction code" })}
          placeholder={t("paymentTransactionsPage.filters.transactionCode.placeholder", { defaultValue: "Transaction code" })}
          value={filters.transactionCode}
          onChange={(event) => {
            setFilters((prev) => ({ ...prev, transactionCode: event.target.value }));
            setPage(0);
          }}
          sx={{ minWidth: 200 }}
        />

        <TimeRangePopoverFilter
          value={{ preset: filters.timePreset, from: filters.from, to: filters.to }}
          onChange={(next) => {
            setFilters((prev) => ({ ...prev, timePreset: next.preset, from: next.from, to: next.to }));
            setPage(0);
          }}
          labels={{
            triggerLabel: t("paymentTransactionsPage.filters.timePreset.label", { defaultValue: "Time range" }),
            presetLabel: t("paymentTransactionsPage.filters.timePreset.label", { defaultValue: "Time range" }),
            fromLabel: t("paymentTransactionsPage.filters.from.label", { defaultValue: "From" }),
            toLabel: t("paymentTransactionsPage.filters.to.label", { defaultValue: "To" }),
            presets: {
              CUSTOM: t("paymentTransactionsPage.filters.timePreset.options.custom", { defaultValue: "Custom" }),
              TODAY: t("paymentTransactionsPage.filters.timePreset.options.today", { defaultValue: "Today" }),
              YESTERDAY: t("paymentTransactionsPage.filters.timePreset.options.yesterday", { defaultValue: "Yesterday" }),
              LAST_7_DAYS: t("paymentTransactionsPage.filters.timePreset.options.last7Days", { defaultValue: "Last 7 days" }),
            },
          }}
          formatDateOnly={formatDateOnly}
        />

        <Button variant="text" onClick={handleClearFilters}>
          {t("common.filters.reset")}
        </Button>
      </Stack>

      <Paper elevation={0}>
        <SoftDataGrid
          rows={rows}
          columns={columns}
          loading={isLoading}
          getRowId={(row) => (row as PaymentTransactionDetailRecord).id}
          maxHeight={520}
          emptyMessage={t("paymentTransactionsPage.empty", {
            defaultValue: "Chưa có giao dịch nào.",
          })}
        />
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_event, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 20, 50, 100]}
          labelRowsPerPage={t('common.pagination.rowsPerPage', {
            defaultValue: 'Rows per page:',
          })}
          labelDisplayedRows={({ from, to, count }) =>
            t('common.pagination.displayedRows', {
              from,
              to,
              count,
              defaultValue: `${from}-${to} of ${count !== -1 ? count : `more than ${to}`}`,
            })
          }
        />
      </Paper>

      <Snackbar
        open={Boolean(errorMessage)}
        autoHideDuration={6000}
        onClose={() => {}}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert severity="error" variant="filled">
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};
