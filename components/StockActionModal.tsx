import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../constants/colors";

export interface StockActionPart {
  id: string;
  name: string;
  brand: string;
  stockQuantity: number;
  inventoryItemId: string | null;
}

export interface StockUpdateResult {
  quantityOnHand?: number;
  message?: string;
  [key: string]: unknown;
}

interface StockActionModalProps {
  visible: boolean;
  part: StockActionPart | null;
  onClose: () => void;
  onStockIn: (
    id: string,
    payload: { quantity: number; note?: string },
  ) => Promise<StockUpdateResult>;
  onStockOut: (
    id: string,
    payload: { quantity: number; note?: string },
  ) => Promise<StockUpdateResult>;
  onSuccess: (newQuantity: number, action: "in" | "out") => void;
}

type Mode = "menu" | "form" | "result";
type Action = "in" | "out" | null;

interface ResultInfo {
  success: boolean;
  title: string;
  message: string;
  newQuantity?: number;
}

export function StockActionModal({
  visible,
  part,
  onClose,
  onStockIn,
  onStockOut,
  onSuccess,
}: StockActionModalProps) {
  const [mode, setMode] = useState<Mode>("menu");
  const [action, setAction] = useState<Action>(null);
  const [quantity, setQuantity] = useState("10");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ResultInfo | null>(null);

  // Reset internal state every time a new part is opened
  useEffect(() => {
    if (visible) {
      setMode("menu");
      setAction(null);
      setQuantity("10");
      setNote("");
      setSubmitting(false);
      setResult(null);
    }
  }, [visible, part?.id]);

  const handlePickAction = (nextAction: "in" | "out") => {
    if (!part?.inventoryItemId) {
      Alert.alert(
        "Not linked to inventory",
        "This product isn't linked to an inventory item yet, so stock can't be adjusted here. Please link it to an inventory item first.",
      );
      return;
    }

    setAction(nextAction);
    setMode("form");
  };

  const handleBackToMenu = () => {
    setMode("menu");
    setAction(null);
  };

  const handleConfirm = async () => {
    if (!part || !action) return;

    if (!part.inventoryItemId) {
      Alert.alert(
        "Not linked to inventory",
        "This product isn't linked to an inventory item yet, so stock can't be adjusted here. Please link it to an inventory item first.",
      );
      return;
    }

    const qty = Number(quantity);

    if (!qty || qty <= 0) {
      Alert.alert(
        "Invalid quantity",
        "Please enter a valid quantity greater than 0.",
      );
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        quantity: qty,
        note: note.trim() || undefined,
      };

      const response =
        action === "in"
          ? await onStockIn(part.inventoryItemId, payload)
          : await onStockOut(part.inventoryItemId, payload);

      const newQuantity =
        typeof response?.quantityOnHand === "number"
          ? response.quantityOnHand
          : action === "in"
            ? part.stockQuantity + qty
            : Math.max(0, part.stockQuantity - qty);

      onSuccess(newQuantity, action);

      const defaultMsg =
        action === "in"
          ? `Successfully added ${qty} units.`
          : `Successfully removed ${qty} units.`;

      setResult({
        success: true,
        title: action === "in" ? "Stock In Successful" : "Stock Out Successful",
        message: response?.message || defaultMsg,
        newQuantity,
      });

      setMode("result");
    } catch (error: any) {
      const message =
        error instanceof Error ? error.message : "Failed to update stock";

      setResult({
        success: false,
        title: "Stock Update Failed",
        message,
      });

      setMode("result");
    } finally {
      setSubmitting(false);
    }
  };

  // Close the modal completely after Done / Close
  const handleDone = () => {
    setResult(null);
    setMode("menu");
    setAction(null);
    setQuantity("10");
    setNote("");
    setSubmitting(false);

    onClose();
  };

  const handleTryAgain = () => {
    setResult(null);
    setMode("form");
  };

  if (!part) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={
        mode === "result" && !result?.success ? handleTryAgain : onClose
      }
    >
      <View className="flex-1 justify-end bg-black/70">
        <TouchableOpacity
          activeOpacity={1}
          className="absolute inset-0"
          onPress={
            submitting ? undefined : mode === "result" ? handleDone : onClose
          }
        />

        <View className="rounded-t-[28px] bg-[#121317] px-5 pb-8 pt-3 border border-b-0 border-[#27303c]">
          <View className="mb-4 items-center">
            <View className="h-1.5 w-12 rounded-full bg-slate-600" />
          </View>

          {mode !== "result" && (
            <View className="mb-4 flex-row items-start justify-between">
              <View className="flex-1 pr-3">
                <Text className="text-white font-bold text-lg">
                  {mode === "menu"
                    ? "Stock Actions"
                    : action === "in"
                      ? "Stock In"
                      : "Stock Out"}
                </Text>

                <Text
                  className="text-sm mt-0.5"
                  style={{ color: Colors.textMuted }}
                >
                  {part.brand} · {part.name}
                </Text>
              </View>

              <TouchableOpacity
                onPress={submitting ? undefined : onClose}
                className="h-9 w-9 items-center justify-center rounded-full bg-white/5"
              >
                <Ionicons name="close" size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>
          )}

          {mode === "menu" ? (
            <View className="gap-3">
              {!part.inventoryItemId && (
                <View className="flex-row items-start gap-2.5 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                  <Ionicons
                    name="warning-outline"
                    size={18}
                    color="#fbbf24"
                    style={{ marginTop: 1 }}
                  />

                  <Text className="flex-1 text-amber-400 text-sm font-medium">
                    This product isn't linked to an inventory item, so stock
                    actions are unavailable.
                  </Text>
                </View>
              )}

              <TouchableOpacity
                disabled={!part.inventoryItemId}
                className={`flex-row items-center gap-3 p-4 rounded-2xl border ${
                  part.inventoryItemId
                    ? "bg-emerald-500/10 border-emerald-500/30"
                    : "bg-white/5 border-[#27303c] opacity-50"
                }`}
                onPress={() => handlePickAction("in")}
                activeOpacity={0.85}
              >
                <View
                  className={`w-10 h-10 rounded-xl items-center justify-center ${
                    part.inventoryItemId ? "bg-emerald-500/20" : "bg-white/5"
                  }`}
                >
                  <Ionicons
                    name="arrow-down-circle"
                    size={22}
                    color={part.inventoryItemId ? "#34d399" : "#64748b"}
                  />
                </View>

                <View className="flex-1">
                  <Text
                    className={`font-bold text-base ${
                      part.inventoryItemId
                        ? "text-emerald-400"
                        : "text-slate-500"
                    }`}
                  >
                    Stock In
                  </Text>

                  <Text
                    className="text-xs mt-0.5"
                    style={{ color: Colors.textMuted }}
                  >
                    Add stock to inventory
                  </Text>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={part.inventoryItemId ? "#34d399" : "#64748b"}
                />
              </TouchableOpacity>

              <TouchableOpacity
                disabled={!part.inventoryItemId}
                className={`flex-row items-center gap-3 p-4 rounded-2xl border ${
                  part.inventoryItemId
                    ? "bg-red-500/10 border-red-500/30"
                    : "bg-white/5 border-[#27303c] opacity-50"
                }`}
                onPress={() => handlePickAction("out")}
                activeOpacity={0.85}
              >
                <View
                  className={`w-10 h-10 rounded-xl items-center justify-center ${
                    part.inventoryItemId ? "bg-red-500/20" : "bg-white/5"
                  }`}
                >
                  <Ionicons
                    name="arrow-up-circle"
                    size={22}
                    color={part.inventoryItemId ? "#f87171" : "#64748b"}
                  />
                </View>

                <View className="flex-1">
                  <Text
                    className={`font-bold text-base ${
                      part.inventoryItemId ? "text-red-400" : "text-slate-500"
                    }`}
                  >
                    Stock Out
                  </Text>

                  <Text
                    className="text-xs mt-0.5"
                    style={{ color: Colors.textMuted }}
                  >
                    Remove stock from inventory
                  </Text>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={part.inventoryItemId ? "#f87171" : "#64748b"}
                />
              </TouchableOpacity>

              <TouchableOpacity
                className="items-center justify-center p-4 rounded-2xl bg-[#1a1f28] border border-[#27303c]"
                onPress={onClose}
                activeOpacity={0.85}
              >
                <Text
                  className="font-semibold text-base"
                  style={{ color: Colors.textPrimary }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          ) : mode === "form" ? (
            <View className="gap-4">
              <View className="rounded-2xl p-3.5 bg-[#1a1f28] border border-[#27303c]">
                <Text
                  className="font-semibold text-base"
                  style={{ color: Colors.textPrimary }}
                >
                  {part.name}
                </Text>

                <Text
                  className="text-sm mt-0.5"
                  style={{ color: Colors.textMuted }}
                >
                  Current stock: {part.stockQuantity}
                </Text>
              </View>

              <View>
                <Text
                  className="text-sm mb-1.5 font-medium"
                  style={{ color: Colors.textMuted }}
                >
                  Quantity
                </Text>

                <TextInput
                  keyboardType="numeric"
                  value={quantity}
                  onChangeText={setQuantity}
                  placeholder="Enter quantity"
                  placeholderTextColor={Colors.textMuted}
                  editable={!submitting}
                  className="min-h-[48px] rounded-xl border border-[#27303c] bg-[#1a1f28] px-4 text-base font-semibold"
                  style={{ color: Colors.textPrimary }}
                />
              </View>

              <View>
                <Text
                  className="text-sm mb-1.5 font-medium"
                  style={{ color: Colors.textMuted }}
                >
                  Note (optional)
                </Text>

                <TextInput
                  value={note}
                  onChangeText={setNote}
                  placeholder="e.g. Purchased from ABC Suppliers - Invoice #INV-2201"
                  placeholderTextColor={Colors.textMuted}
                  multiline
                  numberOfLines={3}
                  editable={!submitting}
                  className="min-h-[90px] rounded-xl border border-[#27303c] bg-[#1a1f28] px-4 py-3 text-sm"
                  style={{
                    textAlignVertical: "top",
                    color: Colors.textPrimary,
                  }}
                />
              </View>

              <View className="flex-row gap-3">
                <TouchableOpacity
                  disabled={submitting}
                  onPress={handleBackToMenu}
                  className="flex-1 min-h-[52px] rounded-2xl items-center justify-center bg-[#1a1f28] border border-[#27303c]"
                  activeOpacity={0.85}
                >
                  <Text
                    className="font-semibold text-base"
                    style={{ color: Colors.textPrimary }}
                  >
                    Back
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  disabled={submitting}
                  onPress={handleConfirm}
                  className={`flex-1 min-h-[52px] rounded-2xl items-center justify-center flex-row gap-2 ${
                    action === "in" ? "bg-emerald-500" : "bg-red-500"
                  } ${submitting ? "opacity-60" : ""}`}
                  activeOpacity={0.85}
                >
                  {submitting && (
                    <ActivityIndicator size="small" color="#080a0d" />
                  )}

                  <Text className="text-black font-bold text-base">
                    {submitting
                      ? "Processing…"
                      : action === "in"
                        ? `Confirm (+${quantity || 0})`
                        : `Confirm (-${quantity || 0})`}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            // ===== RESULT SCREEN =====
            result && (
              <View className="gap-4 items-center pt-1 pb-1">
                <View
                  className={`w-16 h-16 rounded-full items-center justify-center ${
                    result.success ? "bg-emerald-500/15" : "bg-red-500/15"
                  }`}
                >
                  <Ionicons
                    name={result.success ? "checkmark-circle" : "close-circle"}
                    size={40}
                    color={result.success ? "#34d399" : "#f87171"}
                  />
                </View>

                <View className="items-center gap-1.5 px-2">
                  <Text
                    className={`font-bold text-lg text-center ${
                      result.success ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {result.title}
                  </Text>

                  <Text
                    className="text-sm text-center"
                    style={{ color: Colors.textMuted }}
                  >
                    {result.message}
                  </Text>
                </View>

                {result.success && typeof result.newQuantity === "number" && (
                  <View className="w-full rounded-2xl p-4 bg-[#1a1f28] border border-[#27303c] flex-row items-center justify-between">
                    <Text
                      className="text-sm"
                      style={{ color: Colors.textMuted }}
                    >
                      New stock level
                    </Text>

                    <Text
                      className="font-bold text-lg"
                      style={{ color: Colors.textPrimary }}
                    >
                      {result.newQuantity}
                    </Text>
                  </View>
                )}

                <View className="w-full flex-row gap-3 mt-1">
                  {!result.success && (
                    <TouchableOpacity
                      onPress={handleTryAgain}
                      className="flex-1 min-h-[52px] rounded-2xl items-center justify-center bg-[#1a1f28] border border-[#27303c]"
                      activeOpacity={0.85}
                    >
                      <Text
                        className="font-semibold text-base"
                        style={{ color: Colors.textPrimary }}
                      >
                        Try Again
                      </Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    onPress={handleDone}
                    className={`flex-1 min-h-[52px] rounded-2xl items-center justify-center ${
                      result.success
                        ? "bg-emerald-500"
                        : "bg-[#1a1f28] border border-[#27303c]"
                    }`}
                    activeOpacity={0.85}
                  >
                    <Text
                      className={`font-bold text-base ${
                        result.success ? "text-black" : ""
                      }`}
                      style={
                        !result.success
                          ? { color: Colors.textPrimary }
                          : undefined
                      }
                    >
                      {result.success ? "Done" : "Close"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )
          )}
        </View>
      </View>
    </Modal>
  );
}
