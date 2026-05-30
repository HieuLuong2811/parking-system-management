import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTranslation } from "react-i18next";

import { isPasswordComplex } from "../ultis/passwordRegex";
import { showAppToast } from "../ultis/toast";
import FormInput from "./FormInput";

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function ChangePasswordModal({ visible, onClose }: Props) {
  const { t } = useTranslation();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pending, setPending] = useState(false);

  const resetState = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleSubmit = async () => {
    if (!currentPassword.trim()) {
      showAppToast(t("profile.currentPasswordRequired"), "error");
      return;
    }

    if (!isPasswordComplex(newPassword)) {
      showAppToast(t("auth.passwordRules"), "error");
      return;
    }

    if (newPassword !== confirmPassword) {
      showAppToast(t("auth.passwordMismatch"), "error");
      return;
    }

    try {
      setPending(true);

      // TODO: gọi API đổi mật khẩu ở đây
      // await changePassword({
      //   current_password: currentPassword,
      //   new_password: newPassword,
      // });

      showAppToast(t("profile.changePasswordSuccess"), "success");
      handleClose();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : t("profile.changePasswordFailed");

      showAppToast(message, "error");
    } finally {
      setPending(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>{t("profile.changePassword")}</Text>

            <TouchableOpacity onPress={handleClose} activeOpacity={0.85}>
              <Ionicons name="close" size={20} color="#0f172a" />
            </TouchableOpacity>
          </View>

          <FormInput
            label={t("profile.currentPassword")}
            required
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder={t("profile.currentPasswordPlaceholder")}
            placeholderTextColor="#94a3b8"
            style={styles.input}
            secureTextEntry
            autoCapitalize="none"
          />

          <FormInput
            label={t("auth.newPassword")}
            required
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder={t("auth.newPasswordPlaceholder")}
            placeholderTextColor="#94a3b8"
            style={styles.input}
            secureTextEntry
            autoCapitalize="none"
          />

          <Text style={styles.helpText}>{t("auth.passwordRuleText")}</Text>

          <FormInput
            label={t("auth.confirmPassword")}
            required
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder={t("auth.confirmPasswordPlaceholder")}
            placeholderTextColor="#94a3b8"
            style={styles.input}
            secureTextEntry
            autoCapitalize="none"
          />

          <TouchableOpacity
            style={[styles.submitBtn, pending && styles.submitBtnDisabled]}
            disabled={pending}
            onPress={() => void handleSubmit()}
            activeOpacity={0.85}
          >
            {pending ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.submitText}>{t("auth.updatePassword")}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.55)",
    justifyContent: "center",
    padding: 18,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  title: {
    fontSize: 16,
    fontWeight: "900",
    color: "#0f172a",
  },
  label: {
    fontSize: 13,
    fontWeight: "800",
    color: "#334155",
    marginBottom: 7,
  },
  input: {
    height: 48,
    paddingHorizontal: 14,
    fontSize: 15,
    color: "#0f172a",
  },
  helpText: {
    marginTop: 8,
    fontSize: 12,
    color: "#64748b",
    lineHeight: 18,
  },
  submitBtn: {
    height: 48,
    borderRadius: 12,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "900",
  },
});
