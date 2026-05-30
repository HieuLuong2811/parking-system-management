import React, { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { useInfiniteQuery } from '@tanstack/react-query';
import DateTimePicker from '@react-native-community/datetimepicker';

import ScreenShell from '../component/ScreenShell';
import { formatCurrency, formatDate, toStartOfDay } from '../ultis/format';
import {
  listMyTransactionDetails,
  type PaymentTransactionDetail,
  type PaymentTransactionDirection,
  type PaymentTransactionType,
} from '../api/paymentTransactions';
import DateRangeFilter from '../component/DateRangeFilter';

const PAGE_SIZE = 10;

type DirectionFilter = 'ALL' | PaymentTransactionDirection;
type TypeFilter = 'ALL' | PaymentTransactionType;

export default function PaymentTransactionsHistoryScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [direction, setDirection] = useState<DirectionFilter>('ALL');
  const [type, setType] = useState<TypeFilter>('ALL');
  const [invoiceId, setInvoiceId] = useState('');
  const [transactionCode, setTransactionCode] = useState('');

  const normalizedFilters = useMemo(() => {
    return {
      from_time: toStartOfDay(fromDate),
      to_time: toStartOfDay(fromDate),
      direction: direction === 'ALL' ? undefined : direction,
      transaction_type: type === 'ALL' ? undefined : type,
      invoice_id: invoiceId.trim() || undefined,
      transaction_code: transactionCode.trim() || undefined,
    };
  }, [fromDate, toDate, direction, type, invoiceId, transactionCode]);

  const clearFilters = () => {
    setFromDate('');
    setToDate('');
    setDirection('ALL');
    setType('ALL');
    setInvoiceId('');
    setTransactionCode('');
  };


  const query = useInfiniteQuery({
    queryKey: ['payment_transactions', 'me_details', normalizedFilters],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      listMyTransactionDetails({
        ...normalizedFilters,
        page: pageParam,
        limit: PAGE_SIZE,
      }),
    getNextPageParam: (lastPage) => {
      if (!lastPage) return undefined;
      if (lastPage.page >= lastPage.total_pages) return undefined;
      return lastPage.page + 1;
    },
  });

  const items: PaymentTransactionDetail[] = useMemo(() => {
    const pages = query.data?.pages ?? [];
    return pages.flatMap((p) => p.data ?? []);
  }, [query.data]);

  const typeLabel = (value: PaymentTransactionType) => t(`transactions.type.${value}`);

  return (
    <ScreenShell hiddenHeader={true}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.85}>
            <Ionicons name="chevron-back" size={22} color="#0f172a" />
          </TouchableOpacity>
          <Text style={styles.title}>{t('profile.transactionHistory')}</Text>
          <View style={styles.headerRight} />
        </View>

        <View style={styles.filtersCard}>
          <View style={styles.filterHeader}>
            <View style={styles.filterTitleBox}>
              <View style={styles.filterIconBox}>
                <Ionicons name="filter-outline" size={16} color="#2563eb" />
              </View>

              <Text style={styles.filtersTitle}>
                {t("transactions.filters.title")}
              </Text>
            </View>

            {Boolean(fromDate || toDate || direction !== 'ALL' || type !== 'ALL' || invoiceId || transactionCode) && (
              <TouchableOpacity
                onPress={clearFilters}
                activeOpacity={0.85}
                style={styles.clearFilterBtn}
              >
                <Text style={styles.clearFilterText}>
                  {t("transactions.filters.clear")}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View>
            <DateRangeFilter
              fromDate={fromDate}
              toDate={toDate}
              fromLabel={t("transactions.filters.fromDate")}
              toLabel={t("transactions.filters.toDate")}
              placeholder={t("invoices.filters.selectDate")}
              invalidMessage={t("transactions.filters.invalidDateRange", {
                defaultValue: "Ngày kết thúc không được nhỏ hơn ngày bắt đầu.",
              })}
              formatDate={formatDate}
              onChangeFromDate={setFromDate}
              onChangeToDate={setToDate}
            />
          </View>

          <View style={styles.row}>
            <View style={styles.field}>
              <Text style={styles.label}>{t('transactions.filters.invoiceId')}</Text>
              <TextInput
                value={invoiceId}
                onChangeText={setInvoiceId}
                placeholder={t('transactions.filters.invoiceIdPlaceholder')}
                placeholderTextColor="#94a3b8"
                style={styles.input}
                autoCapitalize="none"
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>{t('transactions.filters.transactionCode')}</Text>
              <TextInput
                value={transactionCode}
                onChangeText={setTransactionCode}
                placeholder={t('transactions.filters.transactionCodePlaceholder')}
                placeholderTextColor="#94a3b8"
                style={styles.input}
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.chipsRow}>
            <Text style={styles.label}>{t('transactions.filters.direction')}</Text>
            <View style={styles.chips}>
              {(['ALL', 'IN', 'OUT'] as const).map((key) => (
                <TouchableOpacity
                  key={key}
                  activeOpacity={0.85}
                  onPress={() => setDirection(key)}
                  style={[styles.chip, direction === key && styles.chipActive]}
                >
                  <Text style={[styles.chipText, direction === key && styles.chipTextActive]}>
                    {t(`transactions.direction.${key.toLowerCase()}`)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.chipsRow}>
            <Text style={styles.label}>{t('transactions.filters.type')}</Text>
            <View style={styles.chips}>
              {(
                [
                  'ALL',
                  'TOP_UP',
                  'SUBSCRIPTION_FULL_PAYMENT',
                  'MONTHLY_CHARGE',
                  'INVOICE_DIRECT_PAYMENT',
                  'REFUND',
                  'ADMIN_ADJUSTMENT',
                ] as const
              ).map((key) => (
                <TouchableOpacity
                  key={key}
                  activeOpacity={0.85}
                  onPress={() => setType(key as TypeFilter)}
                  style={[styles.chip, type === key && styles.chipActive]}
                >
                  <Text style={[styles.chipText, type === key && styles.chipTextActive]}>
                    {key === 'ALL' ? t('transactions.type.all') : typeLabel(key as PaymentTransactionType)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {query.isLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator />
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => String(item.payment_transaction_id)}
            contentContainerStyle={styles.list}
            onEndReachedThreshold={0.5}
            onEndReached={() => {
              if (query.hasNextPage && !query.isFetchingNextPage) query.fetchNextPage();
            }}
            ListEmptyComponent={<Text style={styles.empty}>{t('transactions.empty')}</Text>}
            ListFooterComponent={
              query.isFetchingNextPage ? (
                <View style={styles.footerLoading}>
                  <ActivityIndicator />
                </View>
              ) : null
            }
            renderItem={({ item }) => {
              const isIncome = item.transaction_type === 'TOP_UP' || item.transaction_type === 'REFUND' || item.transaction_type === 'ADMIN_ADJUSTMENT';
              const amountText = `${isIncome ? '+' : '-'} ${formatCurrency(Number(item.amount))}`;
              return (
                <View style={styles.item}>
                  <View style={styles.iconBox}>
                    <Ionicons name={isIncome ? 'wallet-outline' : 'card-outline'} size={22} color="#2563eb" />
                  </View>

                  <View style={styles.info}>
                    <Text style={styles.itemTitle}>{typeLabel(item.transaction_type)}</Text>
                    {!!item.invoice_id && <Text style={styles.itemDesc}>{t('transactions.invoice')}: {String(item.invoice_id)}</Text>}
                    {!!item.transaction_code && <Text style={styles.itemId}>{t('transactions.tx')}: {String(item.transaction_code)}</Text>}
                    <Text style={styles.time}>{formatDate(item.created_at)}</Text>
                  </View>

                  <Text style={[styles.amount, isIncome ? styles.incomeAmount : styles.expenseAmount]}>{amountText}</Text>
                </View>
              );
            }}
          />
        )}
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 28,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a',
  },
  headerRight: {
    width: 40,
  },
  filtersCard: {
    borderRadius: 14,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
    marginBottom: 12,
    gap: 10,
  },
  filterHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  filterTitleBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  filterIconBox: {
    width: 30,
    height: 30,
    borderRadius: 6,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
  },
  filtersTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0f172a',
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

  row: {
    flexDirection: 'row',
    gap: 10,
  },
  field: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
    color: '#334155',
    marginBottom: 6,
  },
  input: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dbe2ea',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#0f172a',
  },
  pickerDone: {
    height: 44,
    marginHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  chipsRow: {
    gap: 8,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  chipActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#2563eb',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#334155',
  },
  chipTextActive: {
    color: '#2563eb',
  },
  loadingBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    gap: 12,
    paddingBottom: 20,
  },
  empty: {
    textAlign: 'center',
    color: '#64748b',
    fontWeight: '700',
    paddingTop: 30,
  },
  footerLoading: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  item: {
    minHeight: 78,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 10,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0f172a',
  },
  itemDesc: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  itemId: {
    marginTop: 3,
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
  },
  time: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
  },
  amount: {
    fontSize: 14,
    fontWeight: '900',
  },
  incomeAmount: {
    color: '#10b981',
  },
  expenseAmount: {
    color: '#ef4444',
  },
  invoice: {
    marginTop: 2,
  },
  tx: {
    marginTop: 2,
  },
});
