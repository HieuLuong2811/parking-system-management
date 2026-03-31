import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import QRCode from 'qrcode';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useCreateVehicle } from '../../api/vehicles';

const plateFields = [
  { name: 'user_code', labelKey: 'vehicle.modal.fields.userCode', required: true },
  { name: 'vehicle_type', labelKey: 'vehicle.modal.fields.vehicleType', required: true },
  { name: 'license_plate', labelKey: 'vehicle.modal.fields.licensePlate', required: true },
];

const noPlateFields = [
  { name: 'user_code', labelKey: 'vehicle.modal.fields.userCode', required: true },
  { name: 'vehicle_type', labelKey: 'vehicle.modal.fields.vehicleType', required: true },
  { name: 'description', labelKey: 'vehicle.modal.fields.description', required: false },
];

const initialPlateForm = { user_code: '', vehicle_type: '', license_plate: '' };
const initialNoPlateForm = { user_code: '', vehicle_type: '', description: '', qr_code: '' };

type ModalProps = {
  open: boolean;
  onClose: () => void;
};

const renderField = (
  id: string,
  label: string,
  value: string,
  onChange: (value: string) => void,
  error?: string,
  required = true
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
    />
    {error && (
      <Typography variant="caption" color="error">
        {error}
      </Typography>
    )}
  </div>
);

const VehicleRegistrationModal: React.FC<ModalProps> = ({ open, onClose }) => {
  const { t } = useTranslation();
  const createVehicle = useCreateVehicle();
  const [activeTab, setActiveTab] = useState<'plate' | 'noPlate'>('plate');
  const [formPlate, setFormPlate] = useState(initialPlateForm);
  const [formNoPlate, setFormNoPlate] = useState(initialNoPlateForm);
  const [formErrorsPlate, setFormErrorsPlate] = useState<Record<string, string>>({});
  const [formErrorsNoPlate, setFormErrorsNoPlate] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  const [generatedQR, setGeneratedQR] = useState('');
  const [qrError, setQrError] = useState('');
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);

  const validateFields = (values: Record<string, string>, required: string[]) => {
    const errors: Record<string, string> = {};
    required.forEach((field) => {
      if (!values[field] || !values[field].trim()) {
        errors[field] = t('vehicle.modal.errors.required');
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

  const handleGenerateQR = async () => {
    const errors = validateFields(formNoPlate, ['user_code', 'vehicle_type']);
    setFormErrorsNoPlate(errors);
    setQrError('');
    if (Object.keys(errors).length) {
      setQrError(t('vehicle.modal.errors.qrGenerate'));
      return;
    }
    setIsGeneratingQR(true);
    try {
      const payload = `${formNoPlate.user_code}|${formNoPlate.vehicle_type}|${formNoPlate.description}`;
      const qr = await QRCode.toDataURL(payload, { width: 200, margin: 1 });
      setGeneratedQR(qr);
      setFormNoPlate((prev) => ({ ...prev, qr_code: qr }));
      setQrError('');
    } catch (error) {
      setQrError(t('vehicle.modal.errors.qrFailed'));
    } finally {
      setIsGeneratingQR(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitError('');
    if (activeTab === 'plate') {
      const errors = validateFields(formPlate, ['user_code', 'vehicle_type', 'license_plate']);
      setFormErrorsPlate(errors);
      if (Object.keys(errors).length) return;
      try {
        await createVehicle.mutateAsync({
          ...formPlate,
          qr_code: formPlate.license_plate || undefined,
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
    const errors = validateFields(formNoPlate, ['user_code', 'vehicle_type']);
    setFormErrorsNoPlate(errors);
    if (Object.keys(errors).length) return;
    if (!generatedQR) {
      setQrError(t('vehicle.modal.errors.qrMissing'));
      return;
    }
    try {
      await createVehicle.mutateAsync({
        user_code: formNoPlate.user_code,
        vehicle_type: formNoPlate.vehicle_type,
        license_plate: '',
        qr_code: generatedQR,
      });
      resetModalState();
      onClose();
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : (t('vehicle.modal.errors.generic') as string)
      );
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>{t('vehicle.modal.title')}</DialogTitle>
      <DialogContent dividers>
        <Box className="vehicle-modal-tabs">
          <button
            type="button"
            className={activeTab === 'plate' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('plate')}
          >
            {t('vehicle.modal.tabs.withPlate')}
          </button>
          <button
            type="button"
            className={activeTab === 'noPlate' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('noPlate')}
          >
            {t('vehicle.modal.tabs.withoutPlate')}
          </button>
        </Box>
        <Box className="vehicle-modal-panel">
          {activeTab === 'plate' ? (
            plateFields.map((field) =>
              renderField(
                field.name,
                t(field.labelKey),
                (formPlate as Record<string, string>)[field.name],
                (value) =>
                  setFormPlate((prev) => ({
                    ...prev,
                    [field.name]: value,
                  })),
                formErrorsPlate[field.name],
                field.required
              )
            )
          ) : (
            <>
              {noPlateFields.map((field) =>
                renderField(
                  field.name,
                  t(field.labelKey),
                  (formNoPlate as Record<string, string>)[field.name],
                  (value) =>
                    setFormNoPlate((prev) => ({
                      ...prev,
                      [field.name]: value,
                    })),
                  formErrorsNoPlate[field.name],
                  field.required
                )
              )}
              <div className="vehicle-modal-field">
                <label>
                  {t('vehicle.modal.fields.qrCode')}
                  <span className="required">*</span>
                </label>
                <Button variant="text" onClick={handleGenerateQR} disabled={isGeneratingQR}>
                  {isGeneratingQR
                    ? t('vehicle.modal.generatingQr')
                    : t('vehicle.modal.actions.generateQr')}
                </Button>
                {generatedQR && (
                  <Box
                    component="img"
                    src={generatedQR}
                    alt="QR code"
                    sx={{ width: 120, mt: 1, borderRadius: 1, border: '1px solid #e0e0e0' }}
                  />
                )}
                {(qrError || formErrorsNoPlate.qr_code) && (
                  <Typography variant="caption" color="error">
                    {qrError || formErrorsNoPlate.qr_code}
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
