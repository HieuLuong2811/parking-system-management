import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { useChangePassword } from "../../api/auth";
import { useAppAuth } from "../../contexts/useAppAuth";
import { FormInput } from "../common/FormInput";
import PasswordChecklist from "../common/PasswordChecklist";
import {
  DEFAULT_PASSWORD_RULES,
  getPasswordRuleFailures,
  passwordRuleKeyToComplexityIndex,
} from "../../utils/passwordRules";

type ChangePasswordDialogProps = {
  open: boolean;
  onClose: (success?: string) => void;
};

const initialState = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export default function ChangePasswordDialog({
  open,
  onClose,
}: ChangePasswordDialogProps) {
  const { t } = useTranslation();
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState<
    Partial<Record<keyof typeof initialState, string>>
  >({});
  const [showChecklist, setShowChecklist] = useState(false);
  const [helperText, setHelperText] = useState<string | null>(null);

  const { mutateAsync, isPending } = useChangePassword();
  const { logout } = useAppAuth();


  const getPasswordRuleMessage = useCallback((ruleKey: string) => {
    const complexityText = String(t("validation.password-complexity", { defaultValue: "" }));
    const complexityLines = complexityText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.startsWith("-"))
      .map((line) => line.replace(/^-\\s*/, "").trim());

    switch (ruleKey) {
      case 'min':
        return t('validation.passwordRule.min', { min: DEFAULT_PASSWORD_RULES.min });
      case 'max':
        return t('validation.passwordRule.max', { max: DEFAULT_PASSWORD_RULES.max });
      case "allowedChars":
      case "hasUpper":
      case "hasDigit":
      case "hasSpecial":
      case "hasLower": {
        const idx = passwordRuleKeyToComplexityIndex(ruleKey as any);
        if (idx === null) break;
        return complexityLines[idx] || t('common.error', { defaultValue: 'An error occurred. Please try again.' });
      }
      default:
        return t('common.error', { defaultValue: 'An error occurred. Please try again.' });
    }
  }, [t]);

  useEffect(() => {
    if (!open) {
      setForm(initialState);
      setErrors({});
      setHelperText(null);
      setShowChecklist(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    setErrors((prev) => {
      const next = { ...prev };

      if (!form.newPassword) {
        next.newPassword = undefined;
      } else {
        const failures = getPasswordRuleFailures(form.newPassword);
        next.newPassword = failures.length > 0 ? getPasswordRuleMessage(failures[0]) : undefined;
      }

      if (!form.confirmPassword) {
        next.confirmPassword = undefined;
      } else if (form.newPassword !== form.confirmPassword) {
        next.confirmPassword = t('profile.passwordDialog.confirmMismatch', {
          defaultValue: 'Mật khẩu xác nhận không khớp.',
        });
      } else {
        next.confirmPassword = undefined;
      }

      return next;
    });
  }, [form.confirmPassword, form.newPassword, getPasswordRuleMessage, open, t]);

  const setField = (field: keyof typeof initialState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setHelperText(null);
  };

  const getRequiredMessage = (labelKey: string) =>
    t("validation.requiredField", { field: t(labelKey) });

  const validate = (): boolean => {
    const nextErrors: typeof errors = {};

    if (!form.currentPassword) {
      nextErrors.currentPassword = getRequiredMessage(
        "profile.passwordDialog.currentLabel",
      );
    }

    if (!form.newPassword) {
      nextErrors.newPassword = getRequiredMessage(
        "profile.passwordDialog.newLabel",
      );
    }

    if (form.newPassword) {
      const failures = getPasswordRuleFailures(form.newPassword);
      if (failures.length > 0) {
        nextErrors.newPassword = getPasswordRuleMessage(failures[0]);

        requestAnimationFrame(() => {
        })
      }
    }

    if (!form.confirmPassword) {
      nextErrors.confirmPassword = getRequiredMessage(
        "profile.passwordDialog.confirmLabel",
      );
    }

    if (form.confirmPassword && form.newPassword !== form.confirmPassword) {
      nextErrors.confirmPassword = t("profile.passwordDialog.confirmMismatch", {
        defaultValue: "Mật khẩu xác nhận không khớp.",
      });
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };


  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    try {
      await mutateAsync({
        current_password: form.currentPassword,
        new_password: form.newPassword,
      });

      onClose(
        t("profile.passwordDialog.success", {
          defaultValue: "Đổi mật khẩu thành công. Vui lòng đăng nhập lại.",
        }),
      );

      setTimeout(async () => {
        await logout();
      }, 2000);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : t("profile.passwordDialog.genericError", {
              defaultValue: "Không thể đổi mật khẩu. Vui lòng thử lại.",
            });

      setHelperText(message);
    }
  };

  return (
    <Dialog
      open={open}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: "visible",
          maxHeight: "90vh",
        },
      }}
    >
      <DialogTitle
        component="div"
        sx={{
          p: 3,
        }}
      >
        <Typography
          variant="h6"
          component="div"
          textAlign="center"
          sx={{
            fontWeight: 700,
            color: "text.primary",
          }}
        >
          {t("profile.passwordDialog.title")}
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Box
          component="form"
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            mt: 1,
          }}
        >
          <Stack spacing={1}>
            <FormInput
              id="currentPassword"
              label={t("profile.passwordDialog.currentLabel")}
              required
              requiredMarkerClassName="required-marker"
              type="password"
              value={form.currentPassword}
              onChange={(value) => setField("currentPassword", value)}
              error={errors.currentPassword}
              inputClassName="auth-input"
              labelClassName="profile-field-label required"
              autoComplete="current-password"
              requiredFirst={t("profile.passwordDialog.currentLabel")}
              placeholder={t("profile.passwordDialog.currentPlaceholder")}
            />
          </Stack>

          <Stack spacing={1}>
            <Box sx={{ position: "relative" }}>
              <FormInput
                id="newPassword"
                label={t("profile.passwordDialog.newLabel")}
                required
                requiredMarkerClassName="required-marker"
                type="password"
                value={form.newPassword}
                onChange={(value) => setField("newPassword", value)}
                error={undefined}
                invalid={Boolean(errors.newPassword)}
                showErrorText={false}
                inputClassName="auth-input"
                labelClassName="profile-field-label required"
                autoComplete="new-password"
                requiredFirst={t("profile.passwordDialog.newLabel")}
                placeholder={t("profile.passwordDialog.newPlaceholder")}
                onFocus={() => setShowChecklist(true)}
                onBlur={() => {
                  validate();
                  setShowChecklist(false);
                }}
              />
              {showChecklist ? (
                <PasswordChecklist password={form.newPassword} t={t} />
              ) : null}
            </Box>
          </Stack>

          <Stack spacing={1}>
            <FormInput
              id="confirmPassword"
              label={t("profile.passwordDialog.confirmLabel")}
              required
              requiredMarkerClassName="required-marker"
              type="password"
              value={form.confirmPassword}
              onChange={(value) => setField("confirmPassword", value)}
              error={errors.confirmPassword}
              inputClassName="auth-input"
              labelClassName="profile-field-label required"
              autoComplete="new-password"
              requiredFirst={t("profile.passwordDialog.confirmLabel")}
              placeholder={t("profile.passwordDialog.confirmPlaceholder")}
            />
          </Stack>
        </Box>

        {helperText && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {helperText}
          </Alert>
        )}
        <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end", gap: 2 }}>
          <Button
            onClick={() => onClose()}
            disabled={isPending}
            variant="outlined"
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 700,
              px: 2.5,
            }}
          >
            {t("profile.passwordDialog.cancel", {
              defaultValue: "Hủy",
            })}
          </Button>

          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={isPending}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 700,
              px: 2.5,
            }}
          >
            {isPending
              ? t("profile.passwordDialog.saving")
              : t("profile.passwordDialog.save")}
          </Button>

        </Box>
      </DialogContent>
    </Dialog>
  );
}
