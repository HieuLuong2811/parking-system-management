import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import * as Linking from "expo-linking";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useMyWallet, useWalletTopup } from "../api/wallets";
import { useAuth } from "../auth/AuthContext";
import { formatCurrency, formatCurrencyInput, formatDate } from "../ultis/format";
import { showAppToast } from "../ultis/toast";
import { PaymentTransactionType, useMyTransactionDetails } from "../api/paymentTransactions";
import FormInput from "../component/FormInput";
import ScreenShell from "../component/ScreenShell";

export default function WalletScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { data: wallet, isLoading: walletLoading } = useMyWallet();
  const { mutateAsync: topupWallet, isPending: topupPending } =
    useWalletTopup();

  const [balanceHidden, setBalanceHidden] = useState(true);
  const [topupOpen, setTopupOpen] = useState(false);
  const [topupAmount, setTopupAmount] = useState("");

  const formattedBalance = useMemo(() => {
    const value = Number((wallet as any)?.balance ?? 0);
    return formatCurrency(value);
  }, [wallet]);

  const walletCode = String(
    (wallet as any)?.wallet_code ??
      (wallet as any)?.wallet_id ??
      (wallet as any)?.id ??
      user?.user_code ??
      "000000",
  );

  const lastSixCardDigits = walletCode.slice(-6).padStart(6, "0");

  const {
    data: topupsPaginated,
    isLoading: topupsLoading,
    isError: topupsError,
  } = useMyTransactionDetails({
    page: 1,
    limit: 5,
    transaction_type: "TOP_UP",
    direction: "IN",
  });

  const recentTopups = useMemo(
    () => topupsPaginated?.data ?? [],
    [topupsPaginated],
  );

  const handleTopup = async () => {
    if (!user) return;
    const amount = Number(String(topupAmount || "").replace(/\D/g, ""));
    if (!amount || amount <= 0) {
      showAppToast(t("wallet.invalidAmount"), "error");
      return;
    }

    try {
      const redirectUrl = Linking.createURL("payment-return", {
        queryParams: { invoice_id: "pending" },
      });

      const res = await topupWallet({
        amount,
        redirect_url: redirectUrl,
        lang: user.language_use || "vi",
      });

      const checkoutUrl =
        (res as any).payUrl ??
        (res as any).deeplink ??
        (res as any).shortLink ??
        (res as any).qrCodeUrl ??
        (res as any).redirectUrl ??
        null;

      if (!checkoutUrl) {
        throw new Error(t("wallet.noPaymentUrl"));
      }

      const canOpen = await Linking.canOpenURL(checkoutUrl);
      if (!canOpen) {
        throw new Error(t("wallet.cannotOpenPaymentUrl"));
      }

      setTopupOpen(false);
      setTopupAmount("");
      await Linking.openURL(checkoutUrl);
      showAppToast(t("wallet.redirectingMomo"), "success");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t("wallet.topupFailed");
      showAppToast(message, "error");
    }
  };

  const typeLabel = (value: PaymentTransactionType) => t(`transactions.type.${value}`);

  return (
    <ScreenShell hiddenHeader={true}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.85}
        >
          <Ionicons name="chevron-back" size={22} color="#0f172a" />
        </TouchableOpacity>

        <Text style={styles.title}>{t("wallet.screenTitle")}</Text>

        <View style={styles.headerRight} />
      </View>

      <View style={styles.walletCardWrap}>
        <LinearGradient
          colors={["#8B7CF6", "#6D5DF2", "#4F46E5"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.walletCard}
        >
          <View style={styles.cardDecorOne} />
          <View style={styles.cardDecorTwo} />

          <View style={styles.walletCardHeader}>
            <View style={styles.balanceArea}>
              <Text style={styles.cardLabel}>{t("wallet.balance")}</Text>

              <View style={styles.cardBalanceRow}>
                <Text style={styles.cardBalance}>
                  {walletLoading
                    ? "..."
                    : wallet
                      ? balanceHidden
                        ? "••••••"
                        : formattedBalance
                      : "0 đ"}
                </Text>

                <TouchableOpacity
                  onPress={() => setBalanceHidden((v) => !v)}
                  activeOpacity={0.85}
                  style={styles.cardEyeBtn}
                >
                  <Ionicons
                    name={balanceHidden ? "eye-off-outline" : "eye-outline"}
                    size={18}
                    color="#ffffff"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.cardChip}>
              <Ionicons name="card" size={28} color="#facc15" />
            </View>
          </View>

          <View style={styles.walletCardBottom}>
            <Text style={styles.cardNumber}>•••••• {lastSixCardDigits}</Text>

            <View style={styles.cardStatusBox}>
              <View style={styles.cardStatusDot} />
              <Text style={styles.cardStatusText}>
                {t(`common.userWalletStatus.${wallet?.status.toLocaleLowerCase() ?? "available"}`)}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      <View style={styles.actionGrid}>
        <TouchableOpacity
          style={styles.actionItem}
          activeOpacity={0.85}
          onPress={() => setTopupOpen(true)}
          disabled={topupPending}
        >
          <View style={styles.actionIconBox}>
            {topupPending ? (
              <ActivityIndicator color="#2563eb" size="small" />
            ) : (
              <Ionicons name="wallet-outline" size={24} color="#2563eb" />
            )}
          </View>
          <Text style={styles.actionText}>{t("wallet.topup")}</Text>
        </TouchableOpacity>

        {/* <TouchableOpacity style={styles.actionItem} activeOpacity={0.85}>
          <View style={styles.actionIconBox}>
            <Ionicons name="receipt-outline" size={24} color="#2563eb" />
          </View>
          <Text style={styles.actionText}>{t("wallet.history")}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionItem} activeOpacity={0.85}>
          <View style={styles.actionIconBox}>
            <Ionicons name="card-outline" size={24} color="#2563eb" />
          </View>
          <Text style={styles.actionText}>{t("wallet.card")}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionItem} activeOpacity={0.85}>
          <View style={styles.actionIconBox}>
            <Ionicons
              name="shield-checkmark-outline"
              size={24}
              color="#2563eb"
            />
          </View>
          <Text style={styles.actionText}>{t("wallet.status")}</Text>
        </TouchableOpacity> */}
      </View>

      <View style={styles.transactionsSection}>
        <View style={styles.transactionsHeader}>
          <Text style={styles.transactionsTitle}>
            {t("wallet.transactionsHistory")}
          </Text>

          <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate("PaymentTransactionsHistory")}>
            <Text style={styles.seeAllText}>{t("wallet.seeAll")}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filterRow}>
          <View style={[styles.filterPill, styles.filterPillActive]}>
            <Text style={[styles.filterText, styles.filterTextActive]}>
              {t("wallet.all")}
            </Text>
          </View>

          <View style={styles.filterPill}>
            <View style={[styles.filterDot, styles.incomeDot]} />
            <Text style={styles.filterText}>{t("wallet.income")}</Text>
          </View>

          <View style={styles.filterPill}>
            <View style={[styles.filterDot, styles.expenseDot]} />
            <Text style={styles.filterText}>{t("wallet.expense")}</Text>
          </View>
        </View>

        <View style={styles.transactionList}>
          {topupsLoading ? (
            <View style={{ paddingVertical: 12 }}>
              <ActivityIndicator />
            </View>
          ) : topupsError ? (
            <Text style={styles.transactionDesc}>
              {t("wallet.loadTransactionsFailed")}
            </Text>
          ) : recentTopups.length === 0 ? (
            <Text style={styles.transactionDesc}>
              {t("wallet.noRecentTransactions")}
            </Text>
          ) : (
            recentTopups.map((tx) => {
              const amountNum = Number(tx.amount || 0);
              return (
                <TouchableOpacity
                  key={String(tx.payment_transaction_id)}
                  style={styles.transactionItem}
                  activeOpacity={0.85}
                >
                  <View style={styles.transactionIconBox}>
                    <Ionicons name="wallet-outline" size={22} color="#2563eb" />
                  </View>

                  <View style={styles.transactionInfo}>
                    <Text style={styles.transactionTitle}>{t("wallet.topup")}</Text>
                    <Text style={styles.transactionDesc}>
                      {!!tx.invoice_id && <Text style={styles.itemDesc}>{t('transactions.invoice')}: {String(tx.invoice_id)}</Text>}
                      {!!tx.transaction_code && <Text style={styles.itemId}>{t('transactions.tx')}: {String(tx.transaction_code)}</Text>}
                      <Text style={styles.time}>{formatDate(tx.created_at)}</Text>

                    </Text>
                  </View>

                  <Text style={[styles.transactionAmount, styles.amountIncome]}>
                    {`+ ${formatCurrency(amountNum)}`}
                  </Text>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </View>

      <Modal
        visible={topupOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setTopupOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t("wallet.topup")}</Text>

              <TouchableOpacity
                onPress={() => setTopupOpen(false)}
                activeOpacity={0.85}
              >
                <Ionicons name="close" size={20} color="#0f172a" />
              </TouchableOpacity>
            </View>

            <FormInput
              label={t("wallet.topupAmount")} 
              value={formatCurrencyInput(topupAmount)}
              onChangeText={(v) => setTopupAmount(v.replace(/\D/g, ""))}
              placeholder={t("wallet.topupAmountPlaceholder")}
              keyboardType="numeric"
              style={styles.modalInput}
              placeholderTextColor="#94a3b8"
            />

            <Text style={styles.modalWarning}>{t("wallet.topupWarning")}</Text>

            <TouchableOpacity
              style={[styles.modalBtn, topupPending && styles.modalBtnDisabled]}
              disabled={topupPending}
              onPress={() => void handleTopup()}
              activeOpacity={0.85}
            >
              {topupPending ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.modalBtnText}>
                  {t("wallet.confirmTopup")}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 28,
    backgroundColor: "#f8fafc",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#0f172a",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "900",
    color: "#0f172a",
  },

  headerRight: {
    width: 40,
  },

  walletCardWrap: {
    borderRadius: 22,
    shadowColor: "#4f46e5",
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
    marginBottom: 18,
  },

  walletCard: {
    minHeight: 178,
    borderRadius: 22,
    padding: 22,
    overflow: "hidden",
    justifyContent: "space-between",
  },

  cardDecorOne: {
    position: "absolute",
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: "rgba(255,255,255,0.10)",
    right: -70,
    top: -58,
  },

  cardDecorTwo: {
    position: "absolute",
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: "rgba(255,255,255,0.08)",
    left: -58,
    bottom: -84,
  },

  walletCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  balanceArea: {
    flex: 1,
  },

  cardLabel: {
    fontSize: 16,
    fontWeight: "800",
    color: "rgba(255,255,255,0.78)",
    marginBottom: 6,
  },

  cardBalanceRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  cardBalance: {
    fontSize: 28,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: 0.2,
  },

  cardEyeBtn: {
    marginLeft: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.14)",
    justifyContent: "center",
    alignItems: "center",
  },

  cardChip: {
    width: 46,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.16)",
    justifyContent: "center",
    alignItems: "center",
  },

  walletCardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 34,
  },

  cardNumber: {
    fontSize: 15,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: 1,
  },

  cardStatusBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.20)",
  },

  cardStatusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#22c55e",
  },

  cardStatusText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#ffffff",
    textTransform: "uppercase",
  },

  actionGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },

  actionItem: {
    alignItems: "center",
    width: "23%",
  },

  actionIconBox: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#0f172a",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },

  actionText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "900",
    color: "#334155",
  },

  transactionsSection: {
    marginTop: 2,
  },

  transactionsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  transactionsTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
  },

  seeAllText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#2563eb",
  },

  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },

  filterPill: {
    height: 32,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#eef2f7",
  },

  filterPillActive: {
    backgroundColor: "#eff6ff",
    borderColor: "#dbeafe",
  },

  filterText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#94a3b8",
  },

  filterTextActive: {
    color: "#2563eb",
  },

  filterDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  incomeDot: {
    backgroundColor: "#dcfce7",
  },

  expenseDot: {
    backgroundColor: "#fee2e2",
  },

  transactionList: {
    gap: 12,
  },

  transactionItem: {
    minHeight: 76,
    borderRadius: 18,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#f1f5f9",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    shadowColor: "#0f172a",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  transactionIconBox: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: "#eff6ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  transactionInfo: {
    flex: 1,
  },

  transactionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1e293b",
  },

  transactionDesc: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "600",
    color: "#94a3b8",
  },
  
  itemDesc: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  itemId: {
    marginTop: 3,
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
  },
  time: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: "900",
  },

  amountIncome: {
    color: "#10b981",
  },

  amountExpense: {
    color: "#0f172a",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.55)",
    justifyContent: "center",
    padding: 18,
  },

  modalCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  modalTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#0f172a",
  },

  modalLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 6,
  },

  modalInput: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#0f172a",
    backgroundColor: "#f8fafc",
  },

  modalWarning: {
    marginTop: 10,
    fontSize: 12,
    color: "#b45309",
    fontWeight: "700",
    lineHeight: 16,
  },

  modalBtn: {
    marginTop: 14,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
  },

  modalBtnDisabled: {
    opacity: 0.65,
  },

  modalBtnText: {
    color: "#ffffff",
    fontWeight: "900",
    fontSize: 14,
  },
});
