import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { mapCartItemsToInvoiceItems } from "../api/cartInvoiceMapping";
import { createInvoiceApi, PAYMENT_METHOD_CODE } from "../api/pos.api";
import { getAuthSession, getCachedCatalog } from "../api/storage";
import { CartItem, useCart } from "../context/CartContext";
import { generateAndShareInvoice } from "../utils/generateInvoicePdf";
import {
  CustomerVehicleDetails,
  CustomerVehicleForm,
} from "./CustomerVehicalForm";

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
  const {
    items,
    itemCount,
    subtotal,
    total,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();

  const isEmpty = items.length === 0;

  const [step, setStep] = useState<"cart" | "details">("cart");
  const [submitting, setSubmitting] = useState(false);
  const [isUnpaid, setIsUnpaid] = useState(false);

  const handleSubmitSale = async (details: CustomerVehicleDetails) => {
    console.log(
      "[CartSheet] handleSubmitSale started",
      details,
      "isUnpaid:",
      isUnpaid,
    );
    setSubmitting(true);
    try {
      console.log("[CartSheet] Fetching auth session…");
      const session = await getAuthSession();
      console.log("[CartSheet] Auth session:", session);
      if (!session) {
        throw new Error("No active session found. Please log in again.");
      }

      console.log("[CartSheet] Fetching cached catalog…");
      const catalog = await getCachedCatalog();
      console.log("[CartSheet] Catalog length:", catalog.length);

      const {
        items: invoiceItems,
        unresolvedItemIds,
        invalidPriceItemIds,
      } = mapCartItemsToInvoiceItems(items, catalog);
      console.log("[CartSheet] Mapped invoice items:", invoiceItems);
      console.log("[CartSheet] Unresolved item ids:", unresolvedItemIds);
      console.log("[CartSheet] Invalid price item ids:", invalidPriceItemIds);

      if (unresolvedItemIds.length > 0) {
        throw new Error(
          "Some cart items couldn't be matched to the catalog. Try refreshing the catalog and re-adding them.",
        );
      }

      if (invalidPriceItemIds.length > 0) {
        const names = items
          .filter((entry) => invalidPriceItemIds.includes(entry.id))
          .map((entry) => entry.name)
          .join(", ");
        throw new Error(
          `Price for ${names} is outside the allowed range for that item. Adjust it and try again.`,
        );
      }

      const year = Number(details.year);
      const odometer = Number(details.odometerReading);

      const payload = {
        userId: session.userId,
        customer: {
          name: details.customerName.trim(),
          phone: details.customerPhone.trim(),
          email: details.customerEmail.trim() || undefined,
          address: details.customerAddress.trim() || undefined,
          notes: details.customerNotes.trim() || undefined,
        },
        vehicle: {
          plateNumber: details.plateNumber.trim(),
          make: details.make.trim(),
          model: details.model.trim(),
          year: Number.isFinite(year) ? year : 0,
          vehicleType: details.vehicleType.trim(),
          odometerReading: Number.isFinite(odometer) ? odometer : 0,
        },
        odometerAtService: Number.isFinite(odometer) ? odometer : 0,
        notes: details.invoiceNotes.trim() || undefined,
        items: invoiceItems,
        initialPayment: {
          amount: isUnpaid ? 0 : total,
          method: PAYMENT_METHOD_CODE[paymentMethod],
          paidAt: new Date().toISOString(),
          referenceNo: details.referenceNo.trim() || undefined,
        },
      };
      console.log(
        "[CartSheet] Submitting invoice payload:",
        JSON.stringify(payload, null, 2),
      );

      const response = await createInvoiceApi(payload, session.token);
      console.log("[CartSheet] createInvoiceApi response:", response);

      // --- DEBUG & FIX: Using 'invoiceNumber' from response and adding trace logs ---
      console.log("[CartSheet] Preparing PDF payload data...");
      const pdfData = {
        invoiceNo: String(
          response?.invoiceNumber || response?.invoiceNo || "INV-001",
        ),
        date: new Date().toISOString().split("T")[0],
        vehicleNo: details.plateNumber,
        odometer: details.odometerReading,
        nextService: String(Number(details.odometerReading) + 5000),
        items: items.map((entry) => ({
          name: entry.name,
          qty: entry.qty,
          rate: entry.price,
          amount: entry.price * entry.qty,
        })),
        total: total,
        customerName: details.customerName,
        customerPhone: details.customerPhone,
      };

      console.log("[CartSheet] Calling generateAndShareInvoice with:", pdfData);
      await generateAndShareInvoice(pdfData);
      console.log(
        "[CartSheet] generateAndShareInvoice completed successfully.",
      );

      clearCart();
      setStep("cart");
      setIsUnpaid(false);
      onClose();
      onCheckout();
    } catch (error) {
      console.log("[CartSheet] handleSubmitSale error:", error);
      Alert.alert(
        "Checkout failed",
        error instanceof Error
          ? error.message
          : "Something went wrong while completing the sale.",
      );
    } finally {
      console.log("[CartSheet] handleSubmitSale finished");
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep("cart");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View className="flex-1 justify-end bg-black/70">
        <TouchableOpacity
          activeOpacity={1}
          className="absolute inset-0"
          onPress={handleClose}
        />

        <View className="max-h-[90%] rounded-t-[32px] bg-[#121720] px-5 pb-8 pt-3">
          {/* Handle */}
          <View className="mb-5 items-center">
            <View className="h-1.5 w-12 rounded-full bg-slate-600" />
          </View>

          {/* Header */}
          <View className="mb-5 flex-row items-center justify-between">
            <View className="flex-row items-center">
              {step === "details" && (
                <TouchableOpacity
                  onPress={() => setStep("cart")}
                  className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-[#1a1f28]"
                >
                  <Ionicons name="arrow-back" size={20} color="#94a3b8" />
                </TouchableOpacity>
              )}
              <View>
                <Text className="text-xs font-bold uppercase tracking-widest text-[#22c7b6]">
                  {step === "cart" ? "Current Sale" : "Complete Sale"}
                </Text>
                <Text className="text-2xl font-bold text-white">
                  {step === "cart"
                    ? `Cart · ${itemCount} ${itemCount === 1 ? "item" : "items"}`
                    : "Customer & Vehicle Details"}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleClose}
              className="h-10 w-10 items-center justify-center rounded-full bg-[#1a1f28]"
            >
              <Ionicons name="close" size={22} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          {step === "details" ? (
            <CustomerVehicleForm
              onSubmit={handleSubmitSale}
              submitting={submitting}
              totalAmount={isUnpaid ? 0 : total}
            />
          ) : (
            <>
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
                  contentContainerStyle={{ paddingBottom: 12 }}
                  style={{ width: "100%", maxHeight: 320 }}
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
                          disabled={isUnpaid}
                          onPress={() => onSelectPaymentMethod(method.id)}
                          className={`flex-1 items-center rounded-xl border py-3 ${
                            active
                              ? "border-[#22c7b6] bg-[#22c7b6]/10"
                              : "border-[#27303c] bg-[#1a1f28]"
                          } ${isUnpaid ? "opacity-40" : ""}`}
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

                  <TouchableOpacity
                    onPress={() => setIsUnpaid((current) => !current)}
                    className="mt-3 flex-row items-center rounded-xl border border-[#27303c] bg-[#1a1f28] px-3 py-3"
                  >
                    <View
                      className={`mr-3 h-5 w-5 items-center justify-center rounded-md border ${
                        isUnpaid
                          ? "border-[#22c7b6] bg-[#22c7b6]"
                          : "border-[#475569] bg-transparent"
                      }`}
                    >
                      {isUnpaid && (
                        <Ionicons name="checkmark" size={14} color="#121720" />
                      )}
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-white">
                        Unpaid work
                      </Text>
                      <Text className="text-xs text-slate-500">
                        Bill later — initial payment will be recorded as $0
                      </Text>
                    </View>
                  </TouchableOpacity>
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
                <View className="mt-1 flex-row items-center justify-between border-t border-[#27303c] pt-2">
                  <Text className="text-sm font-semibold text-slate-300">
                    Total
                  </Text>
                  <Text className="font-mono text-2xl font-bold text-[#22c7b6]">
                    ${total.toLocaleString()}
                  </Text>
                </View>
                {isUnpaid && (
                  <View className="mt-1 flex-row items-center justify-between">
                    <Text className="text-xs text-amber-400">
                      Initial payment
                    </Text>
                    <Text className="font-mono text-xs font-bold text-amber-400">
                      $0 (unpaid)
                    </Text>
                  </View>
                )}
              </View>

              {/* Checkout */}
              <TouchableOpacity
                disabled={isEmpty || checkingOut}
                activeOpacity={0.85}
                onPress={() => {
                  console.log(
                    "[CartSheet] Complete Sale pressed, opening details form",
                  );
                  setStep("details");
                }}
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
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}
