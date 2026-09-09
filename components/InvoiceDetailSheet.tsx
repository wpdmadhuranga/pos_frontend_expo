import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Toast from "react-native-toast-message";
import { InvoiceDetailDto, updateInvoicePaymentApi } from "../api/pos.api";
import { Colors } from "../constants/colors";
import { Fonts } from "../constants/typography";
import { BottomSheet } from "./BottomSheet";
import { StatusBadge } from "./StatusBadge";

const PAYMENT_METHOD_LABEL: Record<number, string> = {
  0: "Cash",
  1: "Card",
  2: "Bank Transfer",
  3: "Other",
};

const statusToneMap: Record<string, "blue" | "orange" | "green" | "gray"> = {
  Draft: "gray",
  Completed: "green",
  Cancelled: "gray",
  Unpaid: "orange",
  Partial: "orange",
  PartiallyPaid: "blue",
  Paid: "green",
};

function formatDate(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function validatePaymentAmount(raw: string, balanceDue: number): string | null {
  const trimmed = raw.trim();

  if (!trimmed) return "Enter a payment amount";
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) {
    return "Use numbers only, up to 2 decimal places";
  }

  const value = Number(trimmed);

  if (isNaN(value)) return "Enter a valid number";
  if (value <= 0) return "Amount must be greater than 0";
  if (value > balanceDue) {
    return `Cannot exceed balance due (Rs. ${balanceDue.toFixed(2)})`;
  }

  return null;
}

interface InvoiceDetailSheetProps {
  visible: boolean;
  invoice: InvoiceDetailDto | null;
  onClose: () => void;
  onPaymentRecorded?: () => void;
}

export function InvoiceDetailSheet({
  visible,
  invoice,
  onClose,
  onPaymentRecorded,
}: InvoiceDetailSheetProps) {
  const balanceDue = invoice ? invoice.total - (invoice.amountPaid || 0) : 0;

  const [paymentAmount, setPaymentAmount] = useState<string>(
    balanceDue ? balanceDue.toString() : "",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const amountError = useMemo(
    () => validatePaymentAmount(paymentAmount, balanceDue),
    [paymentAmount, balanceDue],
  );

  if (!invoice) return null;

  const handleRecordPayment = async () => {
    if (amountError) {
      Toast.show({
        type: "error",
        text1: "Invalid amount",
        text2: amountError,
      });
      return;
    }

    const finalAmount = Number(paymentAmount.trim());

    try {
      setIsSubmitting(true);

      const response: any = await updateInvoicePaymentApi(invoice.id, {
        amount: finalAmount,
      });

      const successMessage =
        response?.message ||
        response?.data?.message ||
        "Payment recorded successfully.";

      Toast.show({
        type: "success",
        text1: "Payment recorded",
        text2: successMessage,
      });

      onClose();
      onPaymentRecorded?.();
    } catch (error: any) {
      console.error("Error updating invoice payment:", error);

      const errorMessage =
        error?.response?.data?.message ||
        error?.data?.message ||
        error?.message ||
        "Could not update the payment status.";

      Toast.show({
        type: "error",
        text1: "Payment failed",
        text2: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={`Invoice #${invoice.invoiceNumber}`}
      snapPoints={["100%"]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View className="gap-4">
          <View className="flex-row items-center justify-between">
            <StatusBadge
              label={invoice.paymentStatus}
              tone={statusToneMap[invoice.paymentStatus] || "blue"}
            />
            <Text style={{ color: Colors.textMuted, fontSize: 12 }}>
              {formatDate(invoice.createdAt)}
            </Text>
          </View>

          <View
            className="rounded-2xl p-3.5 gap-1"
            style={{
              backgroundColor: "rgba(239,68,68,0.08)",
              borderWidth: 1,
              borderColor: "rgba(239,68,68,0.18)",
            }}
          >
            <Text
              style={{
                color: Colors.textMuted,
                fontSize: 11,
                textTransform: "uppercase",
              }}
            >
              Balance Due
            </Text>
            <Text
              style={{
                color: Colors.danger,
                fontFamily: Fonts.monoBold,
                fontSize: 28,
              }}
            >
              Rs. {balanceDue.toFixed(2)}
            </Text>
          </View>

          <View className="gap-1">
            <Text
              style={{
                color: Colors.textMuted,
                fontSize: 11,
                textTransform: "uppercase",
              }}
            >
              Customer
            </Text>
            <Text
              style={{
                color: Colors.textPrimary,
                fontWeight: "600",
                fontSize: 15,
              }}
            >
              {invoice.customer?.name || "Walk-in Customer"}
            </Text>
            {invoice.customer?.phone && (
              <Text style={{ color: Colors.textMuted, fontSize: 12 }}>
                {invoice.customer.phone}
              </Text>
            )}
            {invoice.customer?.address && (
              <Text style={{ color: Colors.textMuted, fontSize: 12 }}>
                {invoice.customer.address}
              </Text>
            )}
          </View>

          {invoice.vehicle && (
            <View className="gap-1">
              <Text
                style={{
                  color: Colors.textMuted,
                  fontSize: 11,
                  textTransform: "uppercase",
                }}
              >
                Vehicle
              </Text>
              <Text
                style={{
                  color: Colors.textPrimary,
                  fontWeight: "600",
                  fontSize: 15,
                }}
              >
                {invoice.vehicle.plateNumber || "—"}
              </Text>
              <Text style={{ color: Colors.textMuted, fontSize: 12 }}>
                {[invoice.vehicle.make, invoice.vehicle.model]
                  .filter(Boolean)
                  .join(" ") || "—"}
                {invoice.odometerAtService
                  ? ` · ${invoice.odometerAtService.toLocaleString()} km`
                  : ""}
              </Text>
            </View>
          )}

          {!!invoice.invoiceItems?.length && (
            <View className="gap-2">
              <Text
                style={{
                  color: Colors.textMuted,
                  fontSize: 11,
                  textTransform: "uppercase",
                }}
              >
                Items
              </Text>
              {invoice.invoiceItems.map((line) => (
                <View
                  key={line.id}
                  className="flex-row items-center justify-between rounded-xl px-3 py-2.5"
                  style={{ backgroundColor: "rgba(255,255,255,0.03)" }}
                >
                  <Text
                    style={{ color: Colors.textPrimary, fontSize: 13, flex: 1 }}
                  >
                    {line.nameSnapshot || "Item"}{" "}
                    {line.quantity ? `× ${line.quantity}` : ""}
                  </Text>
                  {typeof line.lineTotal === "number" && (
                    <Text
                      style={{
                        color: Colors.textPrimary,
                        fontFamily: Fonts.monoMedium,
                        fontSize: 13,
                      }}
                    >
                      Rs. {line.lineTotal.toFixed(2)}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}

          {!!invoice.payments?.length && (
            <View className="gap-2">
              <Text
                style={{
                  color: Colors.textMuted,
                  fontSize: 11,
                  textTransform: "uppercase",
                }}
              >
                Payment History
              </Text>
              {invoice.payments.map((p) => (
                <View
                  key={p.id}
                  className="flex-row items-center justify-between rounded-xl px-3 py-2.5"
                  style={{ backgroundColor: "rgba(255,255,255,0.03)" }}
                >
                  <View>
                    <Text style={{ color: Colors.textPrimary, fontSize: 13 }}>
                      {PAYMENT_METHOD_LABEL[p.method] ?? `Method ${p.method}`}
                    </Text>
                    <Text style={{ color: Colors.textMuted, fontSize: 11 }}>
                      {formatDate(p.paidAt)}
                    </Text>
                  </View>
                  <Text
                    style={{
                      color: Colors.success,
                      fontFamily: Fonts.monoMedium,
                      fontSize: 13,
                    }}
                  >
                    Rs. {p.amount.toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Totals breakdown */}
          <View
            className="gap-1.5 pt-1"
            style={{
              borderTopWidth: 1,
              borderTopColor: "rgba(255,255,255,0.08)",
            }}
          >
            <View className="flex-row justify-between">
              <Text style={{ color: Colors.textMuted, fontSize: 12 }}>
                Subtotal
              </Text>
              <Text style={{ color: Colors.textPrimary, fontSize: 12 }}>
                Rs. {invoice.subtotal.toFixed(2)}
              </Text>
            </View>
            {!!invoice.discount && (
              <View className="flex-row justify-between">
                <Text style={{ color: Colors.textMuted, fontSize: 12 }}>
                  Discount
                </Text>
                <Text style={{ color: Colors.textPrimary, fontSize: 12 }}>
                  - Rs. {invoice.discount.toFixed(2)}
                </Text>
              </View>
            )}
            {!!invoice.tax && (
              <View className="flex-row justify-between">
                <Text style={{ color: Colors.textMuted, fontSize: 12 }}>
                  Tax
                </Text>
                <Text style={{ color: Colors.textPrimary, fontSize: 12 }}>
                  Rs. {invoice.tax.toFixed(2)}
                </Text>
              </View>
            )}
            <View className="flex-row justify-between">
              <Text style={{ color: Colors.textMuted, fontSize: 12 }}>
                Total
              </Text>
              <Text
                style={{
                  color: Colors.textPrimary,
                  fontWeight: "700",
                  fontSize: 13,
                }}
              >
                Rs. {invoice.total.toFixed(2)}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text style={{ color: Colors.textMuted, fontSize: 12 }}>
                Paid
              </Text>
              <Text style={{ color: Colors.success, fontSize: 12 }}>
                Rs. {(invoice.amountPaid || 0).toFixed(2)}
              </Text>
            </View>
          </View>

          {invoice.notes && (
            <View className="gap-1">
              <Text
                style={{
                  color: Colors.textMuted,
                  fontSize: 11,
                  textTransform: "uppercase",
                }}
              >
                Notes
              </Text>
              <Text style={{ color: Colors.textPrimary, fontSize: 13 }}>
                {invoice.notes}
              </Text>
            </View>
          )}

          {balanceDue > 0 && (
            <View className="gap-1.5">
              <View className="flex-row items-center justify-between">
                <Text
                  style={{
                    color: Colors.textMuted,
                    fontSize: 11,
                    textTransform: "uppercase",
                  }}
                >
                  Payment Amount
                </Text>
                <TouchableOpacity
                  onPress={() => setPaymentAmount(balanceDue.toString())}
                >
                  <Text
                    style={{
                      color: Colors.primary,
                      fontSize: 11,
                      fontWeight: "600",
                    }}
                  >
                    Full amount
                  </Text>
                </TouchableOpacity>
              </View>

              <View
                className="flex-row items-center rounded-2xl px-3.5"
                style={{
                  minHeight: 50,
                  borderWidth: 1,
                  borderColor: amountError ? Colors.danger : "#1f293d",
                  backgroundColor: "rgba(255,255,255,0.02)",
                }}
              >
                <Text
                  style={{
                    color: Colors.textMuted,
                    fontSize: 15,
                    marginRight: 4,
                  }}
                >
                  Rs.
                </Text>
                <TextInput
                  value={paymentAmount}
                  onChangeText={setPaymentAmount}
                  placeholder="0.00"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="decimal-pad"
                  style={{
                    flex: 1,
                    color: Colors.textPrimary,
                    fontFamily: Fonts.monoMedium,
                    fontSize: 16,
                  }}
                />
              </View>

              {amountError ? (
                <Text style={{ color: Colors.danger, fontSize: 11 }}>
                  {amountError}
                </Text>
              ) : (
                <Text style={{ color: Colors.textMuted, fontSize: 11 }}>
                  Balance due: Rs. {balanceDue.toFixed(2)}
                </Text>
              )}
            </View>
          )}

          <View className="flex-row gap-2.5 mt-1">
            <TouchableOpacity
              className="flex-1 min-h-[46px] rounded-2xl items-center justify-center flex-row gap-1.5"
              style={{
                borderWidth: 1,
                borderColor: "#1f293d",
                backgroundColor: "rgba(255,255,255,0.02)",
              }}
            >
              <Ionicons
                name="call-outline"
                size={16}
                color={Colors.textPrimary}
              />
              <Text
                style={{
                  color: Colors.textPrimary,
                  fontWeight: "600",
                  fontSize: 13,
                }}
              >
                Call Customer
              </Text>
            </TouchableOpacity>

            {balanceDue > 0 && (
              <TouchableOpacity
                className="flex-1 min-h-[46px] rounded-2xl items-center justify-center"
                style={{
                  backgroundColor: Colors.primary,
                  opacity: isSubmitting || !!amountError ? 0.5 : 1,
                }}
                disabled={isSubmitting || !!amountError}
                onPress={handleRecordPayment}
              >
                <Text
                  style={{
                    color: Colors.black,
                    fontWeight: "700",
                    fontSize: 13,
                  }}
                >
                  {isSubmitting ? "Updating..." : "Record Payment"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </BottomSheet>
  );
}
