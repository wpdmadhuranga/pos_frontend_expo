import { Ionicons } from "@expo/vector-icons";
import { Pressable, type PressableProps } from "react-native";

type HapticTabProps = PressableProps & {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
};

export function HapticTab({ icon, color, ...props }: HapticTabProps) {
  return (
    <Pressable
      {...props}
      style={({ pressed }) => [
        {
          opacity: pressed ? 0.6 : 1,
        },
      ]}
    >
      <Ionicons name={icon} size={24} color={color} />
    </Pressable>
  );
}
