import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Box,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { FormInput } from '../common/FormInput';

export type UserFormValues = {
  user_code: string;
  full_name: string;
  email: string;
  phone_number?: string;
};

export type UserFormMode = 'create' | 'edit';

export interface UserFormDialogProps {
  open: boolean;
  mode: UserFormMode;
  values: UserFormValues;
  loading: boolean;
  onClose: () => void;
  onSubmit: () => void;
  onChange: (field: keyof UserFormValues, value: string) => void;
  errors?: Partial<Record<keyof UserFormValues, string>>;
}

export const UserFormDialog: React.FC<UserFormDialogProps> = ({
  open,
  mode,
  values,
  loading,
  onClose,
  onSubmit,
  onChange,
  errors = {},
}) => {
  const { t } = useTranslation();
  const isCreate = mode === 'create';
  const toDigitsOnly = (value: string) => value.replace(/\D+/g, '');

  return (
    <Dialog open={open} fullWidth maxWidth="md" onClose={onClose}>
      <DialogTitle>
        {isCreate
          ? t('usersPage.actions.createDialogTitle')
          : t('usersPage.actions.editDialogTitle')}
      </DialogTitle>

      <DialogContent>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 2,
            mt: 1,
          }}
        >
          <Box>
            <FormInput
              label={t('usersPage.form.userCode')}
              required
              value={values.user_code}
              onChange={(e) => onChange('user_code', toDigitsOnly(e.target.value))}
              inputMode="numeric"
              pattern="[0-9]*"
              disabled={!isCreate}
              error={errors.user_code}
            />
          </Box>

          <Box>
            <FormInput
              label={t('usersPage.form.fullName')}
              required
              value={values.full_name}
              onChange={(e) => onChange('full_name', e.target.value)}
              error={errors.full_name}
            />
          </Box>

          <Box>
            <FormInput
              label={t('usersPage.form.email')}
              required
              type="email"
              value={values.email}
              onChange={(e) => onChange('email', e.target.value)}
              error={errors.email}
            />
          </Box>

          <Box>
            <FormInput
              label={t('usersPage.form.phoneNumber')}
              value={values.phone_number ?? ''}
              onChange={(e) => onChange('phone_number', toDigitsOnly(e.target.value))}
              inputMode="numeric"
              pattern="[0-9]*"
            />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>{t('button.cancel')}</Button>
        <Button variant="contained" onClick={onSubmit} disabled={loading}>
          {loading ? <CircularProgress size={20} /> : t('usersPage.actions.saveButton')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
