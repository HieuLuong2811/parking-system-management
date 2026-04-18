import React from 'react';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '../auth/AuthContext';
import AuthStack from './AuthStack';
import AuthenticatedApp from './AuthenticatedApp';

export default function RootNavigator() {
  const { status } = useAuth();

  if (status === 'loading') {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (status === 'authenticated') {
    return <AuthenticatedApp />;
  }

  return <AuthStack />;
}
