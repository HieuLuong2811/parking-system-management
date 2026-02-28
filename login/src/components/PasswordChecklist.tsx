import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { Box, Typography } from '@mui/material';

interface Props {
  password: string;
  t: (key: string) => string;
  type_width?: boolean;
}

export default function PasswordChecklist({ password, t, type_width }: Props) {
  const rawText = t('validation.password-complexity');

  const complexityRules = rawText
    .split('\n')
    .filter(line => line.trim().startsWith('-'))
    .map((line, idx) => ({
      key: `complexity-${idx}`,
      text: line.replace('- ', '').trim(),
      valid: (() => {
        switch (idx) {
          case 0:
            return /^[A-Za-z0-9!@#$%^&*()\-_=+[\]{}?/|]+$/.test(password);
          case 1:
            return /[A-Z]/.test(password);
          case 2:
            return /\d/.test(password);
          case 3:
            return /[!@#$%^&*()\-_=+[\]{}?/|]/.test(password);
          case 4:
            return /^[!@#$%^&*()\-_=+[\]{}?/|]+$/.test(
              password.replace(/[A-Za-z0-9]/g, '')
            );
          case 5:
            return /[a-z]/.test(password);
          default:
            return false;
        }
      })(),
    }));

  const checklistRules = [
    ...complexityRules,
    {
      key: 'min-length',
      text: t('validation.password-min-8'),
      valid: password.length >= 8,
    },
    {
      key: 'max-length',
      text: t('validation.password-max-40'),
      valid: password.length <= 40,
    },
  ];

  return (
    <Box
      sx={{
        position: 'absolute',
        top: '100%',
        left: 0,
        width: type_width ? 'max-content' : '100%',
        background: '#fff',
        border: '1px solid #ddd',
        borderRadius: '8px',
        pt: 1,
        zIndex: 10,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      }}
    >
      {checklistRules.map(rule => {
        return (
          <Box
            key={rule.key}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 1,
              mb: 0.5,
            }}
          >
            {rule.valid ? (
              <CheckCircleIcon
                style={{ color: '#28a745', fontSize: 12, paddingBottom: 1 }}
              />
            ) : (
              <CancelIcon
                style={{ color: '#ff0000', fontSize: 12, paddingBottom: 1 }}
              />
            )}
            <Typography
              sx={{
                fontSize: '13px',
                color: rule.valid ? '#28a745' : '#555',
                fontWeight: rule.valid ? 600 : 400,
              }}
            >
              {rule.text}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}
