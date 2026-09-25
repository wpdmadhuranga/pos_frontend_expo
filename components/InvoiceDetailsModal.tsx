import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  CancelInvoiceResponse,
  InvoiceDetailDto,
  cancelInvoiceApi,
} from "../api/pos.api";
import { Colors } from "../constants/colors";
import { Fonts } from "../constants/typography";
import { BottomSheet } from "./BottomSheet";

interface Props {
  visible: boolean;
  invoice: InvoiceDetailDto | null;
  onClose: () => void;
  onDeleted?: (invoiceId: string, response: CancelInvoiceResponse) => void;
}

export function InvoiceDetailModal({
  visible,
  invoice,
  onClose,
  onDeleted,
}: Props) {
  const [deleting, setDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  if (!invoice) return null;

  const customerName = invoice.customer?.name ?? "Walk-in Customer";
  const plate = invoice.vehicle?.plateNumber ?? "—";
  const vehicleLabel = invoice.vehicle
    ? [invoice.vehicle.year, invoice.vehicle.make, invoice.vehicle.model]
        .filter(Boolean)
        .join(" ")
    : "No vehicle";

  const handleDeletePress = () => {
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setDeleting(true);

      const response = await cancelInvoiceApi(invoice.id);

      setShowConfirm(false);

      onDeleted?.(invoice.id, response);

      onClose();
    } catch (err: any) {
      setShowConfirm(false);
      console.error("Delete failed:", err);
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelConfirm = () => {
    setShowConfirm(false);
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={`Invoice ${invoice.invoiceNumber}`}
      snapPoints={["85%"]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="on-drag"
        contentContainerStyle={styles.content}
      >
        {/* Customer & Vehicle */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer & Vehicle</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Customer</Text>
            <Text style={styles.value}>{customerName}</Text>
          </View>

          {invoice.customer?.phone && (
            <View style={styles.row}>
              <Text style={styles.label}>Phone</Text>
              <Text style={styles.value}>{invoice.customer.phone}</Text>
            </View>
          )}

          <View style={styles.row}>
            <Text style={styles.label}>Vehicle</Text>
            <Text style={styles.value}>{vehicleLabel}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Plate</Text>
            <Text style={styles.value}>{plate}</Text>
          </View>

          {invoice.odometerAtService != null && (
            <View style={styles.row}>
              <Text style={styles.label}>Odometer</Text>
              <Text style={styles.value}>
                {invoice.odometerAtService.toLocaleString()} km
              </Text>
            </View>
          )}
        </View>

        {/* Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items</Text>

          {(invoice.items ?? []).length === 0 ? (
            <Text style={styles.emptyText}>No items</Text>
          ) : (
            (invoice.items ?? []).map((item) => (
              <View key={item.id} style={styles.itemCard}>
                <View style={styles.itemTop}>
                  <Text style={styles.itemName} numberOfLines={2}>
                    {item.nameSnapshot}
                  </Text>

                  <Text style={styles.itemTotal}>
                    ${item.lineTotal.toFixed(2)}
                  </Text>
                </View>

                <View style={styles.itemBottom}>
                  <Text style={styles.itemMeta}>
                    Qty: {item.quantity} × ${item.priceSnapshot.toFixed(2)}
                  </Text>

                  {item.brandSnapshot && (
                    <Text style={styles.itemBrand}>{item.brandSnapshot}</Text>
                  )}
                </View>
              </View>
            ))
          )}
        </View>

        {/* Totals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Subtotal</Text>
            <Text style={styles.value}>${invoice.subtotal.toFixed(2)}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Discount</Text>
            <Text style={styles.value}>${invoice.discount.toFixed(2)}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Tax</Text>
            <Text style={styles.value}>${invoice.tax.toFixed(2)}</Text>
          </View>

          <View style={[styles.row, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${invoice.total.toFixed(2)}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Amount Paid</Text>
            <Text style={styles.value}>${invoice.amountPaid.toFixed(2)}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Payment Status</Text>
            <Text style={styles.value}>{invoice.paymentStatus}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Status</Text>
            <Text style={styles.value}>{invoice.status}</Text>
          </View>
        </View>

        {/* Notes */}
        {invoice.notes ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notes}>{invoice.notes}</Text>
          </View>
        ) : null}

        {/* Date */}
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>Created</Text>

            <Text style={styles.value}>
              {new Date(invoice.createdAt).toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Delete Button or Confirmation */}
        {!showConfirm ? (
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={handleDeletePress}
            activeOpacity={0.85}
          >
            <Ionicons name="trash-outline" size={22} color="#fff" />

            <Text style={styles.deleteBtnText}>Delete Invoice</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.confirmBox}>
            <Text style={styles.confirmTitle}>Are you sure?</Text>

            <Text style={styles.confirmMessage}>
              Do you really want to delete this invoice? This action cannot be
              undone.
            </Text>

            <View style={styles.confirmActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={handleCancelConfirm}
                disabled={deleting}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.confirmDeleteBtn, deleting && { opacity: 0.6 }]}
                onPress={handleConfirmDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.confirmDeleteBtnText}>Yes, Delete</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 16,
    gap: 20,
  },

  section: {
    gap: 10,
  },

  sectionTitle: {
    color: Colors.textPrimary,
    fontFamily: Fonts.semibold,
    fontSize: 19,
    marginBottom: 2,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  label: {
    color: Colors.textMuted,
    fontFamily: Fonts.medium,
    fontSize: 17,
  },

  value: {
    color: Colors.textPrimary,
    fontFamily: Fonts.body,
    fontSize: 17,
    maxWidth: "60%",
    textAlign: "right",
  },

  totalRow: {
    marginTop: 6,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },

  totalLabel: {
    color: Colors.textPrimary,
    fontFamily: Fonts.bold,
    fontSize: 20,
  },

  totalValue: {
    color: Colors.primary,
    fontFamily: Fonts.monoBold,
    fontSize: 21,
  },

  itemCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: "rgba(255,255,255,0.03)",
    padding: 12,
    gap: 6,
  },

  itemTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },

  itemName: {
    flex: 1,
    color: Colors.textPrimary,
    fontFamily: Fonts.semibold,
    fontSize: 18,
  },

  itemTotal: {
    color: Colors.textPrimary,
    fontFamily: Fonts.monoBold,
    fontSize: 18,
  },

  itemBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  itemMeta: {
    color: Colors.textMuted,
    fontFamily: Fonts.body,
    fontSize: 15,
  },

  itemBrand: {
    color: Colors.textDim,
    fontFamily: Fonts.medium,
    fontSize: 15,
  },

  notes: {
    color: Colors.textPrimary,
    fontFamily: Fonts.body,
    fontSize: 17,
    lineHeight: 25,
  },

  emptyText: {
    color: Colors.textDim,
    fontFamily: Fonts.body,
    fontSize: 17,
  },

  deleteBtn: {
    marginTop: 8,
    minHeight: 56,
    borderRadius: 16,
    backgroundColor: "#dc2626",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  deleteBtnText: {
    color: "#fff",
    fontFamily: Fonts.bold,
    fontSize: 18,
  },

  // Confirmation box styles
  confirmBox: {
    marginTop: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(220, 38, 38, 0.4)",
    backgroundColor: "rgba(220, 38, 38, 0.08)",
    padding: 16,
    gap: 12,
  },

  confirmTitle: {
    color: Colors.textPrimary,
    fontFamily: Fonts.bold,
    fontSize: 20,
  },

  confirmMessage: {
    color: Colors.textMuted,
    fontFamily: Fonts.body,
    fontSize: 17,
    lineHeight: 25,
  },

  confirmActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },

  cancelBtn: {
    flex: 1,
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },

  cancelBtnText: {
    color: Colors.textPrimary,
    fontFamily: Fonts.semibold,
    fontSize: 17,
  },

  confirmDeleteBtn: {
    flex: 1,
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: "#dc2626",
    alignItems: "center",
    justifyContent: "center",
  },

  confirmDeleteBtnText: {
    color: "#fff",
    fontFamily: Fonts.bold,
    fontSize: 17,
  },
});
