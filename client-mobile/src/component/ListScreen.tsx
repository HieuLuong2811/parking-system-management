import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

import ScreenShell from "./ScreenShell";

type ListScreenProps = {
  title?: string;
  subtitle?: string;
  loading?: boolean;
  error?: string | null;
  children: React.ReactNode;
  showBack?: boolean;
  onBack?: () => void;
  hiddenHeader?: boolean;
};

export default function ListScreen({
  title,
  subtitle,
  loading,
  error,
  children,
  showBack,
  onBack,
  hiddenHeader,
}: ListScreenProps) {
  const shouldShowHeader = Boolean(title || subtitle || showBack);
  return (
    <ScreenShell hiddenHeader={hiddenHeader}>
      <View style={styles.container}>
        {shouldShowHeader ? (
          <View style={styles.header}>
            <View style={styles.titleRow}>
              {showBack ? (
                <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.85}>
                  <Ionicons name="chevron-back" size={21} color="#0f172a" />
                </TouchableOpacity>
              ) : null}

              {!!title && (
                <Text style={styles.title} numberOfLines={2}>
                  {title}
                </Text>
              )}
            </View>

            {!!subtitle && (
              <Text style={[styles.subtitle]} numberOfLines={3}>
                {subtitle}
              </Text>
            )}
          </View>
        ) : null}

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color="#43B14B" />
          </View>
        ) : error ? (
          <View style={styles.center}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          children
        )}
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
  },

  header: {
    marginBottom: 14,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0f172a",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },

  title: {
    flex: 1,
    fontSize: 21,
    fontWeight: "900",
    color: "#0f172a",
    letterSpacing: -0.2,
  },

  subtitle: {
    marginTop: 5,
    fontSize: 13,
    fontWeight: "600",
    color: "#64748b",
    lineHeight: 19,
  },

  center: {
    paddingVertical: 24,
    alignItems: "center",
  },

  errorText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ef4444",
    textAlign: "center",
  },
});
