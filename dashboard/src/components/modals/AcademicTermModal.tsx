import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography } from '@mui/material';
import type { AcademicTermRecord } from '../../api/types';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

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
  const [error, setError] = useState('');
  const { t } = useTranslation();

  const getRequiredError = (labelKey: string) =>
    t('validation.requiredField', { field: t(labelKey) });

  const handleSave = async () => {
    setError('');
    if (!termName.trim()) {
      setError(getRequiredError('termsPage.fields.termName'));
      return;
    }
    if (!disableDates) {
      if (!startDate) {
        setError(getRequiredError('termsPage.fields.startDate'));
        return;
      }
      if (!endDate) {
        setError(getRequiredError('termsPage.fields.endDate'));
        return;
      }
      if (startDate > endDate) {
        setError('Start date must come before end date');
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
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    }
  };

  return (
    <Dialog open={open} maxWidth="sm" fullWidth>
      <DialogTitle>{initialValue ? 'Edit academic term' : 'Create new academic term'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Term name"
            value={termName}
            onChange={(event) => setTermName(event.target.value)}
            fullWidth
            size="small"
          />
          <TextField
            label="Start date"
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            fullWidth
            size="small"
            InputLabelProps={{ shrink: true }}
            disabled={disableDates}
            helperText={disableDates ? 'Start date is locked while the term is in use' : undefined}
          />
          <TextField
            label="End date"
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
            fullWidth
            size="small"
            InputLabelProps={{ shrink: true }}
            disabled={disableDates}
            helperText={disableDates ? 'End date is locked while the term is in use' : undefined}
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
