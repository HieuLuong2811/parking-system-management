import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import Ionicons from "@expo/vector-icons/Ionicons";

import ScreenShell from "../component/ScreenShell";
import FormInput from "../component/FormInput";
import { useAuth } from "../auth/AuthContext";
import { useUpdateUser } from "../api/users";
import { showAppToast } from "../ultis/toast";

type ProfileForm = {
  full_name: string;
  email: string;
  phone_number: string;
};

type ProfileFormErrors = Partial<Record<keyof ProfileForm, string>>;

export default function PersonalInfoScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const { user, patchUser } = useAuth();
  const { mutateAsync: updateUser, isPending } = useUpdateUser();

  const [errors, setErrors] = useState<ProfileFormErrors>({});
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
    form.phone_number.trim() !== String((user as any)?.phone_number || "").trim();

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

  const resetForm = () => {
    if (!user) return;

    setForm({
      full_name: user.full_name || "",
      email: user.email || "",
      phone_number: user.phone_number || "",
    });

    setErrors({});
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

      patchUser({
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone_number: form.phone_number.trim(),
      });

      setErrors({});
      showAppToast(t("profile.updateSuccess"), "success");
      navigation.goBack();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t("profile.updateFailed");

      showAppToast(message, "error");
    }
  };

  return (
    <ScreenShell hiddenHeader={true}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.85}
          >
            <Ionicons name="chevron-back" size={22} color="#0f172a" />
          </TouchableOpacity>

          <Text style={styles.title}>{t("profile.personalInfo")}</Text>

          <View style={styles.headerRight} />
        </View>

        <View style={styles.card}>
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
                  <Text
                    style={[
                      styles.resetButtonText,
                      (!hasChanged || isPending) && styles.resetButtonTextDisabled,
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
                    <Text style={styles.saveButtonText}>
                      {t("profile.saveChanges")}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <Text style={styles.emptyText}>{t("profile.noUserInfo")}</Text>
          )}
        </View>
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 28,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
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
  card: {
    padding: 15,
    borderRadius: 8,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  actionRow: {
    marginTop: 4,
    flexDirection: "row",
    gap: 10,
  },
  resetButton: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  resetButtonDisabled: {
    backgroundColor: "#f8fafc",
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
    borderRadius: 8,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonDisabled: {
    backgroundColor: "#cbd5e1",
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
  },
});