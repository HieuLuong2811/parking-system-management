import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';
import type { AcademicTermRecord } from '../../api/types';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FormInput } from '../common/FormInput';

export type AcademicTermFormPayload = {
  term_name: string;
  start_date: string;
  end_date: string;
};

interface AcademicTermModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: AcademicTermFormPayload) => Promise<void>;
  initialValue?: AcademicTermRecord | null;
  submitting?: boolean;
  disableDates?: boolean;
}

export const AcademicTermModal: React.FC<AcademicTermModalProps> = ({
  open,
  onClose,
  onSubmit,
  initialValue,
  submitting = false,
  disableDates = false,
}) => {
  const [termName, setTermName] = useState(initialValue?.term_name ?? '');
  const [startDate, setStartDate] = useState(initialValue?.start_date ?? '');
  const [endDate, setEndDate] = useState(initialValue?.end_date ?? '');
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ term_name?: string; start_date?: string; end_date?: string }>({});
  const { t } = useTranslation();

  const getRequiredError = (labelKey: string) =>
    t('validation.requiredField', { field: t(labelKey) });

  const handleSave = async () => {
    setFormError('');
    setFieldErrors({});
    if (!termName.trim()) {
      setFieldErrors({ term_name: getRequiredError('termsPage.fields.termName') });
      return;
    }
    if (!disableDates) {
      if (!startDate) {
        setFieldErrors({ start_date: getRequiredError('termsPage.fields.startDate') });
        return;
      }
      if (!endDate) {
        setFieldErrors({ end_date: getRequiredError('termsPage.fields.endDate') });
        return;
      }
      if (startDate > endDate) {
        setFormError(t('validation.invalidDateRange', { defaultValue: 'Start date must come before end date.' }));
        return;
      }
    }

    try {
      await onSubmit({
        term_name: termName.trim(),
        start_date: startDate,
        end_date: endDate,
      });
    } catch (err) {
      console.error('Failed to save academic term:', err);
      setFormError(err instanceof Error ? err.message : 'An unexpected error occurred');
    }
  };

  return (
    <Dialog open={open} maxWidth="sm" fullWidth>
      <DialogTitle>
        {initialValue
          ? t('termsPage.dialog.editTitle', { defaultValue: 'Edit academic term' })
          : t('termsPage.dialog.addTitle', { defaultValue: 'Create new academic term' })}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <FormInput
            name="term_name"
            label={t('termsPage.fields.termName', { defaultValue: 'Term name' })}
            required
            value={termName}
            onChange={(event) => setTermName(event.target.value)}
            error={fieldErrors.term_name}
          />
          {initialValue?.is_in_use && (
            <Alert severity="warning" sx={{ py: 0.75 }}>
              {t('termsPage.warnings.rename', {
                defaultValue:
                  "If you change the term name, the system will notify (and email) all users who are currently using this term.",
              })}
            </Alert>
          )}
          <FormInput
            name="start_date"
            label={t('termsPage.fields.startDate', { defaultValue: 'Start date' })}
            required={!disableDates}
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            disabled={disableDates}
            helperText={
              disableDates
                ? t('termsPage.warnings.datesLocked', { defaultValue: 'Dates are locked while the term is in use.' })
                : undefined
            }
            error={fieldErrors.start_date}
          />
          <FormInput
            name="end_date"
            label={t('termsPage.fields.endDate', { defaultValue: 'End date' })}
            required={!disableDates}
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
            disabled={disableDates}
            error={fieldErrors.end_date}
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
          {t('button.cancel', { defaultValue: 'Cancel' })}
        </Button>
        <Button variant="contained" onClick={handleSave} disabled={submitting}>
          {submitting
            ? t('termsPage.dialog.saving', { defaultValue: 'Saving...' })
            : t('button.save', { defaultValue: 'Save' })}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
