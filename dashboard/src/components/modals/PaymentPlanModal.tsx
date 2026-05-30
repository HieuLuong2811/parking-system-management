import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

import type { PaymentPlanRecord } from '../../api/types';
import { FormInput } from '../common/FormInput';

export type PaymentPlanFormPayload = {
  payment_type: 'FULL' | 'MONTHLY';
  discount_percent?: number | null;
  is_active?: boolean;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: PaymentPlanFormPayload) => Promise<void>;
  initialValue?: PaymentPlanRecord | null;
  submitting?: boolean;
};

export const PaymentPlanModal: React.FC<Props> = ({
  open,
  onClose,
  onSubmit,
  initialValue,
  submitting = false,
}) => {
  const { t } = useTranslation();

  const [paymentType, setPaymentType] = useState<'FULL' | 'MONTHLY'>(
    initialValue?.payment_type ?? 'FULL'
  );
  const [discountInput, setDiscountInput] = useState(
    initialValue?.discount_percent != null ? String(initialValue.discount_percent) : ''
  );
  const [isActive, setIsActive] = useState(Boolean(initialValue?.is_active ?? true));
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ payment_type?: string; discount_percent?: string }>({});

  const handleFormError = useCallback((error: string) => {
    setFormError(error);
    setFieldErrors({});
  }, []);

  const handleOpenChange = useCallback(() => {
    if (!open) {
      handleFormError('');
    }
  }, [open, handleFormError]);

  useEffect(() => {
    if (!open) return;

    const updatePaymentType = () => {
      setPaymentType(initialValue?.payment_type ?? 'FULL');
    };

    const updateDiscountInput = () => {
      setDiscountInput(initialValue?.discount_percent != null ? String(initialValue.discount_percent) : '');
    };

    const updateActive = () => {
      setIsActive(Boolean(initialValue?.is_active ?? true));
    };

    updatePaymentType();
    updateDiscountInput();
    updateActive();
  }, [open, initialValue]);


  useEffect(() => {
    return () => {
      handleOpenChange();
    };
  }, [handleOpenChange]);

  const discountLabel = useMemo(
    () => t('paymentPlansPage.dialog.fields.discountPercent', { defaultValue: 'Discount percent' }),
    [t]
  );

  const handleSave = async () => {
    setFormError('');
    setFieldErrors({});

    if (!paymentType) {
      setFieldErrors({
        payment_type: t('validation.requiredField', { field: t('paymentPlansPage.dialog.fields.paymentType', { defaultValue: 'Payment type' }) }),
      });
      return;
    }

    let discountValue: number | null = null;
    if (discountInput.trim()) {
      const numeric = Number(discountInput);
      if (Number.isNaN(numeric) || numeric < 0 || numeric > 70) {
        setFieldErrors({
          discount_percent: t('validation.valueMustBeBetween', { min: 0, max: 70 }),
        });
        return;
      }
      discountValue = numeric;
    }

    try {
      await onSubmit({
        payment_type: paymentType,
        discount_percent: discountValue,
        is_active: isActive,
      });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'An unexpected error occurred');
    }
  };

  return (
    <Dialog open={open} maxWidth="sm" fullWidth onClose={onClose}>
      <DialogTitle>
        {initialValue
          ? t('paymentPlansPage.dialog.editTitle', { defaultValue: 'Edit payment plan' })
          : t('paymentPlansPage.dialog.addTitle', { defaultValue: 'Add payment plan' })}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <FormControl fullWidth>
            <Typography component="label" htmlFor="payment-type-select" variant="body2" sx={{ mb: 0.5 }}>
              {t('paymentPlansPage.dialog.fields.paymentType', { defaultValue: 'Payment type' })}
              <span style={{ color: '#d32f2f' }}> *</span>
            </Typography>
            <Select
              id="payment-type-select"
              value={paymentType}
              onChange={(event) => setPaymentType(event.target.value as 'FULL' | 'MONTHLY')}
              disabled={submitting}
            >
              {(['FULL', 'MONTHLY'] as const).map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {t(`common.paymentPlan.${opt}`, { defaultValue: opt })}
                </MenuItem>
              ))}
            </Select>
            {fieldErrors.payment_type ? (
              <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                {fieldErrors.payment_type}
              </Typography>
            ) : null}
          </FormControl>

          <FormInput
            name="discount_percent"
            label={`${discountLabel} (%)`}
            type="number"
            value={discountInput}
            onChange={(e) => setDiscountInput(e.target.value)}
            disabled={submitting}
            error={fieldErrors.discount_percent}
          />

          <FormControlLabel
            control={<Checkbox checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />}
            label={t('paymentPlansPage.dialog.fields.isActive', { defaultValue: 'Active' })}
          />

          {formError ? (
            <Alert severity="error" variant="outlined">
              {formError}
            </Alert>
          ) : null}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={submitting}>
          {t('paymentPlansPage.dialog.cancel', { defaultValue: 'Cancel' })}
        </Button>
        <Button variant="contained" onClick={handleSave} disabled={submitting}>
          {submitting
            ? t('paymentPlansPage.dialog.saving', { defaultValue: 'Saving...' })
            : t('paymentPlansPage.dialog.save', { defaultValue: 'Save' })}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

