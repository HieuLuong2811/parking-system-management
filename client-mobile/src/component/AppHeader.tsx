import React from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useUi } from '../ui/UiContext';

const HEADER_HEIGHT = 56;

export default function AppHeader() {
  const { toggleDrawer } = useUi();

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Image source={require('../../assets/Logo.png')} style={styles.logo} resizeMode="contain" />
      </View>

      <Pressable onPress={toggleDrawer} style={styles.menuButton} hitSlop={10}>
        <Ionicons name="menu" size={26} color="#0f172a" />
      </Pressable>
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
  },
  logo: {
    width: 32,
    height: 32,
  },
  menuButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
  },
});

