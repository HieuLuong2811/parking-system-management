import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  Tooltip,
  IconButton,
  TextField,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import VehicleRegistrationModal from '../components/vehicle/VehicleRegistrationModal';
import { VehicleInfo } from '../api/clientApi';
import { useDeleteVehicle, useMyVehiclesPaginated } from '../api/vehicles';
import useDebouncedValue from '../hooks/useDebouncedValue';
import useModal from '../hooks/useModal';
import JsBarcode from 'jsbarcode';
import type { GridColDef } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import DownloadIcon from '@mui/icons-material/Download';
import FilterListIcon from "@mui/icons-material/FilterList";

const vehicleColumns: GridColDef[] = [
  { field: 'vehicle_type', width: 200 },
  { field: 'license_plate', width: 200 },
  { field: 'barcode_token', width: 220 },
  { field: 'created_at', width: 250 },
  { field: 'actions', width: 30 },
];

export default function VehiclePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [userCodeFilter, setUserCodeFilter] = useState('');
  const [licenseFilter, setLicenseFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [editingVehicle, setEditingVehicle] = useState<VehicleInfo | null>(null);
  const [snackbar, setSnackbar] = useState<{ message: string; severity: 'success' | 'info' | 'error' } | null>(null);
  const debouncedUserCodeFilter = useDebouncedValue(userCodeFilter, 420);
  const debouncedLicenseFilter = useDebouncedValue(licenseFilter, 420);
  const { data: paginated, isLoading, isError } = useMyVehiclesPaginated({
    page: page + 1,
    limit: rowsPerPage,
    user_code: debouncedUserCodeFilter.trim() || undefined,
    license_plate: debouncedLicenseFilter.trim() || undefined,
  });
  const vehicles = useMemo(() => paginated?.data ?? [], [paginated]);
  const total = paginated?.total ?? 0;
  const deleteVehicle = useDeleteVehicle();
  const registerModal = useModal();
  
  useEffect(() => {
    setPage(0);
  }, [debouncedUserCodeFilter, debouncedLicenseFilter]);

  const handleEdit = (vehicle: VehicleInfo) => {
    setEditingVehicle(vehicle);
    registerModal.openModal();
  };

  const handleDelete = (vehicle: VehicleInfo) => {
    deleteVehicle.mutate({ vehicleId: vehicle.id });
  };

  const handleOpenCreate = () => {
    setEditingVehicle(null);
    registerModal.openModal();
  };

  const handleCloseModal = () => {
    setEditingVehicle(null);
    registerModal.closeModal();
  };

  const handleRegisterPlan = () => {
    navigate(`/plan`);
  };

  const handleDownload = (barcode_token: string, vehicle_type: string) => {
    try {
      const canvas = document.createElement('canvas');
      JsBarcode(canvas, barcode_token || '-', {
        format: 'CODE128',
        displayValue: true,
        margin: 8,
      });
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `${vehicle_type}_barcode.png`;
      link.click();
    } catch (err) {
      console.error('Failed to generate barcode', err);
    }
  }

  return (
    <Box className="profile-page-shell">
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
          {t('vehicle.title')}
        </Typography>
        <Typography variant="body2" fontSize="medium" color="text.secondary">
          {t('vehicle.subtitle', {
            defaultValue: 'Quản lý phương tiện cá nhân và đăng ký gửi xe nhanh chóng.',
          })}
        </Typography>
      </Box>

      <Box
        sx={{
          mb: 3,
          p: 2,
          borderRadius: 3,
          bgcolor: '#F8FAFC',
          border: '1px solid #E5E7EB',
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={1.5}
          alignItems={{ xs: 'flex-start', md: 'center' }}
          justifyContent="space-between"
        >

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} flexWrap="wrap" alignItems="center" mb={2}>
          <Box
            sx={{
              display: "flex",
              gap: 1,
              alignItems: "center",
              minWidth: 130,
            }}
          >
            <FilterListIcon color="primary" fontSize="small" />
            <Typography variant="body2" fontWeight={600}>
              {t("common.filters.search")}
            </Typography>
          </Box>
          <TextField
            label={t('vehicle.search.userCode', {
              defaultValue: 'Mã người dùng',
            })}
            placeholder={t('vehicle.search.userCodePlaceholder', {
              defaultValue: 'Nhập mã người dùng',
            })}
            value={userCodeFilter}
            onChange={(event) => setUserCodeFilter(event.target.value)}
            disabled={isLoading || isError}
            size="small"
            sx={{
              minWidth: { xs: '100%', sm: 220 },
              bgcolor: '#FFFFFF',
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />

          <TextField
            label={t('vehicle.search.license', {
              defaultValue: 'Biển số',
            })}
            placeholder={t('vehicle.search.licensePlaceholder', {
              defaultValue: 'Nhập biển số xe',
            })}
            value={licenseFilter}
            onChange={(event) => setLicenseFilter(event.target.value)}
            disabled={isLoading || isError}
            size="small"
            sx={{
              minWidth: { xs: '100%', sm: 220 },
              bgcolor: '#FFFFFF',
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />
        <Button
          variant="outlined"
          onClick={() => {
            setUserCodeFilter('');
            setLicenseFilter('');
            setPage(0);
          }}
          disabled={isLoading || isError || (!userCodeFilter && !licenseFilter)}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            px: 2.5,
            bgcolor: '#FFFFFF',
          }}
        >
          {t('common.filters.reset', {
            defaultValue: 'Xóa bộ lọc',
          })}
        </Button>
        </Stack>

          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Button
              variant="outlined"
              onClick={handleRegisterPlan}
              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
            >
              {t('vehicle.registerPlanButton')}
            </Button>
            <Button
              variant="contained"
              onClick={handleOpenCreate}
              disabled={isError}
              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
            >
              {t('vehicle.registerVehicleButton')}
            </Button>
          </Stack>
        </Stack>
      </Box>

      {isError && (
        <Typography color="error" mb={2}>
          {t('vehicle.error.load')}
        </Typography>
      )}

      {isLoading ? (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            borderRadius: 3,
            border: '1px solid #E5E7EB',
            overflow: 'hidden',
            bgcolor: '#FFFFFF',
          }}
        >
          <Table size="small">
              <TableHead>
                <TableRow
                  sx={{
                    bgcolor: '#F8FAFC',
                    '& th': {
                      fontWeight: 700,
                      color: '#334155',
                      fontSize: 14,
                      py: 1.75,
                      borderBottom: '1px solid #E5E7EB',
                      whiteSpace: 'nowrap',
                    },
                  }}
                >
                  {vehicleColumns.map((column) => (
                    <TableCell key={String(column.field)}>
                      {t(`vehicle.table.${column.field}`)}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {vehicles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={vehicleColumns.length} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">{t('vehicle.empty')}</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  vehicles.map((vehicle: VehicleInfo) => (
                    <TableRow
                      key={vehicle.id}
                      hover
                      sx={{
                        '& td': {
                          py: 1.8,
                          fontSize: 14,
                          borderBottom: '1px solid #EEF2F7',
                        },
                      }}
                    >
                      <TableCell>{vehicle.vehicle_type}</TableCell>
                        <TableCell>{vehicle.license_plate}</TableCell>
                        <TableCell>
                          {vehicle.barcode_token || '-'}
                        </TableCell>
                      <TableCell>
                        {new Date(vehicle.created_at).toLocaleString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <Tooltip placement="top" title={t('vehicle.table.actionsMenu.edit')}>
                            <IconButton size="small" onClick={() => handleEdit(vehicle)}>
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip placement="top" title={t('vehicle.table.actionsMenu.download')}>
                            <IconButton size="small"  onClick={() => handleDownload(vehicle?.barcode_token || '', vehicle.vehicle_type)}>
                              <DownloadIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip placement="top" title={t('vehicle.table.actionsMenu.delete')} disableInteractive>
                            <IconButton onClick={() => handleDelete(vehicle)}>
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
          </Table>

          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={(_event, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 20, 50, 100]}
          />
        </TableContainer>
      )}

      <VehicleRegistrationModal
        open={registerModal.open}
        onClose={handleCloseModal}
        vehicle={editingVehicle}
      />

      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={Boolean(snackbar)}
        autoHideDuration={3000}
        onClose={() => setSnackbar(null)}
      >
        <Alert severity={snackbar?.severity ?? 'info'} onClose={() => setSnackbar(null)} sx={{ width: '100%' }}>
          {snackbar?.message ?? ''}
        </Alert>
      </Snackbar>
    </Box>
  );
}
