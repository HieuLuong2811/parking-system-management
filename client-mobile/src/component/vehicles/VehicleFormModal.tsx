import React from "react";
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";
import Ionicons from "@expo/vector-icons/Ionicons";
import FormInput from "../FormInput";

export type VehicleForm = {
  hasPlate: boolean;
  vehicle_type: string;
  license_plate: string;
};

const WITH_PLATE_TYPES = ["MOTORBIKE", "ELECTRIC_BICYCLE"];
const WITHOUT_PLATE_TYPES = ["BICYCLE", "ELECTRIC_BICYCLE"];

export const getVehicleTypeOptions = (hasPlate: boolean) => {
  return hasPlate ? WITH_PLATE_TYPES : WITHOUT_PLATE_TYPES;
};

export const getVehicleTypeIcon = (type?: string | null) => {
  const normalized = String(type || "").toUpperCase();

  if (normalized === "MOTORBIKE") return "bicycle";
  if (normalized === "ELECTRIC_BICYCLE") return "flash";
  if (normalized === "BICYCLE") return "bicycle-outline";

  return "car-outline";
};

type VehicleFormModalProps = {
  visible: boolean;
  editing: boolean;
  form: VehicleForm;
  error: string | null;
  saving: boolean;
  onClose: () => void;
  onSave: () => void;
  onChange: (key: keyof VehicleForm, value: string | boolean) => void;
};

export default function VehicleFormModal({
  visible,
  editing,
  form,
  error,
  saving,
  onClose,
  onSave,
  onChange,
}: VehicleFormModalProps) {
  const { t } = useTranslation();

  const typeOptions = getVehicleTypeOptions(form.hasPlate);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.modalTitle}>
                {editing
                  ? t("vehicles.modal.editTitle")
                  : t("vehicles.modal.createTitle")}
              </Text>

              <Text style={styles.modalSubtitle}>
                {t("vehicles.modal.subtitle")}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={onClose}
              activeOpacity={0.85}
            >
              <Ionicons name="close" size={20} color="#0f172a" />
            </TouchableOpacity>
          </View>

          {!editing ? (
            <View style={styles.modalTabs}>
              <TouchableOpacity
                style={[
                  styles.modalTab,
                  form.hasPlate && styles.modalTabActive,
                ]}
                onPress={() => onChange("hasPlate", true)}
                activeOpacity={0.85}
              >
                <Ionicons
                  name="bicycle"
                  size={16}
                  color={form.hasPlate ? "#15803d" : "#64748b"}
                />
                <Text
                  style={[
                    styles.modalTabText,
                    form.hasPlate && styles.modalTabTextActive,
                  ]}
                >
                  {t("vehicles.withPlate")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalTab,
                  !form.hasPlate && styles.modalTabActive,
                ]}
                onPress={() => onChange("hasPlate", false)}
                activeOpacity={0.85}
              >
                <Ionicons
                  name="qr-code-outline"
                  size={16}
                  color={!form.hasPlate ? "#15803d" : "#64748b"}
                />
                <Text
                  style={[
                    styles.modalTabText,
                    !form.hasPlate && styles.modalTabTextActive,
                  ]}
                >
                  {t("vehicles.withoutPlate")}
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}

          <Text style={styles.fieldLabel}>
            {t("vehicles.form.vehicleType")}
          </Text>

          <View style={styles.typeGrid}>
            {typeOptions.map((type) => {
              const selected = form.vehicle_type === type;

              return (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeOption,
                    selected && styles.typeOptionActive,
                  ]}
                  onPress={() => onChange("vehicle_type", type)}
                  activeOpacity={0.85}
                >
                  <Ionicons
                    name={getVehicleTypeIcon(type) as any}
                    size={18}
                    color={selected ? "#15803d" : "#64748b"}
                  />

                  <Text
                    style={[
                      styles.typeOptionText,
                      selected && styles.typeOptionTextActive,
                    ]}
                  >
                    {t(`vehicles.types.${type.toLowerCase()}`, {
                      defaultValue: type,
                    })}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {form.hasPlate ? (
            <FormInput
              label={t("vehicles.form.licensePlate")}
              required
              value={form.license_plate}
              onChangeText={(value) =>
                onChange("license_plate", value.toUpperCase())
              }
              placeholder={t("vehicles.form.licensePlatePlaceholder")}
              autoCapitalize="characters"
            />
          ) : (
            <View style={styles.barcodeNote}>
              <Ionicons
                name="information-circle-outline"
                size={18}
                color="#2563eb"
              />
              <Text style={styles.barcodeNoteText}>
                {t("vehicles.form.barcodeNote")}
              </Text>
            </View>
          )}

          {!!error ? <Text style={styles.modalError}>{error}</Text> : null}

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              activeOpacity={0.85}
            >
              <Text style={styles.cancelButtonText}>
                {t("common.cancel")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={onSave}
              disabled={saving}
              activeOpacity={0.85}
            >
              {saving ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Ionicons name="save-outline" size={18} color="#ffffff" />
                  <Text style={styles.saveButtonText}>
                    {editing
                      ? t("vehicles.modal.save")
                      : t("vehicles.modal.create")}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "center",
    padding: 18,
  },
  modalCard: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 16,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: "900",
    color: "#0f172a",
  },
  modalSubtitle: {
    marginTop: 4,
    fontSize: 12.5,
    fontWeight: "600",
    color: "#64748b",
    lineHeight: 18,
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 13,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  modalTabs: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  modalTab: {
    flex: 1,
    minHeight: 42,
    borderRadius: 999,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  modalTabActive: {
    backgroundColor: "#dcfce7",
    borderColor: "#86efac",
  },
  modalTabText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#64748b",
  },
  modalTabTextActive: {
    color: "#15803d",
  },
  fieldLabel: {
    marginBottom: 8,
    fontSize: 13,
    fontWeight: "900",
    color: "#334155",
  },
  typeGrid: {
    gap: 9,
    marginBottom: 14,
  },
  typeOption: {
    minHeight: 44,
    borderRadius: 15,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    paddingHorizontal: 12,
  },
  typeOptionActive: {
    backgroundColor: "#f0fdf4",
    borderColor: "#86efac",
  },
  typeOptionText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#475569",
  },
  typeOptionTextActive: {
    color: "#15803d",
    fontWeight: "900",
  },
  barcodeNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 12,
    borderRadius: 16,
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
    marginBottom: 12,
  },
  barcodeNoteText: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: "700",
    color: "#1d4ed8",
    lineHeight: 18,
  },
  modalError: {
    marginTop: 2,
    marginBottom: 10,
    fontSize: 12.5,
    fontWeight: "700",
    color: "#dc2626",
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    height: 46,
    borderRadius: 15,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    fontSize: 13.5,
    fontWeight: "900",
    color: "#0f172a",
  },
  saveButton: {
    flex: 1.4,
    height: 46,
    borderRadius: 15,
    backgroundColor: "#43B14B",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 7,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    fontSize: 13.5,
    fontWeight: "900",
    color: "#ffffff",
  },
});