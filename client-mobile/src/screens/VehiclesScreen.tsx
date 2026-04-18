import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import ScreenShell from '../component/ScreenShell';

export default function VehiclesScreen() {
  return (
    <ScreenShell>
      <View style={styles.card}>
        <Text style={styles.title}>Vehicles</Text>
        <Text style={styles.desc}>Danh sách phương tiện sẽ hiển thị ở đây.</Text>
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
});

