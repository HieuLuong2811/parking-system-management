import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import type { SubscriptionPlanRecord } from '../../api/types';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FormInput } from '../common/FormInput';
import { planTypeOptions } from '../../constant/config';

export type SubscriptionPlanFormPayload = {
  plans_type: 'UNLICENSED_VEHICLE' | 'LICENSED_VEHICLE';
  price_per_day: number;
};

interface SubscriptionPlanModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: SubscriptionPlanFormPayload) => Promise<void>;
  initialValue?: SubscriptionPlanRecord | null;
  submitting?: boolean;
  disablePriceField?: boolean;
}

export const SubscriptionPlanModal: React.FC<SubscriptionPlanModalProps> = ({
  open,
  onClose,
  onSubmit,
  initialValue,
  submitting = false,
  disablePriceField = false,
}) => {
  const { t } = useTranslation();
  const [plansType, setPlansType] = useState<'UNLICENSED_VEHICLE' | 'LICENSED_VEHICLE'>(
    initialValue?.plans_type ?? 'LICENSED_VEHICLE'
  );
  const [priceInput, setPriceInput] = useState(initialValue?.price_per_day?.toString() ?? '');
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ plans_type?: string; price_per_day?: string }>({});

  const getRequiredError = (labelKey: string) =>
    t('validation.requiredField', { field: t(labelKey) });

  const formatNumber = (val: string) => {
    const num = val.replace(/\D/g, '');
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const raw = e.target.value.replace(/\D/g, '');
    setPriceInput(formatNumber(raw));
  };

  const handleSave = async () => {
    setFormError('');
    setFieldErrors({});
    if (!plansType) {
      setFieldErrors({ plans_type: getRequiredError('subscriptionPlansPage.fields.planType') });
      return;
    }

    if (!disablePriceField) {
      if (!priceInput.trim()) {
        setFieldErrors({ price_per_day: getRequiredError('subscriptionPlansPage.fields.pricePerDay') });
        return;
      }

      const numeric = Number(priceInput);
      if (Number.isNaN(numeric) || numeric <= 0) {
        setFieldErrors({
          price_per_day: t('validation.invalidNumber', { defaultValue: 'Price must be a positive number.' }),
        });
        return;
      }

      try {
        await onSubmit({
          plans_type: plansType,
          price_per_day: numeric,
        });
      } catch (err) {
        console.error('Failed to save subscription plan:', err);
        setFormError(err instanceof Error ? err.message : 'An unexpected error occurred');
      }
      return;
    }

    const backupPrice = Number(initialValue?.price_per_day ?? 0);
    try {
      await onSubmit({
        plans_type: plansType,
        price_per_day: Number.isNaN(backupPrice) ? 0 : backupPrice,
      });
    } catch (err) {
      console.error('Failed to save subscription plan:', err);
      setFormError(err instanceof Error ? err.message : 'An unexpected error occurred');
    }
  };

  return (
    <Dialog open={open} maxWidth="sm" fullWidth>
      <DialogTitle>{initialValue ? `${t('subscriptionPlansPage.dialog.editTitle')}` : `${t('subscriptionPlansPage.dialog.addTitle')}`}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <FormControl fullWidth>
            <Typography
              component="label"
              htmlFor="plans-type-select"
              variant="body2"
              sx={{ mb: 0.5 }}
            >
              {t('subscriptionPlansPage.dialog.fields.planType')}
              <span style={{ color: '#d32f2f' }}> *</span>
            </Typography>

            <Select
              id="plans-type-select"
              value={plansType}
              onChange={(event) => setPlansType(event.target.value as typeof plansType)}
              disabled={submitting}
              inputProps={{ name: 'plans_type' }}
            >
              {Object.keys(planTypeOptions).map((option) => (
                <MenuItem key={option} value={option}>
                  {t(`common.subscriptionPlans.${option}`, { defaultValue: option })}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {initialValue?.is_in_use && (
            <Alert severity="warning" sx={{ py: 0.75 }}>
              {t('subscriptionPlansPage.warnings.typeChange', {
                defaultValue:
                  "If you change the plan type, the system may notify users who are currently using this plan.",
              })}
            </Alert>
          )}
         <FormInput
            name="price_per_day"
            label={t('subscriptionPlansPage.dialog.fields.pricePerDay') + ' (VND)'}
            required={!disablePriceField}
            type="text"
            value={priceInput}
            onChange={handleChange}
            disabled={disablePriceField}
            inputMode="numeric"
            error={fieldErrors.price_per_day}
          />
          {formError && (
            <Typography variant="body2" color="error">
              {formError}
            </Typography>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={submitting}>
          {t('subscriptionPlansPage.dialog.cancel', { defaultValue: 'Cancel' })}
        </Button>
        <Button variant="contained" onClick={handleSave} disabled={submitting}>
          {submitting ? t('subscriptionPlansPage.dialog.saving', { defaultValue: 'Saving...' }) : t('subscriptionPlansPage.dialog.save', { defaultValue: 'Save' })}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
