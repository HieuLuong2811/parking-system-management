import React from 'react';
import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { useTranslation } from 'react-i18next';

export type ConfirmDialogProps = {
  open: boolean;
  title: React.ReactNode;
  content: React.ReactNode;
  confirmText?: React.ReactNode;
  cancelText?: React.ReactNode;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  content,
  confirmText,
  cancelText,
  loading = false,
  onClose,
  onConfirm,
}) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} fullWidth maxWidth="xs" onClose={loading ? undefined : onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>{content}</DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          {cancelText ?? t('common.button.cancel', { defaultValue: 'Cancel' })}
        </Button>
        <Button variant="contained" color="warning" onClick={onConfirm} disabled={loading}>
          {loading ? <CircularProgress size={20} /> : (confirmText ?? t('common.button.submit', { defaultValue: 'Submit' }))}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

