import { Box } from '@mui/material';

export const ActiveIndicator = ({
  active,
  color = '#6b4fd0',
}: {
  active: boolean;
  color?: string;
}) => {
  if (!active) return null;

  return (
    <Box
      sx={{
        position: 'absolute',
        left: 0,
        top: 6,
        bottom: 6,
        width: 4,
        borderRadius: 4,
        backgroundColor: color,
      }}
    />
  );
};