import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import Ionicons from "@expo/vector-icons/Ionicons";

import ListScreen from "../component/ListScreen";
import PaginationBar from "../component/PaginationBar";
import type { AppStackParamList } from "../navigation/AppStack";
import type { VehicleInfo } from "../api/clientApi";
import {
  useCreateVehicle,
  useDeleteVehicle,
  useMyVehiclesPaginated,
  useUpdateVehicle,
} from "../api/vehicles";
import { useAuth } from "../auth/AuthContext";
import { showAppToast } from "../ultis/toast";
import VehicleFormModal, {
  VehicleForm,
  getVehicleTypeOptions,
  getVehicleTypeIcon,
} from "../component/vehicles/VehicleFormModal";

type Nav = NativeStackNavigationProp<AppStackParamList>;
type VehicleTab = "withPlate" | "withoutPlate";

const getShortId = (id?: string | null) => {
  if (!id) return "—";
  const text = String(id);
  if (text.length <= 14) return text;
  return `${text.slice(0, 8)}...${text.slice(-4)}`;
};

export default function VehiclesScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();

  const [tab, setTab] = useState<VehicleTab>("withPlate");
  const [licenseFilter, setLicenseFilter] = useState("");
  const [page, setPage] = useState(1);
  const limit = 5;

  const [modalVisible, setModalVisible] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<VehicleInfo | null>(
    null,
  );
  const [form, setForm] = useState<VehicleForm>({
    hasPlate: true,
    vehicle_type: "",
    license_plate: "",
  });
  const [formError, setFormError] = useState<string | null>(null);

  const {
    data: paginated,
    isLoading,
    isError,
  } = useMyVehiclesPaginated({
    page,
    limit,
    license_plate:
      tab === "withPlate" ? licenseFilter.trim() || undefined : undefined,
    has_plate: tab === "withPlate",
  });

  const createVehicleMutation = useCreateVehicle();
  const updateVehicleMutation = useUpdateVehicle();
  const deleteVehicleMutation = useDeleteVehicle();

  const vehicles = useMemo(() => paginated?.data ?? [], [paginated]);
  const total = paginated?.total ?? 0;

  const isSaving =
    createVehicleMutation.isPending || updateVehicleMutation.isPending;

  useEffect(() => {
    setPage(1);
  }, [licenseFilter, tab]);

  const resetForm = (hasPlate: boolean = tab === "withPlate") => {
    setForm({
      hasPlate,
      vehicle_type: "",
      license_plate: "",
    });
    setFormError(null);
  };

  const openCreateModal = () => {
    setEditingVehicle(null);
    resetForm(tab === "withPlate");
    setModalVisible(true);
  };

  const openEditModal = (vehicle: VehicleInfo) => {
    const hasPlate = Boolean(vehicle.license_plate?.trim());

    setEditingVehicle(vehicle);
    setForm({
      hasPlate,
      vehicle_type: vehicle.vehicle_type || "",
      license_plate: vehicle.license_plate || "",
    });
    setFormError(null);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingVehicle(null);
    resetForm(tab === "withPlate");
  };

  const updateForm = (key: keyof VehicleForm, value: string | boolean) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
      ...(key === "hasPlate"
        ? {
            vehicle_type: "",
            license_plate: "",
          }
        : null),
    }));
    setFormError(null);
  };

  const validateForm = () => {
    if (!user?.user_code) {
      setFormError(t("vehicles.form.missingUser"));
      return false;
    }

    if (!form.vehicle_type) {
      setFormError(t("vehicles.form.vehicleTypeRequired"));
      return false;
    }

    const options = getVehicleTypeOptions(form.hasPlate);

    if (!options.includes(form.vehicle_type as any)) {
      setFormError(t("vehicles.form.invalidVehicleType"));
      return false;
    }

    if (form.hasPlate && !form.license_plate.trim()) {
      setFormError(t("vehicles.form.licensePlateRequired"));
      return false;
    }

    return true;
  };

  const handleSaveVehicle = async () => {
    if (!validateForm() || !user?.user_code) return;

    const payload: {
      user_code: string;
      vehicle_type: string;
      license_plate?: string;
    } = {
      user_code: user.user_code,
      vehicle_type: form.vehicle_type,
    };

    if (form.hasPlate) {
      payload.license_plate = form.license_plate.trim().toUpperCase();
    }

    try {
      if (editingVehicle) {
        await updateVehicleMutation.mutateAsync({
          vehicleId: editingVehicle.id,
          payload,
        });

        showAppToast(t("vehicles.updateSuccess"), "success");
      } else {
        await createVehicleMutation.mutateAsync(payload);

        showAppToast(t("vehicles.createSuccess"), "success");
      }

      closeModal();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t("vehicles.saveFailed");

      setFormError(message);
      showAppToast(message, "error");
    }
  };
  const handleDelete = (vehicle: VehicleInfo) => {
    Alert.alert(
      t("vehicles.deleteConfirmTitle"),
      t("vehicles.deleteConfirmMessage"),
      [
        {
          text: t("common.cancel"),
          style: "cancel",
        },
        {
          text: t("vehicles.delete"),
          style: "destructive",
          onPress: async () => {
            try {
              await deleteVehicleMutation.mutateAsync({
                vehicleId: vehicle.id,
              });

              showAppToast(t("vehicles.deleteSuccess"), "success");
            } catch (error) {
              const message =
                error instanceof Error
                  ? error.message
                  : t("vehicles.deleteFailed");

              showAppToast(message, "error");
            }
          },
        },
      ],
    );
  };

  const goToPlan = () => {
    navigation.navigate("Tabs", { screen: "Plan" } as any);
  };

  return (
    <ListScreen
      title={t("vehicles.title")}
      subtitle={t("vehicles.subtitle")}
      loading={false}
      error={isError ? t("vehicles.loadError") : null}
      showBack
      onBack={() => navigation.goBack()}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        <View style={styles.actionPanel}>
          <TouchableOpacity
            style={styles.secondaryActionButton}
            activeOpacity={0.85}
            onPress={goToPlan}
          >
            <Ionicons name="pricetag-outline" size={18} color="#0f172a" />
            <Text style={styles.secondaryActionText}>
              {t("vehicles.registerPlan")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.primaryActionButton}
            activeOpacity={0.85}
            onPress={openCreateModal}
          >
            <Ionicons name="add" size={20} color="#ffffff" />
            <Text style={styles.primaryActionText}>
              {t("vehicles.addVehicle")}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filterCard}>
          <View style={styles.tabRow}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                tab === "withPlate" && styles.tabButtonActive,
              ]}
              activeOpacity={0.85}
              onPress={() => setTab("withPlate")}
            >
              <Ionicons
                name="bicycle"
                size={16}
                color={tab === "withPlate" ? "#15803d" : "#64748b"}
              />
              <Text
                style={[
                  styles.tabText,
                  tab === "withPlate" && styles.tabTextActive,
                ]}
              >
                {t("vehicles.withPlate")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabButton,
                tab === "withoutPlate" && styles.tabButtonActive,
              ]}
              activeOpacity={0.85}
              onPress={() => setTab("withoutPlate")}
            >
              <Ionicons
                name="qr-code-outline"
                size={16}
                color={tab === "withoutPlate" ? "#15803d" : "#64748b"}
              />
              <Text
                style={[
                  styles.tabText,
                  tab === "withoutPlate" && styles.tabTextActive,
                ]}
              >
                {t("vehicles.withoutPlate")}
              </Text>
            </TouchableOpacity>
          </View>

          {tab === "withPlate" ? (
            <View style={styles.searchBox}>
              <Ionicons name="search-outline" size={17} color="#64748b" />
              <TextInput
                style={styles.searchInput}
                placeholder={t("vehicles.searchPlatePlaceholder")}
                placeholderTextColor="#94a3b8"
                value={licenseFilter}
                onChangeText={setLicenseFilter}
                autoCapitalize="characters"
              />

              {licenseFilter ? (
                <TouchableOpacity
                  onPress={() => setLicenseFilter("")}
                  activeOpacity={0.85}
                >
                  <Ionicons name="close-circle" size={18} color="#94a3b8" />
                </TouchableOpacity>
              ) : null}
            </View>
          ) : null}
        </View>

        {isLoading ? (
          <View style={styles.stateCard}>
            <ActivityIndicator color="#43B14B" />
            <Text style={styles.stateText}>{t("common.loading")}</Text>
          </View>
        ) : vehicles.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="car-outline" size={38} color="#94a3b8" />
            <Text style={styles.emptyTitle}>{t("vehicles.empty")}</Text>
            <Text style={styles.emptyDesc}>{t("vehicles.emptyDesc")}</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {vehicles.map((vehicle) => {
              const hasPlate = Boolean(vehicle.license_plate?.trim());

              return (
                <View key={vehicle.id} style={styles.vehicleCard}>
                  <View style={styles.vehicleHeader}>
                    <View style={styles.vehicleIconBox}>
                      <Ionicons
                        name={getVehicleTypeIcon(vehicle.vehicle_type) as any}
                        size={22}
                        color="#43B14B"
                      />
                    </View>

                    <View style={styles.vehicleTitleBox}>
                      <Text style={styles.vehicleTitle} numberOfLines={1}>
                        {t(
                          `vehicles.types.${String(vehicle.vehicle_type).toLowerCase()}`,
                          {
                            defaultValue: vehicle.vehicle_type || "—",
                          },
                        )}
                      </Text>

                      <Text style={styles.vehicleSubText} numberOfLines={1}>
                        {hasPlate
                          ? vehicle.license_plate
                          : t("vehicles.autoBarcode")}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.vehicleBadge,
                        hasPlate ? styles.plateBadge : styles.barcodeBadge,
                      ]}
                    >
                      <Text
                        style={[
                          styles.vehicleBadgeText,
                          hasPlate
                            ? styles.plateBadgeText
                            : styles.barcodeBadgeText,
                        ]}
                      >
                        {hasPlate
                          ? t("vehicles.withPlate")
                          : t("vehicles.withoutPlate")}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.metaRow}>
                    <Text style={styles.metaLabel}>
                      {t("vehicles.vehicleId")}
                    </Text>
                    <Text style={styles.metaValue}>
                      {getShortId(vehicle.id)}
                    </Text>
                  </View>

                  <View style={styles.metaRow}>
                    <Text style={styles.metaLabel}>
                      {t("vehicles.createdAt")}
                    </Text>
                    <Text style={styles.metaValue}>
                      {vehicle.created_at
                        ? new Date(vehicle.created_at).toLocaleDateString()
                        : "—"}
                    </Text>
                  </View>

                  {!hasPlate && vehicle.qr_code ? (
                    <View style={styles.qrBox}>
                      <Image
                        source={{ uri: vehicle.qr_code }}
                        style={styles.qr}
                        resizeMode="contain"
                      />
                    </View>
                  ) : null}

                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => openEditModal(vehicle)}
                      activeOpacity={0.85}
                    >
                      <Ionicons
                        name="create-outline"
                        size={17}
                        color="#2563eb"
                      />
                      <Text style={styles.editButtonText}>
                        {t("vehicles.edit")}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDelete(vehicle)}
                      activeOpacity={0.85}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={17}
                        color="#dc2626"
                      />
                      <Text style={styles.deleteButtonText}>
                        {t("vehicles.delete")}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}

            <PaginationBar
              page={page}
              limit={limit}
              total={total}
              onChangePage={setPage}
            />
          </View>
        )}
      </ScrollView>

      <VehicleFormModal
        visible={modalVisible}
        editing={Boolean(editingVehicle)}
        form={form}
        error={formError}
        saving={isSaving}
        onClose={closeModal}
        onSave={handleSaveVehicle}
        onChange={updateForm}
      />
    </ListScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    paddingBottom: 18,
  },

  actionPanel: {
    flexDirection: "row",
    gap: 10,
  },
  secondaryActionButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 6,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 7,
  },
  secondaryActionText: {
    fontSize: 13,
    fontWeight: "900",
    color: "#0f172a",
  },
  primaryActionButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 6,
    backgroundColor: "#43B14B",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 7,
  },
  primaryActionText: {
    fontSize: 13,
    fontWeight: "900",
    color: "#ffffff",
  },

  filterCard: {
    padding: 14,
    borderRadius: 6,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  tabRow: {
    flexDirection: "row",
    gap: 8,
  },
  tabButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 6,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  tabButtonActive: {
    backgroundColor: "#dcfce7",
    borderColor: "#86efac",
  },
  tabText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#64748b",
  },
  tabTextActive: {
    color: "#15803d",
  },
  searchBox: {
    marginTop: 12,
    minHeight: 46,
    borderRadius: 6,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    color: "#0f172a",
  },

  stateCard: {
    minHeight: 160,
    padding: 24,
    borderRadius: 6,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  stateText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748b",
  },
  emptyCard: {
    minHeight: 190,
    padding: 24,
    borderRadius: 6,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: "900",
    color: "#334155",
    textAlign: "center",
  },
  emptyDesc: {
    marginTop: 5,
    fontSize: 13,
    fontWeight: "600",
    color: "#64748b",
    lineHeight: 19,
    textAlign: "center",
  },

  list: {
    gap: 12,
  },
  vehicleCard: {
    padding: 15,
    borderRadius: 6,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#0f172a",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 2,
  },
  vehicleHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },
  vehicleIconBox: {
    width: 46,
    height: 46,
    borderRadius: 6,
    backgroundColor: "#f0fdf4",
    alignItems: "center",
    justifyContent: "center",
  },
  vehicleTitleBox: {
    flex: 1,
  },
  vehicleTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#0f172a",
  },
  vehicleSubText: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: "700",
    color: "#64748b",
  },
  vehicleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
  },
  vehicleBadgeText: {
    fontSize: 10.5,
    fontWeight: "900",
  },
  plateBadge: {
    backgroundColor: "#eff6ff",
    borderColor: "#bfdbfe",
  },
  plateBadgeText: {
    color: "#2563eb",
  },
  barcodeBadge: {
    backgroundColor: "#fef3c7",
    borderColor: "#fde68a",
  },
  barcodeBadgeText: {
    color: "#b45309",
  },
  divider: {
    height: 1,
    backgroundColor: "#f1f5f9",
    marginVertical: 13,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 7,
  },
  metaLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748b",
  },
  metaValue: {
    flexShrink: 1,
    fontSize: 12,
    fontWeight: "800",
    color: "#0f172a",
    textAlign: "right",
  },
  qrBox: {
    marginTop: 8,
    alignItems: "center",
    padding: 12,
    borderRadius: 6,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  qr: {
    width: 120,
    height: 120,
  },
  cardActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  editButton: {
    flex: 1,
    height: 42,
    borderRadius: 6,
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  editButtonText: {
    fontSize: 13,
    fontWeight: "900",
    color: "#2563eb",
  },
  deleteButton: {
    flex: 1,
    height: 42,
    borderRadius: 6,
    backgroundColor: "#fff1f2",
    borderWidth: 1,
    borderColor: "#fecdd3",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  deleteButtonText: {
    fontSize: 13,
    fontWeight: "900",
    color: "#dc2626",
  },
});
