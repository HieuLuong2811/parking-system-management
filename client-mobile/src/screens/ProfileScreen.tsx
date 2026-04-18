import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ScreenShell from '../component/ScreenShell';

import { useAuth } from '../auth/AuthContext';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();

  return (
    <ScreenShell>
      <View style={styles.card}>
        <Text style={styles.title}>Profile</Text>

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
          <Text style={styles.desc}>Chưa tải thông tin người dùng.</Text>
        )}

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
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },
  desc: {
    marginTop: 8,
    fontSize: 15,
    color: '#6b7280',
  },
  section: {
    marginTop: 16,
  },
  label: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  value: {
    marginTop: 4,
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
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
    fontWeight: '800',
    color: '#ffffff',
  },
});
