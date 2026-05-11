import {
  Alert,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Box,
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
  plans_type: 'BASIC' | 'STARTUP' | 'ENTERPRISE';
  price_per_day: number;
  allow_monthly_payment?: boolean | null;
  allow_full_payment?: boolean | null;
  max_licensed_vehicle?: number | null;
  max_unlicensed_vehicle?: number | null;
  after_18_fee?: number | null;
  waive_after_18_fee?: boolean | null;
  status?: string | null;
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
  const [plansType, setPlansType] = useState<'STARTUP' | 'BASIC' | 'ENTERPRISE'>(
    (initialValue?.plans_type) ?? 'BASIC'
  );
  const [priceInput, setPriceInput] = useState(initialValue?.price_per_day?.toString() ?? '');
  const [allowMonthly, setAllowMonthly] = useState(Boolean(initialValue?.allow_monthly_payment));
  const [allowFull, setAllowFull] = useState(Boolean(initialValue?.allow_full_payment));
  const [waiveAfter18, setWaiveAfter18] = useState(Boolean(initialValue?.waive_after_18_fee));
  const [maxLicensed, setMaxLicensed] = useState(
    initialValue?.max_licensed_vehicle != null ? String(initialValue.max_licensed_vehicle) : ''
  );
  const [maxUnlicensed, setMaxUnlicensed] = useState(
    initialValue?.max_unlicensed_vehicle != null ? String(initialValue.max_unlicensed_vehicle) : ''
  );
  const [after18Fee, setAfter18Fee] = useState(
    initialValue?.after_18_fee != null ? String(initialValue.after_18_fee) : ''
  );
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ plans_type?: string; price_per_day?: string }>({});

  const getRequiredError = (labelKey: string) =>
    t('validation.requiredField', { field: t(labelKey) });

  const formatNumber = (val: string) => {
    const num = val.replace(/\D/g, '');
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const sanitizeNumber = (val: string) => formatNumber((val || '').replace(/\D/g, ''));

  const handleSave = async () => {
    setFormError('');
    setFieldErrors({});
    try {
      if (!plansType) {
        setFieldErrors({ plans_type: getRequiredError('subscriptionPlansPage.fields.planType') });
        return;
      }
      if (!disablePriceField) {
        if (!priceInput.trim()) {
          setFieldErrors({ price_per_day: getRequiredError('subscriptionPlansPage.fields.pricePerDay') });
          return;
        }
        const numeric = Number((priceInput || '').replace(/,/g, ''));
        if (Number.isNaN(numeric) || numeric <= 0) {
          setFieldErrors({
            price_per_day: t('validation.invalidNumber', { defaultValue: 'Price must be a positive number.' }),
          });
          return;
        }
        await onSubmit({
          plans_type: plansType,
          price_per_day: numeric,
          allow_monthly_payment: allowMonthly,
          allow_full_payment: allowFull,
          max_licensed_vehicle: maxLicensed.trim() ? Number(maxLicensed) : null,
          max_unlicensed_vehicle: maxUnlicensed.trim() ? Number(maxUnlicensed) : null,
          after_18_fee: after18Fee.trim() ? Number(after18Fee) : null,
          waive_after_18_fee: waiveAfter18,
          status: 'ACTIVE',
        });
        return;
      }

      const backupPrice = Number(initialValue?.price_per_day ?? 0);
      await onSubmit({
        plans_type: plansType,
        price_per_day: Number.isNaN(backupPrice) ? 0 : backupPrice,
        allow_monthly_payment: allowMonthly,
        allow_full_payment: allowFull,
        max_licensed_vehicle: maxLicensed.trim() ? Number(maxLicensed) : null,
        max_unlicensed_vehicle: maxUnlicensed.trim() ? Number(maxUnlicensed) : null,
        after_18_fee: after18Fee.trim() ? Number(after18Fee) : null,
        waive_after_18_fee: waiveAfter18,
        status: 'ACTIVE',
      });
    } catch (err) {
      console.error('Failed to save subscription plan:', err);
      setFormError(err instanceof Error ? err.message : 'An unexpected error occurred');
    }
  };

  return (
    <Dialog open={open} maxWidth="md" fullWidth>
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
              {(['BASIC', 'STARTUP', 'ENTERPRISE'] as const).map((option) => (
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
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <FormInput
              name="price_per_day"
              label={t('subscriptionPlansPage.dialog.fields.pricePerDay') + ' (VND)'}
              required={!disablePriceField}
              type="text"
              value={priceInput}
              onChange={(e) => setPriceInput(sanitizeNumber(e.target.value))}
              disabled={disablePriceField}
              inputMode="numeric"
              error={fieldErrors.price_per_day}
            />
            <FormInput
                name="after_18_fee"
                label={t('subscriptionPlansPage.dialog.fields.after18Fee', { defaultValue: 'After 18 fee (VND)' })}
                type="text"
                value={sanitizeNumber(after18Fee)}
                onChange={(e) => setAfter18Fee((e.target.value || '').replace(/\D/g, ''))}
                inputMode="numeric"
            />
          </ Box>

          <Stack direction="row" spacing={2} flexWrap="wrap">
            <FormControlLabel
              control={<Checkbox checked={allowMonthly} onChange={(e) => setAllowMonthly(e.target.checked)} />}
              label={t('subscriptionPlansPage.dialog.fields.allowMonthly', { defaultValue: 'Allow monthly payment' })}
            />
            <FormControlLabel
              control={<Checkbox checked={allowFull} onChange={(e) => setAllowFull(e.target.checked)} />}
              label={t('subscriptionPlansPage.dialog.fields.allowFull', { defaultValue: 'Allow full payment' })}
            />
            <FormControlLabel
              control={<Checkbox checked={waiveAfter18} onChange={(e) => setWaiveAfter18(e.target.checked)} />}
              label={t('subscriptionPlansPage.dialog.fields.waiveAfter18', { defaultValue: 'Waive after 18 fee' })}
            />
          </Stack>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <FormInput
              name="max_licensed_vehicle"
              label={t('subscriptionPlansPage.dialog.fields.maxLicensed', { defaultValue: 'Max licensed vehicles' })}
              type="text"
              value={sanitizeNumber(maxLicensed)}
              onChange={(e) => setMaxLicensed((e.target.value || '').replace(/\D/g, ''))}
              inputMode="numeric"
            />
            <FormInput
              name="max_unlicensed_vehicle"
              label={t('subscriptionPlansPage.dialog.fields.maxUnlicensed', { defaultValue: 'Max unlicensed vehicles' })}
              type="text"
              value={sanitizeNumber(maxUnlicensed)}
              onChange={(e) => setMaxUnlicensed((e.target.value || '').replace(/\D/g, ''))}
              inputMode="numeric"
            />

          </Box>
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
