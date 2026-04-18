import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import ScreenShell from '../component/ScreenShell';

export default function CheckInOutScreen() {
  return (
    <ScreenShell>
      <View style={styles.card}>
        <Text style={styles.title}>Check in / out history</Text>
        <Text style={styles.desc}>Sau này có thể gắn camera QR vào màn này.</Text>
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

