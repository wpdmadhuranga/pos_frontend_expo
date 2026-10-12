import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { mapCartItemsToInvoiceItems } from "../api/cartInvoiceMapping";
import {
  createInvoiceApi,
  CreateInvoicePayload,
  getPosCatalogApi,
  PAYMENT_METHOD_CODE,
} from "../api/pos.api";
import { getAuthSession } from "../api/storage";
import { CartItem, useCart } from "../context/CartContext";
import { generateAndShareInvoice } from "../utils/generateInvoicePdf";
import {
  CustomerVehicleDetails,
  CustomerVehicleForm,
  getInvoiceScope,
} from "./CustomerVehicalForm";

export type PaymentMethod = "cash" | "card" | "bank";

const PAYMENT_METHODS: { id: PaymentMethod; label: string }[] = [
  { id: "cash", label: "Cash" },
  { id: "card", label: "Card" },
  { id: "bank", label: "Bank" },
];

/**
 * window.alert exists on web AND is polyfilled on React Native (without a
 * proper title), so check the platform instead of checking for window.alert.
 */
function notify(title: string, message: string) {
  if (Platform.OS === "web") {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
}

/** Resolves after `ms` milliseconds. */
const wait = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

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
  const insets = useSafeAreaInsets();

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
    setSubmitting(true);

    try {
      const session = await getAuthSession();

      if (!session) {
        throw new Error("No active session found. Please log in again.");
      }

      // Always get the latest catalog from the API
      const catalog = await getPosCatalogApi(session.token);

      const {
        items: invoiceItems,
        unresolvedItemIds,
        invalidPriceItemIds,
      } = mapCartItemsToInvoiceItems(items, catalog);

      if (unresolvedItemIds.length > 0) {
        throw new Error(
          "Some cart items couldn't be matched to the latest catalog. Please remove and re-add the affected items.",
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
      const odometerRaw = details.odometerReading.trim();
      const odometer = odometerRaw === "" ? undefined : Number(odometerRaw);
      const odometerValid = odometer !== undefined && Number.isFinite(odometer);

      const { includeCustomer, includeVehicle } = getInvoiceScope(details);

      const payload: CreateInvoicePayload = {
        userId: session.userId,
        notes: details.invoiceNotes.trim() || undefined,
        items: invoiceItems,
        initialPayment: {
          amount: isUnpaid ? 0 : total,
          method: PAYMENT_METHOD_CODE[paymentMethod],
          paidAt: new Date().toISOString(),
          referenceNo: details.referenceNo.trim() || undefined,
        },
      };

      if (includeCustomer) {
        payload.customer = {
          name: details.customerName.trim(),
          phone: details.customerPhone.trim(),
          email: details.customerEmail.trim() || undefined,
          address: details.customerAddress.trim() || undefined,
          notes: details.customerNotes.trim() || undefined,
        };
      }

      if (includeVehicle) {
        payload.vehicle = {
          plateNumber: details.plateNumber.trim(),
          make: details.make.trim(),
          model: details.model.trim(),
          year: Number.isFinite(year) ? year : 0,
          vehicleType: details.vehicleType.trim(),
          odometerReading: odometerValid ? odometer : undefined,
        };
        payload.odometerAtService = odometerValid ? odometer : undefined;
      }

      const response = await createInvoiceApi(payload, session.token);

      const pdfData = {
        invoiceNo:
          String(response?.invoiceNumber || response?.invoiceNo || "").trim() ||
          "-",

        date: new Date().toISOString().split("T")[0] || "-",

        vehicleNo: includeVehicle ? details.plateNumber.trim() || "-" : "-",

        odometer:
          includeVehicle && odometerValid
            ? details.odometerReading.trim() || "-"
            : "-",

        nextService: details.nextService.trim() || "-",

        items: items.map((entry) => ({
          name: entry.name?.trim() || "-",
          qty: entry.qty,
          rate: entry.price,
          amount: entry.price * entry.qty,
        })),

        total: total,

        customerName: includeCustomer
          ? details.customerName.trim() || "-"
          : "Walk-in",

        customerPhone: includeCustomer
          ? details.customerPhone.trim() || "-"
          : "-",
        customerAddress: includeCustomer
          ? details.customerAddress.trim() || "-"
          : "-",
      };

      // The invoice is saved at this point. Close this sheet FIRST: on iOS
      // the native share sheet cannot be shown while a React Native <Modal>
      // is still on screen, so it silently never appears.
      setStep("cart");
      setIsUnpaid(false);
      onClose();

      try {
        if (Platform.OS !== "web") {
          // Let the Modal finish its dismiss animation before presenting
          // the native share sheet.
          await wait(600);
        }

        await generateAndShareInvoice(pdfData);
      } catch (pdfError) {
        const pdfMessage =
          pdfError instanceof Error ? pdfError.message : String(pdfError);

        notify(
          "Invoice saved",
          `The sale was recorded, but the PDF could not be created or shared.\n\n${pdfMessage}`,
        );
      }

      // Only now show the "Payment completed" modal (in POSScreen), so it
      // never competes with the share sheet.
      clearCart();
      onCheckout();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong while completing the sale.";

      notify("Checkout failed", message);
    } finally {
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
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      {/* FULL-SCREEN ROOT */}
      <View
        className="flex-1 bg-[#121720]"
        style={{
          paddingTop: insets.top,
          paddingBottom: Math.max(insets.bottom, 12),
        }}
      >
        <View className="flex-1 px-5 pt-4">
          {/* HEADER */}
          <View className="mb-5 flex-row items-center justify-between">
            <View className="mr-3 flex-1 flex-row items-center">
              {step === "details" && (
                <TouchableOpacity
                  onPress={() => setStep("cart")}
                  className="mr-3 h-11 w-11 items-center justify-center rounded-full bg-[#1a1f28]"
                >
                  <Ionicons name="arrow-back" size={25} color="#94a3b8" />
                </TouchableOpacity>
              )}

              <View className="flex-1">
                <Text className="text-base font-bold uppercase tracking-widest text-[#22c7b6]">
                  {step === "cart" ? "Current Sale" : "Complete Sale"}
                </Text>

                <Text
                  className="text-2xl font-bold text-white"
                  numberOfLines={1}
                >
                  {step === "cart"
                    ? `Cart · ${itemCount} ${itemCount === 1 ? "item" : "items"}`
                    : "Customer & Vehicle Details"}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleClose}
              className="h-11 w-11 items-center justify-center rounded-full bg-[#1a1f28]"
            >
              <Ionicons name="close" size={27} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          {step === "details" ? (
            <View className="flex-1">
              <CustomerVehicleForm
                fullScreen
                onSubmit={handleSubmitSale}
                submitting={submitting}
                totalAmount={isUnpaid ? 0 : total}
              />
            </View>
          ) : (
            <>
              {isEmpty ? (
                <View className="flex-1 justify-center">
                  <View className="items-center gap-3 rounded-2xl border border-[#27303c] bg-[#1a1f28] px-4 py-10">
                    <Ionicons name="cart-outline" size={38} color="#475569" />

                    <Text className="text-center text-lg text-slate-400">
                      Cart is empty — add a service or product to get started.
                    </Text>
                  </View>
                </View>
              ) : (
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 12, gap: 10 }}
                  keyboardDismissMode="on-drag"
                  style={{ flex: 1, width: "100%" }}
                >
                  {items.map((entry) => (
                    <View
                      key={entry.id}
                      className="rounded-2xl border border-[#27303c] bg-[#1a1f28] p-3"
                    >
                      <View className="flex-row items-center">
                        <View className="mr-3 h-12 w-12 items-center justify-center rounded-xl bg-white/5">
                          <Ionicons
                            name={KIND_ICON[entry.kind]}
                            size={23}
                            color="#22c7b6"
                          />
                        </View>

                        <View className="flex-1 pr-2">
                          <Text
                            className="text-lg font-bold text-white"
                            numberOfLines={2}
                          >
                            {entry.name}
                          </Text>

                          <Text className="mt-1 text-base text-slate-500">
                            {entry.kind} · ${entry.price.toLocaleString()} each
                          </Text>
                        </View>

                        <TouchableOpacity
                          onPress={() => removeItem(entry.id)}
                          className="h-9 w-9 items-center justify-center rounded-full bg-red-500/10"
                        >
                          <Ionicons
                            name="trash-outline"
                            size={20}
                            color="#f87171"
                          />
                        </TouchableOpacity>
                      </View>

                      <View className="mt-3 flex-row items-center justify-between">
                        <View className="flex-row items-center rounded-xl border border-[#27303c] bg-[#121720] p-1">
                          <TouchableOpacity
                            onPress={() => updateQuantity(entry.id, -1)}
                            className="h-9 w-9 items-center justify-center rounded-lg bg-white/5"
                          >
                            <Ionicons name="remove" size={21} color="white" />
                          </TouchableOpacity>

                          <Text className="mx-3 min-w-[20px] text-center font-mono text-lg font-bold text-white">
                            {entry.qty}
                          </Text>

                          <TouchableOpacity
                            onPress={() => updateQuantity(entry.id, 1)}
                            className="h-9 w-9 items-center justify-center rounded-lg bg-[#22c7b6]/15"
                          >
                            <Ionicons name="add" size={21} color="#22c7b6" />
                          </TouchableOpacity>
                        </View>

                        <Text className="font-mono text-xl font-bold text-[#22c7b6]">
                          ${(entry.price * entry.qty).toLocaleString()}
                        </Text>
                      </View>
                    </View>
                  ))}
                </ScrollView>
              )}

              {!isEmpty && (
                <View className="mb-4 mt-4">
                  <Text className="mb-2 text-lg font-semibold text-slate-300">
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
                            className={`text-base font-bold ${
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
                      className={`mr-3 h-6 w-6 items-center justify-center rounded-md border ${
                        isUnpaid
                          ? "border-[#22c7b6] bg-[#22c7b6]"
                          : "border-[#475569] bg-transparent"
                      }`}
                    >
                      {isUnpaid && (
                        <Ionicons name="checkmark" size={18} color="#121720" />
                      )}
                    </View>

                    <View className="flex-1">
                      <Text className="text-lg font-semibold text-white">
                        Unpaid work
                      </Text>

                      <Text className="text-base text-slate-500">
                        Bill later — initial payment will be recorded as $0
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              )}

              {/* Totals */}
              <View className="mb-4 gap-2 rounded-2xl border border-[#27303c] bg-[#1a1f28] p-4">
                <View className="flex-row items-center justify-between">
                  <Text className="text-lg text-slate-400">Subtotal</Text>

                  <Text className="font-mono text-lg font-bold text-white">
                    ${subtotal.toLocaleString()}
                  </Text>
                </View>

                <View className="mt-1 flex-row items-center justify-between border-t border-[#27303c] pt-2">
                  <Text className="text-lg font-semibold text-slate-300">
                    Total
                  </Text>

                  <Text className="font-mono text-4xl font-bold text-[#22c7b6]">
                    ${total.toLocaleString()}
                  </Text>
                </View>

                {isUnpaid && (
                  <View className="mt-1 flex-row items-center justify-between">
                    <Text className="text-base text-amber-400">
                      Initial payment
                    </Text>

                    <Text className="font-mono text-base font-bold text-amber-400">
                      $0 (unpaid)
                    </Text>
                  </View>
                )}
              </View>

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
                  className={`text-xl font-bold ${
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
