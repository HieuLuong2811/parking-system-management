import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppHeader, { appHeaderHeight } from './AppHeader';

export default function ScreenShell({ children, hiddenHeader }: { children: React.ReactNode; hiddenHeader?: boolean }) {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      {!hiddenHeader && <AppHeader />}
      <View style={styles.content}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f5f7fb',
    paddingBottom: 50,
  },
  content: {
    flex: 1,
    padding: 16,
    paddingTop: 16,
    marginTop: 0,
    minHeight: appHeaderHeight,
  },
});

