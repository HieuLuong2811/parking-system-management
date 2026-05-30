import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as Linking from "expo-linking";
import { useTranslation } from "react-i18next";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from '@react-navigation/native';
import { useInvoicesPaginated } from "../api/invoices";
import { useCheckoutPayDebt } from "../api/momo";
import ListScreen from "../component/ListScreen";
import { formatCurrency, formatDate, formatShortId, normalizeText, toDateKey, toEndOfDay, toStartOfDay } from "../ultis/format";
import { getInvoiceStatus, getInvoiceStatusLabelKey } from "../ultis/status";
import { InvoiceStatus, PaymentMethod } from "../constant/types";
import * as Clipboard from "expo-clipboard";
import { showAppToast } from "../ultis/toast";
import DateRangeFilter from "../component/DateRangeFilter";

const getPaymentUrl = (response: any) => {
  return (
    response?.payUrl ||
    response?.deeplink ||
    response?.shortLink ||
    response?.qrCodeUrl ||
    response?.redirectUrl ||
    response?.deeplinkWebInApp ||
    response?.deeplinkMiniApp ||
    null
  );
};

export default function InvoicesScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "">("");
  const [page, setPage] = useState(1);
  const [payingInvoiceId, setPayingInvoiceId] = useState<string | null>(null);

  const limit = 5;

  const {
    data: paginated,
    isLoading,
    isError,
  } = useInvoicesPaginated({
    page,
    limit,
    from_time: toStartOfDay(fromDate),
    to_time: toEndOfDay(toDate),
    status: statusFilter || undefined,
  });

  const payDebtMutation = useCheckoutPayDebt();

  useEffect(() => {
    setPage(1);
  }, [fromDate, toDate]);

  const rows = useMemo(() => paginated?.data ?? [], [paginated]);
  const total = paginated?.total ?? 0;

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const canPrev = page > 1;
  const canNext = page < totalPages;

  const startItem = total === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  const hasFilter = Boolean(fromDate || toDate || statusFilter);

  const clearFilters = () => {
    setFromDate("");
    setToDate("");
    setStatusFilter("");
    setPage(1);
  };

  const handlePayInvoice = async (invoiceId: string) => {
    setPayingInvoiceId(invoiceId);

    try {
      const redirectUrl = Linking.createURL("payment-return", {
        queryParams: {
          invoice_id: invoiceId,
        },
      });

      const response = await payDebtMutation.mutateAsync({
        invoice_id: invoiceId,
        redirect_url: redirectUrl,
      });

      const checkoutUrl = getPaymentUrl(response);

      if (!checkoutUrl) {
        throw new Error(t("invoices.actions.momoMissingUrl"));
      }

      const canOpen = await Linking.canOpenURL(checkoutUrl);

      if (!canOpen) {
        throw new Error(t("invoices.actions.cannotOpenPaymentUrl"));
      }

      await Linking.openURL(checkoutUrl);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t("common.error");

      Alert.alert(t("common.error"), message);
    } finally {
      setPayingInvoiceId(null);
    }
  };

  return (
    <ListScreen
      title={undefined as string | undefined}
      subtitle={undefined}
      loading={false}
      hiddenHeader={true}
      error={isError ? t("invoices.loadError") : null}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.85}>
            <Ionicons name="chevron-back" size={22} color="#0f172a" />
          </TouchableOpacity>
          <Text style={styles.title}>{t('invoices.title')}</Text>
          <View style={styles.headerRight} />
        </View>

        <View style={styles.filterCard}>
          <View style={styles.filterHeader}>
            <View style={styles.filterIconBox}>
              <Ionicons name="filter-outline" size={16} color="#2563eb" />
            </View>

            <Text style={styles.filterTitle}>
              {t("invoices.filters.title")}
            </Text>

            {hasFilter && (
              <TouchableOpacity
                onPress={clearFilters}
                activeOpacity={0.85}
                style={styles.clearFilterBtn}
              >
                <Text style={styles.clearFilterText}>
                  {t("invoices.filters.clear")}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View>
            <DateRangeFilter
              fromDate={fromDate}
              toDate={toDate}
              fromLabel={t("invoices.filters.from")}
              toLabel={t("invoices.filters.to")}
              placeholder={t("invoices.filters.selectDate")}
              invalidMessage={t("common.dateRange.invalidDateRange")}
              formatDate={formatDate}
              onChangeFromDate={setFromDate}
              onChangeToDate={setToDate}
            />
          </View>

          <View style={styles.statusRow}>
            <Text style={styles.dateLabel}>{t("invoices.filters.status")}</Text>
            <View style={styles.statusChips}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setStatusFilter("")}
                style={[styles.statusChip, !statusFilter && styles.statusChipActive]}
              >
                <Text style={[styles.statusChipText, !statusFilter && styles.statusChipTextActive]}>
                  {t("invoices.filters.statusAll")}
                </Text>
              </TouchableOpacity>
              {Object.values(InvoiceStatus).map((st) => (
                <TouchableOpacity
                  key={st}
                  activeOpacity={0.85}
                  onPress={() => setStatusFilter(st)}
                  style={[styles.statusChip, statusFilter === st && styles.statusChipActive]}
                >
                  <Text style={[styles.statusChipText, statusFilter === st && styles.statusChipTextActive]}>
                    {t(getInvoiceStatusLabelKey(st))}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {isLoading ? (
          <View style={styles.stateCard}>
            <ActivityIndicator color="#2563eb" />
            <Text style={styles.stateText}>{t("invoices.loading")}</Text>
          </View>
        ) : rows.length === 0 ? (
          <View style={styles.stateCard}>
            <Ionicons name="receipt-outline" size={38} color="#94a3b8" />
            <Text style={styles.stateTitle}>{t("invoices.empty")}</Text>
          </View>
        ) : (
          <View style={styles.invoiceList}>
            {rows.map((invoice: any) => {
              const status = normalizeText(invoice.status);
              const isMomoPayable =
                (status === InvoiceStatus.PENDING || status === InvoiceStatus.FAILED) &&
                invoice.payment_method === PaymentMethod.MOMO;

              const isRetry = status === InvoiceStatus.FAILED;
              const isPaying = payingInvoiceId === invoice.id;
              const statusLabelKey = getInvoiceStatusLabelKey(invoice.status);

              return (
                <InvoiceCard
                  key={invoice.id}
                  id={invoice.id}
                  amount={formatCurrency(invoice.amount)}
                  createdAt={formatDate(invoice.created_at)}
                  status={invoice.status}
                  statusLabel={
                    statusLabelKey ? t(statusLabelKey) : invoice.status || "-"
                  }
                  paymentMethod={invoice.payment_method || "-"}
                  isMomoPayable={isMomoPayable}
                  isRetry={isRetry}
                  isPaying={isPaying}
                  onPay={() => void handlePayInvoice(invoice.id)}
                />
              );
            })}
          </View>
        )}

        <View style={styles.paginationCard}>
          <View style={styles.paginationRow}>
            <TouchableOpacity
              disabled={!canPrev}
              style={[styles.pageButton, !canPrev && styles.pageButtonDisabled]}
              onPress={() => setPage((current) => Math.max(1, current - 1))}
              activeOpacity={0.85}
            >
              <Ionicons name="chevron-back" size={16} color="#ffffff" />
              <Text style={styles.pageButtonText}>
                {t("invoices.pagination.prev")}
              </Text>
            </TouchableOpacity>

            <Text style={styles.pageIndicator}>
              {t("invoices.pagination.pageOf", {
                page,
                totalPages,
              })}
            </Text>

            <TouchableOpacity
              disabled={!canNext}
              style={[styles.pageButton, !canNext && styles.pageButtonDisabled]}
              onPress={() =>
                setPage((current) => Math.min(totalPages, current + 1))
              }
              activeOpacity={0.85}
            >
              <Text style={styles.pageButtonText}>
                {t("invoices.pagination.next")}
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#ffffff" />
            </TouchableOpacity>
          </View>

          <Text style={styles.pageMeta}>
            {t("invoices.pagination.showingRange", {
              from: startItem,
              to: endItem,
              total,
            })}
          </Text>
        </View>
      </ScrollView>
    </ListScreen>
  );
}

function InvoiceCard({
  id,
  amount,
  createdAt,
  status,
  statusLabel,
  paymentMethod,
  isMomoPayable,
  isRetry,
  isPaying,
  onPay,
}: {
  id: string;
  amount: string;
  createdAt: string;
  status?: string | null;
  statusLabel: string;
  paymentMethod: string;
  isMomoPayable: boolean;
  isRetry: boolean;
  isPaying: boolean;
  onPay: () => void;
}) {
  const { t } = useTranslation();
  const statusMeta = getInvoiceStatus(status);

  return (
    <View style={styles.invoiceCard}>
      <View
        style={[
          styles.topAccent,
          {
            backgroundColor: statusMeta.dot,
          },
        ]}
      />

      <View style={styles.invoiceHeader}>
        <View style={styles.invoiceTitleBox}>
          <Text style={styles.invoiceLabel}>{t("invoices.card.invoice")}</Text>
            <CopyableInvoiceId id={id} />
        </View>

        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: statusMeta.bg,
              borderColor: statusMeta.border,
            },
          ]}
        >
          <Ionicons name={statusMeta.icon} size={13} color={statusMeta.text} />

          <Text
            numberOfLines={1}
            style={[
              styles.statusText,
              {
                color: statusMeta.text,
              },
            ]}
          >
            {statusLabel}
          </Text>
        </View>
      </View>

      <Text style={styles.amountText}>{amount}</Text>

      <View style={styles.infoList}>
        <InfoRow
          icon="calendar-outline"
          label={t("invoices.card.createdAt")}
          value={createdAt}
        />

        <InfoRow
          icon="wallet-outline"
          label={t("invoices.card.paymentMethod")}
          value={t(`common.paymentMethod.${paymentMethod}`)}
        />
      </View>

      {isMomoPayable ? (
        <TouchableOpacity
          disabled={isPaying}
          style={[styles.payButton, isPaying && styles.payButtonDisabled]}
          onPress={onPay}
          activeOpacity={0.85}
        >
          {isPaying ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <>
              <Ionicons name="card-outline" size={17} color="#ffffff" />
              <Text style={styles.payButtonText}>
                {isRetry
                  ? t("invoices.actions.retryPayment")
                  : t("invoices.actions.payWithMomo")}
              </Text>
            </>
          )}
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoLeft}>
        <Ionicons name={icon} size={15} color="#64748b" />
        <Text style={styles.infoLabel}>{label}:</Text>
      </View>

      <Text numberOfLines={1} style={styles.infoValue}>
        {value}
      </Text>
    </View>
  );
}

function CopyableInvoiceId({ id }: { id: string }) {
  const { t } = useTranslation();

  const handleCopy = async () => {
    await Clipboard.setStringAsync(id);

    showAppToast(
      t("invoices.card.copySuccess", {
        defaultValue: "Đã sao chép mã hóa đơn vào clipboard",
      }),
      "success",
    );
  };

  return (
    <View style={styles.copyIdRow}>
      <Text numberOfLines={1} style={styles.invoiceId}>
        {formatShortId(id)}
      </Text>

      <TouchableOpacity
        style={styles.copyButton}
        onPress={handleCopy}
        activeOpacity={0.85}
      >
        <Ionicons name="copy-outline" size={14} color="#2563eb" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    paddingBottom: 18,
  },

    header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a',
  },
  headerCenter: {
    flex: 1,
  },
  headerRight: {
    width: 40,
  },

  filterCard: {
    backgroundColor: "#ffffff",
    borderRadius: 6,
    padding: 13,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  filterHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  filterIconBox: {
    width: 30,
    height: 30,
    borderRadius: 6,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
  },
  filterTitle: {
    flex: 1,
    color: "#0f172a",
    fontWeight: "900",
    fontSize: 14,
  },
  clearFilterBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#f1f5f9",
  },
  clearFilterText: {
    fontSize: 11.5,
    fontWeight: "900",
    color: "#475569",
  },
  statusRow: {
    marginTop: 12,
    gap: 8,
  },
  statusChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  statusChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  statusChipActive: {
    backgroundColor: "#eff6ff",
    borderColor: "#2563eb",
  },
  statusChipText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#334155",
  },
  statusChipTextActive: {
    color: "#2563eb",
  },
  dateLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748b",
  },
  invoiceList: {
    gap: 12,
  },
  invoiceCard: {
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#ffffff",
    borderRadius: 6,
    padding: 14,
    borderWidth: 1,
    borderColor: "#dbe3ef",
    shadowColor: "#0f172a",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  topAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  invoiceHeader: {
    marginTop: 3,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },
  invoiceTitleBox: {
    flex: 1,
  },
  invoiceLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748b",
    textTransform: "uppercase",
  },
  invoiceId: {
    flexShrink: 1,
    fontSize: 14,
    fontWeight: "900",
    color: "#0f172a",
  },
  amountText: {
    marginTop: 14,
    fontSize: 22,
    fontWeight: "900",
    color: "#0f172a",
  },
  statusBadge: {
    maxWidth: 125,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 10.5,
    fontWeight: "900",
  },
  infoList: {
    marginTop: 12,
    gap: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  infoLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  infoLabel: {
    fontSize: 12.5,
    fontWeight: "800",
    color: "#475569",
  },
  infoValue: {
    flex: 1,
    textAlign: "right",
    fontSize: 12.5,
    fontWeight: "900",
    color: "#0f172a",
  },

  payButton: {
    marginTop: 14,
    height: 46,
    borderRadius: 6,
    backgroundColor: "#43B14B",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    shadowColor: "#43B14B",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 3,
  },
  payButtonDisabled: {
    opacity: 0.65,
  },
  payButtonText: {
    fontSize: 13.5,
    fontWeight: "900",
    color: "#ffffff",
  },

  stateCard: {
    minHeight: 170,
    backgroundColor: "#ffffff",
    borderRadius: 6,
    padding: 18,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
  },
  stateTitle: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "900",
    color: "#0f172a",
    textAlign: "center",
  },
  stateText: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: "700",
    color: "#64748b",
    textAlign: "center",
  },

  paginationCard: {
    backgroundColor: "#ffffff",
    borderRadius: 6,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  paginationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pageButton: {
    minWidth: 86,
    height: 40,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 3,
  },
  pageButtonDisabled: {
    backgroundColor: "#cbd5e1",
  },
  pageButtonText: {
    fontSize: 12.5,
    fontWeight: "900",
    color: "#ffffff",
  },
  pageIndicator: {
    fontSize: 13,
    fontWeight: "900",
    color: "#0f172a",
  },
  pageMeta: {
    marginTop: 9,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "700",
    color: "#64748b",
  },
  copyIdRow: {
    marginTop: 3,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  copyButton: {
    width: 26,
    height: 26,
    borderRadius: 9,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
  },
});
