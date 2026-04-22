import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';

import ScreenShell from '../component/ScreenShell';
import type { AppStackParamList } from '../navigation/AppStack';

type Nav = NativeStackNavigationProp<AppStackParamList>;
type ScreenRoute = RouteProp<AppStackParamList, 'PaymentReturn'>;

export default function PaymentReturnScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<ScreenRoute>();
  const invoiceId = route.params?.invoice_id ?? null;
  const result = route.params?.result ?? null;

  return (
    <ScreenShell>
      <View style={styles.card}>
        <Text style={styles.title}>Trạng thái thanh toán</Text>
        <Text style={styles.desc}>
          {result === 'pending'
            ? 'Bạn đang được chuyển sang trang thanh toán. Sau khi thanh toán xong, hãy quay lại app.'
            : 'Nếu bạn vừa thanh toán, hãy quay lại app để kiểm tra trạng thái.'}
        </Text>

        {invoiceId ? (
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Invoice</Text>
            <Text style={styles.metaValue}>{invoiceId}</Text>
          </View>
        ) : null}

        <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.popToTop()} activeOpacity={0.85}>
          <Text style={styles.primaryBtnText}>Về trang gói gửi xe</Text>
        </TouchableOpacity>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0f172a',
  },
  desc: {
    marginTop: 8,
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  metaRow: {
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  metaLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: '#334155',
  },
  metaValue: {
    fontSize: 12,
    fontWeight: '900',
    color: '#0f172a',
  },
  primaryBtn: {
    marginTop: 18,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#f59e0b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#ffffff',
  },
});

