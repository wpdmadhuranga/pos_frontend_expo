import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors } from "../constants/colors";
import { Fonts } from "../constants/typography";
import { CustomersScreen } from "../screens/CustomersScreen";
import { DashboardScreen } from "../screens/DashboardScreen";
import { InventoryScreen } from "../screens/InventoryScreen";
import { JobsScreen } from "../screens/JobsScreen";
import { POSScreen } from "../screens/POSScreen";

const Tab = createBottomTabNavigator();

function MoreScreen() {
  const navigation = useNavigation();

  useEffect(() => {
    navigation.getParent()?.dispatch(DrawerActions.openDrawer());
  }, [navigation]);

  return (
    <View style={styles.moreScreen}>
      <Text style={styles.moreTitle}>Drawer opened</Text>
      <Text style={styles.moreText}>
        Use the menu to reach Service History, Settings, or Sign Out.
      </Text>
    </View>
  );
}

export function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
        tabBarIcon: ({ color, size }) => {
          const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
            Dashboard: "home-outline",
            POS: "keypad-outline",
            Jobs: "construct-outline",
            Inventory: "cube-outline",
            Customers: "people-outline",
            More: "menu-outline",
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
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="POS" component={POSScreen} />
      <Tab.Screen name="Jobs" component={JobsScreen} />
      <Tab.Screen name="Inventory" component={InventoryScreen} />
      <Tab.Screen name="Customers" component={CustomersScreen} />
      <Tab.Screen
        name="More"
        component={MoreScreen}
        listeners={({ navigation }) => ({
          tabPress: (event) => {
            event.preventDefault();
            navigation.getParent()?.dispatch(DrawerActions.openDrawer());
          },
        })}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.surface,
    borderTopColor: Colors.border,
    borderTopWidth: 1,
    height: 76,
    paddingBottom: 12,
    paddingTop: 10,
  },
  tabLabel: {
    fontSize: 11,
    fontFamily: Fonts.medium,
  },
  tabItem: {
    paddingTop: 4,
  },
  moreScreen: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  moreTitle: {
    color: Colors.textPrimary,
    fontFamily: Fonts.bold,
    fontSize: 20,
  },
  moreText: {
    marginTop: 8,
    textAlign: "center",
    color: Colors.textMuted,
    fontFamily: Fonts.body,
    fontSize: 13,
  },
});
