import React from 'react';
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';

type PlateImagesDialogProps = {
  open: boolean;
  onClose: () => void;
  checkInImageUrl?: string | null;
  checkOutImageUrl?: string | null;
};

const PlateImageBox: React.FC<{
  title: string;
  imageUrl?: string | null;
}> = ({ title, imageUrl }) => {
  const { t } = useTranslation();

  return (
    <Box sx={{ flex: 1, minWidth: 260 }}>
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
        {title}
      </Typography>

      {imageUrl ? (
        <Box
          component="img"
          src={imageUrl}
          alt={title}
          onClick={() => window.open(imageUrl, '_blank', 'noopener,noreferrer')}
          sx={{
            width: '100%',
            height: 220,
            objectFit: 'cover',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            cursor: 'pointer',
            bgcolor: 'background.default',
          }}
        />
      ) : (
        <Box
          sx={{
            height: 220,
            borderRadius: 2,
            border: '1px dashed',
            borderColor: 'divider',
            bgcolor: 'background.default',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            px: 2,
            textAlign: 'center',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {t('parkingSessionsPage.plateImages.noImage', {
              defaultValue: 'Không có ảnh biển số',
            })}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export const PlateImagesDialog: React.FC<PlateImagesDialogProps> = ({
  open,
  onClose,
  checkInImageUrl,
  checkOutImageUrl,
}) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          pr: 6,
          fontWeight: 800,
        }}
      >
        {t('parkingSessionsPage.plateImages.title', {
          defaultValue: 'Ảnh biển số',
        })}

        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            position: 'absolute',
            right: 12,
            top: 12,
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          sx={{ pt: 1 }}
        >
          <PlateImageBox
            title={t('parkingSessionsPage.plateImages.checkIn', {
              defaultValue: 'Ảnh biển số lúc vào',
            })}
            imageUrl={checkInImageUrl}
          />

          <PlateImageBox
            title={t('parkingSessionsPage.plateImages.checkOut', {
              defaultValue: 'Ảnh biển số lúc ra',
            })}
            imageUrl={checkOutImageUrl}
          />
        </Stack>
      </DialogContent>
    </Dialog>
  );
};