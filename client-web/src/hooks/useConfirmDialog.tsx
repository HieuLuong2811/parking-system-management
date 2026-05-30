import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';

type ConfirmOptions = {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
};

export function useConfirmDialog() {
  const { t } = useTranslation();

  const [options, setOptions] = React.useState<ConfirmOptions | null>(null);
  const resolverRef = React.useRef<((value: boolean) => void) | null>(null);

  const confirm = React.useCallback((nextOptions: ConfirmOptions) => {
    setOptions(nextOptions);

    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const handleClose = React.useCallback((result: boolean) => {
    resolverRef.current?.(result);
    resolverRef.current = null;
    setOptions(null);
  }, []);

  const ConfirmDialog = React.useCallback(() => {
    if (!options) return null;

    return (
      <Dialog
        open
        onClose={() => handleClose(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '18px',
          },
        }}
      >
        <DialogTitle
          sx={{
            color: '#0f172a',
            fontSize: 17,
            fontWeight: 700,
            pb: 1,
          }}
        >
          {options.title}
        </DialogTitle>

        <DialogContent>
          <DialogContentText
            sx={{
              color: '#475569',
              fontSize: 14,
              lineHeight: 1.6,
            }}
          >
            {options.message}
          </DialogContentText>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={() => handleClose(false)}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 700,
              color: '#475569',
            }}
          >
            {options.cancelText || t('common.button.cancel', { defaultValue: 'Hủy' })}
          </Button>

          <Button
            variant="contained"
            color={options.danger ? 'error' : 'primary'}
            onClick={() => handleClose(true)}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 700,
              boxShadow: 'none',
            }}
          >
            {options.confirmText || t('common.button.continue', { defaultValue: 'Tiếp tục' })}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }, [handleClose, options, t]);

  return {
    confirm,
    ConfirmDialog,
  };
}