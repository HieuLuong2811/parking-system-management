import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import Ionicons from "@expo/vector-icons/Ionicons";

import ScreenShell from "../component/ScreenShell";
import { useAuth } from "../auth/AuthContext";
import type { AppStackParamList } from "../navigation/AppStack";
import { useMyWallet } from "../api/wallets";
import { avatarText, formatCurrency } from "../ultis/format";
import ChangePasswordModal from "../component/ChangePasswordModal";

type Nav = NativeStackNavigationProp<AppStackParamList>;

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const navigation = useNavigation<Nav>();
  const { t } = useTranslation();
  const { data: wallet, isLoading: walletLoading } = useMyWallet();
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [balanceHidden, setBalanceHidden] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      t("profile.logoutConfirmTitle"),
      t("profile.logoutConfirmMessage"),
      [
        {
          text: t("common.cancel"),
          style: "cancel",
        },
        {
          text: t("profile.logout"),
          style: "destructive",
          onPress: () => void signOut(),
        },
      ],
    );
  };

  return (
    <ScreenShell hiddenHeader={false}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        <View style={styles.headerCard}>
          <View style={styles.avatarBox}>
            <Text style={styles.avatarText}>{avatarText(user?.full_name)}</Text>
          </View>

          <View style={styles.headerContent}>
            <Text style={styles.title}>
              {user?.full_name || t("profile.title")}
            </Text>
            <Text style={styles.subtitle}>
              {user?.user_code || t("profile.subtitle")}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.walletCard}
          activeOpacity={0.85}
          onPress={() => navigation.navigate("Wallet")}
        >
          <View style={styles.sectionHeader}>
            <Ionicons name="wallet-outline" size={18} color="#2563eb" />
            <Text style={styles.sectionTitle}>{t("wallet.title")}</Text>
            <View style={{ flex: 1 }} />
            <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
          </View>

          {walletLoading ? (
            <ActivityIndicator color="#2563eb" />
          ) : wallet ? (
            <View style={styles.walletRow}>
              <Text style={styles.walletLabel}>{t("wallet.balance")}</Text>
              <View style={styles.walletBalance}>
                <Text style={styles.walletValue}>
                  {balanceHidden ? "****" : formatCurrency(wallet.balance)}
                  
                </Text>
                <TouchableOpacity
                  onPress={() => setBalanceHidden((v) => !v)}
                  activeOpacity={0.85}
                  style={styles.cardEyeBtn}
                >
                  <Ionicons
                    name={balanceHidden ? "eye-off-outline" : "eye-outline"}
                    size={18}
                  />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <Text style={styles.emptyText}>{t("wallet.unavailable")}</Text>
          )}
        </TouchableOpacity>

        <View style={styles.menuCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="grid-outline" size={18} color="#2563eb" />
            <Text style={styles.sectionTitle}>
              {t("profile.personalManagement")}
            </Text>
          </View>

          <View style={styles.menuList}>
            <MenuItem
              icon="person-outline"
              title={t("profile.personalInfo")}
              onPress={() => navigation.navigate("PersonalInfo")}
            />

            <MenuItem
              icon="key-outline"
              title={t("profile.changePassword")}
              onPress={() => setChangePasswordOpen(true)}
            />

            <MenuItem
              icon="receipt-outline"
              title={t("profile.transactionHistory")}
              onPress={() => navigation.navigate("PaymentTransactionsHistory")}
            />

            <MenuItem
              icon="document-text-outline"
              title={t("profile.invoice")}
              onPress={() => navigation.navigate("Invoices")}
            />

            <MenuItem
              icon="reader-outline"
              title={t("profile.subscriptions")}
              onPress={() => navigation.navigate("UserSubscriptions")}
            />
          </View>
        </View>

          <TouchableOpacity
            style={styles.logoutItem}
            activeOpacity={0.85}
            onPress={handleLogout}
          >
            <View style={styles.logoutIconBox}>
              <Ionicons name="log-out-outline" size={20} color="#dc2626" />
            </View>

            <View style={styles.menuTextBox}>
              <Text style={styles.logoutTitle}>{t("profile.logout")}</Text>
            </View>

            <Ionicons name="chevron-forward" size={18} color="#ef4444" />
          </TouchableOpacity>


        <ChangePasswordModal
          visible={changePasswordOpen}
          onClose={() => setChangePasswordOpen(false)}
        />
      </ScrollView>
    </ScreenShell>
  );
}

function MenuItem({
  icon,
  title,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.menuItem}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <View style={styles.menuIconBox}>
        <Ionicons name={icon} size={21} color="#2563eb" />
      </View>

      <View style={styles.menuTextBox}>
        <Text style={styles.menuTitle}>{title}</Text>
      </View>

      <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 24,
  },

  headerCard: {
    flexDirection: "row",
    gap: 13,
    padding: 16,
    borderRadius: 6,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 12,
  },

  avatarBox: {
    width: 58,
    height: 58,
    borderRadius: 6,
    backgroundColor: "#43B14B",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    fontSize: 22,
    fontWeight: "900",
    color: "#ffffff",
  },

  headerContent: {
    flex: 1,
    justifyContent: "center",
  },

  title: {
    fontSize: 21,
    fontWeight: "900",
    color: "#0f172a",
  },

  subtitle: {
    marginTop: 5,
    fontSize: 13,
    fontWeight: "800",
    color: "#64748b",
    lineHeight: 19,
  },

  walletCard: {
    padding: 15,
    borderRadius: 6,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 12,
  },

  walletRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  walletLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#64748b",
  },

  walletBalance: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2
  },

  walletValue: {
    fontSize: 16,
    fontWeight: "900",
    color: "#0f172a",
  },

  cardEyeBtn: {
    marginLeft: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(119, 118, 118, 0.14)",
    justifyContent: "center",
    alignItems: "center",
  },

  menuCard: {
    padding: 15,
    borderRadius: 6,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 12,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 13,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#0f172a",
  },

  emptyText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748b",
    lineHeight: 20,
  },

  menuList: {
    gap: 10,
  },

  menuItem: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 6,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },

  menuIconBox: {
    width: 44,
    height: 44,
    borderRadius: 6,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
  },

  menuTextBox: {
    flex: 1,
  },

  menuTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#0f172a",
  },

  logoutItem: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 6,
    backgroundColor: "#fff1f2",
    borderWidth: 1,
    borderColor: "#fecdd3",
  },

  logoutIconBox: {
    width: 44,
    height: 44,
    borderRadius: 6,
    backgroundColor: "#fee2e2",
    alignItems: "center",
    justifyContent: "center",
  },

  logoutTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#dc2626",
  },
});