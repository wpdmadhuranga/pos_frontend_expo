import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../constants/colors";
import { Fonts } from "../constants/typography";
import { useCart } from "../context/CartContext";

export function CartBar({ onPress }: { onPress: () => void }) {
  const { itemCount, total } = useCart();

  if (!itemCount) {
    return null;
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{itemCount}</Text>
      </View>
      <Text style={styles.label}>View Cart</Text>
      <View style={styles.spacer} />
      <Text style={styles.total}>${total.toFixed(2)}</Text>
      <TouchableOpacity style={styles.button} onPress={onPress} activeOpacity={0.85}>
        <Ionicons name="bag-check-outline" size={17} color={Colors.black} />
        <Text style={styles.buttonText}>Open</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    marginHorizontal: 16,
    marginBottom: 14,
    gap: 10,
  },
  badge: {
    minWidth: 28,
    height: 28,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: Colors.black,
    fontFamily: Fonts.bold,
    fontSize: 12,
  },
  label: {
    color: Colors.black,
    fontFamily: Fonts.semibold,
    fontSize: 14,
  },
  spacer: {
    flex: 1,
  },
  total: {
    color: Colors.black,
    fontFamily: Fonts.monoBold,
    fontSize: 16,
  },
  button: {
    minHeight: 44,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.16)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  buttonText: {
    color: Colors.black,
    fontFamily: Fonts.bold,
    fontSize: 13,
  },
});
