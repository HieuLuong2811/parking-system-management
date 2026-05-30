import React from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { useUi } from '../ui/UiContext';
import { listMyNotifications } from '../api/notifications';
import { formatDate } from '../ultis/format';
import { localizeNotification } from '../ultis/notificationI18n';

const HEADER_HEIGHT = 56;

export default function AppHeader() {
  const { toggleDrawer } = useUi();
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const [notificationsOpen, setNotificationsOpen] = React.useState(false);

  const { data: latestNotifications = [] } = useQuery({
    queryKey: ['notifications', 'latest'],
    queryFn: () => listMyNotifications({ limit: 5, offset: 0 }),
    enabled: notificationsOpen,
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.left} onPress={() => navigation.navigate('Home')}>
        <Image source={require('../../assets/Logo.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>Parking UTEHY</Text>
      </TouchableOpacity>

      <View style={styles.right}>
        <Pressable onPress={() => setNotificationsOpen(true)} style={styles.iconButton} hitSlop={10}>
          <Ionicons name="notifications-outline" size={22} color="#0f172a" />
        </Pressable>

        <Pressable onPress={toggleDrawer} style={styles.menuButton} hitSlop={10}>
          <Ionicons name="menu" size={26} color="#0f172a" />
        </Pressable>
      </View>

      <Modal visible={notificationsOpen} transparent animationType="fade" onRequestClose={() => setNotificationsOpen(false)}>
        <Pressable style={styles.notificationsOverlay} onPress={() => setNotificationsOpen(false)}>
          <Pressable style={styles.notificationsCard} onPress={() => null}>
            <Text style={styles.notificationsTitle}>{t('notifications.title')}</Text>
            <ScrollView style={styles.notificationsList} contentContainerStyle={styles.notificationsListContent}>
              {latestNotifications.length === 0 ? (
                <Text style={styles.notificationsEmpty}>{t('notifications.empty')}</Text>
              ) : (
                latestNotifications.map((item) => (
                  <Pressable
                    key={String(item.id)}
                    style={styles.notificationsItem}
                    onPress={() => {
                      setNotificationsOpen(false);
                      navigation.navigate('Notifications');
                    }}
                  >
                    {(() => {
                      const localized = localizeNotification(item, t);
                      return (
                        <>
                          <Text style={styles.notificationsItemTitle} numberOfLines={1}>
                            {localized.title}
                          </Text>
                          <Text style={styles.notificationsItemContent} numberOfLines={2}>
                            {localized.content}
                          </Text>
                        </>
                      );
                    })()}
                    <Text style={styles.notificationsItemTime}>{formatDate(item.created_at)}</Text>
                  </Pressable>
                ))
              )}
            </ScrollView>

            <Pressable
              style={styles.notificationsViewAll}
              onPress={() => {
                setNotificationsOpen(false);
                navigation.navigate('Notifications');
              }}
            >
              <Text style={styles.notificationsViewAllText}>{t('notifications.viewAll')}</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

export const appHeaderHeight = HEADER_HEIGHT;

const styles = StyleSheet.create({
  container: {
    height: HEADER_HEIGHT,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    width: 32,
    height: 32,
  },
  title : {
    fontSize: 18,
    fontWeight: '600',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
  },
  menuButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
  },
  notificationsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.25)',
    paddingTop: HEADER_HEIGHT + 8,
    paddingHorizontal: 14,
  },
  notificationsCard: {
    alignSelf: 'flex-end',
    width: 320,
    maxHeight: 420,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
  },
  notificationsTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 10,
  },
  notificationsList: {
    flexGrow: 0,
  },
  notificationsListContent: {
    gap: 10,
    paddingBottom: 10,
  },
  notificationsItem: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    padding: 12,
  },
  notificationsItemTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0f172a',
  },
  notificationsItemContent: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    lineHeight: 17,
  },
  notificationsItemTime: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
  },
  notificationsEmpty: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    paddingVertical: 10,
    textAlign: 'center',
  },
  notificationsViewAll: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 10,
    alignItems: 'center',
  },
  notificationsViewAllText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#2563eb',
  },
});
