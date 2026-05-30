import React from "react";
import { Text, TouchableOpacity, View, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { formatCurrency } from "../../ultis/format";

export function PaymentMethodCard({
  title,
  subtitle,
  amount,
  badge,
  selected,
  disabled,
  onPress,
  originalAmount,
}: {
  title: string;
  subtitle: string;
  amount: number | null;
  badge?: string;
  selected: boolean;
  disabled: boolean;
  onPress: () => void;
  originalAmount?: number | null;
}) {
  const hasDiscount =
    originalAmount != null &&
    amount != null &&
    Number(originalAmount) > Number(amount);

  return (
    <TouchableOpacity
      activeOpacity={0.86}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.paymentCard,
        selected && styles.paymentCardActive,
        disabled && styles.paymentCardDisabled,
      ]}
    >
      <View style={styles.paymentHeader}>
        <View style={styles.paymentIconBox}>
          <Ionicons
            name={selected ? "checkmark-circle" : "wallet-outline"}
            size={22}
            color={selected ? "#2563eb" : "#64748b"}
          />
        </View>

        <View style={styles.paymentTextBox}>
          <View style={styles.paymentTitleRow}>
            <Text
              style={[
                styles.paymentTitle,
                selected && styles.paymentTitleActive,
              ]}
            >
              {title}
            </Text>

            {!!badge && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{badge}</Text>
              </View>
            )}
          </View>

          <Text style={styles.paymentSubtitle}>{subtitle}</Text>
        </View>
      </View>

      <View style={styles.paymentAmountBox}>
        <View style={styles.paymentAmountRow}>
          <Text style={styles.paymentAmountLabel}>
            {hasDiscount ? "Cần thanh toán" : "Số tiền"}
          </Text>

          <Text style={styles.paymentAmount}>
            {amount != null ? formatCurrency(amount) : "-"}
          </Text>
        </View>

        {hasDiscount && (
          <View style={styles.paymentOldAmountRow}>
            <Text style={styles.paymentOldAmountLabel}>Giá gốc:</Text>
            <Text style={styles.paymentOldAmount}>
              {formatCurrency(originalAmount)}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  paymentCard: {
    padding: 14,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  paymentCardActive: {
    borderColor: "#2563eb",
    backgroundColor: "#eff6ff",
  },
  paymentCardDisabled: {
    opacity: 0.5,
  },
  paymentHeader: {
    flexDirection: "row",
    gap: 12,
  },
  paymentIconBox: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  paymentTextBox: {
    flex: 1,
  },
  paymentTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  paymentTitle: {
    fontSize: 14.5,
    fontWeight: "900",
    color: "#0f172a",
  },
  paymentTitleActive: {
    color: "#1d4ed8",
  },
  paymentSubtitle: {
    marginTop: 5,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "600",
    color: "#64748b",
  },
  
  paymentAmountBox: {
    marginTop: 12,
    gap: 3,
  },

  paymentAmountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  paymentAmountLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: "#64748b",
  },

  paymentAmount: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0f172a",
  },

  paymentOldAmountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 1,
  },

  paymentOldAmountLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#94a3b8",
  },

  paymentOldAmount: {
    fontSize: 12,
    fontWeight: "700",
    color: "#94a3b8",
    textDecorationLine: "line-through",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: "#dbeafe",
  },
  badgeText: {
    fontSize: 10.5,
    fontWeight: "900",
    color: "#1d4ed8",
  },
});
