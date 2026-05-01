import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { useChangePassword } from '../../api/auth';
import { useAppAuth } from '../../contexts/useAppAuth';
import { FormInput } from '../common/FormInput';

type ChangePasswordDialogProps = {
  open: boolean;
  onClose: (success?: string) => void;
};

const initialState = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

export default function ChangePasswordDialog({ open, onClose }: ChangePasswordDialogProps) {
  const { t } = useTranslation();
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState<Partial<Record<keyof typeof initialState, string>>>({});
  const [helperText, setHelperText] = useState<string | null>(null);
  const { mutateAsync, isPending } = useChangePassword();
  const { logout } = useAppAuth();

  useEffect(() => {
    if (!open) {
      setForm(initialState);
      setErrors({});
      setHelperText(null);
    }
  }, [open]);

  const setField = (field: keyof typeof initialState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setHelperText(null);
  };

  const getRequiredMessage = (labelKey: string) =>
    t('validation.requiredField', { field: t(labelKey) });

  const validate = (): boolean => {
    const nextErrors: typeof errors = {};
    if (!form.currentPassword) {
      nextErrors.currentPassword = getRequiredMessage('profile.passwordDialog.currentLabel');
    }
    if (!form.newPassword) {
      nextErrors.newPassword = getRequiredMessage('profile.passwordDialog.newLabel');
    }
    if (form.newPassword && form.newPassword.length < 6) {
      nextErrors.newPassword = t('profile.passwordDialog.minLength');
    }
    if (form.newPassword !== form.confirmPassword) {
      nextErrors.confirmPassword = t('profile.passwordDialog.confirmMismatch');
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
      onClose(t('profile.passwordDialog.success'));

      setTimeout(async () => {
        await logout();
      }, 2000);
      
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : t('profile.passwordDialog.genericError');
      setHelperText(message);
    }
  };

  return (
    <Dialog open={open} onClose={() => onClose()} maxWidth="sm" fullWidth>
      <DialogTitle>{t('profile.passwordDialog.title')}</DialogTitle>
      <DialogContent>
        <Box
          component="form"
          sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 1.5 }}
        >
          {(['currentPassword', 'newPassword', 'confirmPassword'] as Array<keyof typeof initialState>).map(
            (field) => {
              const labelKey =
                field === 'currentPassword'
                  ? 'profile.passwordDialog.currentLabel'
                  : field === 'newPassword'
                  ? 'profile.passwordDialog.newLabel'
                  : 'profile.passwordDialog.confirmLabel';
              const autoComplete =
                field === 'currentPassword'
                  ? 'current-password'
                  : field === 'newPassword'
                  ? 'new-password'
                  : 'new-password';
              return (
                <Box key={field} sx={{ display: 'flex', flexDirection: 'column', gap: 0.35 }}>
                  <FormInput
                    id={field}
                    label={t(labelKey)}
                    required
                    requiredMarkerClassName="required-marker"
                    type="password"
                    value={form[field]}
                    onChange={(value) => setField(field, value)}
                    error={errors[field]}
                    inputClassName="auth-input"
                    labelClassName="profile-field-label"
                    autoComplete={autoComplete}
                    requiredFirst={t(labelKey)}
                  />
                </Box>
              );
            }
          )}
        </Box>
        {helperText && (
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            {helperText}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose()}>{t('profile.passwordDialog.cancel')}</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isPending}
        >
          {t('profile.passwordDialog.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
