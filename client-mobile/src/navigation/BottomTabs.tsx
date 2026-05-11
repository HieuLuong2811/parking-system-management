import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import ParkingSessionsScreen from '../screens/ParkingSessionsScreen';
import PlansScreen from '../screens/PlansScreen';
import InvoicesScreen from '../screens/InvoicesScreen';
import ProfileScreen from '../screens/ProfileScreen';

export type RootTabParamList = {
  Home: undefined;
  Plan: undefined;
  Sessions: undefined;
  Invoices: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#f59e0b',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
        },
        tabBarStyle: {
          minHeight: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarIcon: ({ color, size, focused }) => {
          if (route.name === 'Home') {
            return <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />;
          }

          if (route.name === 'Plan') {
            return (
              <Ionicons
                name={focused ? 'pricetag' : 'pricetag-outline'}
                size={size}
                color={color}
              />
            );
          }

          if (route.name === 'Sessions') {
            return <Ionicons name={focused ? 'time' : 'time-outline'} size={size} color={color} />;
          }

          if (route.name === 'Invoices') {
            return <Ionicons name={focused ? 'receipt' : 'receipt-outline'} size={size} color={color} />;
          }

          return <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="Plan" component={PlansScreen} options={{ title: 'Plan' }} />
      <Tab.Screen name="Sessions" component={ParkingSessionsScreen} options={{ title: 'Sessions' }} />
      <Tab.Screen name="Invoices" component={InvoicesScreen} options={{ title: 'Invoices' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}
