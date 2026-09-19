import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
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

// Module-level so the array keeps the same reference between renders.
const SNAP_POINTS = ["100%"];

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

  if (isNaN(d.getTime())) {
    return "—";
  }

  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function validatePaymentAmount(raw: string, balanceDue: number): string | null {
  const trimmed = raw.trim();

  if (!trimmed) {
    return "Enter a payment amount";
  }

  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) {
    return "Use numbers only, up to 2 decimal places";
  }

  const value = Number(trimmed);

  if (isNaN(value)) {
    return "Enter a valid number";
  }

  if (value <= 0) {
    return "Amount must be greater than 0";
  }

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

  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (invoice && balanceDue > 0) {
      setPaymentAmount(balanceDue.toString());
    } else {
      setPaymentAmount("");
    }
  }, [invoice?.id, balanceDue]);

  const amountError = useMemo(
    () => validatePaymentAmount(paymentAmount, balanceDue),
    [paymentAmount, balanceDue],
  );

  const handleRecordPayment = async () => {
    if (!invoice) {
      return;
    }

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
      title={invoice ? `Invoice #${invoice.invoiceNumber}` : "Invoice"}
      snapPoints={SNAP_POINTS}
    >
      {!invoice ? null : (
        <View className="gap-5" style={{ paddingBottom: 40 }}>
          {/* STATUS + DATE */}
          <View className="flex-row items-center justify-between">
            <StatusBadge
              label={invoice.paymentStatus}
              tone={statusToneMap[invoice.paymentStatus] || "blue"}
            />

            <Text
              style={{
                color: Colors.textMuted,
                fontSize: 15,
              }}
            >
              {formatDate(invoice.createdAt)}
            </Text>
          </View>

          {/* BALANCE DUE */}
          <View
            className="rounded-2xl p-4 gap-1.5"
            style={{
              backgroundColor: "rgba(239,68,68,0.08)",
              borderWidth: 1,
              borderColor: "rgba(239,68,68,0.18)",
            }}
          >
            <Text
              style={{
                color: Colors.textMuted,
                fontSize: 14,
                fontWeight: "600",
                textTransform: "uppercase",
              }}
            >
              Balance Due
            </Text>

            <Text
              style={{
                color: Colors.danger,
                fontFamily: Fonts.monoBold,
                fontSize: 34,
              }}
            >
              Rs. {balanceDue.toFixed(2)}
            </Text>
          </View>

          {/* CUSTOMER */}
          <View className="gap-1.5">
            <Text
              style={{
                color: Colors.textMuted,
                fontSize: 14,
                fontWeight: "600",
                textTransform: "uppercase",
              }}
            >
              Customer
            </Text>

            <Text
              style={{
                color: Colors.textPrimary,
                fontWeight: "700",
                fontSize: 19,
              }}
            >
              {invoice.customer?.name || "Walk-in Customer"}
            </Text>

            {!!invoice.customer?.phone && (
              <Text
                style={{
                  color: Colors.textMuted,
                  fontSize: 15,
                }}
              >
                {invoice.customer.phone}
              </Text>
            )}

            {!!invoice.customer?.address && (
              <Text
                style={{
                  color: Colors.textMuted,
                  fontSize: 15,
                }}
              >
                {invoice.customer.address}
              </Text>
            )}
          </View>

          {/* VEHICLE */}
          {invoice.vehicle && (
            <View className="gap-1.5">
              <Text
                style={{
                  color: Colors.textMuted,
                  fontSize: 14,
                  fontWeight: "600",
                  textTransform: "uppercase",
                }}
              >
                Vehicle
              </Text>

              <Text
                style={{
                  color: Colors.textPrimary,
                  fontWeight: "700",
                  fontSize: 19,
                }}
              >
                {invoice.vehicle.plateNumber || "—"}
              </Text>

              <Text
                style={{
                  color: Colors.textMuted,
                  fontSize: 15,
                }}
              >
                {[invoice.vehicle.make, invoice.vehicle.model]
                  .filter(Boolean)
                  .join(" ") || "—"}

                {invoice.odometerAtService
                  ? ` · ${invoice.odometerAtService.toLocaleString()} km`
                  : ""}
              </Text>
            </View>
          )}

          {/* ITEMS */}
          {!!invoice.items?.length && (
            <View className="gap-2.5">
              <Text
                style={{
                  color: Colors.textMuted,
                  fontSize: 14,
                  fontWeight: "600",
                  textTransform: "uppercase",
                }}
              >
                Items
              </Text>

              {invoice.items.map((line) => (
                <View
                  key={line.id}
                  className="flex-row items-center justify-between rounded-xl px-3.5 py-3"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.03)",
                  }}
                >
                  <Text
                    style={{
                      color: Colors.textPrimary,
                      fontSize: 16,
                      flex: 1,
                    }}
                  >
                    {line.nameSnapshot || "Item"}{" "}
                    {line.quantity ? `× ${line.quantity}` : ""}
                  </Text>

                  {typeof line.lineTotal === "number" && (
                    <Text
                      style={{
                        color: Colors.textPrimary,
                        fontFamily: Fonts.monoMedium,
                        fontSize: 16,
                      }}
                    >
                      Rs. {line.lineTotal.toFixed(2)}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* PAYMENT HISTORY */}
          {!!invoice.payments?.length && (
            <View className="gap-2.5">
              <Text
                style={{
                  color: Colors.textMuted,
                  fontSize: 14,
                  fontWeight: "600",
                  textTransform: "uppercase",
                }}
              >
                Payment History
              </Text>

              {invoice.payments.map((p) => (
                <View
                  key={p.id}
                  className="flex-row items-center justify-between rounded-xl px-3.5 py-3"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.03)",
                  }}
                >
                  <View>
                    <Text
                      style={{
                        color: Colors.textPrimary,
                        fontSize: 16,
                      }}
                    >
                      {PAYMENT_METHOD_LABEL[p.method] ?? `Method ${p.method}`}
                    </Text>

                    <Text
                      style={{
                        color: Colors.textMuted,
                        fontSize: 14,
                      }}
                    >
                      {formatDate(p.paidAt)}
                    </Text>
                  </View>

                  <Text
                    style={{
                      color: Colors.success,
                      fontFamily: Fonts.monoMedium,
                      fontSize: 16,
                    }}
                  >
                    Rs. {p.amount.toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* TOTALS */}
          <View
            className="gap-2 pt-2"
            style={{
              borderTopWidth: 1,
              borderTopColor: "rgba(255,255,255,0.08)",
            }}
          >
            <View className="flex-row justify-between">
              <Text
                style={{
                  color: Colors.textMuted,
                  fontSize: 15,
                }}
              >
                Subtotal
              </Text>

              <Text
                style={{
                  color: Colors.textPrimary,
                  fontSize: 15,
                }}
              >
                Rs. {invoice.subtotal.toFixed(2)}
              </Text>
            </View>

            {!!invoice.discount && (
              <View className="flex-row justify-between">
                <Text
                  style={{
                    color: Colors.textMuted,
                    fontSize: 15,
                  }}
                >
                  Discount
                </Text>

                <Text
                  style={{
                    color: Colors.textPrimary,
                    fontSize: 15,
                  }}
                >
                  - Rs. {invoice.discount.toFixed(2)}
                </Text>
              </View>
            )}

            {!!invoice.tax && (
              <View className="flex-row justify-between">
                <Text
                  style={{
                    color: Colors.textMuted,
                    fontSize: 15,
                  }}
                >
                  Tax
                </Text>

                <Text
                  style={{
                    color: Colors.textPrimary,
                    fontSize: 15,
                  }}
                >
                  Rs. {invoice.tax.toFixed(2)}
                </Text>
              </View>
            )}

            <View className="flex-row justify-between">
              <Text
                style={{
                  color: Colors.textMuted,
                  fontSize: 15,
                }}
              >
                Total
              </Text>

              <Text
                style={{
                  color: Colors.textPrimary,
                  fontWeight: "700",
                  fontSize: 17,
                }}
              >
                Rs. {invoice.total.toFixed(2)}
              </Text>
            </View>

            <View className="flex-row justify-between">
              <Text
                style={{
                  color: Colors.textMuted,
                  fontSize: 15,
                }}
              >
                Paid
              </Text>

              <Text
                style={{
                  color: Colors.success,
                  fontSize: 15,
                  fontWeight: "600",
                }}
              >
                Rs. {(invoice.amountPaid || 0).toFixed(2)}
              </Text>
            </View>
          </View>

          {/* NOTES */}
          {!!invoice.notes && (
            <View className="gap-1.5">
              <Text
                style={{
                  color: Colors.textMuted,
                  fontSize: 14,
                  fontWeight: "600",
                  textTransform: "uppercase",
                }}
              >
                Notes
              </Text>

              <Text
                style={{
                  color: Colors.textPrimary,
                  fontSize: 16,
                  lineHeight: 23,
                }}
              >
                {invoice.notes}
              </Text>
            </View>
          )}

          {/* PAYMENT AMOUNT */}
          {balanceDue > 0 && (
            <View className="gap-2">
              <View className="flex-row items-center justify-between">
                <Text
                  style={{
                    color: Colors.textMuted,
                    fontSize: 14,
                    fontWeight: "600",
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
                      fontSize: 14,
                      fontWeight: "700",
                    }}
                  >
                    Full amount
                  </Text>
                </TouchableOpacity>
              </View>

              <View
                className="flex-row items-center rounded-2xl px-4"
                style={{
                  minHeight: 58,
                  borderWidth: 1,
                  borderColor: amountError ? Colors.danger : "#1f293d",
                  backgroundColor: "rgba(255,255,255,0.02)",
                }}
              >
                <Text
                  style={{
                    color: Colors.textMuted,
                    fontSize: 18,
                    marginRight: 5,
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
                    fontSize: 20,
                  }}
                />
              </View>

              {amountError ? (
                <Text
                  style={{
                    color: Colors.danger,
                    fontSize: 14,
                  }}
                >
                  {amountError}
                </Text>
              ) : (
                <Text
                  style={{
                    color: Colors.textMuted,
                    fontSize: 14,
                  }}
                >
                  Balance due: Rs. {balanceDue.toFixed(2)}
                </Text>
              )}
            </View>
          )}

          {/* ACTIONS */}
          <View className="flex-row gap-2.5 mt-1">
            <TouchableOpacity
              className="flex-1 min-h-[54px] rounded-2xl items-center justify-center flex-row gap-1.5"
              style={{
                borderWidth: 1,
                borderColor: "#1f293d",
                backgroundColor: "rgba(255,255,255,0.02)",
              }}
            >
              <Ionicons
                name="call-outline"
                size={20}
                color={Colors.textPrimary}
              />

              <Text
                style={{
                  color: Colors.textPrimary,
                  fontWeight: "700",
                  fontSize: 15,
                }}
              >
                Call Customer
              </Text>
            </TouchableOpacity>

            {balanceDue > 0 && (
              <TouchableOpacity
                className="flex-1 min-h-[54px] rounded-2xl items-center justify-center"
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
                    fontSize: 15,
                  }}
                >
                  {isSubmitting ? "Updating..." : "Record Payment"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </BottomSheet>
  );
}
