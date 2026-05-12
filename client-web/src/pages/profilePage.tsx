import { Alert, Box, Button, Snackbar, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { FormInput } from "../components/common/FormInput";
import ChangePasswordDialog from "../components/profile/ChangePasswordDialog";
import { useAppAuth } from "../contexts/useAppAuth";
import { useUpdateUser } from "../api/users";

type ProfileFormValues = {
  full_name: string;
  email: string;
  phone_number: string | null;
};

export default function ProfilePage() {
  const { t } = useTranslation();
  const { user, status, patchUser } = useAppAuth();

  const [formValues, setFormValues] = useState<ProfileFormValues>({
    full_name: "",
    email: "",
    phone_number: null,
  });

  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof ProfileFormValues, string>>
  >({});

  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  const { mutateAsync: updateUser, isPending } = useUpdateUser();

  useEffect(() => {
    if (user) {
      setFormValues({
        full_name: user.full_name,
        email: user.email,
        phone_number: user.phone_number ?? null,
      });
    }
  }, [user]);

  const handleFieldChange = (field: keyof ProfileFormValues, value: string) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    setStatusMessage(null);
  };

  const validateForm = (): boolean => {
    const errors: typeof formErrors = {};

    if (!formValues.full_name.trim()) {
      errors.full_name = t("validation.requiredField", {
        field: t("profile.fields.fullName"),
      });
    }

    if (!formValues.email.trim()) {
      errors.email = t("validation.requiredField", {
        field: t("profile.fields.email"),
      });
    }

    if (!formValues.phone_number) {
      errors.phone_number = t("validation.requiredField", {
        field: t("profile.fields.phone"),
      });
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveChanges = async () => {
    if (!user || !validateForm()) {
      return;
    }

    try {
      await updateUser({
        userCode: user.user_code,
        payload: {
          full_name: formValues.full_name.trim(),
          email: formValues.email.trim(),
          phone_number: formValues.phone_number || undefined,
        },
      });

      setStatusMessage(t("profile.fields.saveSuccess"));

      patchUser({
        full_name: formValues.full_name.trim(),
        email: formValues.email.trim(),
        phone_number: formValues.phone_number ?? null,
      });
    } catch (error) {
      setStatusMessage(
        error instanceof Error ? error.message : t("common.error"),
      );
    }
  };

  const handleChangePasswordClose = (message?: string) => {
    setPasswordDialogOpen(false);

    if (message) {
      setPasswordSuccess(message);
    }
  };

  if (status === "loading") {
    return (
      <Box className="profile-page-shell">
        <Typography>{t("profile.loading")}</Typography>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box className="profile-page-shell">
        <Typography color="error">{t("profile.title")}</Typography>
      </Box>
    );
  }

  return (
    <Box className="profile-page-shell">

      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            color: "text.primary",
            mb: 0.5,
          }}
        >
          {t("profile.title", {
            defaultValue: "Thông tin cá nhân",
          })}
        </Typography>

        <Typography variant="body2" fontSize="medium" color="text.secondary">
          {t("profile.subtitle", {
            defaultValue:
              "Quản lý thông tin tài khoản cá nhân và thay đổi mật khẩu khi cần.",
          })}
        </Typography>
      </Box>

      <Box className="profile-card">
        <Box className="profile-form-grid">
          <Box className="profile-field-row">
            <Stack spacing={1} sx={{ flex: 1, minWidth: 260 }}>
              <FormInput
                id="profile-user-code"
                label={t("profile.fields.userCode")}
                value={user.user_code}
                onChange={() => {}}
                readOnly
                inputClassName="plain-input"
                labelClassName="profile-field-label"
              />
            </Stack>

            <Stack spacing={1} sx={{ flex: 1, minWidth: 260 }}>
              <FormInput
                id="profile-full-name"
                label={t("profile.fields.fullName")}
                required
                requiredMarkerClassName="required-marker"
                value={formValues.full_name}
                onChange={(value) => handleFieldChange("full_name", value)}
                error={formErrors.full_name}
                inputClassName="plain-input"
                labelClassName="profile-field-label required"
                requiredFirst={t("profile.fields.fullName")}
              />
            </Stack>
          </Box>

          <Box className="profile-field-row">
            <Stack spacing={1} sx={{ flex: 1, minWidth: 260 }}>
              <FormInput
                id="profile-email"
                label={t("profile.fields.email")}
                required
                requiredMarkerClassName="required-marker"
                value={formValues.email}
                onChange={(value) => handleFieldChange("email", value)}
                error={formErrors.email}
                inputClassName="plain-input"
                labelClassName="profile-field-label required"
                requiredFirst={t("profile.fields.email")}
                placeholder="example@gmail.com"
              />
            </Stack>

            <Stack spacing={1} sx={{ flex: 1, minWidth: 260 }}>
              <FormInput
                id="profile-phone"
                label={t("profile.fields.phone")}
                value={formValues.phone_number ?? ""}
                onChange={(value) => handleFieldChange("phone_number", value)}
                inputClassName="plain-input"
                labelClassName="profile-field-label"
                placeholder="Just number"
              />
            </Stack>
          </Box>
        </Box>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          mt={3}
          alignItems={{ xs: "stretch", sm: "center" }}
        >
          <Button
            variant="contained"
            onClick={handleSaveChanges}
            disabled={isPending}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 700,
              px: 2.5,
            }}
          >
            {t("profile.saveChanges")}
          </Button>

          <Button
            variant="outlined"
            onClick={() => setPasswordDialogOpen(true)}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 700,
              px: 2.5,
            }}
          >
            {t("profile.passwordDialog.button")}
          </Button>
        </Stack>

        {statusMessage && (
          <Snackbar
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
            open
            autoHideDuration={3000}
            onClose={() => setStatusMessage(null)}
          >
            <Alert
              severity={
                statusMessage === t("profile.fields.saveSuccess")
                  ? "success"
                  : "error"
              }
              onClose={() => setStatusMessage(null)}
            >
              {statusMessage}
            </Alert>
          </Snackbar>
        )}

        {passwordSuccess && (
          <Snackbar
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
            open
            autoHideDuration={3000}
            onClose={() => setPasswordSuccess(null)}
          >
            <Alert severity="success" onClose={() => setPasswordSuccess(null)}>
              {passwordSuccess}
            </Alert>
          </Snackbar>
        )}
      </Box>

      <ChangePasswordDialog
        open={passwordDialogOpen}
        onClose={handleChangePasswordClose}
      />
    </Box>
  );
}
