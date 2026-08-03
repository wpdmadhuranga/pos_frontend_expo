import { Ionicons } from "@expo/vector-icons";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../constants/colors";
import { Fonts } from "../constants/typography";

interface AppHeaderProps {
  title: string;
}

export function AppHeader({ title }: AppHeaderProps) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const openDrawer = () => {
    navigation.getParent()?.dispatch(DrawerActions.openDrawer());
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
      <TouchableOpacity onPress={openDrawer} style={styles.iconButton} activeOpacity={0.8}>
        <Ionicons name="menu" size={22} color={Colors.textPrimary} />
      </TouchableOpacity>

      <View style={styles.titleWrap} pointerEvents="none">
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      </View>

      <View style={styles.rightWrap}>
        <TouchableOpacity onPress={() => {}} style={styles.iconButton} activeOpacity={0.8}>
          <View style={styles.notificationDot} />
          <Ionicons name="notifications-outline" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>AR</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 78,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.background,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.04)",
    alignItems: "center",
    justifyContent: "center",
  },
  titleWrap: {
    flex: 1,
    paddingHorizontal: 10,
    alignItems: "center",
  },
  title: {
    color: Colors.textPrimary,
    fontFamily: Fonts.semibold,
    fontSize: 17,
    letterSpacing: -0.3,
  },
  rightWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  notificationDot: {
    position: "absolute",
    top: 9,
    right: 10,
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: Colors.warning,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(0,212,170,0.14)",
    borderWidth: 1,
    borderColor: "rgba(0,212,170,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: Colors.primary,
    fontFamily: Fonts.bold,
    fontSize: 13,
  },
});
