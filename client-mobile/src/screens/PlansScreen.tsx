import React, { useMemo } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import ListScreen from "../component/ListScreen";
import { useSubscriptionPlans } from "../api/subscription_plans";
import type { AppStackParamList } from "../navigation/AppStack";
import { getPlanMeta } from "../ultis/status";
import { normalizeText, formatCurrency } from "../ultis/format";
import { useRegistrationWarningFetcher } from '../api/user_subscriptions';
import { useConfirmDialog } from '../component/ConfirmDialogProvider';

type Nav = NativeStackNavigationProp<AppStackParamList>;

const formatVnd = (value: number | string | null | undefined) => {
  const numberValue = Number(value || 0);
  return new Intl.NumberFormat("vi-VN").format(numberValue);
};


type FeatureRowProps = {
  text: string;
  available?: boolean;
  dark?: boolean;
};

function FeatureRow({ text, available = true, dark = false }: FeatureRowProps) {
  return (
    <View style={styles.featureRow}>
      <Ionicons
        name={available ? "checkmark-circle" : "close-circle"}
        size={18}
        color={available ? "#16a34a" : "#9ca3af"}
      />

      <Text
        style={[
          styles.featureText,
          dark && styles.featureTextDark,
          !available && styles.featureTextMuted,
        ]}
      >
        {text}
      </Text>
    </View>
  );
}

export default function PlansScreen() {
  const navigation = useNavigation<Nav>();
  const { t } = useTranslation();

  const confirm = useConfirmDialog();
  const fetchRegistrationWarningSubscriptions = useRegistrationWarningFetcher();

  const {
    data: plans = [],
    isLoading,
    isError,
    refetch,
  } = useSubscriptionPlans();

  const activePlans = useMemo(
    () => plans.filter((plan) => !plan.deleted_at),
    [plans],
  );

  const handlePlanPress = async (plan: any) => {
    if (plan?.is_in_use) {
      navigation.navigate('UserSubscriptions');
      return;
    }

    const confirmed = await confirmExistingBillingSubscription();

    if (!confirmed) return;

    navigation.navigate('PlanCheckout', { plan });
  };

  const confirmExistingBillingSubscription = async () => {
    try {
      const subscriptions = await fetchRegistrationWarningSubscriptions();

      const current = Array.isArray(subscriptions) ? subscriptions[0] : null;

      if (!current) return true;

      const statusLabel = t(
        `userSubscriptions.status.${String(current.status || '').toLowerCase()}`,
        {
          defaultValue: current.status || '—',
        },
      );

      const planLabel = t(
        `plans.cards.${String(
          current.subscription_plan?.plans_type || '',
        ).toLowerCase()}`,
        {
          defaultValue:
            current.subscription_plan?.plans_type ||
            t('plans.currentPlanFallback'),
        },
      );

      const totalAmount = Number(current.total_amount || 0);
      const paidAmount = Number(current.paid_amount || 0);
      const debtAmount = Math.max(totalAmount - paidAmount, 0);

      return await confirm({
        title: t('plans.overrideActivePlanDialog.title'),
        message: t('plans.overrideActivePlanDialog.message', {
          plan: planLabel,
          status: statusLabel,
          debt: formatCurrency(debtAmount),
        }),
        cancelText: t('common.cancel'),
        confirmText: t('common.continue'),
        danger: true,
      });
    } catch {
      return true;
    }
  };

  return (
    <ListScreen
      title={t("plans.title")}
      subtitle={t("plans.subtitle")}
      loading={false}
      error={isError ? t("plans.loadError") : null}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >

        {isLoading ? (
          <View style={styles.stateBox}>
            <ActivityIndicator size="small" color="#2563eb" />
            <Text style={styles.stateText}>{t("plans.loading")}</Text>
          </View>
        ) : isError ? (
          <View style={styles.stateBox}>
            <Ionicons name="alert-circle-outline" size={34} color="#ef4444" />
            <Text style={styles.stateTitle}>{t("plans.loadError")}</Text>

            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => void refetch()}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryBtnText}>{t("common.retry")}</Text>
            </TouchableOpacity>
          </View>
        ) : activePlans.length === 0 ? (
          <View style={styles.stateBox}>
            <Ionicons name="file-tray-outline" size={34} color="#64748b" />
            <Text style={styles.stateTitle}>{t("plans.empty")}</Text>
          </View>
        ) : (
          <View style={styles.planList}>
            {activePlans.map((plan) => {
              const meta = getPlanMeta(plan.plans_type);
              const isInUse = Boolean((plan as any).is_in_use);
              const isDark = meta.dark;
              const priceText = formatVnd(plan.price_per_day);
              const priceValue = Number(plan.price_per_day || 0);
              const planName = meta.labelKey
                ? t(meta.labelKey)
                : plan.plans_type;

              return (
                <View
                  key={plan.id}
                  style={[
                    styles.planCard,
                    isDark && styles.planCardDark,
                    isInUse && styles.planCardInUse,
                    {
                      borderColor: isInUse ? "#86efac" : meta.borderColor,
                    },
                  ]}
                >
                  {isInUse && (
                    <View style={styles.currentBadge}>
                      <Ionicons
                        name="checkmark-circle"
                        size={14}
                        color="#15803d"
                      />
                      <Text style={styles.currentBadgeText}>
                        {t("plans.inUseBadge")}
                      </Text>
                    </View>
                  )}

                  <View style={styles.planHeader}>
                    <View
                      style={[
                        styles.planIconBox,
                        isDark && styles.planIconBoxDark,
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={meta.icon}
                        size={28}
                        color={isDark ? "#ffffff" : "#0f172a"}
                      />
                    </View>

                    <View style={styles.planTitleBox}>
                      <Text
                        style={[styles.planName, isDark && styles.textWhite]}
                      >
                        {planName}
                      </Text>

                      <Text
                        style={[
                          styles.planCode,
                          isDark && styles.textWhiteMuted,
                        ]}
                      >
                        {normalizeText(plan.plans_type)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.priceRow}>
                    <Text style={[styles.currency, isDark && styles.textWhite]}>
                      đ
                    </Text>

                    <Text style={[styles.price, isDark && styles.textWhite]}>
                      {priceText}
                    </Text>

                    <Text
                      style={[
                        styles.priceUnit,
                        isDark && styles.textWhiteMuted,
                      ]}
                    >
                      {t("plans.perDay")}
                    </Text>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.features}>
                    <FeatureRow
                      text={t("plans.monthlyPayment")}
                      dark={isDark}
                    />

                    <FeatureRow
                      text={
                        priceValue >= 4000
                          ? t("plans.fullPayment")
                          : t("plans.noFullPayment")
                      }
                      available={priceValue >= 4000}
                      dark={isDark}
                    />

                    <FeatureRow
                      text={t("plans.maxLicensedVehicle")}
                      dark={isDark}
                    />

                    <FeatureRow
                      text={t("plans.maxUnlicensedVehicle")}
                      dark={isDark}
                    />

                    <FeatureRow
                      text={t("plans.dailyFee", {
                        price: priceText,
                      })}
                      dark={isDark}
                    />

                    <FeatureRow
                      text={
                        priceValue >= 4000
                          ? t("plans.after18Free")
                          : t("plans.after18Fee", {
                              price: priceText,
                            })
                      }
                      dark={isDark}
                    />
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.88}
                    style={[
                      styles.actionBtn,
                      isInUse && styles.actionBtnViewCurrent,
                    ]}
                    onPress={() => void handlePlanPress(plan)}
                  >
                    <Text
                      style={[
                        styles.actionBtnText,
                        isInUse && styles.actionBtnTextViewCurrent,
                      ]}
                    >
                      {isInUse ? t("plans.viewCurrentPlan") : t("plans.register")}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </ListScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 24,
    gap: 16,
  },
  planCardInUse: {
    backgroundColor: "#fafffb",
  },
  planList: {
    gap: 16,
  },
  planCard: {
    position: "relative",
    overflow: "hidden",
    borderRadius: 24,
    padding: 18,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    shadowColor: "#0f172a",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3,
  },
  planCardDark: {
    backgroundColor: "#111827",
  },

  currentBadge: {
    position: "absolute",
    top: 14,
    right: 14,
    zIndex: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: "#dcfce7",
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  currentBadgeText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#15803d",
  },

  planHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  planIconBox: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  planIconBoxDark: {
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  planTitleBox: {
    flex: 1,
  },
  planName: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0f172a",
  },
  planCode: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: "800",
    color: "#64748b",
  },

  priceRow: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "flex-end",
  },
  currency: {
    marginRight: 5,
    marginBottom: 5,
    fontSize: 15,
    fontWeight: "900",
    color: "#0f172a",
    textDecorationLine: "underline",
  },
  price: {
    fontSize: 34,
    fontWeight: "900",
    color: "#0f172a",
    letterSpacing: -0.8,
  },
  priceUnit: {
    marginLeft: 5,
    marginBottom: 7,
    fontSize: 13,
    fontWeight: "700",
    color: "#475569",
  },

  divider: {
    height: 1,
    marginVertical: 16,
    backgroundColor: "rgba(148, 163, 184, 0.25)",
  },

  features: {
    gap: 11,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
  },
  featureText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "800",
    color: "#334155",
  },
  featureTextDark: {
    color: "#f8fafc",
  },
  featureTextMuted: {
    color: "#94a3b8",
  },

  actionBtnViewCurrent: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    shadowColor: "#0f172a",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 1,
  },

  actionBtnTextViewCurrent: {
    color: "#0f172a",
  },

  actionBtn: {
    marginTop: 18,
    height: 48,
    borderRadius: 10,
    backgroundColor: "#43B14B",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#43B14B",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 3,
  },

  actionBtnText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#ffffff",
  },

  stateBox: {
    minHeight: 180,
    padding: 24,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  stateTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#334155",
    textAlign: "center",
  },
  stateText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748b",
    textAlign: "center",
  },

  primaryBtn: {
    marginTop: 4,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 13,
    backgroundColor: "#111827",
  },
  primaryBtnText: {
    color: "#ffffff",
    fontWeight: "900",
  },

  textWhite: {
    color: "#ffffff",
  },
  textWhiteMuted: {
    color: "#cbd5e1",
  },
});
