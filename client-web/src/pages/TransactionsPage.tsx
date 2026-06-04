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
import { formatCurrency, formatDateTime, toEndOfDay, toStartOfDay } from "../ultis/formatters";
import { getStatusChipColor } from "../ultis/status";

export default function TransactionsPage() {
  const { t } = useTranslation();

  const [transactionType, setTransactionType] = useState("");
  const [direction, setDirection] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const debouncedTransactionType = useDebouncedValue(transactionType, 250);
  const debouncedDirection = useDebouncedValue(direction, 250);
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
    transaction_type: debouncedTransactionType.trim() || undefined,
    direction: debouncedDirection.trim() || undefined,
    from_time: fromTime,
    to_time: toTime,
  });

  const transactions = useMemo(() => paginated?.data ?? [], [paginated]);
  const total = paginated?.total ?? 0;

  useEffect(() => {
    setPage(0);
  }, [
    debouncedTransactionType,
    debouncedDirection,
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
    setTransactionType("");
    setDirection("");
    setFromDate("");
    setToDate("");
    setPage(0);
  };

  const transactionTypeOptions = useMemo(
    () => [
      { value: "", label: t("transactions.filters.all", { defaultValue: "All" }) },
      {
        value: "TOP_UP",
        label: t("transactions.transactionType.top_up", { defaultValue: "Nạp ví" }),
      },
      {
        value: "INVOICE_DIRECT_PAYMENT",
        label: t("transactions.transactionType.invoice_direct_payment", {
          defaultValue: "Thanh toán hoá đơn",
        }),
      },
      {
        value: "MONTHLY_CHARGE",
        label: t("transactions.transactionType.monthly_charge", {
          defaultValue: "Phí tháng",
        }),
      },
      {
        value: "SUBSCRIPTION_FULL_PAYMENT",
        label: t("transactions.transactionType.subscription_full_payment", {
          defaultValue: "Thanh toán vé gửi xe",
        }),
      },
      {
        value: "REFUND",
        label: t("transactions.transactionType.refund", { defaultValue: "Hoàn tiền" }),
      },
      {
        value: "ADMIN_ADJUSTMENT",
        label: t("transactions.transactionType.admin_adjustment", {
          defaultValue: "Điều chỉnh",
        }),
      },
    ],
    [t],
  );

  const directionOptions = useMemo(
    () => [
      { value: "", label: t("transactions.filters.all", { defaultValue: "All" }) },
      { value: "IN", label: t("transactions.direction.in", { defaultValue: "Tiền vào" }) },
      { value: "OUT", label: t("transactions.direction.out", { defaultValue: "Tiền ra" }) },
    ],
    [t],
  );

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
            label={t("transactions.filters.transactionType", {
              defaultValue: "Loại giao dịch",
            })}
            select
            SelectProps={{ native: true }}
            value={transactionType}
            onChange={(e) => setTransactionType(e.target.value)}
            InputLabelProps={{ shrink: true }}
            disabled={isLoading}
            size="small"
            sx={{ bgcolor: "#fff", flex: 1, minWidth: { xs: "100%", md: 220 } }}
          >
            {transactionTypeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </TextField>

          <TextField
            label={t("transactions.filters.direction", {
              defaultValue: "Dòng tiền",
            })}
            InputLabelProps={{ shrink: true }}
            select
            SelectProps={{ native: true }}
            value={direction}
            onChange={(e) => setDirection(e.target.value)}
            disabled={isLoading}
            size="small"
            sx={{ bgcolor: "#fff", flex: 1, minWidth: { xs: "100%", md: 220 } }}
          >
            {directionOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </TextField>

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
        component={Box}
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
              <TableCell width="220px">
                {t("transactions.table.invoiceId", {
                  defaultValue: "Mã hóa đơn",
                })}
              </TableCell>
              <TableCell width="100px">
                {t("transactions.table.transactionCode", {
                  defaultValue: "Mã giao dịch",
                })}
              </TableCell>
              <TableCell align="right" width="220px">
                {t("transactions.table.amount", { defaultValue: "Số tiền" })}
              </TableCell>
              <TableCell align="right" width="220px">
                {t("transactions.table.status", { defaultValue: "Trạng thái" })}
              </TableCell>
              <TableCell width="220px">
                {t("transactions.table.createdAt", {
                  defaultValue: "Thời gian",
                })}
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
              transactions.map((tx, index) => {
                const isTopUp =
                  String(tx.transaction_type || "").toUpperCase() === "TOP_UP";
                const isOutgoing = !isTopUp;
                const numericAmount = Number(tx.amount || 0);
                const amountText = `${isTopUp ? "+" : "-"} ${formatCurrency(numericAmount)}`;
                const amountColor = isOutgoing ? "error.main" : "success.main";
                const statusText = String(tx.status || "").toLowerCase();
                const chipColor = getStatusChipColor(statusText.toUpperCase());
                return (
                  <TableRow
                    key={`${tx.payment_transaction_id} - ${index}`}
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
                    <TableCell sx={{ fontWeight: 600 }}>
                      {tx.invoice_id || "—"}
                    </TableCell>
                    <TableCell>{tx.transaction_code || tx.payment_transaction_id}</TableCell>
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
                          `common.paymentTransactionStatus.${String(tx.status || "")}`,
                          {
                            defaultValue: tx.status,
                          },
                        )}
                        sx={{ fontWeight: 700, borderRadius: 999 }}
                      />
                    </TableCell>
                    <TableCell>
                      {formatDateTime(tx.created_at)}
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
