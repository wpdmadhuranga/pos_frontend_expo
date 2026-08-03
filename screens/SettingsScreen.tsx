import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AppHeader } from "../components/AppHeader";
import { Colors } from "../constants/colors";
import { Fonts } from "../constants/typography";
import { mockUser } from "../data/mock";

export function SettingsScreen() {
  return (
    <View style={styles.screen}>
      <AppHeader title="Settings" />
      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>{mockUser.shop}</Text>
          <Text style={styles.meta}>{mockUser.name} · {mockUser.role}</Text>
        </View>
        {[
          ["Notifications", "notifications-outline"],
          ["Tax Settings", "calculator-outline"],
          ["Printer Setup", "print-outline"],
          ["Appearance", "moon-outline"],
        ].map(([label, icon]) => (
          <TouchableOpacity key={label} style={styles.row} activeOpacity={0.86}>
            <Ionicons name={icon as any} size={18} color={Colors.primary} />
            <Text style={styles.rowText}>{label}</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.signOut} onPress={() => router.replace("/(auth)/login")}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, gap: 12 },
  card: { borderRadius: 22, padding: 16, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border },
  title: { color: Colors.textPrimary, fontFamily: Fonts.bold, fontSize: 18 },
  meta: { color: Colors.textMuted, fontFamily: Fonts.body, fontSize: 12, marginTop: 4 },
  row: { minHeight: 52, borderRadius: 18, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border },
  rowText: { flex: 1, color: Colors.textPrimary, fontFamily: Fonts.semibold },
  signOut: { minHeight: 50, borderRadius: 18, backgroundColor: "rgba(239,68,68,0.1)", borderWidth: 1, borderColor: "rgba(239,68,68,0.18)", alignItems: "center", justifyContent: "center", marginTop: 8 },
  signOutText: { color: Colors.danger, fontFamily: Fonts.bold },
});
