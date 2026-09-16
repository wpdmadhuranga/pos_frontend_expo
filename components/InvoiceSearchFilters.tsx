import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { Colors } from "../constants/colors";
import { Fonts } from "../constants/typography";

export interface InvoiceSearchFiltersValue {
  customerName: string;
  plateNumber: string;
  date: string;
  fromDate: string;
  toDate: string;
  useRange: boolean;
}

interface Props {
  initialValues?: Partial<InvoiceSearchFiltersValue>;
  loading?: boolean;
  onSearch: (values: InvoiceSearchFiltersValue) => void;
  onClear: () => void;
}

export function InvoiceSearchFilters({
  initialValues,
  loading = false,
  onSearch,
  onClear,
}: Props) {
  const [customerName, setCustomerName] = useState(
    initialValues?.customerName ?? "",
  );
  const [plateNumber, setPlateNumber] = useState(
    initialValues?.plateNumber ?? "",
  );
  const [date, setDate] = useState(initialValues?.date ?? "");
  const [fromDate, setFromDate] = useState(initialValues?.fromDate ?? "");
  const [toDate, setToDate] = useState(initialValues?.toDate ?? "");
  const [useRange, setUseRange] = useState(initialValues?.useRange ?? false);

  const handleSearch = () => {
    onSearch({
      customerName: customerName.trim(),
      plateNumber: plateNumber.trim(),
      date: useRange ? "" : date.trim(),
      fromDate: useRange ? fromDate.trim() : "",
      toDate: useRange ? toDate.trim() : "",
      useRange,
    });
  };

  const handleClear = () => {
    setCustomerName("");
    setPlateNumber("");
    setDate("");
    setFromDate("");
    setToDate("");
    setUseRange(false);
    onClear();
  };

  return (
    <View style={styles.container}>
      {/* Customer Name */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Customer Name</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="person-outline" size={18} color={Colors.textMuted} />
          <TextInput
            style={styles.input}
            placeholder="Search by customer name..."
            placeholderTextColor={Colors.textDim}
            value={customerName}
            onChangeText={setCustomerName}
            autoCapitalize="words"
          />
        </View>
      </View>

      {/* Plate Number */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Vehicle Plate Number</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="car-outline" size={18} color={Colors.textMuted} />
          <TextInput
            style={styles.input}
            placeholder="Search by plate number..."
            placeholderTextColor={Colors.textDim}
            value={plateNumber}
            onChangeText={setPlateNumber}
            autoCapitalize="characters"
          />
        </View>
      </View>

      {/* Date mode toggle */}
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleChip, !useRange && styles.toggleChipActive]}
          onPress={() => setUseRange(false)}
        >
          <Text
            style={[styles.toggleText, !useRange && styles.toggleTextActive]}
          >
            Specific Date
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleChip, useRange && styles.toggleChipActive]}
          onPress={() => setUseRange(true)}
        >
          <Text
            style={[styles.toggleText, useRange && styles.toggleTextActive]}
          >
            Date Range
          </Text>
        </TouchableOpacity>
      </View>

      {/* Date inputs */}
      {!useRange ? (
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
          <View style={styles.inputWrapper}>
            <Ionicons
              name="calendar-outline"
              size={18}
              color={Colors.textMuted}
            />
            <TextInput
              style={styles.input}
              placeholder="2025-09-15"
              placeholderTextColor={Colors.textDim}
              value={date}
              onChangeText={setDate}
              keyboardType="numbers-and-punctuation"
            />
          </View>
        </View>
      ) : (
        <View style={styles.rangeRow}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>From Date</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="calendar-outline"
                size={18}
                color={Colors.textMuted}
              />
              <TextInput
                style={styles.input}
                placeholder="2025-09-01"
                placeholderTextColor={Colors.textDim}
                value={fromDate}
                onChangeText={setFromDate}
                keyboardType="numbers-and-punctuation"
              />
            </View>
          </View>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>To Date</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="calendar-outline"
                size={18}
                color={Colors.textMuted}
              />
              <TextInput
                style={styles.input}
                placeholder="2025-09-16"
                placeholderTextColor={Colors.textDim}
                value={toDate}
                onChangeText={setToDate}
                keyboardType="numbers-and-punctuation"
              />
            </View>
          </View>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.clearBtn}
          onPress={handleClear}
          disabled={loading}
        >
          <Text style={styles.clearBtnText}>Clear</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.searchBtn, loading && { opacity: 0.7 }]}
          onPress={handleSearch}
          disabled={loading}
        >
          <Ionicons name="search" size={18} color={Colors.black} />
          <Text style={styles.searchBtnText}>
            {loading ? "Searching..." : "Search"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
    paddingBottom: 8,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    color: Colors.textMuted,
    fontFamily: Fonts.medium,
    fontSize: 12,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minHeight: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    color: Colors.textPrimary,
    fontFamily: Fonts.body,
    fontSize: 14,
  },
  toggleRow: {
    flexDirection: "row",
    gap: 10,
  },
  toggleChip: {
    flex: 1,
    minHeight: 40,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  toggleChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  toggleText: {
    color: Colors.textMuted,
    fontFamily: Fonts.semibold,
    fontSize: 13,
  },
  toggleTextActive: {
    color: Colors.black,
  },
  rangeRow: {
    flexDirection: "row",
    gap: 12,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },
  clearBtn: {
    flex: 1,
    minHeight: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  clearBtnText: {
    color: Colors.textPrimary,
    fontFamily: Fonts.semibold,
    fontSize: 14,
  },
  searchBtn: {
    flex: 2,
    minHeight: 48,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  searchBtnText: {
    color: Colors.black,
    fontFamily: Fonts.bold,
    fontSize: 14,
  },
});
