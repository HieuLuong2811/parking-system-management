import React from 'react';
import { View } from 'react-native';

import AppDrawer from '../component/AppDrawer';
import { UiProvider } from '../ui/UiContext';
import BottomTabs from './BottomTabs';

export default function AuthenticatedApp() {
  return (
    <UiProvider>
      <View style={{ flex: 1 }}>
        <BottomTabs />
        <AppDrawer />
      </View>
    </UiProvider>
  );
}

