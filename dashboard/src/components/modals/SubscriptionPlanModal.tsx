import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography } from '@mui/material';
import type { SubscriptionPlanRecord } from '../../api/types';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export type SubscriptionPlanFormPayload = {
  plan_name: string;
  price_per_day: number;
  description?: string;
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
  const [planName, setPlanName] = useState(initialValue?.plan_name ?? '');
  const [priceInput, setPriceInput] = useState(initialValue?.price_per_day?.toString() ?? '');
  const [description, setDescription] = useState(initialValue?.description ?? '');
  const [error, setError] = useState('');

  const getRequiredError = (labelKey: string) =>
    t('validation.requiredField', { field: t(labelKey) });

  const handleSave = async () => {
    setError('');
    const trimmedName = planName.trim();
    if (!trimmedName) {
      setError(getRequiredError('plansPage.fields.planName'));
      return;
    }

    const normalizedDescription = description.trim() || undefined;

    if (!disablePriceField) {
      if (!priceInput.trim()) {
        setError(getRequiredError('plansPage.fields.pricePerDay'));
        return;
      }

      const numeric = Number(priceInput);
      if (Number.isNaN(numeric) || numeric <= 0) {
        setError('Price per day must be a positive number');
        return;
      }

      try {
        await onSubmit({
          plan_name: trimmedName,
          price_per_day: numeric,
          description: normalizedDescription,
        });
      } catch (err) {
        console.error('Failed to save subscription plan:', err);
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      }
      return;
    }

    const backupPrice = Number(initialValue?.price_per_day ?? 0);
    try {
      await onSubmit({
        plan_name: trimmedName,
        price_per_day: Number.isNaN(backupPrice) ? 0 : backupPrice,
        description: normalizedDescription,
      });
    } catch (err) {
      console.error('Failed to save subscription plan:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    }
  };

  return (
    <Dialog open={open} maxWidth="sm" fullWidth>
      <DialogTitle>{initialValue ? 'Edit subscription plan' : 'Create new subscription plan'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Plan name"
            value={planName}
            onChange={(event) => setPlanName(event.target.value)}
            fullWidth
            size="small"
          />
          <TextField
            label="Price per day"
            value={priceInput}
            onChange={(event) => setPriceInput(event.target.value)}
            fullWidth
            size="small"
            type="number"
            disabled={disablePriceField}
            helperText={disablePriceField ? 'Price is locked while the plan is in use' : undefined}
          />
          <TextField
            label="Description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            fullWidth
            size="small"
            multiline
            minRows={2}
          />
          {error && (
            <Typography variant="body2" color="error">
              {error}
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
