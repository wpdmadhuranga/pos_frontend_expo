import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { BlurView } from "expo-blur";
import { forwardRef, ReactNode, useEffect, useImperativeHandle, useRef } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
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

export const BottomSheet = forwardRef<BottomSheetHandle, BottomSheetProps>(
  ({ visible, title, onClose, snapPoints = ["55%"], children, footer, scrollable = true }, ref) => {
    const modalRef = useRef<BottomSheetModal>(null);

    useImperativeHandle(ref, () => ({
      present: () => modalRef.current?.present(),
      dismiss: () => modalRef.current?.dismiss(),
    }));

    useEffect(() => {
      if (visible) {
        modalRef.current?.present();
      } else {
        modalRef.current?.dismiss();
      }
    }, [visible]);

    return (
      <BottomSheetModal
        ref={modalRef}
        snapPoints={snapPoints}
        enablePanDownToClose
        onDismiss={onClose}
        backgroundStyle={styles.background}
        handleIndicatorStyle={styles.handle}
        backdropComponent={(backdropProps) => (
          <View style={StyleSheet.absoluteFill}>
            <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
            <BottomSheetBackdrop
              {...backdropProps}
              appearsOnIndex={0}
              disappearsOnIndex={-1}
              pressBehavior="close"
              opacity={0.35}
            />
          </View>
        )}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>Premium service workflow</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton} activeOpacity={0.8}>
            <Ionicons name="close" size={18} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {scrollable ? (
          <BottomSheetScrollView contentContainerStyle={styles.content}>{children}</BottomSheetScrollView>
        ) : (
          <BottomSheetView style={styles.content}>{children}</BottomSheetView>
        )}

        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </BottomSheetModal>
    );
  },
);

BottomSheet.displayName = "BottomSheet";

const styles = StyleSheet.create({
  background: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  handle: {
    backgroundColor: "rgba(255,255,255,0.2)",
    width: 42,
    height: 5,
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
