import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Paper,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";

import { PageHeader } from "../components/common/PageHeader";
import { FormInput } from "../components/common/FormInput";
import { useAuth } from "../contexts/useAuth";
import {
  useChangePassword,
  useMyProfile,
  useUpdateMyProfile,
} from "../api/profile";

export const MyProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const { user, refresh } = useAuth();
  const userCode = user?.user_code;

  const profileQuery = useMyProfile(userCode);
  const updateProfile = useUpdateMyProfile();
  const changePassword = useChangePassword();

  const [email, setEmail] = useState<string | null>(null);
  const [phone, setPhone] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<{
    current?: string;
    new?: string;
    confirm?: string;
  } | null>(null);
  const [profileError, setProfileError] = useState<{
    email?: string;
    phone?: string;
  } | null>(null);

  const currentEmail = useMemo(
    () => (email ?? profileQuery.data?.email ?? "").trim(),
    [email, profileQuery.data?.email],
  );
  const currentPhone = useMemo(
    () => (phone ?? profileQuery.data?.phone_number ?? "").trim(),
    [phone, profileQuery.data?.phone_number],
  );

  const validateProfile = useCallback(() => {
    const nextErrors: { email?: string; phone?: string } = {};

    if (!currentEmail) {
      nextErrors.email = t("profilePage.validation.emailRequired", {
        defaultValue: "Email is required.",
      });
    } else {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(currentEmail)) {
        nextErrors.email = t("profilePage.validation.emailInvalid", {
          defaultValue: "Invalid email format.",
        });
      }
    }

    if (currentPhone) {
      const phoneDigitsPattern = /^[0-9]{10}$/;
      if (!phoneDigitsPattern.test(currentPhone)) {
        nextErrors.phone = t("profilePage.validation.phoneInvalid", {
          defaultValue: "Phone number must contain only 10 digits.",
        });
      }
    }

    const hasErrors = Object.values(nextErrors).some(Boolean);
    setProfileError(hasErrors ? nextErrors : null);
    return !hasErrors;
  }, [currentEmail, currentPhone, t]);

  const canSave = useMemo(() => {
    if (!profileQuery.data) return false;
    if (profileError) return false;
    return (
      currentEmail !== String(profileQuery.data.email ?? "") ||
      currentPhone !== String(profileQuery.data.phone_number ?? "")
    );
  }, [currentEmail, currentPhone, profileError, profileQuery.data]);

  const handleSave = useCallback(async () => {
    if (!userCode) return;
    if (!validateProfile()) return;
    await updateProfile.mutateAsync({
      userCode,
      payload: {
        email: currentEmail || undefined,
        phone_number: currentPhone || undefined,
      },
    });
    await refresh();
  }, [
    currentEmail,
    currentPhone,
    refresh,
    updateProfile,
    userCode,
    validateProfile,
  ]);

  const handleChangePassword = useCallback(async () => {
    const nextErrors: { current?: string; new?: string; confirm?: string } = {};

    if (!currentPassword.trim()) {
      nextErrors.current = t("profilePage.password.currentRequired", {
        defaultValue: "Current password is required.",
      });
    }
    if (!newPassword.trim()) {
      nextErrors.new = t("profilePage.password.newRequired", {
        defaultValue: "New password is required.",
      });
    }
    if (newPassword !== confirmPassword) {
      nextErrors.confirm = t("profilePage.password.mismatch", {
        defaultValue: "Passwords do not match.",
      });
    }

    const hasErrors = Object.values(nextErrors).some(Boolean);
    setPasswordError(hasErrors ? nextErrors : null);
    if (hasErrors) return;

    await changePassword.mutateAsync({
      current_password: currentPassword,
      new_password: newPassword,
    });
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }, [changePassword, confirmPassword, currentPassword, newPassword, t]);

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <PageHeader
        title={t("profilePage.title", { defaultValue: "Profile settings" })}
        subtitle={t("profilePage.description", {
          defaultValue: "Manage your profile and password.",
        })}
      />

      {profileQuery.isError && (
        <Alert severity="error">
          {t("profilePage.loadError", {
            defaultValue: "Unable to load your profile.",
          })}
        </Alert>
      )}

      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        alignItems="flex-start"
      >
        <Paper sx={{ p: 2, flex: "1 1 0" }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
            {t("profilePage.section.profile", { defaultValue: "Profile" })}
          </Typography>

          <Stack spacing={2}>
            <FormInput
              label={t("profilePage.fields.email", { defaultValue: "Email" })}
              name="email"
              required
              value={currentEmail}
              onChange={(e) => {
                setEmail(e.target.value);
                setProfileError(null);
              }}
              error={profileError?.email}
            />
            <FormInput
              label={t("profilePage.fields.phone", {
                defaultValue: "Phone number",
              })}
              name="phone_number"
              placeholder="__ ___ ____"
              value={currentPhone}
              onChange={(e) => {
                const nextValue = e.target.value.replace(/\D/g, "");
                setPhone(nextValue);
                setProfileError(null);
              }}
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={15}
              error={profileError?.phone}
            />
            <Box>
              <Button
                variant="contained"
                onClick={() => void handleSave()}
                disabled={!canSave || updateProfile.isPending}
              >
                {t("common.save", { defaultValue: "Save" })}
              </Button>
            </Box>
            {updateProfile.isError && (
              <Snackbar
                open
                autoHideDuration={3000}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                onClose={() => updateProfile.reset()}
              >
                <Alert severity="error">
                  {t("profilePage.saveError", {
                    defaultValue: "Unable to save profile.",
                  })}
                </Alert>
              </Snackbar>
            )}
            {updateProfile.isSuccess && (
              <Snackbar
                open
                autoHideDuration={3000}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                onClose={() => updateProfile.reset()}
              >
                <Alert severity="success">
                  {t("profilePage.saveSuccess", {
                    defaultValue: "Profile updated.",
                  })}
                </Alert>
              </Snackbar>
            )}
          </Stack>
        </Paper>

        <Paper sx={{ p: 2, flex: "1 1 0" }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
            {t("profilePage.section.password", {
              defaultValue: "Change password",
            })}
          </Typography>

          <Stack spacing={2}>
            <FormInput
              label={t("profilePage.password.current", {
                defaultValue: "Current password",
              })}
              name="current_password"
              type="password"
              required
              value={currentPassword}
              onChange={(e) => {
                setCurrentPassword(e.target.value);
                setPasswordError(null);
              }}
              error={passwordError?.current}
            />
            <FormInput
              label={t("profilePage.password.new", {
                defaultValue: "New password",
              })}
              name="new_password"
              type="password"
              required
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setPasswordError(null);
              }}
              error={passwordError?.new}
            />
            <FormInput
              label={t("profilePage.password.confirm", {
                defaultValue: "Confirm password",
              })}
              name="confirm_password"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setPasswordError(null);
              }}
              error={passwordError?.confirm}
            />
            <Box>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => void handleChangePassword()}
                disabled={changePassword.isPending}
              >
                {t("profilePage.password.submit", {
                  defaultValue: "Update password",
                })}
              </Button>
            </Box>
            {changePassword.isError && (
              <Alert severity="error">
                {t("profilePage.password.error", {
                  defaultValue: "Unable to change password.",
                })}
              </Alert>
            )}
            {changePassword.isSuccess && (
              <Alert severity="success">
                {t("profilePage.password.success", {
                  defaultValue: "Password updated.",
                })}
              </Alert>
            )}
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
};
