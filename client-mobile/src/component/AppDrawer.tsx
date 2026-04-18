import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Image, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../auth/AuthContext';
import { languageOptions } from '../constant/languageOptions';
import { useUi } from '../ui/UiContext';

const DRAWER_WIDTH = 320;

export default function AppDrawer() {
  const { drawerOpen, closeDrawer } = useUi();
  const { user, signOut } = useAuth();
  const { i18n } = useTranslation();

  const slideAnim = useRef(new Animated.Value(DRAWER_WIDTH)).current;

  const currentLanguage = useMemo(
    () => languageOptions.find((item) => item.code === i18n.language) ?? languageOptions[0],
    [i18n.language]
  );

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: drawerOpen ? 0 : DRAWER_WIDTH,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [drawerOpen, slideAnim]);

  const handleChangeLanguage = async (code: string) => {
    await i18n.changeLanguage(code);
    closeDrawer();
  };

  return (
    <Modal visible={drawerOpen} transparent animationType="none" onRequestClose={closeDrawer}>
      <View style={styles.modalRoot}>
        <Pressable style={styles.backdrop} onPress={closeDrawer} />

        <Animated.View style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Menu</Text>
            <Pressable onPress={closeDrawer} hitSlop={10} style={styles.closeButton}>
              <Ionicons name="close" size={22} color="#0f172a" />
            </Pressable>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>User</Text>
            {user ? (
              <View style={styles.userCard}>
                <View style={styles.userRow}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{(user.full_name || user.user_code).slice(0, 1)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.userName}>{user.full_name}</Text>
                    <Text style={styles.userMeta}>{user.user_code}</Text>
                    <Text style={styles.userMeta}>{user.email}</Text>
                  </View>
                </View>
              </View>
            ) : (
              <Text style={styles.muted}>Chưa có thông tin người dùng.</Text>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Language</Text>

            <View style={styles.langCurrent}>
              <Image source={{ uri: currentLanguage.flag }} style={styles.flag} />
              <Text style={styles.langCurrentText}>{currentLanguage.name}</Text>
            </View>

            <View style={styles.langList}>
              {languageOptions.map((item) => {
                const selected = item.code === currentLanguage.code;
                return (
                  <TouchableOpacity
                    key={item.code}
                    style={[styles.langItem, selected && styles.langItemActive]}
                    onPress={() => void handleChangeLanguage(item.code)}
                    activeOpacity={0.85}
                  >
                    <Image source={{ uri: item.flag }} style={styles.flag} />
                    <Text style={[styles.langItemText, selected && styles.langItemTextActive]}>{item.name}</Text>
                    {selected && <Ionicons name="checkmark" size={18} color="#2563eb" />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={() => {
                closeDrawer();
                void signOut();
              }}
              activeOpacity={0.85}
            >
              <Ionicons name="log-out-outline" size={18} color="#ffffff" />
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
  },
  drawer: {
    width: DRAWER_WIDTH,
    backgroundColor: '#ffffff',
    borderLeftWidth: 1,
    borderLeftColor: '#e2e8f0',
    paddingBottom: 16,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#334155',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  userCard: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    padding: 12,
    backgroundColor: '#f8fafc',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0ea5e9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#ffffff',
  },
  userName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  userMeta: {
    marginTop: 2,
    fontSize: 13,
    color: '#475569',
  },
  muted: {
    fontSize: 14,
    color: '#64748b',
  },
  langCurrent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    marginBottom: 10,
  },
  langCurrentText: {
    marginLeft: 10,
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  langList: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    overflow: 'hidden',
  },
  langItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
  },
  langItemActive: {
    backgroundColor: '#eff6ff',
  },
  langItemText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#0f172a',
  },
  langItemTextActive: {
    fontWeight: '800',
    color: '#1d4ed8',
  },
  flag: {
    width: 22,
    height: 16,
    borderRadius: 2,
  },
  footer: {
    marginTop: 'auto',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  logoutButton: {
    height: 46,
    borderRadius: 14,
    backgroundColor: '#ef4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logoutButtonText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#ffffff',
  },
});

