import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import FilterListIcon from "@mui/icons-material/FilterList";
import SectionCard from "../components/shared/SectionCard";
import { useMyPaymentTransactionsPaginated } from "../api/payment_transactions";
import useDebouncedValue from "../hooks/useDebouncedValue";
import { formatMoney, toEndOfDay, toStartOfDay } from "../ultis/formatters";
import { getStatusChipColor } from "../ultis/status";

export default function TransactionsPage() {
  const { t } = useTranslation();

  const [invoiceId, setInvoiceId] = useState("");
  const [transactionCode, setTransactionCode] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const debouncedInvoiceId = useDebouncedValue(invoiceId, 450);
  const debouncedTransactionCode = useDebouncedValue(transactionCode, 450);
  const debouncedFromDate = useDebouncedValue(fromDate, 450);
  const debouncedToDate = useDebouncedValue(toDate, 450);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterError, setFilterError] = useState<string | null>(null);

  const fromTime = toStartOfDay(debouncedFromDate) || undefined;
  const toTime = toEndOfDay(debouncedToDate) || undefined;

  const isDateRangeInvalid = Boolean(
    fromTime && toTime && new Date(toTime) < new Date(fromTime),
  );

  const {
    data: paginated,
    isLoading,
    isError,
  } = useMyPaymentTransactionsPaginated({
    page: page + 1,
    limit: rowsPerPage,
    invoice_id: debouncedInvoiceId.trim() || undefined,
    transaction_code: debouncedTransactionCode.trim() || undefined,
    from_time: fromTime,
    to_time: toTime,
  });

  const transactions = useMemo(() => paginated?.data ?? [], [paginated]);
  const total = paginated?.total ?? 0;

  useEffect(() => {
    setPage(0);
  }, [
    debouncedInvoiceId,
    debouncedTransactionCode,
    debouncedFromDate,
    debouncedToDate,
  ]);

  useEffect(() => {
    if (isDateRangeInvalid) {
      setFilterError(
        t("transactions.filters.invalidRange", {
          defaultValue: "`to` không được nhỏ hơn `from`.",
        }),
      );
    } else {
      setFilterError(null);
    }
  }, [isDateRangeInvalid, t]);

  const clearFilters = () => {
    setInvoiceId("");
    setTransactionCode("");
    setFromDate("");
    setToDate("");
    setPage(0);
  };

  return (
    <SectionCard>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
          {t("transactions.sectionTitle")}
        </Typography>
        <Typography variant="body2" fontSize="medium" color="text.secondary">
          {t("transactions.subtitle")}
        </Typography>
      </Box>

      <Box
        sx={{
          mb: 2.5,
          p: 2,
          borderRadius: 3,
          bgcolor: "#F8FAFC",
          border: "1px solid #E5E7EB",
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems={{ xs: "stretch", md: "center" }}
        >
          <Box
            sx={{
              display: "flex",
              gap: 1,
              alignItems: "center",
            }}
          >
            <FilterListIcon color="primary" fontSize="small" />
            <Typography variant="body2" fontWeight={600}>
              {t("common.filters.search")}
            </Typography>
          </Box>

          <TextField
            label={t("transactions.filters.invoiceId", {
              defaultValue: "Mã hóa đơn",
            })}
            placeholder={t("transactions.filters.invoiceIdPlaceholder", {
              defaultValue: "Nhập mã hóa đơn",
            })}
            value={invoiceId}
            onChange={(e) => setInvoiceId(e.target.value)}
            disabled={isLoading}
            size="small"
            sx={{ bgcolor: "#fff", flex: 1, minWidth: { xs: "100%", md: 220 } }}
          />

          <TextField
            label={t("transactions.filters.transactionCode", {
              defaultValue: "Mã giao dịch",
            })}
            placeholder={t("transactions.filters.transactionCodePlaceholder", {
              defaultValue: "Nhập mã giao dịch",
            })}
            value={transactionCode}
            onChange={(e) => setTransactionCode(e.target.value)}
            disabled={isLoading}
            size="small"
            sx={{ bgcolor: "#fff", flex: 1, minWidth: { xs: "100%", md: 220 } }}
          />

          <TextField
            label={t("transactions.filters.from", { defaultValue: "Từ" })}
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            disabled={isLoading}
            size="small"
            sx={{ bgcolor: "#fff", minWidth: { xs: "100%", md: 170 } }}
          />

          <TextField
            label={t("transactions.filters.to", { defaultValue: "Đến" })}
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            disabled={isLoading}
            size="small"
            error={isDateRangeInvalid}
            sx={{ bgcolor: "#fff", minWidth: { xs: "100%", md: 170 } }}
          />

          <Button
            onClick={clearFilters}
            variant="outlined"
            sx={{ textTransform: "none", whiteSpace: "nowrap" }}
            disabled={isLoading}
          >
            {t("common.filters.reset", { defaultValue: "Xóa bộ lọc" })}
          </Button>
        </Stack>
      </Box>

      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {t("transactions.loadError", {
            defaultValue: "Không thể tải lịch sử giao dịch. Vui lòng thử lại.",
          })}
        </Alert>
      )}

      <TableContainer
        sx={{
          borderRadius: 3,
          border: "1px solid #E5E7EB",
          overflow: "hidden",
          bgcolor: "#fff",
        }}
      >
        <Table size="small">
          <TableHead>
            <TableRow
              sx={{
                bgcolor: "#F8FAFC",
                "& th": {
                  fontWeight: 700,
                  color: "#334155",
                  fontSize: 14,
                  py: 1.75,
                  borderBottom: "1px solid #E5E7EB",
                  whiteSpace: "nowrap",
                },
              }}
            >
              <TableCell>
                {t("transactions.table.invoiceId", {
                  defaultValue: "Mã hóa đơn",
                })}
              </TableCell>
              <TableCell>
                {t("transactions.table.transactionCode", {
                  defaultValue: "Mã giao dịch",
                })}
              </TableCell>
              <TableCell align="right">
                {t("transactions.table.amount", { defaultValue: "Số tiền" })}
              </TableCell>
              <TableCell align="right">
                {t("transactions.table.status", { defaultValue: "Trạng thái" })}
              </TableCell>
              <TableCell>
                {t("transactions.table.createdAt", {
                  defaultValue: "Thời gian",
                })}
              </TableCell>
              <TableCell>
                {t("transactions.table.note", { defaultValue: "Ghi chú" })}
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    {t("transactions.empty", {
                      defaultValue: "Chưa có giao dịch nào.",
                    })}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((tx) => {
                const chipColor = getStatusChipColor(tx.invoice_status);
                const amountText = formatMoney(
                  tx.invoice_amount,
                  tx.invoice_status,
                );
                const amountColor =
                  String(tx.invoice_status || "").toUpperCase() === "PAID"
                    ? "error.main"
                    : "success.main";
                return (
                  <TableRow key={tx.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {tx.invoice_id}
                    </TableCell>
                    <TableCell>{tx.transaction_code}</TableCell>
                    <TableCell
                      align="right"
                      sx={{ fontWeight: 700, color: amountColor }}
                    >
                      {amountText}
                    </TableCell>
                    <TableCell align="right">
                      <Chip
                        size="small"
                        color={chipColor}
                        label={t(
                          `invoices.status.${String(tx.invoice_status || "").toLowerCase()}`,
                          {
                            defaultValue: tx.invoice_status,
                          },
                        )}
                        sx={{ fontWeight: 700, borderRadius: 999 }}
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(tx.created_at).toLocaleString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {tx.response_message || "—"}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

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
        sx={{
          "& .MuiTablePagination-toolbar": { justifyContent: "flex-end" },
        }}
      />

      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        open={Boolean(filterError)}
        autoHideDuration={3000}
        onClose={() => setFilterError(null)}
      >
        <Alert
          severity="warning"
          onClose={() => setFilterError(null)}
          sx={{ width: "100%" }}
        >
          {filterError}
        </Alert>
      </Snackbar>
    </SectionCard>
  );
}
