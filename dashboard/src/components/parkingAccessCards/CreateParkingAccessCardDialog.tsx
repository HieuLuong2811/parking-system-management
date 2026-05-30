import React, { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Select,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

import { FormInput } from '../common/FormInput';
import { FormField } from '../common/FormField';
import type { HolderType } from '../../api/types';
import { useCreateParkingAccessCard } from '../../api/parkingAccessCards';
import type { ParkingAccessCardCreatePayload } from '../../api/parkingAccessCards';
import { PaginatedUserSelect } from './PaginatedUserSelect';

export type CreateParkingAccessCardDialogProps = {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
};

const HOLDER_TYPES: HolderType[] = ['STUDENT', 'TEACHER', 'GUEST'];

export const CreateParkingAccessCardDialog: React.FC<CreateParkingAccessCardDialogProps> = ({
  open,
  onClose,
  onCreated,
}) => {
  const { t } = useTranslation();
  const createMutation = useCreateParkingAccessCard();

  const [values, setValues] = useState<ParkingAccessCardCreatePayload>({
    barcode_token: '',
    holder_type: 'STUDENT',
    user_code: '',
  });
  const [errors, setErrors] = useState<{ holder_type?: string; user_code?: string }>({});
  const [submitError, setSubmitError] = useState<string>('');

  const isGuest = values.holder_type === 'GUEST';

  const canSubmit = useMemo(() => {
    if (!values.holder_type) return false;
    if (!isGuest && !values.user_code?.trim()) return false;
    return true;
  }, [isGuest, values.holder_type, values.user_code]);

  const handleClose = () => {
    if (createMutation.isPending) return;
    setErrors({});
    setSubmitError('');
    onClose();
  };

  const handleSubmit = async () => {
    setSubmitError('');
    const nextErrors: typeof errors = {};
    if (!values.holder_type) nextErrors.holder_type = t('common.validation.required', { defaultValue: 'Required' });
    if (!isGuest && !values.user_code.trim()) {
      nextErrors.user_code = t('common.validation.required', { defaultValue: 'Required' });
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      await createMutation.mutateAsync({
        barcode_token: values.barcode_token ?? '',
        holder_type: values.holder_type,
        user_code: isGuest ? undefined : values.user_code.trim(),
      });
    } catch {
      setSubmitError(t('parkingAccessCardsPage.actions.createError', { defaultValue: 'Create card failed.' }));
      return;
    }

    onCreated?.();
    setValues({ barcode_token: '', holder_type: 'STUDENT', user_code: '' });
    handleClose();
  };

  return (
    <Dialog open={open} fullWidth maxWidth="md" onClose={handleClose}>
      <DialogTitle>
        {t('parkingAccessCardsPage.actions.createTitle', { defaultValue: 'Create parking access card' })}
      </DialogTitle>

      <DialogContent>
        {submitError ? (
          <Alert severity="error" sx={{ mt: 1 }}>
            {submitError}
          </Alert>
        ) : null}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 1, alignItems: 'start' }}>
          <Box>
            <FormField label={t('parkingAccessCardsPage.form.holderType', { defaultValue: 'Holder type' })} required>
              <Select
                size="small"
                fullWidth
                value={values.holder_type}
                onChange={(e) => {
                  const holderType = e.target.value as HolderType;
                  setValues((prev) => ({
                    ...prev,
                    holder_type: holderType,
                    user_code: holderType === 'GUEST' ? '' : prev.user_code,
                  }));
                  setErrors((prev) => ({ ...prev, holder_type: undefined, user_code: undefined }));
                }}
              >
                {HOLDER_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>
                    {t(`parkingAccessCardsPage.holderType.${type.toLowerCase()}`, { defaultValue: type })}
                  </MenuItem>
                ))}
              </Select>
            </FormField>
          </Box>

          <Box>
            <FormInput
              name="barcode_token"
              label={t('parkingAccessCardsPage.form.barcode', { defaultValue: 'Card code (optional)' })}
              value={values.barcode_token}
              onChange={(e) => setValues((prev) => ({ ...prev, barcode_token: e.target.value }))}
            />
          </Box>

          <Box sx={{ gridColumn: '1 / -1' }}>
            <FormField
              label={t('parkingAccessCardsPage.form.user', { defaultValue: 'User' })}
              required={!isGuest}
            >
              <PaginatedUserSelect
                disabled={isGuest}
                value={values.user_code}
                error={errors.user_code}
                onChange={(userCode) => {
                  setValues((prev) => ({ ...prev, user_code: userCode }));
                  setErrors((prev) => ({ ...prev, user_code: undefined }));
                }}
              />
            </FormField>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>{t('button.cancel', { defaultValue: 'Cancel' })}</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={!canSubmit || createMutation.isPending}>
          {createMutation.isPending ? <CircularProgress size={20} /> : t('button.create', { defaultValue: 'Create' })}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
