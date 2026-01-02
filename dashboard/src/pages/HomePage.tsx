// src/pages/HomePage.tsx
import React from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
} from '@mui/material';
import { PaginationBar } from '../components/pages';

const mockRows = Array.from({ length: 56 }, (_, index) => ({
  id: index + 1,
  name: `Xe #${String(index + 1).padStart(2, '0')}`,
  owner: ['Trần Minh', 'Lan Phạm', 'Tuấn Anh', 'Huyền Trang'][index % 4],
  status: index % 3 === 0 ? 'Đã thanh toán' : 'Đang chờ',
}));

export const HomePage = () => {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [loading, setLoading] = React.useState(false);

  const visibleRows = React.useMemo(() => {
    const from = page * rowsPerPage;
    return mockRows.slice(from, from + rowsPerPage);
  }, [page, rowsPerPage]);

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage);
  };

  const handleRowsPerPageChange = (nextRows: number) => {
    setRowsPerPage(nextRows);
    setPage(0);
  };

  React.useEffect(() => {
    setLoading(true);
    const timer = window.setTimeout(() => setLoading(false), 400);
    return () => window.clearTimeout(timer);
  }, [page, rowsPerPage]);

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Typography variant="h5" color="primary">
        Chào mừng đến với ứng dụng React TSX!
      </Typography>
      <Typography paragraph sx={{ mt: 0 }}>
        Ứng dụng này sử dụng React Router để điều hướng, MUI cho giao diện và React Query
        để quản lý API.
      </Typography>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Bảng đăng ký đỗ xe (dữ liệu giả)
        </Typography>
        <Box sx={{ position: 'relative' }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Tên xe</TableCell>
                <TableCell>Chủ xe</TableCell>
                <TableCell>Trạng thái</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {visibleRows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.owner}</TableCell>
                  <TableCell>{row.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

          {loading && (
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                bgcolor: 'rgba(255,255,255,0.75)',
                backdropFilter: 'blur(1px)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <CircularProgress color="primary" />
            </Box>
          )}
        </Box>
        <Box mt={2}>
          <PaginationBar
            page={page}
            rowsPerPage={rowsPerPage}
            count={mockRows.length}
            loading={loading}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
          />
        </Box>
      </Paper>
    </Box>
  );
};
