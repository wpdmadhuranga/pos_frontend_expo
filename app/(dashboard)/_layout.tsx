import { Image } from "expo-image";
import { Redirect } from "expo-router";
import { Drawer } from "expo-router/drawer";
import { ActivityIndicator, View } from "react-native";
import { Colors } from "../../constants/colors";
import { useAuth } from "../../context/AuthContext";

export default function DashboardLayout() {
  const { loggedIn, isHydrated } = useAuth();

  if (!isHydrated) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: Colors.background,
        }}
      >
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!loggedIn) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Background Image */}
      <Image
        source={require("../../assets/images/login.jpg")}
        contentFit="cover"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: "100%",
          height: "100%",
          opacity: 0.25,
        }}
      />

      {/* Dark Overlay */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(5, 9, 13, 0.65)",
        }}
      />

      <Drawer
        screenOptions={{
          headerShown: false,
          drawerStyle: {
            backgroundColor: Colors.background,
            width: 320,
          },
          drawerActiveTintColor: Colors.primary,
          drawerInactiveTintColor: Colors.textMuted,
          overlayColor: "rgba(0,0,0,0.72)",
        }}
      >
        <Drawer.Screen
          name="(tabs)"
          options={{
            title: "Dashboard",
          }}
        />

        <Drawer.Screen
          name="service-history"
          options={{
            title: "Service History",
          }}
        />

        <Drawer.Screen
          name="settings"
          options={{
            title: "Settings",
          }}
        />
      </Drawer>
    </View>
  );
}
