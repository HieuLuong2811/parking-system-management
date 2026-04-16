import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Paper,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import SectionCard from '../components/shared/SectionCard';
import VehicleRegistrationModal from '../components/vehicle/VehicleRegistrationModal';
import { VehicleInfo } from '../api/clientApi';
import { useDeleteVehicle, useVehicles } from '../api/vehicles';
import useDebouncedValue from '../hooks/useDebouncedValue';
import useModal from '../hooks/useModal';
import QRCode from 'qrcode';
import { vehicles_tab } from '../constant/config';

const vehicleColumns: { key: keyof VehicleInfo | 'actions'; labelKey: string }[] = [
  { key: 'user_code', labelKey: 'vehicle.table.userCode' },
  { key: 'vehicle_type', labelKey: 'vehicle.table.type' },
  { key: 'license_plate', labelKey: 'vehicle.table.licensePlate' },
  { key: 'qr_code', labelKey: 'vehicle.table.qrCode' },
  { key: 'created_at', labelKey: 'vehicle.table.createdAt' },
  { key: 'actions', labelKey: 'vehicle.table.actions' },
];

interface QRCodeCellProps {
  value: string;
}

function QRCodeCell({ value }: QRCodeCellProps) {
  const [src, setSrc] = useState<string>();

  useEffect(() => {
    let mounted = true;

    QRCode.toDataURL(value, { width: 200, margin: 1 })
      .then((dataUrl) => {
        if (mounted) {
          setSrc(dataUrl);
        }
      })
      .catch(() => {
        if (mounted) {
          setSrc('');
        }
      });

    return () => {
      mounted = false;
    };
  }, [value]);

  if (!src) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" minHeight="120px">
        <CircularProgress size={16} />
      </Box>
    );
  }

  return (
    <Box
      component="img"
      alt="QR code"
      src={src}
      sx={{ width: '120px', height: '100px', border: '1px solid #e0e0e0' }}
    />
  );
}

const getTabLabelKeys = {
  withPlate: 'vehicle.tabs.withPlate',
  withoutPlate: 'vehicle.tabs.withoutPlate',
};

export default function VehiclePage() {
  const { t } = useTranslation();
  const [userCodeFilter, setUserCodeFilter] = useState('');
  const [licenseFilter, setLicenseFilter] = useState('');
  const [vehicleTab, setVehicleTab] = useState<'withPlate' | 'withoutPlate'>('withPlate');
  const debouncedUserCodeFilter = useDebouncedValue(userCodeFilter, 420);
  const debouncedLicenseFilter = useDebouncedValue(licenseFilter, 420);
  const { data: vehicles = [], isLoading, isError } = useVehicles();
  const deleteVehicle = useDeleteVehicle();
  const registerModal = useModal();

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((vehicle: VehicleInfo) => {
      const matchesUser =
        !debouncedUserCodeFilter ||
        vehicle.user_code?.toLowerCase().includes(debouncedUserCodeFilter.toLowerCase());
      const matchesLicense =
        !debouncedLicenseFilter ||
        (vehicle.license_plate &&
          vehicle.license_plate.toLowerCase().includes(debouncedLicenseFilter.toLowerCase()));
      return matchesUser && matchesLicense;
    });
  }, [vehicles, debouncedUserCodeFilter, debouncedLicenseFilter]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: 'withPlate' | 'withoutPlate') => {
    setVehicleTab(newValue);
  };

  const visibleVehicles = useMemo(() => {
    return filteredVehicles.filter((vehicle) => {
      const hasPlate = Boolean(vehicle.license_plate?.trim());
      return vehicleTab === vehicles_tab.withPlate ? hasPlate : !hasPlate;
    });
  }, [filteredVehicles, vehicleTab]);

  const handleEdit = (vehicle: VehicleInfo) => {
    <>
      <Snackbar anchorOrigin={{ vertical: 'top', horizontal: 'center' }} open autoHideDuration={3000}>
        <Alert>
          Edit ${vehicle.id}`
        </Alert>
      </Snackbar>
    </>
  };

  const handleDelete = (vehicle: VehicleInfo) => {
    deleteVehicle.mutate({ vehicleId: vehicle.id });
  };

  const handleRidirectToPlan = () => {
    if (filteredVehicles.length === 0) {
      <>
        <Snackbar>
          <Alert severity="info" sx={{ width: '100%' }}>
            {t('vehicle.empty')}
          </Alert>
        </Snackbar>
      </>;
      return;
    }
    window.location.href = '/plan';
  }

  const visibleColumbs = useMemo(() => {
    if (vehicleTab === vehicles_tab.withoutPlate) {
      return vehicleColumns.filter((column) => column.key !== 'license_plate');
    }
    else if (vehicleTab === vehicles_tab.withPlate) {
      return vehicleColumns.filter((column) => column.key !== 'qr_code');
    }
    return vehicleColumns;
  }, [vehicleTab]);

  return (
    <SectionCard>
      <Stack spacing={1}>
        <Stack direction="row" justifyContent="space-between" flexWrap="wrap" spacing={1}>
          <Typography variant="h5">{t('vehicle.subtitle')}</Typography>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={handleRidirectToPlan}>
              {t('vehicle.registerPlanButton')}
            </Button>
            <Button variant="contained" onClick={registerModal.openModal} disabled={isError}>
              {t('vehicle.registerVehicleButton')}
            </Button>
          </Stack>
        </Stack>
        <Tabs value={vehicleTab} onChange={handleTabChange} sx={{ mt: 2 }} indicatorColor="primary">
          <Tab value="withPlate" label={t(getTabLabelKeys.withPlate)} />
          <Tab value="withoutPlate" label={t(getTabLabelKeys.withoutPlate)} />
        </Tabs>
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
        <Button variant="text" onClick={() => {setUserCodeFilter(''); setLicenseFilter(''); }} disabled={isLoading || isError}>
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
                  {visibleColumbs.map((column) => (
                    <TableCell key={String(column.key)} sx={{ fontWeight: 600 }}>
                      {t(column.labelKey)}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {visibleVehicles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={vehicleColumns.length} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">{t('vehicle.empty')}</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  visibleVehicles.map((vehicle: VehicleInfo) => (
                    <TableRow key={vehicle.id} hover>
                      <TableCell>{vehicle.user_code}</TableCell>
                      <TableCell>{vehicle.vehicle_type}</TableCell>
                      {vehicleTab === vehicles_tab.withPlate && (
                        <TableCell>{vehicle.license_plate}</TableCell>
                      )}
                      <TableCell>
                        {vehicle.qr_code ? <QRCodeCell value={vehicle.qr_code} /> : '-'}
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
                          <Button size="small" variant="outlined" onClick={() => handleEdit(vehicle)}>
                            {t('vehicle.table.actionsMenu.edit')}
                          </Button>
                          { vehicle.qr_code && (
                            <Button variant='outlined' size='small' 
                            onClick={() => {
                              const qrImage = vehicle.qr_code || '-';
                              QRCode.toDataURL(qrImage, {width: 200, margin: 1 })
                                .then((qrImage) => {
                                  const canvas = document.createElement('canvas');
                                  const context = canvas.getContext('2d');
                                  const img = new Image();
                                  img.src = qrImage;
                                  img.onload = () => {
                                    canvas.width = img.width;
                                    canvas.height = img.height;
                                    context?.drawImage(img, 0, 0);

                                    const link = document.createElement('a');
                                    link.href = canvas.toDataURL('image/png');
                                    link.download = `${vehicle.vehicle_type}_qr_code.png`;
                                    link.click();
                                  };
                                })
                                .catch((err) => {
                                  console.error('Failed to generate QR code', err);
                                })
                            }}>
                              Download QR code
                            </Button>
                          )}
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
