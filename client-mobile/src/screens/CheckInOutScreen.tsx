import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import ScreenShell from '../component/ScreenShell';
import { useUserSubscriptions } from '../api/user_subscriptions';
import { useVehicles } from '../api/vehicles';
import type { UserSubscriptionDetail } from '../api/clientApi';
import { RENDER_QR_CODE } from '../constant/config';

const getPlanTypeLabel = (plansType?: string | null) => {
  switch (plansType) {
    case 'UNLICENSED_VEHICLE':
      return 'Xe không biển số';
    case 'LICENSED_VEHICLE':
      return 'Xe có biển số';
    default:
      return plansType ?? '—';
  }
};

export default function CheckInOutScreen() {
  const {
    data: subscriptions = [],
    isLoading: subscriptionsLoading,
    isError: subscriptionsError,
  } = useUserSubscriptions();
  const { data: vehicles = [], isLoading: vehiclesLoading, isError: vehiclesError } = useVehicles();
  const [qrOpen, setQrOpen] = useState(false);

  const activeSubscription = useMemo<UserSubscriptionDetail | null>(() => {
    const today = new Date();
    const candidates = subscriptions.filter((subscription) => {
      if (subscription.status !== 'ACTIVE') return false;
      const endDate = new Date(subscription.end_date);
      return !Number.isNaN(endDate.getTime()) && endDate >= today;
    });
    candidates.sort((a, b) => new Date(b.end_date).getTime() - new Date(a.end_date).getTime());
    return candidates[0] ?? null;
  }, [subscriptions]);

  const qrPayload = useMemo(() => {
    const vehicleId = activeSubscription?.vehicle?.id;
    if (!vehicleId) return null;
    const vehicle = vehicles.find((v) => v.id === vehicleId) ?? null;
    return vehicle?.qr_code ?? null;
  }, [activeSubscription?.vehicle?.id, vehicles]);

  const qrImageUri = useMemo(() => {
    if (!qrPayload) return null;
    const encoded = encodeURIComponent(qrPayload);
    return `${RENDER_QR_CODE}${encoded}`;
  }, [qrPayload]);

  const busy = subscriptionsLoading || vehiclesLoading;
  const errored = subscriptionsError || vehiclesError;

  return (
    <ScreenShell>
      <View style={styles.card}>
        <Text style={styles.title}>My subscription</Text>

        {busy ? (
          <ActivityIndicator />
        ) : errored ? (
          <Text style={styles.error}>Failed to load subscription data.</Text>
        ) : !activeSubscription ? (
          <Text style={styles.desc}>No active subscription found.</Text>
        ) : (
          <>
            <View style={styles.subscriptionCard}>
              <Text style={styles.subHeading}>Active subscription</Text>
              <Text style={styles.subLine}>
                Plan:{' '}
                <Text style={styles.subValue}>
                  {getPlanTypeLabel(activeSubscription.subscription_plan?.plans_type)}
                </Text>
              </Text>
              <Text style={styles.subLine}>
                Vehicle:{' '}
                <Text style={styles.subValue}>
                  {activeSubscription.vehicle?.license_plate?.trim() ||
                    activeSubscription.vehicle?.id ||
                    '—'}
                </Text>
              </Text>
              <Text style={styles.subLine}>
                Period:{' '}
                <Text style={styles.subValue}>
                  {new Date(activeSubscription.start_date).toLocaleDateString()} –{' '}
                  {new Date(activeSubscription.end_date).toLocaleDateString()}
                </Text>
              </Text>
            </View>

            <View style={styles.qrWrap}>
              {qrImageUri ? (
                <Pressable onPress={() => setQrOpen(true)} style={styles.qrPressable}>
                  <Image
                    source={{ uri: qrImageUri }}
                    style={styles.qrImage}
                    resizeMode="contain"
                  />
                  <Text style={styles.qrHint}>Tap QR to show full screen</Text>
                </Pressable>
              ) : (
                <Text style={styles.desc}>Unable to load vehicle QR payload.</Text>
              )}
            </View>
          </>
        )}
      </View>

      <Modal
        visible={qrOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setQrOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Check-in QR</Text>
            {qrImageUri ? (
              <Pressable onPress={() => setQrOpen(false)} style={styles.modalQrPressable}>
                <Image
                  source={{ uri: qrImageUri }}
                  style={styles.modalQrImage}
                  resizeMode="contain"
                />
              </Pressable>
            ) : null}
            <Pressable style={styles.modalClose} onPress={() => setQrOpen(false)}>
              <Text style={styles.modalCloseText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },
  desc: {
    marginTop: 8,
    fontSize: 15,
    color: '#6b7280',
  },
  error: { marginTop: 10, color: '#dc2626', fontWeight: '700' },
  subscriptionCard: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    padding: 14,
    backgroundColor: '#f8fafc',
  },
  subHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
  },
  subLine: { marginTop: 6, color: '#334155' },
  subValue: { color: '#111827', fontWeight: '700' },
  qrWrap: { marginTop: 18, alignItems: 'center' },
  qrPressable: { alignItems: 'center' },
  qrImage: { width: 220, height: 220, backgroundColor: '#fff', borderRadius: 12 },
  qrHint: { marginTop: 10, color: '#64748b', fontWeight: '600' },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    padding: 18,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
  },
  modalTitle: { fontSize: 18, fontWeight: '900', color: '#111827', marginBottom: 12 },
  modalQrPressable: { width: '100%', alignItems: 'center', backgroundColor: '#fffff' },
  modalQrImage: { width: 320, height: 320, borderRadius: 12, backgroundColor: '#fff', padding: 12 },
  modalClose: {
    marginTop: 14,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
  },
  modalCloseText: { fontWeight: '900', color: '#111827' },
});
