import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { useUserSubscriptionsPaginated } from '../api/user_subscriptions';
import ListScreen from '../component/ListScreen';
import PaginationBar from '../component/PaginationBar';

export default function UserSubscriptionsScreen() {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const limit = 5;

  const { data: paginated, isLoading, isError } = useUserSubscriptionsPaginated({
    page,
    limit,
    status: status.trim() || undefined,
  });

  const rows = useMemo(() => paginated?.data ?? [], [paginated]);
  const total = paginated?.total ?? 0;

  return (
    <ListScreen
      title="Gói đã đăng ký"
      subtitle="Theo dõi gói gửi xe, học kỳ áp dụng và trạng thái sử dụng của bạn."
      loading={isLoading}
      error={isError ? 'Không tải được danh sách gói đã đăng ký.' : null}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.filterCard}>
          <Text style={styles.filterTitle}>Bộ lọc</Text>
          <TextInput
            style={styles.input}
            placeholder="Trạng thái (ACTIVE/INACTIVE/PAYMENT_DUE...)"
            value={status}
            onChangeText={(value) => {
              setPage(1);
              setStatus(value);
            }}
          />
        </View>

        {rows.length === 0 ? (
          <Text style={styles.emptyText}>Chưa có gói đăng ký.</Text>
        ) : (
          <View style={{ gap: 12 }}>
            {rows.map((sub) => (
              <View key={sub.id} style={styles.card}>
                <View style={styles.row}>
                  <Text style={styles.label}>Gói</Text>
                  <Text style={styles.value}>{sub.subscription_plan?.plans_type ?? '-'}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Học kỳ</Text>
                  <Text style={styles.value}>{sub.term?.term_name ?? '-'}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Thời gian</Text>
                  <Text style={styles.value}>
                    {sub.start_date} - {sub.end_date}
                  </Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Số tiền</Text>
                  <Text style={styles.value}>{String(sub.total_amount ?? 0)}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Trạng thái</Text>
                  <Text style={styles.value}>{sub.status}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <PaginationBar page={page} limit={limit} total={total} onChangePage={setPage} />
      </ScrollView>
    </ListScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    paddingBottom: 12,
  },
  emptyText: {
    padding: 24,
    textAlign: 'center',
    color: '#64748b',
    fontWeight: '700',
  },
  filterCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 10,
  },
  filterTitle: {
    color: '#334155',
    fontWeight: '900',
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#0f172a',
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  label: {
    color: '#64748b',
    fontWeight: '700',
  },
  value: {
    flexShrink: 1,
    color: '#0f172a',
    fontWeight: '800',
    textAlign: 'right',
  },
});
