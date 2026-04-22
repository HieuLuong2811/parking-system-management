import React from 'react';
import { View } from 'react-native';

import AppDrawer from '../component/AppDrawer';
import { UiProvider } from '../ui/UiContext';
import AppStack from './AppStack';

export default function AuthenticatedApp() {
  return (
    <UiProvider>
      <View style={{ flex: 1 }}>
        <AppStack />
        <AppDrawer />
      </View>
    </UiProvider>
  );
}
