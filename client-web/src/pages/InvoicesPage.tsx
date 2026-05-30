import {
  Box,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Typography,
  useTheme,
  CircularProgress,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import SectionCard from "../components/shared/SectionCard";
import { useInvoicesPaginated } from "../api/invoices";
import { invoices_status } from "../constant/config";
import { useCheckoutPayDebt } from "../api/momo";
import FilterListIcon from "@mui/icons-material/FilterList";
import { formatDateTime, toEndOfDay, toStartOfDay } from "../ultis/formatters";
import useDebouncedValue from "../hooks/useDebouncedValue";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";

export default function InvoicesPage() {
  const { t } = useTranslation();
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [status, setStatus] = useState("");
  const debouncedFromDate = useDebouncedValue(fromDate, 500);
  const debouncedToDate = useDebouncedValue(toDate, 500);
  const debouncedStatus = useDebouncedValue(status, 250);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const {
    data: paginated,
    isLoading,
    isError,
  } = useInvoicesPaginated({
    page: page + 1,
    limit: rowsPerPage,
    from_time: toStartOfDay(debouncedFromDate) || undefined,
    to_time: toEndOfDay(debouncedToDate) || undefined,
    status: debouncedStatus.trim() || undefined,
  });
  const invoices = useMemo(() => paginated?.data ?? [], [paginated]);
  const total = paginated?.total ?? 0;
  const momoPaymentMutation = useCheckoutPayDebt();
  const [payError, setPayError] = useState<string | null>(null);

  const theme = useTheme();

  useEffect(() => {
    setPage(0);
  }, [debouncedFromDate, debouncedToDate, debouncedStatus]);

  const handlePayInvoice = async (invoice_id: string) => {
    setPayError(null);
    try {
      const response = await momoPaymentMutation.mutateAsync({
        invoice_id: invoice_id,
        redirect_url: `${window.location.origin}/profile`,
      });
      const redirectUrl =
        (response.payUrl as string | undefined) ||
        (response.deeplink as string | undefined) ||
        (response.shortLink as string | undefined) ||
        (response.qrCodeUrl as string | undefined) ||
        (response.deeplinkWebInApp as string | undefined) ||
        (response.deeplinkMiniApp as string | undefined);
      if (!redirectUrl) {
        throw new Error(t("invoices.actions.momoMissingUrl"));
      }
      window.location.href = redirectUrl;
    } catch (error) {
      setPayError(error instanceof Error ? error.message : t("common.error"));
    }
  };

  const clearFilters = () => {
    setFromDate("");
    setToDate("");
    setStatus("");
    setPage(0);
  };

  return (
    <SectionCard>
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            color: "text.primary",
            mb: 0.5,
          }}
        >
          {t("invoices.sectionTitle")}
        </Typography>

        <Typography variant="body2" fontSize="medium" color="text.secondary">
          {t("invoices.subtitle")}
        </Typography>
      </Box>

      <Box
        sx={{
          mb: 3,
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
              minWidth: 130,
            }}
          >
            <FilterListIcon color="primary" fontSize="small" />
            <Typography variant="body2" fontWeight={600}>
              {t("common.filters.search")}
            </Typography>
          </Box>

          <TextField
            label={t("invoices.filters.from")}
            type="date"
            value={fromDate}
            onChange={(event) => {
              const next = event.target.value;
              setFromDate(next);
              if (toDate && next && next > toDate) {
                setToDate(next);
              }
            }}
            InputLabelProps={{ shrink: true }}
            inputProps={{ max: toDate || undefined }}
            disabled={isLoading || isError}
            size="small"
            sx={{
              minWidth: { xs: "100%", sm: 180 },
              bgcolor: "#FFFFFF",
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />

          <TextField
            label={t("invoices.filters.to")}
            type="date"
            value={toDate}
            onChange={(event) => {
              const next = event.target.value;
              setToDate(next);
              if (fromDate && next && next < fromDate) {
                setFromDate(next);
              }
            }}
            InputLabelProps={{ shrink: true }}
            inputProps={{ min: fromDate || undefined }}
            disabled={isLoading || isError}
            size="small"
            sx={{
              minWidth: { xs: "100%", sm: 180 },
              bgcolor: "#FFFFFF",
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />

          <TextField
            select
            SelectProps={{ native: true }}
            label={t("invoices.filters.status", { defaultValue: "Status" })}
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            disabled={isLoading || isError}
            size="small"
            InputLabelProps={{ shrink: true }}
            sx={{
              minWidth: { xs: "100%", sm: 180 },
              bgcolor: "#FFFFFF",
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          >
            <option value="">{t("common.all", { defaultValue: "All" })}</option>
            <option value="PENDING">
              {t("invoices.status.pending", { defaultValue: "Pending" })}
            </option>
            <option value="PAID">
              {t("invoices.status.paid", { defaultValue: "Paid" })}
            </option>
            <option value="FAILED">
              {t("invoices.status.failed", { defaultValue: "Failed" })}
            </option>
            <option value="OVERDUE">
              {t("invoices.status.overdue", { defaultValue: "Overdue" })}
            </option>
          </TextField>

          <Button
            onClick={clearFilters}
            disabled={!fromDate && !toDate && !status}
            variant="outlined"
            sx={{
              borderRadius: 2,
              textTransform: "none",
              px: 2.5,
              bgcolor: "#FFFFFF",
            }}
          >
            {t("common.filters.reset")}
          </Button>
        </Stack>
      </Box>

      <Stack spacing={2}>
        <TableContainer
          className="invoice-table-container"
          component={Box}
          sx={{
            borderRadius: 3,
            border: "1px solid #E5E7EB",
            overflow: "hidden",
            bgcolor: "#FFFFFF",
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
                  },
                }}
              >
                <TableCell>{t("invoices.table.invoiceId")}</TableCell>
                <TableCell>{t("invoices.table.paid_at")}</TableCell>
                <TableCell align="right">
                  {t("invoices.table.amount")}
                </TableCell>
                <TableCell align="center">
                  {t("invoices.table.status")}
                </TableCell>
                <TableCell align="right">
                  {t("invoices.table.actions")}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={26} />
                    <Typography color="text.secondary" mt={1}>
                      {t("invoices.loading")}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <Typography color="error" fontWeight={600}>
                      {t("common.error")}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : invoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <ReceiptLongIcon
                      sx={{ fontSize: 48, color: "#CBD5E1", mb: 1 }}
                    />
                    <Typography fontWeight={700} color="text.primary">
                      Chưa có hóa đơn
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                invoices.map((invoice) => {
                  const invoices_paid = invoices_status.PAID;
                  const invoices_pending = invoices_status.PENDING;
                  const invoices_failed = invoices_status.FAILED;
                  const isMomoPayable =
                    (invoice.status === invoices_pending ||
                      invoice.status === invoices_failed) &&
                    invoice.payment_method === "MOMO";
                  const isRetry = invoice.status === invoices_failed;
                  const chipColor =
                    invoice.status === invoices_paid
                      ? "success"
                      : invoice.status === invoices_pending
                        ? "warning"
                        : "error";
                  return (
                    <TableRow
                      key={invoice.id}
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
                        {invoice.id}
                      </TableCell>
                      <TableCell>{formatDateTime(invoice.paid_at)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(invoice.amount)}
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          label={t(
                            `invoices.status.${invoice.status.toLowerCase()}`,
                          )}
                          color={chipColor}
                          size="small"
                          sx={{ textTransform: "capitalize" }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        {isMomoPayable ? (
                          <Button
                            variant="contained"
                            size="small"
                            sx={{ backgroundColor: "#43B14B" }}
                            onClick={() => handlePayInvoice(invoice.id)}
                            disabled={momoPaymentMutation.isPending}
                            startIcon={
                              momoPaymentMutation.isPending ? (
                                <CircularProgress size={14} />
                              ) : null
                            }
                          >
                            {isRetry
                              ? t("invoices.actions.retryPayment")
                              : t("invoices.actions.payWithMomo")}
                          </Button>
                        ) : (
                          <Typography color="text.secondary">—</Typography>
                        )}
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
            "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
              {
                color: theme.palette.text.secondary,
              },
          }}
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
      </Stack>
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        open={Boolean(payError)}
        autoHideDuration={3000}
        onClose={() => setPayError(null)}
      >
        <Alert
          severity="error"
          onClose={() => setPayError(null)}
          sx={{ width: "100%" }}
        >
          {payError}
        </Alert>
      </Snackbar>
    </SectionCard>
  );
}
