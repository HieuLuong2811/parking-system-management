import { Alert, Box, Button, Snackbar, Stack } from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { FormInput } from '../../components/common/FormInput';
import ChangePasswordDialog from '../../components/profile/ChangePasswordDialog';
import { useAppAuth } from '../../contexts/useAppAuth';
import { useUpdateUser } from '../../api/users';

type ProfileFormValues = {
  full_name: string;
  email: string;
  phone_number: string | null;
};

export const ProfileInformationPanel: React.FC = () => {
  const { t } = useTranslation();
  const { user, patchUser } = useAppAuth();
  const { mutateAsync: updateUser, isPending } = useUpdateUser();

  const [toast, setToast] = useState<{ open: boolean; severity: 'success' | 'error'; message: string }>({
    open: false,
    severity: 'success',
    message: '',
  });
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [formValues, setFormValues] = useState<ProfileFormValues>({
    full_name: '',
    email: '',
    phone_number: null,
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof ProfileFormValues, string>>>({});

  useEffect(() => {
    if (!user) return;
    setFormValues({
      full_name: user.full_name,
      email: user.email,
      phone_number: user.phone_number ?? null,
    });
  }, [user]);

  const handleFieldChange = (field: keyof ProfileFormValues, value: string) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validateForm = (): boolean => {
    const errors: typeof formErrors = {};
    if (!formValues.full_name.trim()) {
      errors.full_name = t('validation.requiredField', { field: t('profile.fields.fullName') });
    }
    if (!formValues.email.trim()) {
      errors.email = t('validation.requiredField', { field: t('profile.fields.email') });
    }
    if (!formValues.phone_number) {
      errors.phone_number = t('validation.requiredField', { field: t('profile.fields.phone') });
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!user || !validateForm()) return;
    try {
      await updateUser({
        userCode: user.user_code,
        payload: {
          full_name: formValues.full_name.trim(),
          email: formValues.email.trim(),
          phone_number: formValues.phone_number || undefined,
        },
      });
      patchUser({
        full_name: formValues.full_name.trim(),
        email: formValues.email.trim(),
        phone_number: formValues.phone_number ?? null,
      });
      setToast({ open: true, severity: 'success', message: t('profile.fields.saveSuccess') });
    } catch (e) {
      setToast({ open: true, severity: 'error', message: e instanceof Error ? e.message : t('common.error') });
    }
  };

  if (!user) return null;

  return (
    <Box>
      <Box className="profile-form-grid">
        <Box className="profile-field-row">
          <Stack spacing={1} sx={{ flex: 1, minWidth: 260 }}>
            <FormInput
              id="profile-user-code"
              label={t('profile.fields.userCode')}
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
              label={t('profile.fields.fullName')}
              required
              requiredMarkerClassName="required-marker"
              value={formValues.full_name}
              onChange={(value) => handleFieldChange('full_name', value)}
              error={formErrors.full_name}
              inputClassName="plain-input"
              labelClassName="profile-field-label required"
              requiredFirst={t('profile.fields.fullName')}
            />
          </Stack>
        </Box>

        <Box className="profile-field-row">
          <Stack spacing={1} sx={{ flex: 1, minWidth: 260 }}>
            <FormInput
              id="profile-email"
              label={t('profile.fields.email')}
              required
              requiredMarkerClassName="required-marker"
              value={formValues.email}
              onChange={(value) => handleFieldChange('email', value)}
              error={formErrors.email}
              inputClassName="plain-input"
              labelClassName="profile-field-label required"
              requiredFirst={t('profile.fields.email')}
              placeholder="example@gmail.com"
            />
          </Stack>

          <Stack spacing={1} sx={{ flex: 1, minWidth: 260 }}>
            <FormInput
              id="profile-phone"
              label={t('profile.fields.phone')}
              value={formValues.phone_number ?? ''}
              onChange={(value) => handleFieldChange('phone_number', value)}
              error={formErrors.phone_number}
              inputClassName="plain-input"
              labelClassName="profile-field-label"
              placeholder="Just number"
            />
          </Stack>
        </Box>
      </Box>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mt={3} alignItems={{ xs: 'stretch', sm: 'center' }}>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={isPending}
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, px: 2.5 }}
        >
          {t('profile.saveChanges')}
        </Button>

        <Button
          variant="outlined"
          onClick={() => setPasswordDialogOpen(true)}
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, px: 2.5 }}
        >
          {t('profile.passwordDialog.button')}
        </Button>
      </Stack>

      <ChangePasswordDialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)} />

      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast((p) => ({ ...p, open: false }))}
      >
        <Alert severity={toast.severity} onClose={() => setToast((p) => ({ ...p, open: false }))}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
