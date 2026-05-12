import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useTranslation } from "react-i18next";
import Ionicons from "@expo/vector-icons/Ionicons";

import { useParkingSessions } from "../api/parking_sessions";
import ListScreen from "../component/ListScreen";
import { getParkingStatusColor } from "../ultis/status";
import { formatCurrency, formatDate, toDateKey, toEndOfDay, toStartOfDay } from "../ultis/format";

type DatePickerTarget = "from" | "to";

const getVehicleType = (session: any, fallback: string) => {
  return (
    session.vehicle_type ||
    fallback
  );
};

const getLicensePlate = (session: any) => {
  return session.license_plate || session.vehicle?.license_plate;
};

export default function ParkingSessionsScreen() {
  const { t } = useTranslation();

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);
  const [datePickerTarget, setDatePickerTarget] =
    useState<DatePickerTarget | null>(null);

  const limit = 5;

  const {
    data: paginated,
    isLoading,
    isError,
  } = useParkingSessions({
    page,
    limit,
    from_time: toStartOfDay(fromDate),
    to_time: toEndOfDay(toDate),
  });

  useEffect(() => {
    setPage(1);
  }, [fromDate, toDate]);

  const rows = useMemo(() => paginated?.data ?? [], [paginated]);
  const total = paginated?.total ?? 0;

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const canPrev = page > 1;
  const canNext = page < totalPages;

  const startItem = total === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  const hasFilter = Boolean(fromDate || toDate);

  const selectedPickerDate = useMemo(() => {
    if (datePickerTarget === "from" && fromDate) {
      return new Date(fromDate);
    }

    if (datePickerTarget === "to" && toDate) {
      return new Date(toDate);
    }

    return new Date();
  }, [datePickerTarget, fromDate, toDate]);

  const handleChangeDate = (
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    if (Platform.OS === "android") {
      setDatePickerTarget(null);
    }

    if (event.type === "dismissed" || !selectedDate || !datePickerTarget) {
      return;
    }

    const value = toDateKey(selectedDate);

    if (datePickerTarget === "from") {
      setFromDate(value);
      return;
    }

    setToDate(value);
  };

  const clearFilters = () => {
    setFromDate("");
    setToDate("");
    setPage(1);
  };

  return (
    <ListScreen
      title={t("parkingHistory.title")}
      subtitle={t("parkingHistory.subtitle")}
      loading={false}
      error={isError ? t("parkingHistory.loadError") : null}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        <View style={styles.filterCard}>
          <View style={styles.filterHeader}>
            <View style={styles.filterIconBox}>
              <Ionicons name="filter-outline" size={16} color="#2563eb" />
            </View>

            <Text style={styles.filterTitle}>{t("parkingHistory.filter")}</Text>

            {hasFilter && (
              <TouchableOpacity
                onPress={clearFilters}
                activeOpacity={0.85}
                style={styles.clearFilterBtn}
              >
                <Text style={styles.clearFilterText}>
                  {t("parkingHistory.clearFilters")}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.dateRow}>
            <TouchableOpacity
              style={styles.dateButton}
              activeOpacity={0.85}
              onPress={() => setDatePickerTarget("from")}
            >
              <Text style={styles.dateLabel}>
                {t("parkingHistory.fromDate")}
              </Text>
              <View style={styles.dateValueRow}>
                <Text
                  style={[
                    styles.dateValue,
                    !fromDate && styles.datePlaceholder,
                  ]}
                >
                  {fromDate
                    ? formatDate(fromDate)
                    : t("parkingHistory.selectDate")}
                </Text>
                <Ionicons name="calendar-outline" size={15} color="#64748b" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dateButton}
              activeOpacity={0.85}
              onPress={() => setDatePickerTarget("to")}
            >
              <Text style={styles.dateLabel}>{t("parkingHistory.toDate")}</Text>
              <View style={styles.dateValueRow}>
                <Text
                  style={[styles.dateValue, !toDate && styles.datePlaceholder]}
                >
                  {toDate ? formatDate(toDate) : t("parkingHistory.selectDate")}
                </Text>
                <Ionicons name="calendar-outline" size={15} color="#64748b" />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {datePickerTarget && (
          <DateTimePicker
            value={selectedPickerDate}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={handleChangeDate}
          />
        )}

        {isLoading ? (
          <View style={styles.stateCard}>
            <ActivityIndicator color="#2563eb" />
            <Text style={styles.stateText}>{t("parkingHistory.loading")}</Text>
          </View>
        ) : rows.length === 0 ? (
          <View style={styles.stateCard}>
            <Ionicons name="file-tray-outline" size={34} color="#64748b" />
            <Text style={styles.stateTitle}>{t("parkingHistory.empty")}</Text>
          </View>
        ) : (
          <View style={styles.sessionList}>
            {rows.map((session: any) => (
              <ParkingSessionCard
                key={session.id}
                vehicleType={getVehicleType(
                  session,
                  t("parkingHistory.unknownVehicle"),
                )}
                licensePlate={getLicensePlate(
                  session
                )}
                status={session.status}
                checkInTime={formatDate(session.check_in_time)}
                checkOutTime={
                  session.check_out_time
                    ? formatDate(session.check_out_time)
                    : t("parkingHistory.notYet")
                }
                amount={formatCurrency(session.total_amount)}
              />
            ))}
          </View>
        )}

        <View style={styles.paginationCard}>
          <View style={styles.paginationRow}>
            <TouchableOpacity
              disabled={!canPrev}
              style={[styles.pageButton, !canPrev && styles.pageButtonDisabled]}
              onPress={() => setPage((current) => Math.max(1, current - 1))}
              activeOpacity={0.85}
            >
              <Ionicons name="chevron-back" size={16} color="#ffffff" />
              <Text style={styles.pageButtonText}>
                {t("parkingHistory.prev")}
              </Text>
            </TouchableOpacity>

            <Text style={styles.pageIndicator}>
              {t("parkingHistory.pageOf", {
                page,
                totalPages,
              })}
            </Text>

            <TouchableOpacity
              disabled={!canNext}
              style={[styles.pageButton, !canNext && styles.pageButtonDisabled]}
              onPress={() =>
                setPage((current) => Math.min(totalPages, current + 1))
              }
              activeOpacity={0.85}
            >
              <Text style={styles.pageButtonText}>
                {t("parkingHistory.next")}
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#ffffff" />
            </TouchableOpacity>
          </View>

          <Text style={styles.pageMeta}>
            {t("parkingHistory.showingRange", {
              from: startItem,
              to: endItem,
              total,
            })}
          </Text>
        </View>
      </ScrollView>
    </ListScreen>
  );
}

function ParkingSessionCard({
  vehicleType,
  licensePlate,
  status,
  checkInTime,
  checkOutTime,
  amount,
}: {
  vehicleType: string;
  licensePlate: string;
  status?: string | null;
  checkInTime: string;
  checkOutTime: string;
  amount: string;
}) {
  const { t } = useTranslation();
  const statusColor = getParkingStatusColor(status);
  console.log(vehicleType);
  return (
    <View style={styles.sessionCard}>
      <View
        style={[
          styles.topAccent,
          {
            backgroundColor: statusColor.dot,
          },
        ]}
      />

      <View style={styles.sessionHeader}>
        <View style={styles.vehicleBox}>
          <Text numberOfLines={1} style={styles.vehicleTitle}>
            {t(`common.vehicleType.${vehicleType.toLocaleLowerCase()}`)} {licensePlate == null ? " " : '- ' + licensePlate}
          </Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: statusColor.bg,
              borderColor: statusColor.border,
            },
          ]}
        >
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor: statusColor.dot,
              },
            ]}
          />

          <Text
            numberOfLines={1}
            style={[
              styles.statusText,
              {
                color: statusColor.text,
              },
            ]}
          >
            {t(`parkingHistory.status.${(status)?.toLocaleLowerCase()}`)}
          </Text>
        </View>
      </View>

      <View style={styles.infoList}>
        <InfoRow
          icon="time-outline"
          label={t("parkingHistory.checkIn")}
          value={checkInTime}
        />

        <InfoRow
          icon="log-out-outline"
          label={t("parkingHistory.checkOut")}
          value={checkOutTime}
        />

        <InfoRow
          icon="cash-outline"
          label={t("parkingHistory.amount")}
          value={amount}
        />
      </View>
    </View>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoLeft}>
        <Ionicons name={icon} size={15} color="#64748b" />
        <Text style={styles.infoLabel}>{label}:</Text>
      </View>

      <Text numberOfLines={1} style={styles.infoValue}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    paddingBottom: 18,
  },

  filterCard: {
    backgroundColor: "#ffffff",
    borderRadius: 6,
    padding: 13,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  filterHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  filterIconBox: {
    width: 30,
    height: 30,
    borderRadius: 6,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
  },
  filterTitle: {
    flex: 1,
    color: "#0f172a",
    fontWeight: "900",
    fontSize: 14,
  },
  clearFilterBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#f1f5f9",
  },
  clearFilterText: {
    fontSize: 11.5,
    fontWeight: "900",
    color: "#475569",
  },

  dateRow: {
    flexDirection: "row",
    gap: 10,
  },
  dateButton: {
    flex: 1,
    minHeight: 58,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#dbeafe",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 11,
    paddingVertical: 9,
    justifyContent: "center",
  },
  dateLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748b",
  },
  dateValueRow: {
    marginTop: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dateValue: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: "900",
    color: "#0f172a",
  },
  datePlaceholder: {
    color: "#94a3b8",
  },

  sessionList: {
    gap: 12,
  },
  sessionCard: {
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#ffffff",
    borderRadius: 6,
    padding: 13,
    borderWidth: 1,
    borderColor: "#dbe3ef",
    shadowColor: "#0f172a",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  topAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  sessionHeader: {
    marginTop: 3,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  vehicleBox: {
    flex: 1,
  },
  vehicleTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#0f172a",
  },

  statusBadge: {
    maxWidth: 112,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10.5,
    fontWeight: "900",
  },

  infoList: {
    marginTop: 12,
    gap: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  infoLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  infoLabel: {
    fontSize: 12.5,
    fontWeight: "800",
    color: "#475569",
  },
  infoValue: {
    flex: 1,
    textAlign: "right",
    fontSize: 12.5,
    fontWeight: "900",
    color: "#0f172a",
  },

  stateCard: {
    minHeight: 160,
    backgroundColor: "#ffffff",
    borderRadius: 6,
    padding: 18,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
  },
  stateTitle: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "900",
    color: "#0f172a",
    textAlign: "center",
  },
  stateText: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: "700",
    color: "#64748b",
    textAlign: "center",
  },

  paginationCard: {
    backgroundColor: "#ffffff",
    borderRadius: 6,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  paginationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pageButton: {
    minWidth: 86,
    height: 40,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 3,
  },
  pageButtonDisabled: {
    backgroundColor: "#cbd5e1",
  },
  pageButtonText: {
    fontSize: 12.5,
    fontWeight: "900",
    color: "#ffffff",
  },
  pageIndicator: {
    fontSize: 13,
    fontWeight: "900",
    color: "#0f172a",
  },
  pageMeta: {
    marginTop: 9,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "700",
    color: "#64748b",
  },
});
