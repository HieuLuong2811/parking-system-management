import "react-native-gesture-handler";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as Linking from "expo-linking";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RootSiblingParent } from "react-native-root-siblings";
import "./src/translations/i18n";
import { AuthProvider } from "./src/auth/AuthContext";
import RootNavigator from "./src/navigation/RootNavigator";
import { ConfirmDialogProvider } from './src/component/ConfirmDialogProvider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const linking = {
  prefixes: [Linking.createURL("/")],
  config: {
    screens: {
      PaymentReturn: "payment-return",
    },
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <RootSiblingParent>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <ConfirmDialogProvider>
              <NavigationContainer linking={linking}>
                <RootNavigator />
              </NavigationContainer>
            </ConfirmDialogProvider>
          </AuthProvider>
        </QueryClientProvider>
      </RootSiblingParent>
    </SafeAreaProvider>
  );
}
