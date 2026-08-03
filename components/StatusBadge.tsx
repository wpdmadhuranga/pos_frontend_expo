import { StyleSheet, Text, View } from "react-native";
import { Colors } from "../constants/colors";
import { Fonts } from "../constants/typography";

type Tone = "teal" | "blue" | "orange" | "green" | "red" | "gray" | "amber" | "purple";

const toneMap: Record<Tone, { background: string; border: string; text: string }> = {
  teal: { background: "rgba(0,212,170,0.14)", border: "rgba(0,212,170,0.2)", text: Colors.primary },
  blue: { background: "rgba(59,130,246,0.14)", border: "rgba(59,130,246,0.2)", text: Colors.info },
  orange: { background: "rgba(255,107,53,0.14)", border: "rgba(255,107,53,0.2)", text: Colors.warning },
  green: { background: "rgba(16,185,129,0.14)", border: "rgba(16,185,129,0.2)", text: Colors.success },
  red: { background: "rgba(239,68,68,0.14)", border: "rgba(239,68,68,0.2)", text: Colors.danger },
  gray: { background: "rgba(107,114,128,0.14)", border: "rgba(107,114,128,0.2)", text: "#9aa3b8" },
  amber: { background: "rgba(245,158,11,0.14)", border: "rgba(245,158,11,0.2)", text: Colors.amber },
  purple: { background: "rgba(139,92,246,0.14)", border: "rgba(139,92,246,0.2)", text: Colors.purple },
};

export function StatusBadge({ label, tone }: { label: string; tone: Tone }) {
  const palette = toneMap[tone];
  return (
    <View style={[styles.badge, { backgroundColor: palette.background, borderColor: palette.border }]}>
      <Text style={[styles.text, { color: palette.text }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    minHeight: 28,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    alignSelf: "flex-start",
    justifyContent: "center",
  },
  text: {
    fontFamily: Fonts.semibold,
    fontSize: 11,
    letterSpacing: 0.2,
  },
});
