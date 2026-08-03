import { Stack } from "expo-router";

export default function DashboardLayout() {
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
