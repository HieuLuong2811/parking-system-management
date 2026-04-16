import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Box,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

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
            <Typography variant="body2" mb={0.5}>
              {t('usersPage.form.userCode')}
            </Typography>
                  <input
                    value={values.user_code}
                    onChange={(e) => onChange('user_code', e.target.value)}
                    disabled={!isCreate}
                    style={inputStyle}
                  />
                  {errors.user_code && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                      {errors.user_code}
                    </Typography>
                  )}
                </Box>

                <Box>
            <Typography variant="body2" mb={0.5}>
              {t('usersPage.form.fullName')}
            </Typography>
                  <input
                    value={values.full_name}
                    onChange={(e) => onChange('full_name', e.target.value)}
                    style={inputStyle}
                  />
                  {errors.full_name && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                      {errors.full_name}
                    </Typography>
                  )}
                </Box>

          <Box>
            <Typography variant="body2" mb={0.5}>
              {t('usersPage.form.email')}
            </Typography>
                  <input
                    type="email"
                    value={values.email}
                    onChange={(e) => onChange('email', e.target.value)}
                    style={inputStyle}
                  />
                  {errors.email && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                      {errors.email}
                    </Typography>
                  )}
                </Box>

          <Box>
            <Typography variant="body2" mb={0.5}>
              {t('usersPage.form.phoneNumber')}
            </Typography>
            <input
              value={values.phone_number ?? ''}
              onChange={(e) => onChange('phone_number', e.target.value)}
              style={inputStyle}
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

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid #ccc',
  borderRadius: 6,
  fontSize: 14,
  outline: 'none',
};
