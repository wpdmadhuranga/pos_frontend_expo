import { StyleSheet, Text, View } from "react-native";
import { Colors } from "../constants/colors";
import { Fonts } from "../constants/typography";

export function StatCard({
  label,
  value,
  accent = Colors.primary,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color: accent }]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 76,
    borderRadius: 20,
    padding: 14,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: "space-between",
  },
  label: {
    color: Colors.textMuted,
    fontSize: 12,
    fontFamily: Fonts.medium,
  },
  value: {
    fontFamily: Fonts.monoBold,
    fontSize: 18,
    letterSpacing: -0.4,
  },
});
