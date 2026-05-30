import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { useTranslation } from 'react-i18next';
import { PRIMARY } from '../../ultis/formatters';

type ParkingCardRulesDialogProps = {
  open: boolean;
  onClose: () => void;
};

export const ParkingCardRulesDialog: React.FC<ParkingCardRulesDialogProps> = ({
  open,
  onClose,
}) => {
  const { t } = useTranslation();

  const rules = [
    t('presentCard.warning.rule1'),
    t('presentCard.warning.rule2'),
    t('presentCard.warning.rule3'),
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '18px',
          overflow: 'hidden',
        },
      }}
    >
      <DialogTitle
        sx={{
          px: 2.5,
          py: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          borderBottom: '1px solid #eef2f7',
        }}
      >
        <Box>
          <Typography
            sx={{
              color: '#0f172a',
              fontSize: 17,
              fontWeight: 700,
              lineHeight: 1.35,
            }}
          >
            {t('presentCard.warning.title', {
              defaultValue: 'Quy định sử dụng thẻ gửi xe sinh viên',
            })}
          </Typography>

          <Typography
            sx={{
              mt: 0.5,
              color: '#64748b',
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            {t('presentCard.warning.subtitle', {
              defaultValue: 'Vui lòng đọc kỹ trước khi sử dụng thẻ.',
            })}
          </Typography>
        </Box>

        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 2.5, mt: 2 }}>
        <Stack spacing={1.5}>
          {rules.map((rule, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1.25,
              }}
            >
              <Box
                sx={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  bgcolor: '#e8f7ea',
                  color: PRIMARY,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 700,
                  flexShrink: 0,
                  mt: 0.1,
                }}
              >
                {index + 1}
              </Box>

              <Typography
                sx={{
                  flex: 1,
                  color: '#334155',
                  fontSize: 14,
                  lineHeight: 1.6,
                  fontWeight: 600,
                }}
              >
                {rule}
              </Typography>
            </Box>
          ))}

          <Box
            sx={{
              mt: 0.5,
              p: 1.5,
              borderRadius: '14px',
              bgcolor: '#fff7ed',
              border: '1px solid #fed7aa',
              display: 'flex',
              gap: 1,
              alignItems: 'flex-start',
            }}
          >
            <WarningAmberRoundedIcon
              sx={{
                color: '#c2410c',
                fontSize: 21,
                mt: 0.1,
                flexShrink: 0,
              }}
            />

            <Typography
              sx={{
                color: '#9a3412',
                fontSize: 13,
                lineHeight: 1.6,
                fontWeight: 700,
                textAlign: 'justify',
              }}
            >
              {t('presentCard.warning.rule4')}
            </Typography>
          </Box>

          <Button
            fullWidth
            variant="contained"
            onClick={onClose}
            sx={{
              mt: 1,
              height: 44,
              borderRadius: '14px',
              bgcolor: PRIMARY,
              fontWeight: 700,
              textTransform: 'none',
              boxShadow: 'none',
              '&:hover': {
                bgcolor: '#278a32',
                boxShadow: 'none',
              },
            }}
          >
            {t('common.button.continue', { defaultValue: 'Tôi đã hiểu' })}
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};