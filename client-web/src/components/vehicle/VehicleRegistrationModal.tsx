import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from '@mui/material';
import PedalBikeIcon from '@mui/icons-material/PedalBike';
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler';
import QRCode from 'qrcode';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { VehicleInfo } from '../../api/clientApi';
import { useCreateVehicle, useUpdateVehicle } from '../../api/vehicles';
import { useAppAuth } from '../../contexts/useAppAuth';

const plateFields = [
  { name: 'user_code', labelKey: 'vehicle.modal.fields.userCode', required: true },
  { name: 'vehicle_type', labelKey: 'vehicle.modal.fields.vehicleType', required: true },
  { name: 'license_plate', labelKey: 'vehicle.modal.fields.licensePlate', required: true },
];

const noPlateFields = [
  { name: 'user_code', labelKey: 'vehicle.modal.fields.userCode', required: true },
  { name: 'vehicle_type', labelKey: 'vehicle.modal.fields.vehicleType', required: true },
];

const initialPlateForm = { user_code: '', vehicle_type: '', license_plate: '' };
const initialNoPlateForm = { user_code: '', vehicle_type: '' };

type ModalProps = {
  open: boolean;
  onClose: () => void;
  vehicle?: VehicleInfo | null;
};

const renderField = (
  id: string,
  label: string,
  value: string,
  onChange: (value: string) => void,
  error?: string,
  required = true,
  disabled = false,
  placeholder = ''
) => (
  <div className="vehicle-modal-field" key={id}>
    <label htmlFor={id}>
      {label}
      {required && <span className="required">*</span>}
    </label>
    <input
      id={id}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="plain-input"
      disabled={disabled}
      placeholder={placeholder}
    />
    {error && (
      <Typography variant="caption" color="error">
        {error}
      </Typography>
    )}
  </div>
);

type SelectOption = {
  value: string;
  label: string;
};

const renderSelectField = (
  id: string,
  label: string,
  value: string,
  onChange: (value: string) => void,
  options: SelectOption[],
  placeholder: string,
  error?: string,
  required = true
) => (
  <div className="vehicle-modal-field" key={id}>
    <label htmlFor={id}>
      {label}
      {required && <span className="required">*</span>}
    </label>
    <FormControl fullWidth error={Boolean(error)} variant="standard">
      <Select
        id={id}
        value={value}
        displayEmpty
        onChange={(event: SelectChangeEvent<string>) => onChange(event.target.value)}
        className="vehicle-type-select"
      >
        <MenuItem value="" disabled>
          <em>{placeholder}</em>
        </MenuItem>
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
    {error && (
      <Typography variant="caption" color="error">
        {error}
      </Typography>
    )}
  </div>
);

const VehicleRegistrationModal: React.FC<ModalProps> = ({ open, onClose, vehicle }) => {
  const { t } = useTranslation();
  const { user: currentUser } = useAppAuth();
  const currentUserCode = currentUser?.user_code ?? '';
  const createVehicle = useCreateVehicle();
  const updateVehicle = useUpdateVehicle();
  const [activeTab, setActiveTab] = useState<'plate' | 'noPlate'>('plate');
  const [formPlate, setFormPlate] = useState(initialPlateForm);
  const [formNoPlate, setFormNoPlate] = useState(initialNoPlateForm);
  const [formErrorsPlate, setFormErrorsPlate] = useState<Record<string, string>>({});
  const [formErrorsNoPlate, setFormErrorsNoPlate] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  const [generatedQR, setGeneratedQR] = useState('');
  const [qrError, setQrError] = useState('');
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);

  const fieldLabels = useMemo(() => ({
    user_code: t('vehicle.modal.fields.userCode'),
    vehicle_type: t('vehicle.modal.fields.vehicleType'),
    license_plate: t('vehicle.modal.fields.licensePlate'),
    qr_code: t('vehicle.modal.fields.qrCode'),
  }), [t]) as Record<string, string>;

  const getRequiredMessage = (field: string) =>
    t('validation.requiredField', { field: fieldLabels[field] ?? field });

  const validateFields = (values: Record<string, string>, required: string[]) => {
    const errors: Record<string, string> = {};
    required.forEach((field) => {
      if (!values[field] || !values[field].trim()) {
        errors[field] = getRequiredMessage(field);
      }
    });
    return errors;
  };

  const resetModalState = () => {
    setFormPlate(initialPlateForm);
    setFormNoPlate(initialNoPlateForm);
    setFormErrorsPlate({});
    setFormErrorsNoPlate({});
    setSubmitError('');
    setQrError('');
    setGeneratedQR('');
    setActiveTab('plate');
  };

  const handleClose = () => {
    resetModalState();
    onClose();
  };

  useEffect(() => {
    if (vehicle) {
      const hasPlate = Boolean(vehicle.license_plate?.trim());
      setActiveTab(hasPlate ? 'plate' : 'noPlate');
      setFormPlate({
        user_code: vehicle.user_code ?? currentUserCode,
        vehicle_type: vehicle.vehicle_type ?? '',
        license_plate: vehicle.license_plate ?? '',
      });
      setFormNoPlate({
        user_code: vehicle.user_code ?? currentUserCode,
        vehicle_type: vehicle.vehicle_type ?? '',
      });
      setGeneratedQR(vehicle.qr_code ?? '');
    } else {
      setFormPlate((prev) => ({ ...prev, user_code: currentUserCode }));
      setFormNoPlate((prev) => ({ ...prev, user_code: currentUserCode }));
    }
  }, [currentUserCode, open, vehicle]);

  const tabDefinitions = useMemo(
    () => [
      {
        id: 'plate' as const,
        title: t('vehicle.modal.tabs.withPlate'),
        icon: <TwoWheelerIcon className="vehicle-modal-tab-icon" fontSize="small" />,
      },
      {
        id: 'noPlate' as const,
        title: t('vehicle.modal.tabs.withoutPlate'),
        icon: <PedalBikeIcon className="vehicle-modal-tab-icon" fontSize="small" />,
      },
    ],
    [t]
  );

  const vehicleTypeOptions = useMemo<SelectOption[]>(
    () => [
      {
        value: 'MOTORBIKE',
        label: t('vehicle.modal.types.motorbike'),
      },
      {
        value: 'BICYCLE',
        label: t('vehicle.modal.types.bicycle'),
      },
      {
        value: 'ELECTRIC_BICYCLE',
        label: t('vehicle.modal.types.electricBicycle'),
      },
    ],
    [t]
  );

  const getVehicleTypeOptionsForTab = (tab: 'plate' | 'noPlate'): SelectOption[] => {
    if (tab === 'plate') {
      return vehicleTypeOptions.filter((option) => option.value !== 'BICYCLE');
    }
    return vehicleTypeOptions.filter((option) => option.value !== 'MOTORBIKE');
  };

  const vehicleTypePlaceholder = t('vehicle.modal.fields.vehicleTypePlaceholder', {
    defaultValue: 'Select a vehicle type',
  });

  const licensePlatePlaceholder = t('vehicle.modal.fields.licensePlatePlaceholder', {
    defaultValue: 'e.g. 30K12345',
  });

  const generateNoPlatePayload = () =>
    `${formNoPlate.user_code.trim()}|${formNoPlate.vehicle_type.trim()}`;

  const generateNoPlateQRCode = async () => {
    setQrError('');
    setIsGeneratingQR(true);
    try {
      const payload = generateNoPlatePayload();
      const qr = await QRCode.toDataURL(payload, { width: 200, margin: 1 });
      setGeneratedQR(qr);
      return qr;
    } catch (error) {
      setQrError(t('vehicle.modal.errors.qrFailed'));
      throw error;
    } finally {
      setIsGeneratingQR(false);
    }
  };

  const handlePlateSubmission = async () => {
    const errors = validateFields(formPlate, ['user_code', 'vehicle_type', 'license_plate']);
    setFormErrorsPlate(errors);
    if (Object.keys(errors).length) return;
    try {
      const payload = {
        user_code: formPlate.user_code,
        vehicle_type: formPlate.vehicle_type,
        license_plate: formPlate.license_plate,
        qr_code: formPlate.license_plate || undefined,
      };
      if (vehicle) {
        await updateVehicle.mutateAsync({
          vehicleId: vehicle.id,
          payload,
        });
      } else {
        await createVehicle.mutateAsync(payload);
      }
      resetModalState();
      onClose();
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : (t('vehicle.modal.errors.generic') as string)
      );
    }
  };

  const handleNoPlateSubmission = async () => {
    const errors = validateFields(formNoPlate, ['user_code', 'vehicle_type']);
    setFormErrorsNoPlate(errors);
    if (Object.keys(errors).length) return;
    const payloadBase = {
      user_code: formNoPlate.user_code,
      vehicle_type: formNoPlate.vehicle_type,
      license_plate: '',
    };
    if (vehicle) {
      try {
        await updateVehicle.mutateAsync({
          vehicleId: vehicle.id,
          payload: {
            ...payloadBase,
            qr_code: generatedQR || vehicle.qr_code || '',
          },
        });
        resetModalState();
        onClose();
      } catch (error) {
        setSubmitError(
          error instanceof Error ? error.message : (t('vehicle.modal.errors.generic') as string)
        );
      }
      return;
    }
    try {
      const qrCode = await generateNoPlateQRCode();
      await createVehicle.mutateAsync({
        ...payloadBase,
        qr_code: qrCode,
      });
      resetModalState();
      onClose();
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : (t('vehicle.modal.errors.generic') as string)
      );
    }
  };

  const handleSubmit = () => {
    setSubmitError('');
    if (activeTab === 'plate') {
      void handlePlateSubmission();
      return;
    }
    void handleNoPlateSubmission();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>{t('vehicle.modal.title')}</DialogTitle>
      <DialogContent dividers>
        <Box className="vehicle-modal-tabs">
          {tabDefinitions.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={activeTab === tab.id ? 'tab active' : 'tab'}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              <span className="vehicle-modal-tab-text">
                <span className="vehicle-modal-tab-title">{tab.title}</span>
              </span>
            </button>
          ))}
        </Box>
        <Box className="vehicle-modal-panel">
          {activeTab === 'plate' ? (
            plateFields.map((field) => {
              if (field.name === 'vehicle_type') {
                return renderSelectField(
                  field.name,
                  t(field.labelKey),
                  (formPlate as Record<string, string>)[field.name],
                  (value) =>
                    setFormPlate((prev) => ({
                      ...prev,
                      [field.name]: value,
                    })),
                  getVehicleTypeOptionsForTab('plate'),
                  vehicleTypePlaceholder,
                  formErrorsPlate[field.name],
                  field.required
                );
              }
              return renderField(
                field.name,
                t(field.labelKey),
                (formPlate as Record<string, string>)[field.name],
                (value) =>
                  setFormPlate((prev) => ({
                    ...prev,
                    [field.name]: value,
                  })),
                formErrorsPlate[field.name],
                field.required,
                field.name === 'user_code',
                field.name === 'license_plate' ? licensePlatePlaceholder : ''
              );
            })
          ) : (
            <>
              {noPlateFields.map((field) => {
                if (field.name === 'vehicle_type') {
                  return renderSelectField(
                    field.name,
                    t(field.labelKey),
                    (formNoPlate as Record<string, string>)[field.name],
                    (value) =>
                      setFormNoPlate((prev) => ({
                        ...prev,
                        [field.name]: value,
                      })),
                    getVehicleTypeOptionsForTab('noPlate'),
                    vehicleTypePlaceholder,
                    formErrorsNoPlate[field.name],
                    field.required
                  );
                }
                return renderField(
                  field.name,
                  t(field.labelKey),
                  (formNoPlate as Record<string, string>)[field.name],
                  (value) =>
                    setFormNoPlate((prev) => ({
                      ...prev,
                      [field.name]: value,
                    })),
                  formErrorsNoPlate[field.name],
                  field.required,
                  field.name === 'user_code'
                );
              })}
              <div className="vehicle-modal-field">
                <label>
                  {t('vehicle.modal.fields.qrCode')}
                  <span className="required">*</span>
                </label>
                <Box
                  sx={{
                    mt: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    minHeight: '120px',
                  }}
                >
                  {isGeneratingQR ? (
                    <CircularProgress size={16} />
                  ) : generatedQR ? (
                    <Box
                      component="img"
                      src={generatedQR}
                      alt="QR code"
                      sx={{ width: 120, borderRadius: 1, border: '1px solid #e0e0e0' }}
                    />
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      {vehicle
                        ? t('vehicle.modal.info.qrLocked', {
                            defaultValue: 'QR code cannot be edited for existing no-plate vehicles.',
                          })
                        : t('vehicle.modal.info.qrAutoGenerate', {
                            defaultValue: 'QR code will be created when you submit.',
                          })}
                    </Typography>
                  )}
                </Box>
                {qrError && (
                  <Typography variant="caption" color="error">
                    {qrError}
                  </Typography>
                )}
              </div>
            </>
          )}
        </Box>
        {submitError && (
          <Typography color="error" variant="body2" sx={{ mt: 1 }}>
            {submitError}
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose}>{t('vehicle.modal.cancel')}</Button>
        <Button variant="contained" onClick={handleSubmit}>
          {t('vehicle.modal.submit')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VehicleRegistrationModal;
