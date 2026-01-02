import React from 'react';
import { Typography, Box, Alert, CircularProgress, Card, CardContent } from '@mui/material';
import { useUsers } from '../hooks/useUsers';
import Grid from '@mui/material/Grid';

export const DashboardPage: React.FC = () => {
  const { data: users, isLoading, isError, error } = useUsers();

  return (
    <Box>
        <Typography variant="h4" gutterBottom>
            📊 Dashboard - Dữ liệu Người dùng (React Query)
        </Typography>

        {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Đang tải dữ liệu...</Typography>
            </Box>
        )}

        {isError && (
        <Alert severity="error" sx={{ my: 2 }}>
            Lỗi khi tải dữ liệu: {error?.message ?? 'Không rõ lỗi'}
        </Alert>
        )}

      {users && (
        <Grid container spacing={3}>
            {users.map((user) => (
            <Grid key={user.id}>
                <Card variant="outlined">
                <CardContent>
                    <Typography variant="h6">{user.name}</Typography>
                    <Typography color="text.secondary">@{user.username}</Typography>
                    <Typography variant="body2">{user.email}</Typography>
                </CardContent>
                </Card>
            </Grid>
            ))}
        </Grid>
        )}

    </Box>
  );
};
