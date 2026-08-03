import { StyleSheet, Text, View } from "react-native";
import { Colors } from "../constants/colors";
import { Fonts } from "../constants/typography";

export function StockBar({ stock, minStock, capacity = 20 }: { stock: number; minStock: number; capacity?: number }) {
  const ratio = Math.max(0, Math.min(stock / capacity, 1));
  const fill = stock <= 0 ? Colors.danger : stock <= minStock ? Colors.warning : Colors.success;
  return (
    <View style={styles.wrap}>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${ratio * 100}%`, backgroundColor: fill }]} />
      </View>
      <Text style={styles.text}>{stock} / {capacity}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
  },
  track: {
    height: 7,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.06)",
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 999,
  },
  text: {
    color: Colors.textMuted,
    fontFamily: Fonts.monoMedium,
    fontSize: 12,
  },
});
