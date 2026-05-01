import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
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
} from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import SectionCard from '../components/shared/SectionCard';
import VehicleRegistrationModal from '../components/vehicle/VehicleRegistrationModal';
import { VehicleInfo } from '../api/clientApi';
// import { useSubscriptionPlans } from '../api/subscription_plans';
import { useUserSubscriptions } from '../api/user_subscriptions';
import { useDeleteVehicle, useMyVehiclesPaginated } from '../api/vehicles';
import useDebouncedValue from '../hooks/useDebouncedValue';
import useModal from '../hooks/useModal';
import JsBarcode from 'jsbarcode';
import type { GridColDef } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import DownloadIcon from '@mui/icons-material/Download';

const vehicleColumns: GridColDef[] = [
  { field: 'vehicle_type', headerName: 'Vehicle Type', width: 200 },
  { field: 'license_plate', headerName: 'License Plate', width: 200 },
  { field: 'barcode_token', headerName: 'Barcode', width: 220 },
  { field: 'created_at', headerName: 'Created At', width: 250 },
  { field: 'actions', headerName: 'Actions', width: 30 },
];

export default function VehiclePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [userCodeFilter, setUserCodeFilter] = useState('');
  const [licenseFilter, setLicenseFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
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
  // const { data: plans = [] } = useSubscriptionPlans();
  const { data: subscriptions = [], isLoading: subscriptionsLoading } = useUserSubscriptions();
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

  const showToast = (message: string, severity: 'success' | 'info' | 'error' = 'info') => {
    setSnackbar({ message, severity });
  };

  const hasActiveSubscription = useMemo(() => {
    return subscriptions.some((s) => s.status !== 'EXPIRED');
  }, [subscriptions]);

  const handleRegisterPlan = () => {
    if (subscriptionsLoading) {
      showToast(t('common.loading'), 'info');
      return;
    }

    if (hasActiveSubscription) {
      console.log('hasActiveSubscription', hasActiveSubscription);
      showToast(t('vehicle.alerts.onlyOneSubscription'), 'error');
      return;
    }


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
    <SectionCard>
      <Stack spacing={1}>
        <Stack direction="row" justifyContent="space-between" flexWrap="wrap" spacing={1} mb={2}>
          <Typography variant="h5">{t('vehicle.subtitle')}</Typography>
          <Stack direction="row" spacing={1}>
            <Button variant="contained" onClick={handleRegisterPlan}>
              {t('vehicle.registerPlanButton')}
            </Button>
            <Button variant="contained" onClick={handleOpenCreate} disabled={isError}>
              {t('vehicle.registerVehicleButton')}
            </Button>
          </Stack>
        </Stack>
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} flexWrap="wrap" alignItems="center" mb={2}>
        <input
          placeholder={t('vehicle.search.userCode')}
          className="plain-input"
          value={userCodeFilter}
          onChange={(event) => setUserCodeFilter(event.target.value)}
          disabled={isLoading || isError}
        />
        <input
          placeholder={t('vehicle.search.license')}
          className="plain-input"
          value={licenseFilter}
          onChange={(event) => setLicenseFilter(event.target.value)}
          disabled={isLoading || isError}
        />
        <Button
          variant="text"
          onClick={() => {
            setUserCodeFilter('');
            setLicenseFilter('');
            setPage(0);
          }}
          disabled={isLoading || isError}
        >
          {t('vehicle.clearFilter')}
        </Button>
      </Stack>

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
        <Paper elevation={0} sx={{ boxShadow: 'none' }}>
          <TableContainer component={Box}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {vehicleColumns.map((column) => (
                    <TableCell key={String(column.field)} sx={{ fontWeight: 600 }}>
                      {t(column.headerName?? column.field)}
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
                    <TableRow key={vehicle.id} hover>
                      <TableCell>{vehicle.vehicle_type}</TableCell>
                        <TableCell>{vehicle.license_plate}</TableCell>
                        <TableCell>
                          {/* <BarcodeCell value={vehicle.barcode_token || '-'} /> */}
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
                          <Tooltip title={t('vehicle.table.actionsMenu.edit')}>
                            <IconButton size="small" onClick={() => handleEdit(vehicle)}>
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={t('vehicle.table.actionsMenu.download')}>
                            <IconButton size="small"  onClick={() => handleDownload(vehicle?.barcode_token || '', vehicle.vehicle_type)}>
                              <DownloadIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={t('vehicle.table.actionsMenu.delete')} disableInteractive placement="top">
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
          </TableContainer>

          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={(_event, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 5));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 20, 50, 100]}
          />
        </Paper>
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
    </SectionCard>
  );
}
