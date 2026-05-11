import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import ScreenShell from '../component/ScreenShell';
import { useAuth } from '../auth/AuthContext';
import type { AppStackParamList } from '../navigation/AppStack';

type Nav = NativeStackNavigationProp<AppStackParamList>;

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const navigation = useNavigation<Nav>();

  return (
    <ScreenShell>
      <View style={styles.card}>
        <Text style={styles.title}>Thông tin cá nhân</Text>
        <Text style={styles.subtitle}>Quản lý thông tin tài khoản, phương tiện và gói gửi xe.</Text>

        {user ? (
          <View style={styles.section}>
            <Text style={styles.label}>User code</Text>
            <Text style={styles.value}>{user.user_code}</Text>

            <Text style={styles.label}>Full name</Text>
            <Text style={styles.value}>{user.full_name}</Text>

            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{user.email}</Text>
          </View>
        ) : (
          <Text style={styles.subtitle}>Chưa tải thông tin người dùng.</Text>
        )}

        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.actionPrimary]}
            onPress={() => navigation.navigate('Vehicles')}
            activeOpacity={0.85}
          >
            <Text style={styles.actionButtonText}>Phương tiện</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.actionPrimary]}
            onPress={() => navigation.navigate('UserSubscriptions')}
            activeOpacity={0.85}
          >
            <Text style={styles.actionButtonText}>Gói đã đăng ký</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={() => void signOut()} activeOpacity={0.85}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#111827',
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    lineHeight: 20,
  },
  section: {
    marginTop: 16,
  },
  label: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: '800',
    color: '#334155',
  },
  value: {
    marginTop: 4,
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  quickActions: {
    marginTop: 16,
    gap: 10,
  },
  actionButton: {
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionPrimary: {
    backgroundColor: '#111827',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#ffffff',
  },
  logoutButton: {
    marginTop: 18,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButtonText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#ffffff',
  },
});

