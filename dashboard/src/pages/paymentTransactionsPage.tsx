import React, { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
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
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
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
    from_time: debouncedFilters.from
      ? dateToFromTime(debouncedFilters.from)
      : undefined,
    to_time: debouncedFilters.to
      ? dateToToTime(debouncedFilters.to)
      : undefined,
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
    const getStatusColor = (
      status?: string | null,
    ): "success" | "warning" | "error" | "default" => {
      switch (status) {
        case "SUCCESS":
          return "success";
        case "PENDING":
          return "warning";
        case "FAILED":
        case "CANCELLED":
          return "error";
        default:
          return "default";
      }
    };

    const getStatusLabel = (status?: string | null) => {
      switch (status) {
        case "SUCCESS":
          return t("paymentTransactionsPage.status.success", {
            defaultValue: "Thành công",
          });
        case "PENDING":
          return t("paymentTransactionsPage.status.pending", {
            defaultValue: "Đang chờ",
          });
        case "FAILED":
          return t("paymentTransactionsPage.status.failed", {
            defaultValue: "Thất bại",
          });
        case "CANCELLED":
          return t("paymentTransactionsPage.status.cancelled", {
            defaultValue: "Đã hủy",
          });
        default:
          return status || "-";
      }
    };

    return [
      {
        field: "user_code",
        headerName: t("paymentTransactionsPage.columns.user", {
          defaultValue: "Người dùng",
        }),
        minWidth: 210,
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
        field: "amount",
        headerName: t("paymentTransactionsPage.columns.amount", {
          defaultValue: "Số tiền",
        }),
        width: 150,
        sortable: false,
        align: "right",
        headerAlign: "center",
        renderCell: (params) => (
          <Typography variant="body2" textAlign="center" fontWeight={600}>
            {formatCurrency(params.row.amount)}
          </Typography>
        ),
      },
      {
        field: "status",
        headerName: t("paymentTransactionsPage.columns.status", {
          defaultValue: "Trạng thái",
        }),
        width: 140,
        sortable: false,
        renderCell: (params) => (
          <Chip
            size="small"
            label={getStatusLabel(params.row.status)}
            color={getStatusColor(params.row.status)}
          />
        ),
      },
      {
        field: "payment_method",
        headerName: t("paymentTransactionsPage.columns.payment_method", {
          defaultValue: "Phương thức",
        }),
        width: 160,
        sortable: false,
        renderCell: (params) =>
          t(`paymentTransactionsPage.paymentMethods.${params.row.payment_method}`, {
            defaultValue: params.row.payment_method || "-",
          }),
      },
      {
        field: "transaction_type",
        headerName: t("paymentTransactionsPage.columns.transactionType", {
          defaultValue: "Loại giao dịch",
        }),
        minWidth: 190,
        flex: 0.9,
        sortable: false,
        renderCell: (params) =>
          t(`paymentTransactionsPage.transactionTypes.${params.row.transaction_type}`, {
            defaultValue: params.row.transaction_type || "-",
          }),
      },
      {
        field: "transaction_code",
        headerName: t("paymentTransactionsPage.columns.code", {
          defaultValue: "Mã giao dịch",
        }),
        minWidth: 160,
        flex: 0.8,
        sortable: false,
        renderCell: (params) => params.row.transaction_code || "-",
      },
      {
        field: "invoice_id",
        headerName: t("paymentTransactionsPage.columns.invoice", {
          defaultValue: "Hóa đơn",
        }),
        minWidth: 240,
        flex: 1,
        sortable: false,
        renderCell: (params) => (
          <Tooltip title={params.row.invoice_id || "-"} placement="top" arrow>
            <Typography
              variant="body2"
              sx={{
                maxWidth: "100%",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {params.row.invoice_id || "-"}
            </Typography>
          </Tooltip>
        ),
      },
      {
        field: "created_at",
        headerName: t("paymentTransactionsPage.columns.createdAt", {
          defaultValue: "Thời gian tạo",
        }),
        width: 180,
        sortable: false,
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

      <Stack direction="row" flexWrap="wrap" gap={2} alignItems="center">
        <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
          <FilterListIcon color="action" />
          <Typography variant="body2">{t("common.filters.search")}</Typography>
        </Box>
        <TextField
          size="small"
          label={t("paymentTransactionsPage.filters.userCode.label", {
            defaultValue: "User code",
          })}
          placeholder={t(
            "paymentTransactionsPage.filters.userCode.placeholder",
            { defaultValue: "Enter user code" },
          )}
          value={filters.userCode}
          onChange={(event) => {
            setFilters((prev) => ({ ...prev, userCode: event.target.value }));
            setPage(0);
          }}
        />

        <TextField
          size="small"
          label={t("paymentTransactionsPage.filters.invoiceId.label", {
            defaultValue: "Invoice",
          })}
          placeholder={t(
            "paymentTransactionsPage.filters.invoiceId.placeholder",
            { defaultValue: "Invoice id" },
          )}
          value={filters.invoiceId}
          onChange={(event) => {
            setFilters((prev) => ({ ...prev, invoiceId: event.target.value }));
            setPage(0);
          }}
          sx={{ minWidth: 220 }}
        />

        <TextField
          size="small"
          label={t("paymentTransactionsPage.filters.transactionCode.label", {
            defaultValue: "Transaction code",
          })}
          placeholder={t(
            "paymentTransactionsPage.filters.transactionCode.placeholder",
            { defaultValue: "Transaction code" },
          )}
          value={filters.transactionCode}
          onChange={(event) => {
            setFilters((prev) => ({
              ...prev,
              transactionCode: event.target.value,
            }));
            setPage(0);
          }}
          sx={{ minWidth: 200 }}
        />

        <TimeRangePopoverFilter
          value={{
            preset: filters.timePreset,
            from: filters.from,
            to: filters.to,
          }}
          onChange={(next) => {
            setFilters((prev) => ({
              ...prev,
              timePreset: next.preset,
              from: next.from,
              to: next.to,
            }));
            setPage(0);
          }}
          labels={{
            triggerLabel: t(
              "paymentTransactionsPage.filters.timePreset.label",
              { defaultValue: "Time range" },
            ),
            presetLabel: t("paymentTransactionsPage.filters.timePreset.label", {
              defaultValue: "Time range",
            }),
            fromLabel: t("paymentTransactionsPage.filters.from.label", {
              defaultValue: "From",
            }),
            toLabel: t("paymentTransactionsPage.filters.to.label", {
              defaultValue: "To",
            }),
            presets: {
              CUSTOM: t(
                "paymentTransactionsPage.filters.timePreset.options.custom",
                { defaultValue: "Custom" },
              ),
              TODAY: t(
                "paymentTransactionsPage.filters.timePreset.options.today",
                { defaultValue: "Today" },
              ),
              YESTERDAY: t(
                "paymentTransactionsPage.filters.timePreset.options.yesterday",
                { defaultValue: "Yesterday" },
              ),
              LAST_7_DAYS: t(
                "paymentTransactionsPage.filters.timePreset.options.last7Days",
                { defaultValue: "Last 7 days" },
              ),
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
          getRowId={(row) => (row as PaymentTransactionDetailRecord).payment_transaction_id}
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
          labelRowsPerPage={t("common.pagination.rowsPerPage", {
            defaultValue: "Rows per page:",
          })}
          labelDisplayedRows={({ from, to, count }) =>
            t("common.pagination.displayedRows", {
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
