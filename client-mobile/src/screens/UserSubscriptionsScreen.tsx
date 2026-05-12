import React, { useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";
import Ionicons from "@expo/vector-icons/Ionicons";

import { useUserSubscriptionsPaginated } from "../api/user_subscriptions";
import ListScreen from "../component/ListScreen";
import PaginationBar from "../component/PaginationBar";
import * as Clipboard from "expo-clipboard";
import { showAppToast } from "../ultis/toast";
import { formatCurrency, formatDate, formatShortId } from "../ultis/format";
import type { AppStackParamList } from '../navigation/AppStack';
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { getUserSubscriptionStatusColor } from "../ultis/status";
import { useNavigation } from "@react-navigation/native";

type Nav = NativeStackNavigationProp<AppStackParamList>;

const STATUS_OPTIONS = [
  "",
  "ACTIVE",
  "PAYMENT_DUE",
  "OVERDUE",
  "CANCELED",
  "SUSPENDED",
  "INACTIVE",
];

export default function UserSubscriptionsScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();

  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const limit = 5;
  const {
    data: paginated,
    isLoading,
    isError,
  } = useUserSubscriptionsPaginated({
    page,
    limit,
    status: status.trim() || undefined,
  });

  const rows = useMemo(() => paginated?.data ?? [], [paginated]);
  const total = paginated?.total ?? 0;

  const handleChangeStatus = (nextStatus: string) => {
    setPage(1);
    setStatus(nextStatus);
  };

  return (
    <ListScreen
      title={t("userSubscriptions.title")}
      subtitle={t("userSubscriptions.subtitle")}
      loading={isLoading}
      error={isError ? t("userSubscriptions.loadError") : null}
      showBack
      onBack={() => navigation.goBack()}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        <View style={styles.filterCard}>
          <View style={styles.filterHeader}>
            <View style={styles.filterTitleRow}>
              <Ionicons name="filter-outline" size={18} color="#2563eb" />
              <Text style={styles.filterTitle}>
                {t("userSubscriptions.filterTitle")}
              </Text>
            </View>

            {status ? (
              <TouchableOpacity
                style={styles.clearFilterBtn}
                onPress={() => handleChangeStatus("")}
                activeOpacity={0.85}
              >
                <Ionicons name="close" size={14} color="#64748b" />
                <Text style={styles.clearFilterText}>{t("common.resetChanges")}</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statusChipList}
          >
            {STATUS_OPTIONS.map((item) => {
              const selected = status === item;

              return (
                <TouchableOpacity
                  key={item || "ALL"}
                  activeOpacity={0.85}
                  style={[
                    styles.statusChip,
                    selected && styles.statusChipActive,
                  ]}
                  onPress={() => handleChangeStatus(item)}
                >
                  <Text
                    style={[
                      styles.statusChipText,
                      selected && styles.statusChipTextActive,
                    ]}
                  >
                    {item
                      ? t(`userSubscriptions.status.${item.toLowerCase()}`, {
                          defaultValue: item,
                        })
                      : t("common.all")}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {rows.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="reader-outline" size={34} color="#94a3b8" />
            <Text style={styles.emptyTitle}>
              {t("userSubscriptions.empty")}
            </Text>
            <Text style={styles.emptyDesc}>
              {t("userSubscriptions.emptyDesc")}
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {rows.map((sub) => {
              const statusColor = getUserSubscriptionStatusColor(sub.status);
              const totalAmount = Number(sub.total_amount || 0);
              const paidAmount = Number((sub as any).paid_amount || 0);
              const debtAmount = Math.max(totalAmount - paidAmount, 0);

              return (
                <View key={sub.id} style={styles.card}>
                  <View style={styles.cardTop}>
                    <View style={styles.planIconBox}>
                      <Ionicons name="pricetag" size={22} color="#43B14B" />
                    </View>

                    <View style={styles.cardTitleBox}>
                      <Text style={styles.planName} numberOfLines={1}>
                        {sub.subscription_plan?.plans_type ?? "—"}
                      </Text>

                      <CopyableId
                        id={String(sub.id)}
                        label={t("userSubscriptions.subscriptionCode")}
                      />
                    </View>

                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: statusColor.bg,
                          borderColor: statusColor.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusBadgeText,
                          { color: statusColor.text },
                        ]}
                      >
                        {t(
                          `userSubscriptions.status.${sub.status.toLowerCase()}`,
                          { defaultValue: sub.status || "—" },
                        )}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.infoGrid}>
                    <InfoItem
                      icon="school-outline"
                      label={t("userSubscriptions.term")}
                      value={sub.term?.term_name ?? "—"}
                    />

                    <InfoItem
                      icon="calendar-outline"
                      label={t("userSubscriptions.period")}
                      value={`${formatDate(sub.start_date)} - ${formatDate(
                        sub.end_date,
                      )}`}
                    />
                  </View>

                  <View style={styles.amountBox}>
                    <AmountRow
                      label={t("userSubscriptions.totalAmount")}
                      value={formatCurrency(totalAmount)}
                    />

                    <AmountRow
                      label={t("userSubscriptions.paidAmount")}
                      value={formatCurrency(paidAmount)}
                    />

                    <AmountRow
                      label={t("userSubscriptions.debtAmount")}
                      value={formatCurrency(debtAmount)}
                      danger={debtAmount > 0}
                      strong
                    />
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <PaginationBar
          page={page}
          limit={limit}
          total={total}
          onChangePage={setPage}
        />
      </ScrollView>
    </ListScreen>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoItem}>
      <View style={styles.infoIconBox}>
        <Ionicons name={icon} size={16} color="#2563eb" />
      </View>

      <View style={styles.infoTextBox}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue} numberOfLines={2}>
          {value}
        </Text>
      </View>
    </View>
  );
}

function AmountRow({
  label,
  value,
  danger = false,
  strong = false,
}: {
  label: string;
  value: string;
  danger?: boolean;
  strong?: boolean;
}) {
  return (
    <View style={styles.amountRow}>
      <Text style={styles.amountLabel}>{label}</Text>
      <Text
        style={[
          styles.amountValue,
          strong && styles.amountValueStrong,
          danger && styles.amountValueDanger,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

function CopyableId({
  id,
  label,
}: {
  id: string;
  label: string;
}) {
  const { t } = useTranslation();

  const handleCopy = async () => {
    await Clipboard.setStringAsync(id);

    showAppToast(
      t('userSubscriptions.copySuccess', {
        defaultValue: 'Đã sao chép mã gói vào clipboard',
      }),
      'success',
    );
  };

  return (
    <View style={styles.copyIdRow}>
      <Text style={styles.subId} numberOfLines={1}>
        {label}: {formatShortId(id)}
      </Text>

      <TouchableOpacity
        style={styles.copyButton}
        onPress={handleCopy}
        activeOpacity={0.8}
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

  filterCard: {
    padding: 14,
    borderRadius: 22,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  filterHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 11,
  },
  filterTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  filterTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#0f172a",
  },
  clearFilterBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "#f1f5f9",
  },
  clearFilterText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#64748b",
  },
  statusChipList: {
    gap: 8,
    paddingRight: 4,
  },
  statusChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  statusChipActive: {
    backgroundColor: "#dcfce7",
    borderColor: "#86efac",
  },
  statusChipText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#475569",
  },
  statusChipTextActive: {
    color: "#15803d",
  },
  copyIdRow: {
    marginTop: 4,
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
  subId: {
    marginTop: 3,
    fontSize: 11,
    fontWeight: "700",
    color: "#64748b",
  },
  emptyCard: {
    minHeight: 190,
    padding: 24,
    borderRadius: 22,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: "900",
    color: "#334155",
    textAlign: "center",
  },
  emptyDesc: {
    marginTop: 5,
    fontSize: 13,
    fontWeight: "600",
    color: "#64748b",
    lineHeight: 19,
    textAlign: "center",
  },

  list: {
    gap: 12,
  },
  card: {
    padding: 15,
    borderRadius: 22,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#0f172a",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 2,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },
  planIconBox: {
    width: 46,
    height: 46,
    borderRadius: 17,
    backgroundColor: "#f0fdf4",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitleBox: {
    flex: 1,
  },
  planName: {
    fontSize: 16,
    fontWeight: "900",
    color: "#0f172a",
  },
  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "900",
  },
  divider: {
    height: 1,
    backgroundColor: "#f1f5f9",
    marginVertical: 13,
  },

  infoGrid: {
    gap: 10,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  infoIconBox: {
    width: 34,
    height: 34,
    borderRadius: 13,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
  },
  infoTextBox: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748b",
  },
  infoValue: {
    marginTop: 2,
    fontSize: 13,
    fontWeight: "800",
    color: "#0f172a",
    lineHeight: 18,
  },

  amountBox: {
    marginTop: 13,
    padding: 12,
    borderRadius: 18,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 8,
  },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  amountLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748b",
  },
  amountValue: {
    flexShrink: 1,
    fontSize: 12.5,
    fontWeight: "800",
    color: "#0f172a",
    textAlign: "right",
  },
  amountValueStrong: {
    fontSize: 13.5,
    fontWeight: "900",
  },
  amountValueDanger: {
    color: "#dc2626",
  },
});
