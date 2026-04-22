import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import VehiclesScreen from '../screens/VehiclesScreen';
import CheckInOutScreen from '../screens/CheckInOutScreen';
import ProfileScreen from '../screens/ProfileScreen';

export type RootTabParamList = {
  Home: undefined;
  Vehicles: undefined;
  CheckInOut: undefined;
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

          if (route.name === 'Vehicles') {
            return (
              <Ionicons
                name={focused ? 'car-sport' : 'car-sport-outline'}
                size={size}
                color={color}
              />
            );
          }

          if (route.name === 'CheckInOut') {
            return <Ionicons name={focused ? 'scan' : 'scan-outline'} size={size} color={color} />;
          }

          return <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="Vehicles" component={VehiclesScreen} options={{ title: 'Vehicles' }} />
      <Tab.Screen name="CheckInOut" component={CheckInOutScreen} options={{ title: 'Check in/out' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}
