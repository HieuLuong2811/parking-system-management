import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import BottomTabs from './BottomTabs';
import PlanCheckoutScreen from '../screens/PlanCheckoutScreen';
import PaymentReturnScreen from '../screens/PaymentReturnScreen';
import type { SubscriptionPlanRecord } from '../api/clientApi';

export type AppStackParamList = {
  Tabs: undefined;
  PlanCheckout: { plan?: SubscriptionPlanRecord } | undefined;
  PaymentReturn: { invoice_id?: string; result?: string } | undefined;
};

const Stack = createNativeStackNavigator<AppStackParamList>();

export default function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={BottomTabs} />
      <Stack.Screen name="PlanCheckout" component={PlanCheckoutScreen} />
      <Stack.Screen name="PaymentReturn" component={PaymentReturnScreen} />
    </Stack.Navigator>
  );
}
