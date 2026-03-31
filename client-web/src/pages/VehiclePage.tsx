import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import SectionCard from '../components/shared/SectionCard';
import VehicleRegistrationModal from '../components/vehicle/VehicleRegistrationModal';
import { VehicleInfo } from '../api/clientApi';
import { useDeleteVehicle, useVehicles } from '../api/vehicles';
import useModal from '../hooks/useModal';

const vehicleColumns: { key: keyof VehicleInfo | 'actions'; labelKey: string }[] = [
  { key: 'id', labelKey: 'vehicle.table.vehicleId' },
  { key: 'user_code', labelKey: 'vehicle.table.userCode' },
  { key: 'vehicle_type', labelKey: 'vehicle.table.type' },
  { key: 'license_plate', labelKey: 'vehicle.table.licensePlate' },
  { key: 'qr_code', labelKey: 'vehicle.table.qrCode' },
  { key: 'created_at', labelKey: 'vehicle.table.createdAt' },
  { key: 'actions', labelKey: 'vehicle.table.actions' },
];

export default function VehiclePage() {
  const { t } = useTranslation();
  const [userCodeFilter, setUserCodeFilter] = useState('');
  const [licenseFilter, setLicenseFilter] = useState('');
  const { data: vehicles = [], isLoading, isError } = useVehicles();
  const deleteVehicle = useDeleteVehicle();
  const registerModal = useModal();

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((vehicle: VehicleInfo) => {
      const matchesUser =
        !userCodeFilter ||
        vehicle.user_code?.toLowerCase().includes(userCodeFilter.toLowerCase());
      const matchesLicense =
        !licenseFilter ||
        (vehicle.license_plate &&
          vehicle.license_plate.toLowerCase().includes(licenseFilter.toLowerCase()));
      return matchesUser && matchesLicense;
    });
  }, [vehicles, userCodeFilter, licenseFilter]);

  const handleEdit = (vehicle: VehicleInfo) => {
    alert(`Edit ${vehicle.id}`);
  };

  const handleDelete = (vehicle: VehicleInfo) => {
    deleteVehicle.mutate({ vehicleId: vehicle.id });
  };

  return (
    <SectionCard>
      <Stack spacing={1} mb={2}>
        <Typography variant="subtitle2" className="section-label">
          {t('vehicle.sectionTitle')}
        </Typography>
        <Stack direction="row" justifyContent="space-between" flexWrap="wrap" spacing={1}>
          <Typography variant="h5">{t('vehicle.subtitle')}</Typography>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined">{t('vehicle.registerPlanButton')}</Button>
            <Button variant="contained" onClick={registerModal.openModal} disabled={isError}>
              {t('vehicle.registerVehicleButton')}
            </Button>
          </Stack>
        </Stack>
      </Stack>

      <Divider sx={{ mb: 2 }} />

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
        <Button variant="text" onClick={() => {}}>
          {t('vehicle.applyFilter')}
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
                    <TableCell key={String(column.key)} sx={{ fontWeight: 600 }}>
                      {t(column.labelKey)}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredVehicles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={vehicleColumns.length} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">{t('vehicle.empty')}</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredVehicles.map((vehicle: VehicleInfo) => (
                    <TableRow key={vehicle.id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{vehicle.id}</TableCell>
                      <TableCell>{vehicle.user_code}</TableCell>
                      <TableCell>{vehicle.vehicle_type}</TableCell>
                      <TableCell>{vehicle.license_plate ?? '—'}</TableCell>
                      <TableCell>{vehicle.qr_code ?? '—'}</TableCell>
                      <TableCell>
                        {new Date(vehicle.created_at).toLocaleString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <Button size="small" variant="outlined" onClick={() => handleEdit(vehicle)}>
                            {t('vehicle.table.actionsMenu.edit')}
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            color="error"
                            onClick={() => handleDelete(vehicle)}
                            disabled={isLoading}
                          >
                            {t('vehicle.table.actionsMenu.delete')}
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      <VehicleRegistrationModal open={registerModal.open} onClose={registerModal.closeModal} />
    </SectionCard>
  );
}
