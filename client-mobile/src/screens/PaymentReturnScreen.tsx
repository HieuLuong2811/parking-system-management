import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Ionicons from '@expo/vector-icons/Ionicons';

import ScreenShell from '../component/ScreenShell';
import type { AppStackParamList } from '../navigation/AppStack';

type Nav = NativeStackNavigationProp<AppStackParamList>;
type ScreenRoute = RouteProp<AppStackParamList, 'PaymentReturn'>;

export default function PaymentReturnScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<ScreenRoute>();
  const { t } = useTranslation();

  const invoiceId = route.params?.invoice_id ?? null;
  const result = route.params?.result ?? null;

  const isPending = result === 'pending';

  return (
    <ScreenShell>
      <View style={styles.card}>
        <View style={styles.iconBox}>
          <Ionicons
            name={isPending ? 'time-outline' : 'receipt-outline'}
            size={34}
            color="#2563eb"
          />
        </View>

        <Text style={styles.title}>{t('paymentReturn.title')}</Text>

        <Text style={styles.desc}>
          {isPending
            ? t('paymentReturn.pendingDesc')
            : t('paymentReturn.defaultDesc')}
        </Text>

        {invoiceId ? (
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>{t('paymentReturn.invoice')}</Text>
            <Text numberOfLines={1} style={styles.metaValue}>
              {invoiceId}
            </Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => navigation.navigate('Tabs', { screen: 'Home' } as any)}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryBtnText}>
            {t('paymentReturn.backToPlans')}
          </Text>
        </TouchableOpacity>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    shadowColor: '#0f172a',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3,
  },

  iconBox: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },

  title: {
    fontSize: 21,
    fontWeight: '900',
    color: '#0f172a',
    textAlign: 'center',
  },

  desc: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    lineHeight: 21,
    textAlign: 'center',
  },

  metaRow: {
    width: '100%',
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },

  metaLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: '#334155',
  },

  metaValue: {
    flex: 1,
    textAlign: 'right',
    fontSize: 12,
    fontWeight: '900',
    color: '#0f172a',
  },

  primaryBtn: {
    width: '100%',
    marginTop: 20,
    height: 50,
    borderRadius: 16,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563eb',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 3,
  },

  primaryBtnText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#ffffff',
  },
});