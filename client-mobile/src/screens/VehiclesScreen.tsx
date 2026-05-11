import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import ScreenShell from "../component/ScreenShell";
import { useMyVehiclesPaginated } from "../api/vehicles";
import { useDeleteVehicle, useUpdateVehicle } from "../api/vehicles";
import FormInput from "../component/FormInput";
import type { VehicleInfo } from "../api/clientApi";
import type { AppStackParamList } from "../navigation/AppStack";
import PaginationBar from "../component/PaginationBar";

const VEHICLE_TYPES = ["MOTORBIKE", "BICYCLE", "ELECTRIC_BICYCLE"] as const;
type Nav = NativeStackNavigationProp<AppStackParamList>;

export default function VehiclesScreen() {
  const navigation = useNavigation<Nav>();
  const [userCodeFilter, setUserCodeFilter] = useState("");
  const [licenseFilter, setLicenseFilter] = useState("");
  const [tab, setTab] = useState<"withPlate" | "withoutPlate">("withPlate");
  const [page, setPage] = useState(1);
  const limit = 5;
  const { data: paginated, isLoading, isError } = useMyVehiclesPaginated({
    page,
    limit,
    user_code: userCodeFilter.trim() || undefined,
    license_plate: licenseFilter.trim() || undefined,
    has_plate: tab === "withPlate",
  });
  const vehicles = paginated?.data ?? [];
  const total = paginated?.total ?? 0;
  const updateVehicle = useUpdateVehicle();
  const deleteVehicle = useDeleteVehicle();
  const [editingVehicle, setEditingVehicle] = useState<VehicleInfo | null>(null);
  const [editVehicleType, setEditVehicleType] = useState("");
  const [editLicensePlate, setEditLicensePlate] = useState("");
  const [editError, setEditError] = useState<string | null>(null);

  useEffect(() => {
    setPage(1);
  }, [userCodeFilter, licenseFilter, tab]);

  const openEditModal = (vehicle: VehicleInfo) => {
    setEditError(null);
    setEditingVehicle(vehicle);
    setEditVehicleType(vehicle.vehicle_type ?? "");
    setEditLicensePlate(vehicle.license_plate ?? "");
  };

  const closeEditModal = () => {
    setEditError(null);
    setEditingVehicle(null);
    setEditVehicleType("");
    setEditLicensePlate("");
  };

  const handleSaveEdit = async () => {
    if (!editingVehicle) return;
    const hasPlate = Boolean(editingVehicle.license_plate?.trim());
    const vehicleType = editVehicleType.trim();
    if (!vehicleType) {
      setEditError("Vehicle type is required.");
      return;
    }
    if (!VEHICLE_TYPES.includes(vehicleType as (typeof VEHICLE_TYPES)[number])) {
      setEditError("Invalid vehicle type.");
      return;
    }

    const licensePlateValue = hasPlate ? editLicensePlate.trim() : "";
    if (hasPlate && !licensePlateValue) {
      setEditError("License plate is required.");
      return;
    }

    setEditError(null);
    try {
      await updateVehicle.mutateAsync({
        vehicleId: editingVehicle.id,
        payload: {
          user_code: editingVehicle.user_code ?? "",
          vehicle_type: vehicleType,
          license_plate: licensePlateValue,
          qr_code: editingVehicle.qr_code ?? null,
        },
      });
      closeEditModal();
    } catch (error) {
      setEditError(error instanceof Error ? error.message : "Unable to update vehicle.");
    }
  };

  const handleDelete = (vehicle: VehicleInfo) => {
    Alert.alert("Delete vehicle", "Are you sure you want to delete this vehicle?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteVehicle.mutateAsync({ vehicleId: vehicle.id });
          } catch {
            // ignore UI toast for now
          }
        },
      },
    ]);
  };

  return (
    <ScreenShell>
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Vehicles</Text>
          <Pressable
            style={[styles.registerPlanButton, vehicles.length === 0 && styles.registerPlanButtonDisabled]}
            disabled={vehicles.length === 0}
            onPress={() => navigation.navigate("PlanCheckout")}
          >
            <Text style={styles.registerPlanButtonText}>Register plan</Text>
          </Pressable>
        </View>

        <View style={styles.tabs}>
          <Pressable
            style={[styles.tab, tab === "withPlate" && styles.tabActive]}
            onPress={() => setTab("withPlate")}
          >
            <Text>With plate</Text>
          </Pressable>
          <Pressable
            style={[styles.tab, tab === "withoutPlate" && styles.tabActive]}
            onPress={() => setTab("withoutPlate")}
          >
            <Text>Without plate</Text>
          </Pressable>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Search by user code"
          value={userCodeFilter}
          onChangeText={setUserCodeFilter}
        />
        <TextInput
          style={styles.input}
          placeholder="Search by license plate"
          value={licenseFilter}
          onChangeText={setLicenseFilter}
        />

        {isLoading ? (
          <ActivityIndicator />
        ) : isError ? (
          <Text style={styles.error}>Failed to load vehicles.</Text>
        ) : (
          <ScrollView contentContainerStyle={styles.list}>
            {vehicles.map((vehicle) => (
              <View key={vehicle.id} style={styles.item}>
                <Text style={styles.label}>
                  User code:{" "}
                  <Text style={styles.value}>{vehicle.user_code || "-"}</Text>
                </Text>
                <Text style={styles.label}>
                  Type: <Text style={styles.value}>{vehicle.vehicle_type}</Text>
                </Text>
                <Text style={styles.label}>
                  Plate:{" "}
                  <Text style={styles.value}>
                    {vehicle.license_plate || "-"}
                  </Text>
                </Text>
                <Text style={styles.label}>
                  Created:{" "}
                  <Text style={styles.value}>
                    {new Date(vehicle.created_at).toLocaleDateString()}
                  </Text>
                </Text>
                {!vehicle.license_plate && vehicle.qr_code ? (
                  <Image
                    source={{ uri: vehicle.qr_code }}
                    style={styles.qr}
                    resizeMode="contain"
                  />
                ) : null}

                <View style={styles.actionsRow}>
                  <Pressable style={[styles.actionButton, styles.actionEdit]} onPress={() => openEditModal(vehicle)}>
                    <Text style={styles.actionText}>Edit</Text>
                  </Pressable>
                  <Pressable style={[styles.actionButton, styles.actionDelete]} onPress={() => handleDelete(vehicle)}>
                    <Text style={styles.actionText}>Delete</Text>
                  </Pressable>
                </View>
              </View>
            ))}
            <PaginationBar page={page} limit={limit} total={total} onChangePage={setPage} />
          </ScrollView>
        )}
      </View>

      <Modal
        visible={Boolean(editingVehicle)}
        transparent
        animationType="fade"
        onRequestClose={closeEditModal}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit vehicle</Text>
            <FormInput
              label="Vehicle type (MOTORBIKE/BICYCLE/ELECTRIC_BICYCLE)"
              value={editVehicleType}
              onChangeText={setEditVehicleType}
              placeholder="e.g. MOTORBIKE"
            />
            {editingVehicle && editingVehicle.license_plate?.trim() ? (
              <FormInput
                label="License plate"
                value={editLicensePlate}
                onChangeText={setEditLicensePlate}
                placeholder="e.g. 30K12345"
              />
            ) : null}

            {!!editError ? <Text style={styles.modalError}>{editError}</Text> : null}

            <View style={styles.modalActions}>
              <Pressable style={[styles.modalButton, styles.modalCancel]} onPress={closeEditModal}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalSave]}
                onPress={handleSaveEdit}
                disabled={updateVehicle.isPending}
              >
                {updateVehicle.isPending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalButtonTextOnPrimary}>Save</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: "#fff", borderRadius: 20, padding: 20, flex: 1 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 12,
  },
  registerPlanButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "#2563eb",
  },
  registerPlanButtonDisabled: { backgroundColor: "#93c5fd" },
  registerPlanButtonText: { color: "#fff", fontWeight: "900" },
  tabs: { flexDirection: "row", gap: 8, marginBottom: 12 },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
  },
  tabActive: { backgroundColor: "#dbeafe" },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },
  list: { gap: 12, paddingTop: 8 },
  item: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 16,
    padding: 14,
  },
  label: { color: "#374151", marginBottom: 6 },
  value: { color: "#111827", fontWeight: "600" },
  qr: { width: 120, height: 120, marginTop: 8 },
  error: { color: "#dc2626" },
  actionsRow: { flexDirection: "row", gap: 10, marginTop: 10 },
  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  actionEdit: { backgroundColor: "#e0f2fe" },
  actionDelete: { backgroundColor: "#fee2e2" },
  actionText: { fontWeight: "700", color: "#111827" },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: 18,
  },
  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: "800", marginBottom: 12, color: "#111827" },
  modalError: { color: "#dc2626", fontWeight: "600", marginTop: 8 },
  modalActions: { flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 12 },
  modalButton: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12 },
  modalCancel: { backgroundColor: "#f3f4f6" },
  modalSave: { backgroundColor: "#2563eb" },
  modalButtonText: { color: "#111827", fontWeight: "800" },
  modalButtonTextOnPrimary: { color: "#ffffff", fontWeight: "800" },
});
