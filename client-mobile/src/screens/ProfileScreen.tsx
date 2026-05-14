import React, { useEffect, useState } from "react";
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
import { showAppToast } from "../ultis/toast";
import ScreenShell from "../component/ScreenShell";
import { useAuth } from "../auth/AuthContext";
import type { AppStackParamList } from "../navigation/AppStack";
import { useUpdateUser } from "../api/users";
import FormInput from "../component/FormInput";
import { useMyWallet, useWalletTopup } from "../api/wallets";
import { formatCurrency } from "../ultis/format";
import * as Linking from "expo-linking";

type Nav = NativeStackNavigationProp<AppStackParamList>;

type ProfileForm = {
  full_name: string;
  email: string;
  phone_number: string;
};

type ProfileFormErrors = Partial<Record<keyof ProfileForm, string>>;

export default function ProfileScreen() {
  const { user, signOut, patchUser } = useAuth();
  const navigation = useNavigation<Nav>();
  const { t } = useTranslation();
  const [errors, setErrors] = useState<ProfileFormErrors>({});
  const { mutateAsync: updateUser, isPending } = useUpdateUser();
  const { data: wallet, isLoading: walletLoading } = useMyWallet();
  const { mutateAsync: topupWallet, isPending: topupPending } = useWalletTopup();
  const [topupAmount, setTopupAmount] = useState("");

  const [form, setForm] = useState<ProfileForm>({
    full_name: "",
    email: "",
    phone_number: "",
  });

  useEffect(() => {
    if (!user) return;

    setForm({
      full_name: user.full_name || "",
      email: user.email || "",
      phone_number: user.phone_number || "",
    });
  }, [user]);

  const hasChanged =
    form.full_name.trim() !== String(user?.full_name || "").trim() ||
    form.email.trim() !== String(user?.email || "").trim() ||
    form.phone_number.trim() !==
      String((user as any)?.phone_number || "").trim();

  const validateForm = () => {
    const nextErrors: ProfileFormErrors = {};

    if (!form.full_name.trim()) {
      nextErrors.full_name = t("profile.fullNameRequired");
    }

    const email = form.email.trim().toLowerCase();

    if (!email) {
      nextErrors.email = t("profile.emailRequired");
    } else {
      const emailRegex =
        /^[A-Za-z0-9._%+-]+@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,}$/;

      const domain = email.split("@")[1] || "";
      const isPunycodeDomain = domain
        .split(".")
        .some((part) => part.startsWith("xn--"));

      if (!emailRegex.test(email) || isPunycodeDomain) {
        nextErrors.email = t("profile.invalidEmail");
      }
    }

    if (form.phone_number.trim()) {
      const phoneRegex = /^[0-9]{10}$/;

      if (!phoneRegex.test(form.phone_number.trim())) {
        nextErrors.phone_number = t("profile.invalidPhone");
      }
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const updateForm = (key: keyof ProfileForm, value: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [key]: undefined,
    }));
  };

  const handleSave = async () => {
    if (!user) return;
    if (!validateForm()) return;

    try {
      await updateUser({
        userCode: user.user_code,
        payload: {
          full_name: form.full_name.trim(),
          email: form.email.trim(),
          phone_number: form.phone_number.trim() || undefined,
        },
      });

      setErrors({});
      showAppToast(t("profile.updateSuccess"), "success");

      patchUser({
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone_number: form.phone_number.trim(),
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t("profile.updateFailed");

      showAppToast(message, "error");
    }
  };

  const resetForm = () => {
    if (!user) return;

    setForm({
      full_name: user.full_name || "",
      email: user.email || "",
      phone_number: user.phone_number || "",
    });

    setErrors({});
  };

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

      await Linking.openURL(checkoutUrl);
      showAppToast(t("wallet.redirectingMomo"), "success");
    } catch (error) {
      const message = error instanceof Error ? error.message : t("wallet.topupFailed");
      showAppToast(message, "error");
    }
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      
      <ScreenShell>
        <View style={styles.headerCard}>
          <View style={styles.avatarBox}>
            <Ionicons name="person" size={30} color="#2563eb" />
          </View>

          <View style={styles.headerContent}>
            <Text style={styles.title}>{t("profile.title")}</Text>
            <Text style={styles.subtitle}>{t("profile.subtitle")}</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="id-card-outline" size={18} color="#2563eb" />
            <Text style={styles.sectionTitle}>{t("profile.accountInfo")}</Text>
          </View>

          {user ? (
            <>
              <FormInput
                label={t("profile.userCode")}
                required
                value={user.user_code}
                onChangeText={() => {}}
                disabled
              />

              <FormInput
                label={t("profile.fullName")}
                required
                value={form.full_name}
                onChangeText={(value) => updateForm("full_name", value)}
                placeholder={t("profile.fullNamePlaceholder")}
                error={errors.full_name}
              />

              <FormInput
                label={t("profile.email")}
                required
                value={form.email}
                onChangeText={(value) => updateForm("email", value)}
                placeholder={t("profile.emailPlaceholder")}
                error={errors.email}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <FormInput
                label={t("profile.phoneNumber")}
                value={form.phone_number}
                onChangeText={(value) =>
                  updateForm("phone_number", value.replace(/\D/g, ""))
                }
                placeholder={t("profile.phoneNumberPlaceholder")}
                error={errors.phone_number}
                keyboardType="phone-pad"
                maxLength={10}
              />

              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[
                    styles.resetButton,
                    (!hasChanged || isPending) && styles.resetButtonDisabled,
                  ]}
                  disabled={!hasChanged || isPending}
                  onPress={resetForm}
                  activeOpacity={0.85}
                >
                  <Ionicons
                    name="refresh-outline"
                    size={18}
                    color={!hasChanged || isPending ? "#94a3b8" : "#0f172a"}
                  />
                  <Text
                    style={[
                      styles.resetButtonText,
                      (!hasChanged || isPending) &&
                        styles.resetButtonTextDisabled,
                    ]}
                  >
                    {t("common.resetChanges")}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    (!hasChanged || isPending) && styles.saveButtonDisabled,
                  ]}
                  disabled={!hasChanged || isPending}
                  onPress={() => void handleSave()}
                  activeOpacity={0.85}
                >
                  {isPending ? (
                    <ActivityIndicator color="#ffffff" size="small" />
                  ) : (
                    <>
                      <Ionicons name="save-outline" size={18} color="#ffffff" />
                      <Text style={styles.saveButtonText}>
                        {t("profile.saveChanges")}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <Text style={styles.emptyText}>{t("profile.noUserInfo")}</Text>
          )}
        </View>

        <View style={styles.walletCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="wallet-outline" size={18} color="#2563eb" />
            <Text style={styles.sectionTitle}>{t("wallet.title")}</Text>
          </View>

          {walletLoading ? (
            <ActivityIndicator color="#2563eb" />
          ) : wallet ? (
            <>
              <View style={styles.walletRow}>
                <Text style={styles.walletLabel}>{t("wallet.balance")}</Text>
                <Text style={styles.walletValue}>
                  {formatCurrency(Number(wallet.balance))}
                </Text>
              </View>
              <View style={styles.walletRow}>
                <Text style={styles.walletLabel}>{t("wallet.status")}</Text>
                <Text
                  style={[
                    styles.walletStatus,
                    wallet.status === "ACTIVE"
                      ? styles.walletStatusActive
                      : styles.walletStatusLocked,
                  ]}
                >
                  {wallet.status}
                </Text>
              </View>

              <View style={styles.topupBox}>
                <FormInput
                  label={t("wallet.topupAmount")}
                  value={topupAmount}
                  onChangeText={(value) => setTopupAmount(value.replace(/\D/g, ""))}
                  placeholder={t("wallet.topupAmountPlaceholder")}
                  keyboardType="numeric"
                />

                <TouchableOpacity
                  style={[styles.topupBtn, topupPending && styles.topupBtnDisabled]}
                  disabled={topupPending}
                  onPress={() => void handleTopup()}
                  activeOpacity={0.85}
                >
                  {topupPending ? (
                    <ActivityIndicator color="#ffffff" size="small" />
                  ) : (
                    <Text style={styles.topupBtnText}>{t("wallet.topup")}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <Text style={styles.emptyText}>{t("wallet.unavailable")}</Text>
          )}
        </View>

        <View style={styles.menuCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="grid-outline" size={18} color="#2563eb" />
            <Text style={styles.sectionTitle}>
              {t("profile.personalManagement")}
            </Text>
          </View>

          <View style={styles.menuList}>
            <MenuItem
              icon="reader-outline"
              title={t("profile.subscriptions")}
              subtitle={t("profile.subscriptionsDesc")}
              onPress={() => navigation.navigate("UserSubscriptions")}
            />
          </View>
        </View>

        <View style={styles.menuCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="settings-outline" size={18} color="#2563eb" />
            <Text style={styles.sectionTitle}>{t("profile.account")}</Text>
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
              <Text style={styles.logoutSubtitle}>{t("profile.logoutDesc")}</Text>
            </View>

            <Ionicons name="chevron-forward" size={18} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </ScreenShell>
    </ScrollView>
  );
}

function MenuItem({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
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
        <Text numberOfLines={2} style={styles.menuSubtitle}>
          {subtitle}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 24,
    gap: 16,
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
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 21,
    fontWeight: "900",
    color: "#0f172a",
  },
  subtitle: {
    marginTop: 5,
    fontSize: 13,
    fontWeight: "600",
    color: "#64748b",
    lineHeight: 19,
  },

  infoCard: {
    padding: 15,
    borderRadius: 6,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 12,
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
    marginBottom: 8,
  },
  walletLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#64748b",
  },
  walletValue: {
    fontSize: 16,
    fontWeight: "900",
    color: "#0f172a",
  },
  walletStatus: {
    fontSize: 12,
    fontWeight: "900",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: "hidden",
  },
  walletStatusActive: {
    backgroundColor: "#dcfce7",
    color: "#166534",
  },
  walletStatusLocked: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
  },
  topupBox: {
    marginTop: 10,
    gap: 10,
  },
  topupBtn: {
    height: 46,
    borderRadius: 6,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
  },
  topupBtnDisabled: {
    backgroundColor: "#cbd5e1",
  },
  topupBtnText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#ffffff",
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

  actionRow: {
    marginTop: 2,
    flexDirection: "row",
    gap: 10,
  },

  resetButton: {
    flex: 1,
    height: 48,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 7,
  },

  resetButtonDisabled: {
    backgroundColor: "#f8fafc",
    borderColor: "#e2e8f0",
  },

  resetButtonText: {
    fontSize: 13.5,
    fontWeight: "900",
    color: "#0f172a",
  },

  resetButtonTextDisabled: {
    color: "#94a3b8",
  },

  saveButton: {
    flex: 1.4,
    height: 48,
    borderRadius: 6,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    shadowColor: "#2563eb",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 3,
  },

  saveButtonDisabled: {
    backgroundColor: "#cbd5e1",
    shadowOpacity: 0,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#ffffff",
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
  menuSubtitle: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
    lineHeight: 17,
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
    fontSize: 14,
    fontWeight: "900",
    color: "#dc2626",
  },
  logoutSubtitle: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: "600",
    color: "#ef4444",
    lineHeight: 17,
  },
});
