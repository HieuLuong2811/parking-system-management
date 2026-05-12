import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  FormControl,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Typography,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import PedalBikeIcon from "@mui/icons-material/PedalBike";
import TwoWheelerIcon from "@mui/icons-material/TwoWheeler";
import ElectricBikeIcon from "@mui/icons-material/ElectricBike";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { VehicleInfo } from "../../api/clientApi";
import { useCreateVehicle, useUpdateVehicle } from "../../api/vehicles";
import { FormInput } from "../common/FormInput";
import { useAppAuth } from "../../contexts/useAppAuth";
import { vehicles_tab } from "../../constant/config";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  vehicle?: VehicleInfo | null;
  onSuccess?: (mode: "create" | "update") => void;
};

type SelectOption = {
  value: string;
  label: string;
};

const initialPlateForm = {
  user_code: "",
  vehicle_type: "",
  license_plate: "",
};

const initialNoPlateForm = {
  user_code: "",
  vehicle_type: "",
};

const getVehicleIcon = (type: string) => {
  if (type === "MOTORBIKE") return <TwoWheelerIcon fontSize="small" />;
  if (type === "ELECTRIC_BICYCLE") return <ElectricBikeIcon fontSize="small" />;
  return <PedalBikeIcon fontSize="small" />;
};

const VehicleRegistrationModal: React.FC<ModalProps> = ({
  open,
  onClose,
  vehicle,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const { user: currentUser } = useAppAuth();

  const currentUserCode = currentUser?.user_code ?? "";

  const { mutateAsync: createVehicle, isPending: isCreatingVehicle } =
    useCreateVehicle();

  const { mutateAsync: updateVehicle, isPending: isUpdatingVehicle } =
    useUpdateVehicle();

  const [activeTab, setActiveTab] = useState<
    typeof vehicles_tab.withPlate | typeof vehicles_tab.withoutPlate
  >(vehicles_tab.withPlate);

  const [formPlate, setFormPlate] = useState(initialPlateForm);
  const [formNoPlate, setFormNoPlate] = useState(initialNoPlateForm);

  const [formErrorsPlate, setFormErrorsPlate] = useState<
    Record<string, string>
  >({});
  const [formErrorsNoPlate, setFormErrorsNoPlate] = useState<
    Record<string, string>
  >({});

  const [submitError, setSubmitError] = useState("");

  const isEditing = Boolean(vehicle);
  const isSaving = isCreatingVehicle || isUpdatingVehicle;

  const fieldLabels = useMemo(
    () => ({
      user_code: t("vehicle.modal.fields.userCode"),
      vehicle_type: t("vehicle.modal.fields.vehicleType"),
      license_plate: t("vehicle.modal.fields.licensePlate"),
    }),
    [t],
  ) as Record<string, string>;

  const vehicleTypeOptions = useMemo<SelectOption[]>(
    () => [
      {
        value: "MOTORBIKE",
        label: t("vehicle.modal.types.motorbike"),
      },
      {
        value: "BICYCLE",
        label: t("vehicle.modal.types.bicycle"),
      },
      {
        value: "ELECTRIC_BICYCLE",
        label: t("vehicle.modal.types.electricBicycle"),
      },
    ],
    [t],
  );

  const getVehicleTypeOptionsForTab = (
    tab: typeof vehicles_tab.withPlate | typeof vehicles_tab.withoutPlate,
  ) => {
    if (tab === vehicles_tab.withPlate) {
      return vehicleTypeOptions.filter((option) => option.value !== "BICYCLE");
    }

    return vehicleTypeOptions.filter((option) => option.value !== "MOTORBIKE");
  };

  const activeVehicleTypeOptions = getVehicleTypeOptionsForTab(activeTab);

  const vehicleTypePlaceholder = t(
    "vehicle.modal.fields.vehicleTypePlaceholder",
    {
      defaultValue: "Chọn loại phương tiện",
    },
  );

  const licensePlatePlaceholder = t(
    "vehicle.modal.fields.licensePlatePlaceholder",
    {
      defaultValue: "VD: 30K12345",
    },
  );

  const getRequiredMessage = (field: string) =>
    t("validation.requiredField", {
      field: fieldLabels[field] ?? field,
    });

  const validateFields = (
    values: Record<string, string>,
    required: string[],
  ) => {
    const errors: Record<string, string> = {};

    required.forEach((field) => {
      if (!values[field] || !values[field].trim()) {
        errors[field] = getRequiredMessage(field);
      }
    });

    return errors;
  };

  const resetModalState = () => {
    setFormPlate({
      ...initialPlateForm,
      user_code: currentUserCode,
    });
    setFormNoPlate({
      ...initialNoPlateForm,
      user_code: currentUserCode,
    });
    setFormErrorsPlate({});
    setFormErrorsNoPlate({});
    setSubmitError("");
    setActiveTab(vehicles_tab.withPlate);
  };

  const handleClose = () => {
    resetModalState();
    onClose();
  };

  useEffect(() => {
    if (!open) return;

    if (vehicle) {
      const hasPlate = Boolean(vehicle.license_plate?.trim());

      setActiveTab(
        hasPlate ? vehicles_tab.withPlate : vehicles_tab.withoutPlate,
      );

      setFormPlate({
        user_code: vehicle.user_code ?? currentUserCode,
        vehicle_type: vehicle.vehicle_type ?? "",
        license_plate: vehicle.license_plate ?? "",
      });

      setFormNoPlate({
        user_code: vehicle.user_code ?? currentUserCode,
        vehicle_type: vehicle.vehicle_type ?? "",
      });

      return;
    }

    setFormPlate({
      ...initialPlateForm,
      user_code: currentUserCode,
    });

    setFormNoPlate({
      ...initialNoPlateForm,
      user_code: currentUserCode,
    });
  }, [currentUserCode, open, vehicle]);

  const handleChangeTab = (
    tab: typeof vehicles_tab.withPlate | typeof vehicles_tab.withoutPlate,
  ) => {
    if (isEditing) return;

    setActiveTab(tab);
    setSubmitError("");
    setFormErrorsPlate({});
    setFormErrorsNoPlate({});
  };

  const handlePlateSubmission = async (): Promise<boolean> => {
    const errors = validateFields(formPlate, [
      "user_code",
      "vehicle_type",
      "license_plate",
    ]);

    setFormErrorsPlate(errors);

    if (Object.keys(errors).length) {
      return false;
    }

    const payload = {
      user_code: formPlate.user_code,
      vehicle_type: formPlate.vehicle_type,
      license_plate: formPlate.license_plate.trim().toUpperCase(),
    };

    if (vehicle) {
      await updateVehicle({
        vehicleId: vehicle.id,
        payload,
      });
    } else {
      await createVehicle(payload);
    }

    return true;
  };

  const handleNoPlateSubmission = async (): Promise<boolean> => {
    const errors = validateFields(formNoPlate, ["user_code", "vehicle_type"]);

    setFormErrorsNoPlate(errors);

    if (Object.keys(errors).length) {
      return false;
    }

    const payload = {
      user_code: formNoPlate.user_code,
      vehicle_type: formNoPlate.vehicle_type,
    };

    if (vehicle) {
      await updateVehicle({
        vehicleId: vehicle.id,
        payload,
      });
    } else {
      await createVehicle(payload);
    }

    return true;
  };

  const handleSubmit = async () => {
    setSubmitError("");

    try {
      const success =
        activeTab === vehicles_tab.withPlate
          ? await handlePlateSubmission()
          : await handleNoPlateSubmission();

      if (!success) {
        return;
      }

      onSuccess?.(vehicle ? "update" : "create");
      resetModalState();
      onClose();

    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : (t("vehicle.modal.errors.generic") as string),
      );
    }
  };

  const renderVehicleTypeSelect = (
    value: string,
    onChange: (value: string) => void,
    error?: string,
  ) => (
    <Box className="vehicle-modal-field">
      <Typography component="label" className="vehicle-modal-label">
        {t("vehicle.modal.fields.vehicleType")}
        <span className="required">*</span>
      </Typography>

      <FormControl fullWidth error={Boolean(error)} size="small">
        <Select
          value={value}
          displayEmpty
          onChange={(event: SelectChangeEvent<string>) =>
            onChange(event.target.value)
          }
          className="vehicle-modal-select"
          renderValue={(selected) => {
            if (!selected) {
              return (
                <Typography
                  component="span"
                  className="vehicle-modal-placeholder"
                >
                  {vehicleTypePlaceholder}
                </Typography>
              );
            }

            const selectedOption = activeVehicleTypeOptions.find(
              (option) => option.value === selected,
            );

            return (
              <Stack direction="row" alignItems="center" spacing={1}>
                <Box className="vehicle-modal-select-icon">
                  {getVehicleIcon(selected)}
                </Box>
                <Typography component="span" fontWeight={600}>
                  {selectedOption?.label ?? selected}
                </Typography>
              </Stack>
            );
          }}
        >
          <MenuItem value="" disabled>
            <em>{vehicleTypePlaceholder}</em>
          </MenuItem>

          {activeVehicleTypeOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Box className="vehicle-modal-menu-icon">
                  {getVehicleIcon(option.value)}
                </Box>
                <Typography fontWeight={700}>{option.label}</Typography>
              </Stack>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {error && (
        <Typography variant="caption" color="error" sx={{ mt: 0.75 }}>
          {error}
        </Typography>
      )}
    </Box>
  );

  const currentForm =
    activeTab === vehicles_tab.withPlate ? formPlate : formNoPlate;

  const currentErrors =
    activeTab === vehicles_tab.withPlate ? formErrorsPlate : formErrorsNoPlate;

  return (
    <Dialog
      open={open}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        className: "vehicle-modal-paper",
      }}
    >
      <Box className="vehicle-modal-header">
        <Box>
          <Typography className="vehicle-modal-title" fontSize='1.25rem' fontWeight={600}>
            {isEditing
              ? t("vehicle.modal.editTitle", {
                  defaultValue: "Cập nhật phương tiện",
                })
              : t("vehicle.modal.title")}
          </Typography>

          <Typography className="vehicle-modal-subtitle">
            {t("vehicle.modal.subtitle", {
              defaultValue:
                "Chọn loại phương tiện và nhập thông tin cần thiết.",
            })}
          </Typography>
        </Box>
      </Box>

      <DialogContent className="vehicle-modal-content">
        <Box className="vehicle-modal-tabs">
          <button
            type="button"
            disabled={isEditing}
            className={
              activeTab === vehicles_tab.withPlate
                ? "vehicle-modal-tab active"
                : "vehicle-modal-tab"
            }
            onClick={() => handleChangeTab(vehicles_tab.withPlate)}
          >
            <span className="vehicle-modal-tab-icon-box">
              <TwoWheelerIcon fontSize="small" />
            </span>

            <span>
              <span className="vehicle-modal-tab-title">
                {t("vehicle.modal.tabs.withPlate")}
              </span>
            </span>
          </button>

          <button
            type="button"
            disabled={isEditing}
            className={
              activeTab === vehicles_tab.withoutPlate
                ? "vehicle-modal-tab active"
                : "vehicle-modal-tab"
            }
            onClick={() => handleChangeTab(vehicles_tab.withoutPlate)}
          >
            <span className="vehicle-modal-tab-icon-box">
              <QrCode2Icon fontSize="small" />
            </span>

            <span>
              <span className="vehicle-modal-tab-title">
                {t("vehicle.modal.tabs.withoutPlate")}
              </span>
            </span>
          </button>
        </Box>

        <Box className="vehicle-modal-panel">
          {renderVehicleTypeSelect(
            currentForm.vehicle_type,
            (value) => {
              if (activeTab === vehicles_tab.withPlate) {
                setFormPlate((prev) => ({
                  ...prev,
                  vehicle_type: value,
                }));
              } else {
                setFormNoPlate((prev) => ({
                  ...prev,
                  vehicle_type: value,
                }));
              }
            },
            currentErrors.vehicle_type,
          )}

          {activeTab === vehicles_tab.withPlate ? (
            <FormInput
              id="license_plate"
              containerClassName="vehicle-modal-field"
              label={t("vehicle.modal.fields.licensePlate")}
              requiredMarkerClassName="required"
              required
              value={formPlate.license_plate}
              onChange={(value) =>
                setFormPlate((prev) => ({
                  ...prev,
                  license_plate: value.toUpperCase(),
                }))
              }
              error={formErrorsPlate.license_plate}
              placeholder={licensePlatePlaceholder}
              inputClassName="plain-input vehicle-modal-input"
              requiredFirst={t("vehicle.modal.fields.licensePlate")}
            />
          ) : (
            <Alert
              severity="info"
              icon={<InfoOutlinedIcon fontSize="small" />}
              className="vehicle-modal-note"
            >
              {t("vehicle.modal.barcodeNote", {
                defaultValue:
                  "Phương tiện không có biển số sẽ được hệ thống tự động tạo barcode sau khi lưu.",
              })}
            </Alert>
          )}
        </Box>

        {submitError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {submitError}
          </Alert>
        )}
      </DialogContent>

      <DialogActions className="vehicle-modal-actions">
        <Button
          onClick={handleClose}
          disabled={isSaving}
          className="vehicle-modal-cancel-btn"
        >
          {t("vehicle.modal.cancel")}
        </Button>

        <Button
          variant="contained"
          disabled={isSaving}
          onClick={() => void handleSubmit()}
          className="vehicle-modal-submit-btn"
        >
          {isEditing
            ? t("vehicle.modal.save", {
                defaultValue: "Lưu thay đổi",
              })
            : t("vehicle.modal.submit")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VehicleRegistrationModal;
