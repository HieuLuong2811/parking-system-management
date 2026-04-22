import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StripeProvider } from '@stripe/stripe-react-native';
import * as Linking from 'expo-linking';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import './src/translations/i18n';
import { AuthProvider } from './src/auth/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';
import { EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY } from './src/constant/config';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const linking = {
  prefixes: [Linking.createURL('/')],
  config: {
    screens: {
      PaymentReturn: 'payment-return',
    },
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <StripeProvider publishableKey={EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim() ?? ''}>
            <NavigationContainer linking={linking}>
              <RootNavigator />
            </NavigationContainer>
          </StripeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
