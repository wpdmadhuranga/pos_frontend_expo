import { Ionicons } from "@expo/vector-icons";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItem,
} from "@react-navigation/drawer";
import {
  DrawerActions,
  NavigationState,
  useNavigation,
} from "@react-navigation/native";
import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../constants/colors";
import { Fonts } from "../constants/typography";
import { useAuth } from "../context/AuthContext";
import { mockUser } from "../data/mock";
import { ServiceHistoryScreen } from "../screens/ServiceHistoryScreen";
import { SettingsScreen } from "../screens/SettingsScreen";
import { BottomTabNavigator } from "./BottomTabNavigator";

const Drawer = createDrawerNavigator();

function DrawerContent(props: any) {
  const navigation = useNavigation();
  const { signOut } = useAuth();

  const goToTabs = (screen: string) => {
    navigation.dispatch(DrawerActions.closeDrawer());
    (navigation as any).navigate("Tabs", { screen });
  };

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={styles.drawerScroll}
    >
      <View style={styles.brandBlock}>
        <View style={styles.brandIcon}>
          <Ionicons name="build-outline" size={24} color={Colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.brandName}>{mockUser.shop}</Text>
          <Text style={styles.brandTag}>Premium auto service POS</Text>
        </View>
      </View>

      <View style={styles.userCard}>
        <View style={styles.userTopRow}>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>{mockUser.initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>{mockUser.name}</Text>
            <Text style={styles.userRole}>{mockUser.role}</Text>
          </View>
          <View style={styles.onlinePill}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>Online</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Navigation</Text>
        {[
          { label: "Dashboard", icon: "home-outline", screen: "Dashboard" },
          { label: "POS", icon: "keypad-outline", screen: "POS" },
          { label: "Jobs", icon: "construct-outline", screen: "Jobs" },
          { label: "Inventory", icon: "cube-outline", screen: "Inventory" },
          { label: "Customers", icon: "people-outline", screen: "Customers" },
        ].map((item) => (
          <DrawerItem
            key={item.label}
            label={item.label}
            focused={false}
            onPress={() => goToTabs(item.screen)}
            icon={({ color, size }) => (
              <Ionicons name={item.icon as any} size={size} color={color} />
            )}
            labelStyle={styles.drawerLabel}
            style={styles.drawerItem}
          />
        ))}

        <DrawerItem
          label="Service History"
          focused={false}
          onPress={() => {
            navigation.dispatch(DrawerActions.closeDrawer());
            (navigation as any).navigate("ServiceHistory");
          }}
          icon={({ color, size }) => (
            <Ionicons name="receipt-outline" size={size} color={color} />
          )}
          labelStyle={styles.drawerLabel}
          style={styles.drawerItem}
        />
      </View>

      <View style={styles.footer}>
        <DrawerItem
          label="Settings"
          focused={false}
          onPress={() => (navigation as any).navigate("Settings")}
          icon={({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          )}
          labelStyle={styles.drawerLabel}
          style={styles.drawerItem}
        />
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={async () => {
            await signOut();
            router.replace("/(auth)/login");
          }}
          activeOpacity={0.85}
        >
          <Ionicons name="log-out-outline" size={18} color={Colors.danger} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
}

export function RootNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: { backgroundColor: Colors.background, width: 320 },
        drawerActiveTintColor: Colors.primary,
        drawerInactiveTintColor: Colors.textMuted,
        overlayColor: "rgba(0,0,0,0.72)",
      }}
      // --- ADD THIS SCREEN OPTIONS LISTENER ---
      screenListeners={{
        state: (e) => {
          const state = e.data.state as NavigationState;
          if (state) {
            console.log(
              "📍 [Navigation Debug] Active Route Stack:",
              JSON.stringify(state, null, 2),
            );
          }
        },
      }}
    >
      <Drawer.Screen name="Tabs" component={BottomTabNavigator} />
      <Drawer.Screen name="ServiceHistory" component={ServiceHistoryScreen} />
      <Drawer.Screen name="Settings" component={SettingsScreen} />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  drawerScroll: {
    backgroundColor: Colors.background,
    paddingTop: 10,
    paddingBottom: 24,
  },
  brandBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 18,
    paddingBottom: 16,
  },
  brandIcon: {
    width: 50,
    height: 50,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,212,170,0.12)",
    borderWidth: 1,
    borderColor: "rgba(0,212,170,0.18)",
  },
  brandName: {
    color: Colors.textPrimary,
    fontFamily: Fonts.bold,
    fontSize: 18,
  },
  brandTag: {
    color: Colors.textMuted,
    fontFamily: Fonts.body,
    fontSize: 12,
    marginTop: 3,
  },
  userCard: {
    marginHorizontal: 16,
    padding: 14,
    borderRadius: 22,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  userTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 18,
    backgroundColor: "rgba(0,212,170,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  userAvatarText: {
    color: Colors.primary,
    fontFamily: Fonts.bold,
  },
  userName: {
    color: Colors.textPrimary,
    fontFamily: Fonts.semibold,
    fontSize: 15,
  },
  userRole: {
    color: Colors.textMuted,
    fontFamily: Fonts.body,
    fontSize: 12,
    marginTop: 2,
  },
  onlinePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    height: 30,
    borderRadius: 999,
    backgroundColor: "rgba(16,185,129,0.12)",
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: Colors.success,
  },
  onlineText: {
    color: Colors.success,
    fontFamily: Fonts.semibold,
    fontSize: 11,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 8,
  },
  sectionTitle: {
    color: Colors.textMuted,
    fontFamily: Fonts.semibold,
    fontSize: 12,
    paddingHorizontal: 10,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  drawerItem: {
    borderRadius: 16,
    marginVertical: 2,
  },
  drawerLabel: {
    color: Colors.textPrimary,
    fontFamily: Fonts.medium,
  },
  footer: {
    marginTop: 10,
    paddingHorizontal: 8,
  },
  signOutButton: {
    minHeight: 48,
    marginHorizontal: 10,
    marginTop: 6,
    borderRadius: 16,
    backgroundColor: "rgba(239,68,68,0.08)",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.16)",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  signOutText: {
    color: Colors.danger,
    fontFamily: Fonts.semibold,
    fontSize: 13,
  },
});
