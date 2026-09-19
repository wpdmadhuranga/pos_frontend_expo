import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import {
  Platform,
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

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseDate(value: string): Date {
  if (!value) {
    return new Date();
  }

  const parts = value.split("-");

  if (parts.length === 3) {
    const year = Number(parts[0]);
    const month = Number(parts[1]);
    const day = Number(parts[2]);

    if (
      Number.isFinite(year) &&
      Number.isFinite(month) &&
      Number.isFinite(day)
    ) {
      return new Date(year, month - 1, day);
    }
  }

  return new Date();
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

  const [showDatePicker, setShowDatePicker] = useState(false);

  const [activeDateField, setActiveDateField] = useState<
    "date" | "fromDate" | "toDate" | null
  >(null);

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
    setShowDatePicker(false);
    setActiveDateField(null);
    onClear();
  };

  const openDatePicker = (field: "date" | "fromDate" | "toDate") => {
    if (loading) {
      return;
    }

    setActiveDateField(field);
    setShowDatePicker(true);
  };

  const getPickerDate = () => {
    if (activeDateField === "date") {
      return parseDate(date);
    }

    if (activeDateField === "fromDate") {
      return parseDate(fromDate);
    }

    if (activeDateField === "toDate") {
      return parseDate(toDate);
    }

    return new Date();
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }

    if (event?.type === "dismissed" || !selectedDate) {
      if (Platform.OS === "android") {
        setActiveDateField(null);
      }

      return;
    }

    const formattedDate = formatDate(selectedDate);

    if (activeDateField === "date") {
      setDate(formattedDate);
    } else if (activeDateField === "fromDate") {
      setFromDate(formattedDate);
    } else if (activeDateField === "toDate") {
      setToDate(formattedDate);
    }

    if (Platform.OS === "ios") {
      setShowDatePicker(false);
    }

    setActiveDateField(null);
  };

  return (
    <View style={styles.container}>
      {/* Customer Name */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Customer Name</Text>

        <View style={styles.inputWrapper}>
          <Ionicons name="person-outline" size={20} color={Colors.textMuted} />

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
          <Ionicons name="car-outline" size={20} color={Colors.textMuted} />

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
          disabled={loading}
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
          disabled={loading}
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
          <Text style={styles.label}>Date</Text>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => openDatePicker("date")}
            disabled={loading}
            style={styles.inputWrapper}
          >
            <Ionicons
              name="calendar-outline"
              size={20}
              color={Colors.textMuted}
            />

            <Text style={[styles.dateText, !date && styles.datePlaceholder]}>
              {date || "Select date"}
            </Text>

            <Ionicons name="chevron-down" size={20} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.rangeRow}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>From Date</Text>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => openDatePicker("fromDate")}
              disabled={loading}
              style={styles.inputWrapper}
            >
              <Ionicons
                name="calendar-outline"
                size={20}
                color={Colors.textMuted}
              />

              <Text
                style={[styles.dateText, !fromDate && styles.datePlaceholder]}
              >
                {fromDate || "From date"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>To Date</Text>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => openDatePicker("toDate")}
              disabled={loading}
              style={styles.inputWrapper}
            >
              <Ionicons
                name="calendar-outline"
                size={20}
                color={Colors.textMuted}
              />

              <Text
                style={[styles.dateText, !toDate && styles.datePlaceholder]}
              >
                {toDate || "To date"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Native Date Picker */}
      {showDatePicker && activeDateField && (
        <DateTimePicker
          value={getPickerDate()}
          mode="date"
          display={Platform.OS === "android" ? "calendar" : "spinner"}
          onChange={handleDateChange}
        />
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
          <Ionicons name="search" size={20} color={Colors.black} />

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
    fontSize: 16,
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
    fontSize: 17,
  },

  dateText: {
    flex: 1,
    color: Colors.textPrimary,
    fontFamily: Fonts.body,
    fontSize: 17,
  },

  datePlaceholder: {
    color: Colors.textDim,
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
    fontSize: 16,
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
    fontSize: 17,
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
    fontSize: 17,
  },
});
