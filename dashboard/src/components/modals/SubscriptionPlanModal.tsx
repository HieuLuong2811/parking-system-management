import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import type { SubscriptionPlanRecord } from '../../api/types';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FormInput } from '../common/FormInput';

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

  const handleSave = async () => {
    setFormError('');
    setFieldErrors({});
    if (!plansType) {
      setFieldErrors({ plans_type: getRequiredError('plansPage.fields.planType') });
      return;
    }

    if (!disablePriceField) {
      if (!priceInput.trim()) {
        setFieldErrors({ price_per_day: getRequiredError('plansPage.fields.pricePerDay') });
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
      <DialogTitle>{initialValue ? 'Edit subscription plan' : 'Create new subscription plan'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <FormControl fullWidth>
            <InputLabel id="plans-type-label">{t('plansPage.fields.planType', { defaultValue: 'Plan type' })}</InputLabel>
            <Select
              labelId="plans-type-label"
              value={plansType}
              label={t('plansPage.fields.planType', { defaultValue: 'Plan type' })}
              onChange={(event) => setPlansType(event.target.value as 'UNLICENSED_VEHICLE' | 'LICENSED_VEHICLE')}
              disabled={submitting}
            >
              <MenuItem value="UNLICENSED_VEHICLE">{t('plansPage.types.unlicensed', { defaultValue: 'Unlicensed vehicle' })}</MenuItem>
              <MenuItem value="LICENSED_VEHICLE">{t('plansPage.types.licensed', { defaultValue: 'Licensed vehicle' })}</MenuItem>
            </Select>
            {fieldErrors.plans_type ? (
              <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                {fieldErrors.plans_type}
              </Typography>
            ) : null}
          </FormControl>
          {initialValue?.is_in_use && (
            <Alert severity="warning" sx={{ py: 0.75 }}>
              {t('plansPage.warnings.typeChange', {
                defaultValue:
                  "If you change the plan type, the system may notify users who are currently using this plan.",
              })}
            </Alert>
          )}
          <FormInput
            label={t('plansPage.fields.pricePerDay', { defaultValue: 'Price per day' })}
            required={!disablePriceField}
            type="number"
            value={priceInput}
            onChange={(event) => setPriceInput(event.target.value)}
            disabled={disablePriceField}
            helperText={
              disablePriceField
                ? t('plansPage.warnings.priceLocked', { defaultValue: 'Price is locked while the plan is in use.' })
                : undefined
            }
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
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSave} disabled={submitting}>
          {submitting ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
