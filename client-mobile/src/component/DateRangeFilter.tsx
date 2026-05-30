import React, { useState } from "react";
import {
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import Ionicons from "@expo/vector-icons/Ionicons";

type DateRangeFilterProps = {
  fromDate: string;
  toDate: string;
  fromLabel: string;
  toLabel: string;
  placeholder: string;
  invalidMessage: string;
  formatDate: (value: string) => string;
  onChangeFromDate: (value: string) => void;
  onChangeToDate: (value: string) => void;
};

const toDateOnly = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const parseDateOnly = (value?: string | null) => {
  if (!value) return null;

  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;

  return new Date(year, month - 1, day);
};

const isInvalidDateRange = (fromDate?: string, toDate?: string) => {
  const from = parseDateOnly(fromDate);
  const to = parseDateOnly(toDate);

  if (!from || !to) return false;

  return to.getTime() < from.getTime();
};

export default function DateRangeFilter({
  fromDate,
  toDate,
  fromLabel,
  toLabel,
  placeholder,
  invalidMessage,
  formatDate,
  onChangeFromDate,
  onChangeToDate,
}: DateRangeFilterProps) {
  const [target, setTarget] = useState<"from" | "to" | null>(null);

  const selectedValue = target === "from" ? fromDate : toDate;

  return (
    <>
      <View style={styles.row}>
        <TouchableOpacity
          style={styles.dateButton}
          activeOpacity={0.85}
          onPress={() => setTarget("from")}
        >
          <Text style={styles.dateLabel}>{fromLabel}</Text>

          <View style={styles.dateValueRow}>
            <Text
              style={[styles.dateValue, !fromDate && styles.datePlaceholder]}
            >
              {fromDate ? formatDate(fromDate) : placeholder}
            </Text>

            <Ionicons name="calendar-outline" size={15} color="#64748b" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dateButton}
          activeOpacity={0.85}
          onPress={() => setTarget("to")}
        >
          <Text style={styles.dateLabel}>{toLabel}</Text>

          <View style={styles.dateValueRow}>
            <Text style={[styles.dateValue, !toDate && styles.datePlaceholder]}>
              {toDate ? formatDate(toDate) : placeholder}
            </Text>

            <Ionicons name="calendar-outline" size={15} color="#64748b" />
          </View>
        </TouchableOpacity>
      </View>

      {target && (
        <DateTimePicker
          value={parseDateOnly(selectedValue) ?? new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(_, selectedDate) => {
            if (Platform.OS !== "ios") {
              setTarget(null);
            }

            if (!selectedDate) return;

            const nextValue = toDateOnly(selectedDate);

            if (target === "from") {
              if (toDate && isInvalidDateRange(nextValue, toDate)) {
                Alert.alert("", invalidMessage);
                return;
              }

              onChangeFromDate(nextValue);
              return;
            }

            if (fromDate && isInvalidDateRange(fromDate, nextValue)) {
              Alert.alert("", invalidMessage);
              return;
            }

            onChangeToDate(nextValue);
          }}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  row: {
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
});
