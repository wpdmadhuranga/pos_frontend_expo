import { Ionicons } from "@expo/vector-icons";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";

import { CartItem, useCart } from "../context/CartContext";

export type PaymentMethod = "cash" | "card" | "bank";

const PAYMENT_METHODS: { id: PaymentMethod; label: string }[] = [
  { id: "cash", label: "Cash" },
  { id: "card", label: "Card" },
  { id: "bank", label: "Bank" },
];

const KIND_ICON: Record<CartItem["kind"], keyof typeof Ionicons.glyphMap> = {
  service: "construct-outline",
  part: "cube-outline",
  package: "layers-outline",
};

interface CartSheetProps {
  visible: boolean;
  onClose: () => void;
  paymentMethod: PaymentMethod;
  onSelectPaymentMethod: (method: PaymentMethod) => void;
  onCheckout: () => void;
  checkingOut?: boolean;
}

export function CartSheet({
  visible,
  onClose,
  paymentMethod,
  onSelectPaymentMethod,
  onCheckout,
  checkingOut = false,
}: CartSheetProps) {
  const { items, itemCount, subtotal, tax, total, updateQuantity, removeItem } =
    useCart();

  const isEmpty = items.length === 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/70">
        <TouchableOpacity
          activeOpacity={1}
          className="absolute inset-0"
          onPress={onClose}
        />

        <View className="max-h-[90%] rounded-t-[32px] bg-[#121720] px-5 pb-8 pt-3">
          {/* Handle */}
          <View className="mb-5 items-center">
            <View className="h-1.5 w-12 rounded-full bg-slate-600" />
          </View>

          {/* Header */}
          <View className="mb-5 flex-row items-center justify-between">
            <View>
              <Text className="text-xs font-bold uppercase tracking-widest text-[#22c7b6]">
                Current Sale
              </Text>
              <Text className="text-2xl font-bold text-white">
                Cart · {itemCount} {itemCount === 1 ? "item" : "items"}
              </Text>
            </View>

            <TouchableOpacity
              onPress={onClose}
              className="h-10 w-10 items-center justify-center rounded-full bg-[#1a1f28]"
            >
              <Ionicons name="close" size={22} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          {/* Line items */}
          {isEmpty ? (
            <View className="items-center gap-3 rounded-2xl border border-[#27303c] bg-[#1a1f28] px-4 py-10">
              <Ionicons name="cart-outline" size={32} color="#475569" />
              <Text className="text-sm text-slate-400">
                Cart is empty — add a service or product to get started.
              </Text>
            </View>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerClassName="gap-3 pb-3"
              style={{ maxHeight: 320 }}
            >
              {items.map((entry) => (
                <View
                  key={entry.id}
                  className="rounded-2xl border border-[#27303c] bg-[#1a1f28] p-3"
                >
                  <View className="flex-row items-center">
                    <View className="mr-3 h-11 w-11 items-center justify-center rounded-xl bg-white/5">
                      <Ionicons
                        name={KIND_ICON[entry.kind]}
                        size={18}
                        color="#22c7b6"
                      />
                    </View>

                    <View className="flex-1 pr-2">
                      <Text
                        className="text-sm font-bold text-white"
                        numberOfLines={2}
                      >
                        {entry.name}
                      </Text>
                      <Text className="mt-1 text-xs text-slate-500">
                        {entry.kind} · ${entry.price.toLocaleString()} each
                      </Text>
                    </View>

                    <TouchableOpacity
                      onPress={() => removeItem(entry.id)}
                      className="h-8 w-8 items-center justify-center rounded-full bg-red-500/10"
                    >
                      <Ionicons
                        name="trash-outline"
                        size={16}
                        color="#f87171"
                      />
                    </TouchableOpacity>
                  </View>

                  <View className="mt-3 flex-row items-center justify-between">
                    <View className="flex-row items-center rounded-xl border border-[#27303c] bg-[#121720] p-1">
                      <TouchableOpacity
                        onPress={() => updateQuantity(entry.id, -1)}
                        className="h-8 w-8 items-center justify-center rounded-lg bg-white/5"
                      >
                        <Ionicons name="remove" size={16} color="white" />
                      </TouchableOpacity>

                      <Text className="mx-3 min-w-[18px] text-center font-mono text-sm font-bold text-white">
                        {entry.qty}
                      </Text>

                      <TouchableOpacity
                        onPress={() => updateQuantity(entry.id, 1)}
                        className="h-8 w-8 items-center justify-center rounded-lg bg-[#22c7b6]/15"
                      >
                        <Ionicons name="add" size={16} color="#22c7b6" />
                      </TouchableOpacity>
                    </View>

                    <Text className="font-mono text-base font-bold text-[#22c7b6]">
                      ${(entry.price * entry.qty).toLocaleString()}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}

          {/* Payment method */}
          {!isEmpty && (
            <View className="mb-4 mt-4">
              <Text className="mb-2 text-sm font-semibold text-slate-300">
                Payment Method
              </Text>
              <View className="flex-row gap-2">
                {PAYMENT_METHODS.map((method) => {
                  const active = paymentMethod === method.id;
                  return (
                    <TouchableOpacity
                      key={method.id}
                      onPress={() => onSelectPaymentMethod(method.id)}
                      className={`flex-1 items-center rounded-xl border py-3 ${
                        active
                          ? "border-[#22c7b6] bg-[#22c7b6]/10"
                          : "border-[#27303c] bg-[#1a1f28]"
                      }`}
                    >
                      <Text
                        className={`text-xs font-bold ${
                          active ? "text-[#22c7b6]" : "text-slate-400"
                        }`}
                      >
                        {method.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Totals */}
          <View className="mb-4 gap-2 rounded-2xl border border-[#27303c] bg-[#1a1f28] p-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-slate-400">Subtotal</Text>
              <Text className="font-mono text-sm font-bold text-white">
                ${subtotal.toLocaleString()}
              </Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-slate-400">Tax (8%)</Text>
              <Text className="font-mono text-sm font-bold text-white">
                ${tax.toLocaleString()}
              </Text>
            </View>
            <View className="mt-1 flex-row items-center justify-between border-t border-[#27303c] pt-2">
              <Text className="text-sm font-semibold text-slate-300">
                Total
              </Text>
              <Text className="font-mono text-2xl font-bold text-[#22c7b6]">
                ${total.toLocaleString()}
              </Text>
            </View>
          </View>

          {/* Checkout */}
          <TouchableOpacity
            disabled={isEmpty || checkingOut}
            activeOpacity={0.85}
            onPress={onCheckout}
            className={`items-center rounded-2xl py-5 ${
              isEmpty || checkingOut ? "bg-slate-700" : "bg-[#22c7b6]"
            }`}
          >
            <Text
              className={`text-base font-bold ${
                isEmpty || checkingOut ? "text-slate-400" : "text-[#121720]"
              }`}
            >
              {checkingOut
                ? "Processing…"
                : `Complete Sale — $${total.toLocaleString()}`}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}