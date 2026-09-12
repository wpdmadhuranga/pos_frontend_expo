import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "../../../constants/colors";
import { Fonts } from "../../../constants/typography";

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,

        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,

        tabBarStyle: {
          backgroundColor: Colors.background,
          borderTopWidth: 0,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom + 8,
          paddingTop: 6,
        },

        tabBarLabelStyle: {
          fontFamily: Fonts.semibold,
          fontSize: 11,
        },

        tabBarIcon: ({ color, size }) => {
          const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
            dashboard: "home-outline",
            pos: "keypad-outline",
            jobs: "construct-outline",
            inventory: "cube-outline",
            customers: "people-outline",
          };

          return (
            <Ionicons
              name={iconMap[route.name] ?? "ellipse-outline"}
              size={size}
              color={color}
            />
          );
        },
      })}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
        }}
      />

      <Tabs.Screen
        name="pos"
        options={{
          title: "POS",
        }}
      />

      <Tabs.Screen
        name="jobs"
        options={{
          title: "Jobs",
        }}
      />

      <Tabs.Screen
        name="inventory"
        options={{
          title: "Inventory",
        }}
      />

      <Tabs.Screen
        name="customers"
        options={{
          title: "Customers",
        }}
      />
    </Tabs>
  );
}
