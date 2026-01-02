// src/pages/HomePage.tsx
import { Typography, Box } from '@mui/material';

export const HomePage = () => (
  <Box>
    <Typography variant="h5" color="primary">
      Chào mừng đến với ứng dụng React TSX!
    </Typography>
    <Typography paragraph sx={{ mt: 2 }}>
      Ứng dụng này sử dụng React Router để điều hướng, MUI cho giao diện và React Query để quản lý API.
    </Typography>
  </Box>
);