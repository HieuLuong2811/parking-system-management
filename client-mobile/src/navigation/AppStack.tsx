import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import BottomTabs from './BottomTabs';
import PlanCheckoutScreen from '../screens/PlanCheckoutScreen';
import PaymentReturnScreen from '../screens/PaymentReturnScreen';
import UserSubscriptionsScreen from '../screens/UserSubscriptionsScreen';
import WalletScreen from '../screens/WalletScreen';
import type { SubscriptionPlanRecord } from '../api/clientApi';
import PersonalInfoScreen from '../screens/PersonalInfoScreen';
import PaymentTransactionsHistoryScreen from '../screens/PaymentTransactionsHistoryScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import InvoicesScreen from '../screens/InvoicesScreen';

export type AppStackParamList = {
  Tabs: undefined;
  PlanCheckout: { plan?: SubscriptionPlanRecord } | undefined;
  PaymentReturn: { invoice_id?: string; result?: string } | undefined;
  UserSubscriptions: undefined;
  Wallet: undefined;
  PersonalInfo: undefined;
  PaymentTransactionsHistory: undefined;
  Notifications: undefined;
  Invoices: undefined;
};

const Stack = createNativeStackNavigator<AppStackParamList>();

export default function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={BottomTabs} />
      <Stack.Screen name="PlanCheckout" component={PlanCheckoutScreen} />
      <Stack.Screen name="PaymentReturn" component={PaymentReturnScreen} />
      <Stack.Screen name="UserSubscriptions" component={UserSubscriptionsScreen} />
      <Stack.Screen name="Wallet" component={WalletScreen} />
      <Stack.Screen name="PersonalInfo" component={PersonalInfoScreen} />
      <Stack.Screen name="PaymentTransactionsHistory" component={PaymentTransactionsHistoryScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Invoices" component={InvoicesScreen} />
    </Stack.Navigator>
  );
}
