import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  GestureResponderEvent,
} from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import HomeScreen from "../screens/HomeScreen";
import ParkingSessionsScreen from "../screens/ParkingSessionsScreen";
import ProfileScreen from "../screens/ProfileScreen";
import PresentCardScreen from "../screens/PresentCardScreen";
import PlansScreen from "../screens/PlansScreen";

export type RootTabParamList = {
  Home: undefined;
  Sessions: undefined;
  PresentCard: undefined;
  Plans: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

type CenterButtonProps = {
  children: React.ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
};

function CenterTabButton({ children, onPress }: CenterButtonProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={styles.centerButtonWrapper}
    >
      <View style={styles.centerButton}>{children}</View>
    </TouchableOpacity>
  );
}

export default function BottomTabs() {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#43B14B",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
          marginBottom: 4,
        },
        tabBarStyle: {
          position: "absolute",
          height: 74,
          paddingTop: 8,
          paddingBottom: Platform.OS === "ios" ? 12 : 8,
          backgroundColor: "#ffffff",
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: "#000",
          shadowOpacity: 0.08,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: -2 },
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
        tabBarIcon: ({ color, size, focused }) => {
          if (route.name === "Home") {
            return <Ionicons name={focused ? "home" : "home-outline"} size={22} color={color} />;
          }

          if (route.name === "Sessions") {
            return <Ionicons name={focused ? "time" : "time-outline"} size={22} color={color} />;
          }

          if (route.name === "Plans") {
            return <Ionicons name={focused ? "list" : "list-outline"} size={22} color={color} />;
          }

          if (route.name === "Profile") {
            return <Ionicons name={focused ? "person" : "person-outline"} size={22} color={color} />;
          }

          return <MaterialCommunityIcons name="card-account-details-outline" size={28} color="#ffffff" />;
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: t("tabs.home"),
        }}
      />

      <Tab.Screen
        name="Plans"
        component={PlansScreen}
        options={{
          title: t("tabs.plans"),
        }}
      />


      <Tab.Screen
        name="PresentCard"
        component={PresentCardScreen}
        options={{
          title: t("tabs.card"),
          tabBarLabel: ({ focused }) => (
            <Text
              style={{
                fontSize: 11,
                fontWeight: "700",
                color: focused ? "#43B14B" : "#9ca3af",
                marginBottom: 4,
              }}
            >
              {t("tabs.card")}
            </Text>
          ),
          tabBarButton: (props) => (
            <CenterTabButton onPress={props.onPress}>
              <MaterialCommunityIcons name="card-account-details-outline" size={28} color="#fff" />
            </CenterTabButton>
          ),
        }}
      />

      <Tab.Screen
        name="Sessions"
        component={ParkingSessionsScreen}
        options={{
          title: t("tabs.sessions"),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: t("tabs.profile"),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  centerButtonWrapper: {
    top: -18,
    justifyContent: "center",
    alignItems: "center",
  },
  centerButton: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: "#43B14B",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#43B14B",
    shadowOpacity: 0.28,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
    borderWidth: 4,
    borderColor: "#ffffff",
  },
});
