import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import ScreenShell from './ScreenShell';

type ListScreenProps = {
  title: string;
  subtitle?: string;
  loading?: boolean;
  error?: string | null;
  children: React.ReactNode;
};

export default function ListScreen({ title, subtitle, loading, error, children }: ListScreenProps) {
  return (
    <ScreenShell>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator />
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
    marginBottom: 12,
    gap: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    lineHeight: 20,
  },
  center: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ef4444',
    textAlign: 'center',
  },
});

