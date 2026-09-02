import { Redirect, Stack } from "expo-router";
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
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="service-history" />
      <Stack.Screen name="jobs" />
      <Stack.Screen name="pos" />
      <Stack.Screen name="inventory" />
      <Stack.Screen name="customers" />
    </Stack>
  );
}
