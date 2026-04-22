import React, { useMemo, useState } from "react";
import {
  Alert,
  Box,
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
} from "../api/types";
import { UserIdentityCell } from "../components/common/UserIdentityCell";
import { formatCurrencyInvoice, formatDateTime } from "../ultis/format";
import { useTranslation } from "react-i18next";

const formatCurrency = (value: number) => formatCurrencyInvoice(String(value));

export const PaymentTransactionsPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const {
    data: paginated,
    isLoading,
    isError,
    error,
  } = usePaymentTransactions({
    search: searchTerm || undefined,
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
        field: "response_message",
        headerName: t("paymentTransactionsPage.columns.response"),
        flex: 1,
        sortable: false,
        renderCell: (params) => <span>{params.value ?? "-"}</span>,
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

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Stack spacing={0.5}>
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
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        gap={2}
      >
        <TextField
          fullWidth
          size="small"
          variant="outlined"
          value={searchTerm}
          label={t("paymentTransactionsPage.searchLabel", {
            defaultValue: "Tìm kiếm",
          })}
          placeholder={t("paymentTransactionsPage.searchPlaceholder", {
            defaultValue: "Tìm theo hóa đơn, mã giao dịch, người dùng",
          })}
          onChange={(event) => {
            setSearchTerm(event.target.value);
            setPage(0);
          }}
          sx={{ maxWidth: 420 }}
        />
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
