import { Ionicons } from "@expo/vector-icons";
import {
  forwardRef,
  ReactNode,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../constants/colors";
import { Fonts } from "../constants/typography";

export interface BottomSheetHandle {
  present: () => void;
  dismiss: () => void;
}

interface BottomSheetProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  snapPoints?: (string | number)[];
  children: ReactNode;
  footer?: ReactNode;
  scrollable?: boolean;
}

// Module-level so the default keeps the same reference between renders.
const DEFAULT_SNAP_POINTS: (string | number)[] = ["55%"];

/**
 * Turns the first snap point ("55%" or 480) into a pixel height,
 * never taller than the space available below the status bar.
 */
function resolveSheetHeight(
  snap: string | number | undefined,
  available: number,
): number {
  if (typeof snap === "number") {
    return Math.min(snap, available);
  }

  if (typeof snap === "string" && snap.trim().endsWith("%")) {
    const fraction = parseFloat(snap) / 100;
    if (!isNaN(fraction)) {
      return Math.min(available * fraction, available);
    }
  }

  return available * 0.55;
}

/**
 * Bottom sheet built on React Native's <Modal>.
 * Same props and ref API as the previous gorhom-based version, but with no
 * dependency on gorhom, Reanimated or gesture handler.
 */
export const BottomSheet = forwardRef<BottomSheetHandle, BottomSheetProps>(
  (
    {
      visible,
      title,
      onClose,
      snapPoints = DEFAULT_SNAP_POINTS,
      children,
      footer,
      scrollable = true,
    },
    ref,
  ) => {
    const [open, setOpen] = useState(visible);
    const { height: windowHeight } = useWindowDimensions();
    const insets = useSafeAreaInsets();

    // Keep the sheet in sync with the `visible` prop.
    useEffect(() => {
      console.log("[BottomSheet] visible =", visible);
      setOpen(visible);
    }, [visible]);

    // Same imperative API as before (present / dismiss).
    useImperativeHandle(ref, () => ({
      present: () => setOpen(true),
      dismiss: () => setOpen(false),
    }));

    const close = useCallback(() => {
      setOpen(false);
      onClose();
    }, [onClose]);

    const available = windowHeight - insets.top;
    const sheetHeight = resolveSheetHeight(snapPoints[0], available);

    return (
      <Modal
        visible={open}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={close}
      >
        <KeyboardAvoidingView
          style={styles.overlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          {/* Tap outside the sheet to close */}
          <Pressable style={styles.backdrop} onPress={close} />

          <View style={[styles.sheet, { height: sheetHeight }]}>
            <View style={styles.handle} />

            <View style={styles.header}>
              <View>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.subtitle}>Premium service workflow</Text>
              </View>
              <TouchableOpacity
                onPress={close}
                style={styles.closeButton}
                activeOpacity={0.8}
              >
                <Ionicons name="close" size={18} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {scrollable ? (
              <ScrollView
                style={styles.body}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {children}
              </ScrollView>
            ) : (
              <View style={[styles.body, styles.content]}>{children}</View>
            )}

            {footer ? <View style={styles.footer}>{footer}</View> : null}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    );
  },
);

BottomSheet.displayName = "BottomSheet";

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  handle: {
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    width: 42,
    height: 5,
    borderRadius: 3,
    marginTop: 10,
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingBottom: 12,
  },
  title: {
    color: Colors.textPrimary,
    fontFamily: Fonts.semibold,
    fontSize: 17,
  },
  subtitle: {
    color: Colors.textMuted,
    fontFamily: Fonts.body,
    fontSize: 12,
    marginTop: 4,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  body: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 18,
    paddingBottom: 18,
    gap: 14,
  },
  footer: {
    padding: 18,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});
