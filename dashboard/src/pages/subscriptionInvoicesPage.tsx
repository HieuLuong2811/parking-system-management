import React, { useMemo, useState, useRef, useCallback } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";

import { useSubscriptionInvoices } from "../api/invoices";
import type { InvoiceAdminRecord } from "../api/types";
import { formatCurrency, formatDateTime } from "../ultis/format";
import { PageHeader } from "../components/common/PageHeader";
import { useReactToPrint } from "react-to-print";

import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import { invoicesStatusOptions } from "../constant/config";
import { useDebouncedValue } from "../hooks/useDebouncedValue";

type InvoiceMetadataItem = {
  description?: string;
  name?: string;
  count?: number;
  quantity?: number;
  price?: number;
  priceEach?: number;
  unit?: string;
  taxKey?: string;
  taxRate?: string;
};

type InvoiceMetadata = {
  invoiceNumber?: string;
  documentDate?: string;
  document_date?: string;
  sellDate?: string;
  sell_date?: string;
  dueDate?: string;
  due_date?: string;
  paymentMethod?: string;
  currency?: string;
  seller?: string | Record<string, unknown>;
  buyer?: string | Record<string, unknown>;
  description?: string;
  items?: InvoiceMetadataItem[];
  taxes?: Record<string, number>;
  defaultTaxRate?: number;
  defaultTaxKey?: string;
};

type InvoiceTemplateProps = {
  localizationOptions: typeof localizationOptions & { currency: string };
  invoiceItemsTableData: {
    name: string;
    count: number;
    priceEach: number;
  }[];
  // taxesData no longer needed
  invoiceValues: {
    invoiceTitle: string;
    documentDate: Date;
    sellDate: Date;
    dueDate: Date;
    paymentMethod: string;
    seller: string;
    buyer: string;
    total: string;
  };
  invoiceIdLabel: string;
  payerLabel: string;
  recipientLabel: string;
  amountDueLabel: string;
};

const InvoiceTemplateRenderer: React.FC<InvoiceTemplateProps> = ({
  localizationOptions,
  invoiceItemsTableData,
  invoiceValues,
  invoiceIdLabel,
  payerLabel,
  recipientLabel,
  amountDueLabel,
}) => {
  const formattedDocumentDate = format(
    invoiceValues.documentDate,
    localizationOptions.dateFormat,
  );
  const formattedSellDate = format(
    invoiceValues.sellDate,
    localizationOptions.dateFormat,
  );
  const formattedDueDate = format(
    invoiceValues.dueDate,
    localizationOptions.dateFormat,
  );

  // const totalGross = invoiceItemsTableData.reduce(
  //   (sum, item) => sum + item.count * item.priceEach,
  //   0,
  // );

  const renderPartyInfo = (value?: string) =>
    value ? value.replace(/, /g, "\n") : "";

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="flex-start"
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box
            component="img"
            src="/Logo.png"
            alt="UTEHY logo"
            sx={{ width: 80, height: "auto", objectFit: "contain" }}
          />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Trường Đại học Sư phạm Kỹ thuật Hưng Yên
            </Typography>
            <Typography variant="body2">
              Hung Yen University of Technology and Education
            </Typography>
          </Box>
        </Stack>
        <Box textAlign="right">
          <Typography variant="subtitle2" color="text.secondary">
            {invoiceIdLabel}
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {invoiceValues.invoiceTitle}
          </Typography>
          <Divider sx={{ my: 1 }} />
          <Typography variant="body2">
            {localizationOptions.documentDateLabel} {formattedDocumentDate}
          </Typography>
          <Typography variant="body2">
            {localizationOptions.sellDateLabel} {formattedSellDate}
          </Typography>
          <Typography variant="body2">
            {localizationOptions.dueDateLabel} {formattedDueDate}
          </Typography>
          <Typography variant="body2">
            {localizationOptions.paymentMethodLabel}{" "}
            {invoiceValues.paymentMethod}
          </Typography>
        </Box>
      </Box>

      <Box
        display="grid"
        gridTemplateColumns={{ xs: "1fr", md: "1fr 1fr" }}
        gap={4}
        mt={4}
      >
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
            {payerLabel}
          </Typography>
          <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>
            {renderPartyInfo(invoiceValues.buyer)}
          </Typography>
        </Box>
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
            {recipientLabel}
          </Typography>
          <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>
            {renderPartyInfo(invoiceValues.seller)}
          </Typography>
        </Box>
      </Box>

      <TableContainer component={Paper} variant="outlined" sx={{ mt: 4 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Nội dung</TableCell>
              <TableCell>Số lượng</TableCell>
              <TableCell align="right">Đơn giá</TableCell>
              <TableCell align="right">Thành tiền</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoiceItemsTableData.map((item, index) => {
              const lineTotal = item.count * item.priceEach;
              return (
                <TableRow key={`${item.name}-${index}`}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.count}</TableCell>
                  <TableCell align="right">
                    {formatCurrency(item.priceEach)}
                  </TableCell>
                  <TableCell align="right">
                    {formatCurrency(lineTotal)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Box mt={3} textAlign="right">
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {amountDueLabel}: {invoiceValues.total}
        </Typography>
      </Box>
    </Box>
  );
};

const localizationOptions = {
  locale: "vi-VN",
  currency: "VND",
  dateFormat: "dd/MM/yyyy",
  documentDateLabel: "Ngày lập:",
  sellDateLabel: "Ngày thanh toán:",
  dueDateLabel: "Hạn thanh toán:",
  paymentMethodLabel: "Phương thức:",
  sellerLabel: "Người nhận",
  buyerLabel: "Người thanh toán",
  totalLabel: "Tổng cộng:",
};

const parseMetadata = (value: unknown): InvoiceMetadata | undefined => {
  if (!value) return undefined;
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return undefined;
    }
  }
  if (typeof value === "object") {
    return value as InvoiceMetadata;
  }
  return undefined;
};

const parseDateFromMetadata = (
  metadata: InvoiceMetadata | undefined,
  ...keys: (keyof InvoiceMetadata)[]
): Date | undefined => {
  for (const key of keys) {
    const raw = metadata?.[key];
    if (typeof raw === "string") {
      const parsed = new Date(raw);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed;
      }
    }
  }
  return undefined;
};

const stringifyParty = (value?: string | Record<string, unknown>) => {
  if (!value) return undefined;
  if (typeof value === "string") return value;
  return Object.entries(value)
    .map(([key, entry]) => `${key}: ${String(entry)}`)
    .join(", ");
};

const buildTemplateProps = (
  invoice: InvoiceAdminRecord,
  invoiceIdLabel: string,
  payerLabel: string,
  recipientLabel: string,
  amountDueLabel: string,
  payerInfo?: string,
): InvoiceTemplateProps => {
  const metadata = parseMetadata(invoice.metadata);
  const currency = metadata?.currency ?? localizationOptions.currency;
  const items =
    metadata?.items?.map((item, index) => ({
      name: item.name ?? item.description ?? `Line ${index + 1}`,
      count:
        typeof item.count === "number"
          ? item.count
          : typeof item.quantity === "number"
            ? item.quantity
            : 1,
      priceEach:
        typeof item.priceEach === "number"
          ? item.priceEach
          : typeof item.price === "number"
            ? item.price
            : Number(invoice.amount) || 0,
    })) ?? [];

  const sanitizedItems = items.length
    ? items
    : [
        {
          name: metadata?.description ?? "Thanh toán vé gửi xe",
          count: 1,
          priceEach: Number(invoice.amount) || 0,
          taxKey: metadata?.defaultTaxKey ?? "tax",
        },
      ];

  const createdAt = new Date(invoice.created_at);
  const grossTotal = sanitizedItems.reduce((sum, item) => {
    const netValue = item.count * item.priceEach;
    const grossValue = netValue;
    return sum + grossValue;
  }, 0);

  const titleValue = metadata?.invoiceNumber ?? invoice.id;
  const values = {
    documentDate:
      parseDateFromMetadata(metadata, "documentDate", "document_date") ??
      createdAt,
    sellDate:
      parseDateFromMetadata(metadata, "sellDate", "sell_date") ?? createdAt,
    dueDate:
      parseDateFromMetadata(metadata, "dueDate", "due_date") ?? createdAt,
    paymentMethod: metadata?.paymentMethod ?? invoice.payment_method,
    seller:
      stringifyParty(metadata?.seller) ??
      "Trường Đại học sư phạm Kỹ thuật Hưng Yên",
    buyer: stringifyParty(metadata?.buyer) ?? payerInfo ?? invoice.user_code,
    total: formatCurrency(grossTotal),
    invoiceTitle: titleValue,
  };

  return {
    localizationOptions: { ...localizationOptions, currency },
    invoiceItemsTableData: sanitizedItems,
    invoiceValues: values,
    invoiceIdLabel,
    payerLabel,
    recipientLabel,
    amountDueLabel,
  };
};

type FiltersState = {
  status: string;
  invoice_id: string;
};

const defaultFilters: FiltersState = {
  status: invoicesStatusOptions.PAID,
  invoice_id: '',
};

const invoiceStatus = ['ALL', ...Object.values(invoicesStatusOptions)] as const;

export const SubscriptionInvoicesPage: React.FC = () => {
  const { subscriptionId } = useParams<{ subscriptionId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [manualSelectedId, setManualSelectedId] = useState<string | null>(null);

  const [filters, setFilters] = useState<FiltersState>(defaultFilters);

  const debouncedSearch = useDebouncedValue(
    { ...filters },
    450
  );

  const updateFilters = useCallback((updater: (prev: FiltersState) => FiltersState) => {
    setFilters((prev) => updater(prev));
  }, []);
  
  const queryFilters = useMemo(() => ({
    ...debouncedSearch,
  }), [debouncedSearch]);

  const invoicePrintRef = useRef<HTMLDivElement | null>(null);

  const {
    data: invoiceResponse,
    isLoading,
    isError,
  } = useSubscriptionInvoices(subscriptionId, queryFilters);

  const data = useMemo(() => invoiceResponse?.data ?? [], [invoiceResponse]);

  const payerInfo = useMemo(() => {
    if (!invoiceResponse) return undefined;

    if (invoiceResponse.full_name && invoiceResponse.user_code) {
      return `${invoiceResponse.full_name} - ${invoiceResponse.user_code}`;
    }

    return invoiceResponse.full_name ?? invoiceResponse.user_code ?? undefined;
  }, [invoiceResponse]);

  const resolvedSelectedId = useMemo(() => {
    if (!data.length) {
      return null;
    }
    if (
      manualSelectedId &&
      data.some((invoice) => invoice.id === manualSelectedId)
    ) {
      return manualSelectedId;
    }
    return data[0].id;
  }, [data, manualSelectedId]);

  const selectedInvoice = useMemo(() => {
    if (!resolvedSelectedId) return data[0] ?? null;
    return data.find((invoice) => invoice.id === resolvedSelectedId) ?? data[0];
  }, [data, resolvedSelectedId]);

  const handleExportPdf = useReactToPrint({
    contentRef: invoicePrintRef,
    documentTitle: selectedInvoice
      ? `invoice-${selectedInvoice.id}`
      : "invoice",
  });

  const invoiceIdLabel = t(
    "subscriptionInvoicesPage.invoiceIdLabel",
    "Mã hóa đơn",
  );

  const payerLabel = t(
    "subscriptionInvoicesPage.payerTitle",
    "Người thanh toán",
  );

  const recipientLabel = t(
    "subscriptionInvoicesPage.recipientTitle",
    "Người nhận",
  );

  const amountDueLabel = t(
    "subscriptionInvoicesPage.amountDueLabel",
    "Tổng số tiền",
  );

  const templateProps = useMemo(
    () =>
      selectedInvoice
        ? buildTemplateProps(
            selectedInvoice,
            invoiceIdLabel,
            payerLabel,
            recipientLabel,
            amountDueLabel,
            payerInfo,
          )
        : null,
    [
      selectedInvoice,
      invoiceIdLabel,
      payerLabel,
      recipientLabel,
      amountDueLabel,
      payerInfo,
    ],
  );

  if (!subscriptionId) {
    return (
      <Snackbar
        open
        autoHideDuration={3000}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert severity="warning">
          {t("subscriptionInvoicesPage.noSubscription")}
        </Alert>
      </Snackbar>
    );
  }

  return (
    <Box>
      <Button
        variant="outlined"
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/subscriptions")}
      >
        {t("common.button.back")}
      </Button>
      <Stack
        direction={{ xs: "column", md: "row" }}
        alignItems={{ xs: "flex-start", md: "center" }}
        justifyContent="space-between"
        gap={2}
        sx={{ my: 2 }}
      >
        <PageHeader
          title={t("subscriptionInvoicesPage.title")}
          subtitle={t("subscriptionInvoicesPage.description")}
        />

        <Button
          variant="contained"
          startIcon={<PictureAsPdfIcon />}
          disabled={!selectedInvoice}
          onClick={handleExportPdf}
        >
          Xuất PDF
        </Button>
      </Stack>
      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {t("subscriptionInvoicesPage.error")}
        </Alert>
      )}

      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {!isLoading && !data.length && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {t("subscriptionInvoicesPage.empty")}
        </Alert>
      )}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "340px minmax(0, 1fr)" },
          gap: 2,
          alignItems: "flex-start",
        }}
      >
        <Paper
          variant="outlined"
          sx={{
            px: 1.5,
            borderRadius: 3,
            bgcolor: "#f8fafc",
            maxHeight: "500px",
            overflowY: "auto",
            "&::-webkit-scrollbar": {
              width: "8px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "rgba(0, 0, 0, 0.2)",
              borderRadius: "4px",
            },
          }}
        >
          <Box sx={{ position: "sticky", top: 0, zIndex: 1, bgcolor: "#f8fafc", py: 2, gap: 2, display: "flex", flexDirection: "column" }}>
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
            >
              <ReceiptLongIcon color="primary" fontSize="small" />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Danh sách hóa đơn
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {data.length} hóa đơn được tìm thấy
                </Typography>
              </Box>
            </Stack>

            <TextField
              size="small"
              fullWidth
              variant="outlined"
              label={t('subscriptionInvoicesPage.filters.invoiceId', { defaultValue: 'Invoice ID' })}
              value={filters.invoice_id}
              onChange={(event) => {
                updateFilters((prev) => ({ ...prev, invoice_id: event.target.value }));
              }}
            />

            <FormControl size="small" sx={{ minWidth: 170 }} fullWidth>
              <InputLabel>{t('subscriptionInvoicesPage.filters.status', { defaultValue: 'Status' })}</InputLabel>
              <Select
                value={filters.status}
                label={t('subscriptionInvoicesPage.filters.status', { defaultValue: 'Status' })}
                onChange={(event) => {
                  updateFilters((prev) => ({ ...prev, status: event.target.value as typeof invoiceStatus[number] }));
                }}
              >
                {invoiceStatus.map((value) => (
                  <MenuItem key={value} value={value}>
                    {t(`common.subscriptionPlans.${value}`, { defaultValue: value })}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Stack spacing={1.25}>
            {data.map((invoice) => {
              const metadata = parseMetadata(invoice.metadata);
              const title = metadata?.invoiceNumber ?? invoice.id;
              const amount = formatCurrency(invoice.amount);
              const status = invoice.status;
              const description = metadata?.description;
              const isSelected = selectedInvoice?.id === invoice.id;

              const statusColor =
                status === "PAID"
                  ? "success"
                  : status === "PENDING"
                    ? "warning"
                    : status === "FAILED"
                      ? "error"
                      : "default";

              return (
                <Paper
                  key={invoice.id}
                  onClick={() => setManualSelectedId(invoice.id)}
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    cursor: "pointer",
                    borderRadius: 2.5,
                    borderColor: isSelected ? "primary.main" : "divider",
                    bgcolor: isSelected
                      ? "rgba(67, 177, 75, 0.08)"
                      : "background.paper",
                    borderWidth: isSelected ? 1.5 : 1,
                    transition: "0.18s ease",
                    "&:hover": {
                      borderColor: "primary.main",
                      boxShadow: "0 8px 18px rgba(15, 23, 42, 0.08)",
                      transform: "translateY(-1px)",
                    },
                  }}
                >
                  <Stack spacing={1}>
                    <Stack
                      direction="row"
                      alignItems="flex-start"
                      justifyContent="space-between"
                      spacing={1}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 800,
                          wordBreak: "break-word",
                          lineHeight: 1.5,
                        }}
                      >
                        {title}
                      </Typography>

                      <Chip
                        size="small"
                        label={status}
                        color={statusColor}
                        sx={{ fontWeight: 700 }}
                      />
                    </Stack>

                    <Typography variant="h6" sx={{ fontWeight: 900 }}>
                      {amount}
                    </Typography>

                    <Typography variant="caption" color="text.secondary">
                      {formatDateTime(invoice.created_at)}
                    </Typography>

                    {description && (
                      <>
                        <Divider />
                        <Typography variant="body2" color="text.secondary">
                          {description}
                        </Typography>
                      </>
                    )}
                  </Stack>
                </Paper>
              );
            })}
          </Stack>
        </Paper>
        <Paper
          variant="outlined"
          sx={{
            p: 0,
            minHeight: 400,
            borderRadius: 3,
            overflow: "hidden",
          }}
        >
          {templateProps ? (
            <Box>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{
                  px: 2,
                  py: 1.5,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  bgcolor: "#f8fafc",
                }}
              >
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Chi tiết hóa đơn
                  </Typography>
                </Box>
                <Chip
                  size="small"
                  label={selectedInvoice?.status ?? ""}
                  color={
                    selectedInvoice?.status === "PAID" ? "success" : "default"
                  }
                  sx={{ fontWeight: 700 }}
                />
              </Stack>

              <Box ref={invoicePrintRef} sx={{ p: 2.5, bgcolor: "#fff" }}>
                <InvoiceTemplateRenderer {...templateProps} />
              </Box>
            </Box>
          ) : (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="body2" color="text.secondary">
                {t("subscriptionInvoicesPage.selectInvoice")}
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
};
