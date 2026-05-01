import React, { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Paper,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';

import { useInvoiceSearch } from '../api/invoices';
import type { InvoiceAdminRecord } from '../api/types';
import { formatCurrency, formatDateTime } from '../ultis/format';

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
  const formattedDocumentDate = format(invoiceValues.documentDate, localizationOptions.dateFormat);
  const formattedSellDate = format(invoiceValues.sellDate, localizationOptions.dateFormat);
  const formattedDueDate = format(invoiceValues.dueDate, localizationOptions.dateFormat);

  const totalGross = invoiceItemsTableData.reduce(
    (sum, item) => sum + item.count * item.priceEach,
    0
  );

  const renderPartyInfo = (value?: string) =>
    value ? value.replace(/, /g, '\n') : '';

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box
            component="img"
            src="/Logo.png"
            alt="UTEHY logo"
            sx={{ width: 80, height: 'auto', objectFit: 'contain' }}
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
            {localizationOptions.paymentMethodLabel} {invoiceValues.paymentMethod}
          </Typography>
        </Box>
      </Box>

      <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={4} mt={4}>
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
            {payerLabel}
          </Typography>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
            {renderPartyInfo(invoiceValues.buyer)}
          </Typography>
        </Box>
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
            {recipientLabel}
          </Typography>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
            {renderPartyInfo(invoiceValues.seller)}
          </Typography>
        </Box>
      </Box>

      <TableContainer component={Paper} variant="outlined" sx={{ mt: 4 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Qty</TableCell>
              <TableCell align="right">Unit price</TableCell>
              <TableCell align="right">Total</TableCell>
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
                  <TableCell align="right">{formatCurrency(item.priceEach)}</TableCell>
                  <TableCell align="right">{formatCurrency(lineTotal)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Box mt={2} textAlign="right">
        <Typography variant="body2" color="text.secondary">
          Total items: {invoiceItemsTableData.length}
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {formatCurrency(totalGross)}
        </Typography>
      </Box>

      <Box mt={3} textAlign="right">
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {amountDueLabel}: {invoiceValues.total}
        </Typography>
      </Box>
    </Box>
  );
};

const localizationOptions = {
  locale: 'en-EN',
  currency: 'USD',
  dateFormat: 'dd/MM/yyyy',
  documentDateLabel: 'Document date:',
  sellDateLabel: 'Sell date:',
  dueDateLabel: 'Due date:',
  paymentMethodLabel: 'Payment method:',
  sellerLabel: 'Seller',
  buyerLabel: 'Buyer',
  totalLabel: 'Total:',
};

const parseMetadata = (value: unknown): InvoiceMetadata | undefined => {
  if (!value) return undefined;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return undefined;
    }
  }
  if (typeof value === 'object') {
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
    if (typeof raw === 'string') {
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
  if (typeof value === 'string') return value;
  return Object.entries(value)
    .map(([key, entry]) => `${key}: ${String(entry)}`)
    .join(', ');
};

const buildTemplateProps = (
  invoice: InvoiceAdminRecord,
  invoiceIdLabel: string,
  payerLabel: string,
  recipientLabel: string,
  amountDueLabel: string
): InvoiceTemplateProps => {
  const metadata = parseMetadata(invoice.metadata);
  const currency = metadata?.currency ?? localizationOptions.currency;
  const items =
    metadata?.items?.map((item, index) => ({
      name: item.name ?? item.description ?? `Line ${index + 1}`,
      count:
        typeof item.count === 'number'
          ? item.count
          : typeof item.quantity === 'number'
          ? item.quantity
          : 1,
      priceEach:
        typeof item.priceEach === 'number'
          ? item.priceEach
          : typeof item.price === 'number'
          ? item.price
          : Number(invoice.amount) || 0,
    })) ?? [];

  const sanitizedItems = items.length
    ? items
    : [
        {
          name: metadata?.description ?? 'Subscription payment',
          count: 1,
          priceEach: Number(invoice.amount) || 0,
          taxKey: metadata?.defaultTaxKey ?? 'tax',
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
      parseDateFromMetadata(metadata, 'documentDate', 'document_date') ?? createdAt,
    sellDate: parseDateFromMetadata(metadata, 'sellDate', 'sell_date') ?? createdAt,
    dueDate: parseDateFromMetadata(metadata, 'dueDate', 'due_date') ?? createdAt,
    paymentMethod: metadata?.paymentMethod ?? invoice.payment_method,
    seller: stringifyParty(metadata?.seller) ?? 'UTEHY',
    buyer: stringifyParty(metadata?.buyer) ?? invoice.user_code,
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

export const SubscriptionInvoicesPage: React.FC = () => {
  const { subscriptionId } = useParams<{ subscriptionId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [manualSelectedId, setManualSelectedId] = useState<string | null>(null);

  const { data = [], isLoading, isError } = useInvoiceSearch({
    subscriptionId,
  });
  const resolvedSelectedId = useMemo(() => {
    if (!data.length) {
      return null;
    }
    if (manualSelectedId && data.some((invoice) => invoice.id === manualSelectedId)) {
      return manualSelectedId;
    }
    return data[0].id;
  }, [data, manualSelectedId]);

  const selectedInvoice = useMemo(() => {
    if (!resolvedSelectedId) return data[0] ?? null;
    return data.find((invoice) => invoice.id === resolvedSelectedId) ?? data[0] ?? null;
  }, [data, resolvedSelectedId]);

  const invoiceIdLabel = t('subscriptionInvoicesPage.invoiceIdLabel', 'Invoice ID');
  const payerLabel = t('subscriptionInvoicesPage.payerTitle', 'Payer');
  const recipientLabel = t('subscriptionInvoicesPage.recipientTitle', 'Recipient');
  const amountDueLabel = t('subscriptionInvoicesPage.amountDueLabel', 'Amount due');

  const templateProps = useMemo(
    () =>
      selectedInvoice
        ? buildTemplateProps(
            selectedInvoice,
            invoiceIdLabel,
            payerLabel,
            recipientLabel,
            amountDueLabel
          )
        : null,
    [selectedInvoice, invoiceIdLabel, payerLabel, recipientLabel, amountDueLabel]
  );

  if (!subscriptionId) {
    return (
      <Snackbar open autoHideDuration={3000} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}> 
        <Alert severity="warning">
          {t('subscriptionInvoicesPage.noSubscription')}
        </Alert>
      </Snackbar>
    );
  }

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h5">
          {t('subscriptionInvoicesPage.title')}
        </Typography>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/subscriptions')}>
          {t('subscriptionInvoicesPage.common.back')}
        </Button>
      </Stack>

      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {t('subscriptionInvoicesPage.error')}
        </Alert>
      )}

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {!isLoading && !data.length && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {t('subscriptionInvoicesPage.empty')}
        </Alert>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '320px 1fr' },
          gap: 2,
          alignItems: 'stretch',
        }}
      >
        <Stack spacing={2}>
          {data.map((invoice) => {
            const metadata = parseMetadata(invoice.metadata);
            const title = metadata?.invoiceNumber ?? invoice.id;
            const amount = formatCurrency(invoice.amount);
            const status = invoice.status;
            const description = metadata?.description;
            const isSelected = selectedInvoice?.id === invoice.id;
            return (
              <Paper
                key={invoice.id}
                onClick={() => setManualSelectedId(invoice.id)}
                variant="outlined"
                sx={{
                  p: 2,
                  cursor: 'pointer',
                  borderColor: isSelected ? 'primary.main' : 'divider',
                  bgcolor: isSelected ? 'rgba(25, 118, 210, 0.08)' : 'background.paper',
                  borderWidth: 1,
                  '&:hover': {
                    borderColor: 'primary.main',
                  },
                }}
              >
                <Stack spacing={0.5}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="subtitle1">{title}</Typography>
                    <FormatListBulletedIcon fontSize="small" color="action" />
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    {status} • {amount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
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
        <Paper variant="outlined" sx={{ p: 2, minHeight: 400 }}>
          {templateProps ? (
            <InvoiceTemplateRenderer {...templateProps} />
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="text.secondary">
                {t('subscriptionInvoicesPage.selectInvoice')}
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
};
