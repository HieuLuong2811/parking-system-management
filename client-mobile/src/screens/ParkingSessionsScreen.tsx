import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { useParkingSessions } from '../api/parking_sessions';
import ListScreen from '../component/ListScreen';
import PaginationBar from '../component/PaginationBar';

const formatDateTime = (value?: string | null) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
};

const toStartOfDay = (value?: string) => (value ? `${value} 00:00:00` : undefined);
const toEndOfDay = (value?: string) => (value ? `${value} 23:59:59` : undefined);

export default function ParkingSessionsScreen() {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);
  const limit = 5;

  const { data: paginated, isLoading, isError } = useParkingSessions({
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

  return (
    <ListScreen
      title="Phiên gửi xe"
      subtitle="Theo dõi lịch sử gửi xe, thời điểm vào/ra và trạng thái phiên gửi xe của bạn."
      loading={isLoading}
      error={isError ? 'Không tải được danh sách phiên gửi xe.' : null}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.filterCard}>
          <Text style={styles.filterTitle}>Bộ lọc</Text>
          <View style={styles.filterRow}>
            <TextInput
              style={styles.input}
              placeholder="Từ ngày (YYYY-MM-DD)"
              value={fromDate}
              onChangeText={setFromDate}
            />
            <TextInput
              style={styles.input}
              placeholder="Đến ngày (YYYY-MM-DD)"
              value={toDate}
              onChangeText={setToDate}
            />
          </View>
        </View>

        {rows.length === 0 ? (
          <Text style={styles.emptyText}>Chưa có phiên gửi xe.</Text>
        ) : (
          <View style={{ gap: 12 }}>
            {rows.map((session) => (
              <View key={session.id} style={styles.card}>
                <View style={styles.row}>
                  <Text style={styles.label}>Biển số</Text>
                  <Text style={styles.value}>{session.license_plate ?? '-'}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Check-in</Text>
                  <Text style={styles.value}>{formatDateTime(session.check_in_time)}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Check-out</Text>
                  <Text style={styles.value}>{formatDateTime(session.check_out_time)}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Trạng thái</Text>
                  <Text style={styles.value}>{session.status}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Số tiền</Text>
                  <Text style={styles.value}>{session.total_amount != null ? String(session.total_amount) : '-'}</Text>
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
  filterRow: {
    flexDirection: 'row',
    gap: 10,
  },
  input: {
    flex: 1,
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

