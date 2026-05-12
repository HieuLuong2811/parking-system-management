import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import BottomTabs from './BottomTabs';
import PlanCheckoutScreen from '../screens/PlanCheckoutScreen';
import PaymentReturnScreen from '../screens/PaymentReturnScreen';
import VehiclesScreen from '../screens/VehiclesScreen';
import UserSubscriptionsScreen from '../screens/UserSubscriptionsScreen';
import type { SubscriptionPlanRecord } from '../api/clientApi';

export type AppStackParamList = {
  Tabs: undefined;
  PlanCheckout: { plan?: SubscriptionPlanRecord } | undefined;
  PaymentReturn: { invoice_id?: string; result?: string } | undefined;
  Vehicles: undefined;
  UserSubscriptions: undefined;
};

const Stack = createNativeStackNavigator<AppStackParamList>();

export default function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={BottomTabs} />
      <Stack.Screen name="PlanCheckout" component={PlanCheckoutScreen} />
      <Stack.Screen name="PaymentReturn" component={PaymentReturnScreen} />
      <Stack.Screen name="Vehicles" component={VehiclesScreen} />
      <Stack.Screen name="UserSubscriptions" component={UserSubscriptionsScreen} />
    </Stack.Navigator>
  );
}
