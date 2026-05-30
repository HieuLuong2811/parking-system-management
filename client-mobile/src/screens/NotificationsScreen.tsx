import React, { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { useInfiniteQuery } from '@tanstack/react-query';

import ScreenShell from '../component/ScreenShell';
import { listMyNotifications } from '../api/notifications';
import { formatDate } from '../ultis/format';
import type { Notification } from '../api/clientApi';
import { localizeNotification } from '../ultis/notificationI18n';

type TypeFilter = 'ALL' | 'SYSTEM' | 'PAYMENT';
type TimeFilter = 'ALL' | '7D' | '30D';

const PAGE_SIZE = 20;

export default function NotificationsScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('ALL');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('ALL');

  const createdFromIso = useMemo(() => {
    if (timeFilter === 'ALL') return undefined;
    const days = timeFilter === '7D' ? 7 : 30;
    const date = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return date.toISOString();
  }, [timeFilter]);

  const query = useInfiniteQuery({
    queryKey: ['notifications', { typeFilter, timeFilter }],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      return listMyNotifications({
        limit: PAGE_SIZE,
        offset: pageParam,
        type: typeFilter === 'ALL' ? undefined : typeFilter,
        created_from: createdFromIso,
      });
    },
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || lastPage.length < PAGE_SIZE) return undefined;
      return allPages.reduce((sum, page) => sum + page.length, 0);
    },
  });

  const items: Notification[] = useMemo(() => query.data?.pages?.flat() ?? [], [query.data]);

  return (
    <ScreenShell hiddenHeader={true}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.85}>
            <Ionicons name="chevron-back" size={22} color="#0f172a" />
          </TouchableOpacity>

          <Text style={styles.title}>{t('notifications.title')}</Text>

          <View style={styles.headerRight} />
        </View>

        <View style={styles.filters}>
          <View style={styles.filterRow}>
            <TouchableOpacity
              style={[styles.filterChip, typeFilter === 'ALL' && styles.filterChipActive]}
              onPress={() => setTypeFilter('ALL')}
              activeOpacity={0.85}
            >
              <Text style={[styles.filterChipText, typeFilter === 'ALL' && styles.filterChipTextActive]}>
                {t('notifications.filter.all')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterChip, typeFilter === 'SYSTEM' && styles.filterChipActive]}
              onPress={() => setTypeFilter('SYSTEM')}
              activeOpacity={0.85}
            >
              <Text style={[styles.filterChipText, typeFilter === 'SYSTEM' && styles.filterChipTextActive]}>
                {t('notifications.filter.system')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterChip, typeFilter === 'PAYMENT' && styles.filterChipActive]}
              onPress={() => setTypeFilter('PAYMENT')}
              activeOpacity={0.85}
            >
              <Text style={[styles.filterChipText, typeFilter === 'PAYMENT' && styles.filterChipTextActive]}>
                {t('notifications.filter.payment')}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.filterRow}>
            <TouchableOpacity
              style={[styles.filterChip, timeFilter === 'ALL' && styles.filterChipActive]}
              onPress={() => setTimeFilter('ALL')}
              activeOpacity={0.85}
            >
              <Text style={[styles.filterChipText, timeFilter === 'ALL' && styles.filterChipTextActive]}>
                {t('notifications.filter.timeAll')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterChip, timeFilter === '7D' && styles.filterChipActive]}
              onPress={() => setTimeFilter('7D')}
              activeOpacity={0.85}
            >
              <Text style={[styles.filterChipText, timeFilter === '7D' && styles.filterChipTextActive]}>
                {t('notifications.filter.last7d')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterChip, timeFilter === '30D' && styles.filterChipActive]}
              onPress={() => setTimeFilter('30D')}
              activeOpacity={0.85}
            >
              <Text style={[styles.filterChipText, timeFilter === '30D' && styles.filterChipTextActive]}>
                {t('notifications.filter.last30d')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {query.isLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator />
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.list}
            onEndReachedThreshold={0.5}
            onEndReached={() => {
              if (query.hasNextPage && !query.isFetchingNextPage) query.fetchNextPage();
            }}
            ListEmptyComponent={<Text style={styles.empty}>{t('notifications.empty')}</Text>}
            ListFooterComponent={
              query.isFetchingNextPage ? (
                <View style={styles.footerLoading}>
                  <ActivityIndicator />
                </View>
              ) : null
            }
            renderItem={({ item }) => (
              <View style={styles.item}>
                <View style={styles.iconBox}>
                  <Ionicons name="notifications-outline" size={22} color="#2563eb" />
                </View>

                <View style={styles.info}>
                  {(() => {
                    const localized = localizeNotification(item, t);
                    return (
                      <>
                        <Text style={styles.itemTitle}>{localized.title}</Text>
                        <Text style={styles.itemDesc}>{localized.content}</Text>
                      </>
                    );
                  })()}
                  <Text style={styles.time}>{formatDate(item.created_at)}</Text>
                </View>
              </View>
            )}
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
  filters: {
    gap: 10,
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filterChipActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#2563eb',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#334155',
  },
  filterChipTextActive: {
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
    paddingTop: 40,
  },
  footerLoading: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  item: {
    borderRadius: 10,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
    flexDirection: 'row',
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
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    lineHeight: 17,
  },
  time: {
    marginTop: 5,
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
  },
});
