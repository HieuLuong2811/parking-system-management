import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";

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
      <Dialog open onClose={() => handleClose(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>{options.title}</DialogTitle>

        <DialogContent>
          <DialogContentText sx={{ color: "#262626cc" }}>
            {options.message}
          </DialogContentText>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => handleClose(false)}
            sx={{ textTransform: "none", fontWeight: 700 }}
          >
            {t("common.button.cancel")}
          </Button>

          <Button
            variant="contained"
            color={options.danger ? "error" : "primary"}
            onClick={() => handleClose(true)}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            {t("common.button.continue")}
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
