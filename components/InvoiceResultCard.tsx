import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { InvoiceDetailDto } from "../api/pos.api";
import { Colors } from "../constants/colors";
import { Fonts } from "../constants/typography";
import { StatusBadge } from "./StatusBadge";

interface Props {
  invoice: InvoiceDetailDto;
  onPress?: () => void;
}

export function InvoiceResultCard({ invoice, onPress }: Props) {
  const customerName = invoice.customer?.name ?? "Walk-in Customer";
  const plate = invoice.vehicle?.plateNumber ?? "—";
  const vehicleLabel = invoice.vehicle
    ? [invoice.vehicle.year, invoice.vehicle.make, invoice.vehicle.model]
        .filter(Boolean)
        .join(" ")
    : "No vehicle";

  const paymentTone =
    invoice.paymentStatus?.toLowerCase() === "paid"
      ? "green"
      : invoice.paymentStatus?.toLowerCase() === "partial"
        ? "orange"
        : "gray";

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.86}
    >
      <View style={styles.topRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.invoiceNumber}>{invoice.invoiceNumber}</Text>
          <Text style={styles.customer}>{customerName}</Text>
        </View>

        <StatusBadge
          label={invoice.paymentStatus || "Unknown"}
          tone={paymentTone as any}
        />
      </View>

      <Text style={styles.vehicle}>{vehicleLabel}</Text>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Plate</Text>
          <Text style={styles.metaValue}>{plate}</Text>
        </View>

        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Total</Text>
          <Text style={styles.total}>${invoice.total.toFixed(2)}</Text>
        </View>

        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Paid</Text>
          <Text style={styles.metaValue}>${invoice.amountPaid.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.date}>
          {new Date(invoice.createdAt).toLocaleDateString()}
        </Text>

        <Text style={styles.status}>{invoice.status}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    padding: 16,
    gap: 10,
  },

  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },

  invoiceNumber: {
    color: Colors.textPrimary,
    fontFamily: Fonts.semibold,
    fontSize: 18,
  },

  customer: {
    color: Colors.textMuted,
    fontFamily: Fonts.body,
    fontSize: 16,
    marginTop: 2,
  },

  vehicle: {
    color: Colors.textPrimary,
    fontFamily: Fonts.body,
    fontSize: 16,
  },

  metaRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },

  metaItem: {
    flex: 1,
  },

  metaLabel: {
    color: Colors.textMuted,
    fontFamily: Fonts.medium,
    fontSize: 14,
  },

  metaValue: {
    color: Colors.textPrimary,
    fontFamily: Fonts.semibold,
    fontSize: 16,
    marginTop: 2,
  },

  total: {
    color: Colors.primary,
    fontFamily: Fonts.monoBold,
    fontSize: 18,
    marginTop: 2,
  },

  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },

  date: {
    color: Colors.textDim,
    fontFamily: Fonts.mono,
    fontSize: 15,
  },

  status: {
    color: Colors.textMuted,
    fontFamily: Fonts.medium,
    fontSize: 15,
  },
});
