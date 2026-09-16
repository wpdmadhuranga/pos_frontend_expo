import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  getAllVehiclesWithCustomerApi,
  VehicleWithCustomerDto,
} from "../api/pos.api";

export interface CustomerVehicleDetails {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;
  customerNotes: string;
  plateNumber: string;
  make: string;
  model: string;
  year: string;
  vehicleType: string;
  odometerReading: string;
  invoiceNotes: string;
  referenceNo: string;
}

const EMPTY_DETAILS: CustomerVehicleDetails = {
  customerName: "",
  customerPhone: "",
  customerEmail: "",
  customerAddress: "",
  customerNotes: "",
  plateNumber: "",
  make: "",
  model: "",
  year: "",
  vehicleType: "",
  odometerReading: "",
  invoiceNotes: "",
  referenceNo: "",
};

// --- Silent scenario detection -------------------------------------------
// No explicit "sale type" picker. Instead we look at what the user actually
// typed and infer which of the three backend scenarios applies:
//   - nothing in Customer or Vehicle  -> walk-in (no customer, no vehicle)
//   - Customer filled, Vehicle empty  -> counter sale (customer only)
//   - Customer filled, Vehicle filled -> full service (customer + vehicle)
//   - Vehicle filled, Customer empty  -> invalid (a vehicle needs an owner)
// This mirrors the same rule enforced server-side in
// PosCreateInvoiceRequest.Validate() / ResolveCustomerAndVehicleAsync.

export function hasCustomerInput(details: CustomerVehicleDetails): boolean {
  return (
    details.customerName.trim() !== "" || details.customerPhone.trim() !== ""
  );
}

export function hasVehicleInput(details: CustomerVehicleDetails): boolean {
  return details.plateNumber.trim() !== "";
}

export interface InvoiceScope {
  includeCustomer: boolean;
  includeVehicle: boolean;
}

// Single source of truth for "what should actually be sent" — used both by
// this form's own validation and by CartSheet when building the API payload,
// so the two can never drift apart.
export function getInvoiceScope(details: CustomerVehicleDetails): InvoiceScope {
  const includeVehicle = hasVehicleInput(details);
  const includeCustomer = includeVehicle || hasCustomerInput(details);
  return { includeCustomer, includeVehicle };
}

interface FieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  required?: boolean;
  keyboardType?: "default" | "numeric" | "email-address" | "phone-pad";
  multiline?: boolean;
  onFocus?: () => void;
}

function Field({
  label,
  value,
  onChangeText,
  required,
  keyboardType = "default",
  multiline,
  onFocus,
}: FieldProps) {
  return (
    <View className="mb-3">
      <Text className="mb-1 text-xs font-semibold text-slate-400">
        {label}
        {required ? " *" : ""}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onFocus={onFocus}
        keyboardType={keyboardType}
        multiline={multiline}
        placeholderTextColor="#475569"
        className={`rounded-xl border border-[#27303c] bg-[#1a1f28] px-3 py-3 text-sm text-white ${
          multiline ? "min-h-[70px]" : ""
        }`}
        style={multiline ? { textAlignVertical: "top" } : undefined}
      />
    </View>
  );
}

interface SearchSuggestionsListProps {
  results: VehicleWithCustomerDto[];
  onSelect: (record: VehicleWithCustomerDto) => void;
}

// Dropdown shown under the Name / Phone / Plate number fields while the
// user is typing, listing matching customer+vehicle records.
function SearchSuggestionsList({
  results,
  onSelect,
}: SearchSuggestionsListProps) {
  if (results.length === 0) {
    return null;
  }

  return (
    <View className="mb-3 -mt-2 overflow-hidden rounded-xl border border-[#27303c] bg-[#1a1f28]">
      {results.map((record) => (
        <TouchableOpacity
          key={record.id}
          activeOpacity={0.7}
          onPress={() => onSelect(record)}
          className="border-b border-[#27303c] px-3 py-2"
        >
          <Text className="text-sm font-semibold text-white">
            {record.customer.name}
          </Text>
          <Text className="text-xs text-slate-400">
            {record.customer.phone}
            {record.customer.email ? `  ·  ${record.customer.email}` : ""}
          </Text>
          <Text className="text-xs text-[#22c7b6]">
            {record.plateNumber}
            {record.make || record.model
              ? `  ·  ${[record.make, record.model].filter(Boolean).join(" ")}`
              : ""}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

interface CustomerVehicleFormProps {
  onSubmit: (details: CustomerVehicleDetails) => void;
  submitting?: boolean;
  totalAmount: number;
}

// NOTE: intentionally no <Modal> here. This renders as plain content inside
// CartSheet's single Modal — stacking two native <Modal> components caused
// the "Confirm & Submit" button's onPress to silently never fire (touch
// events don't reliably route through nested modals, especially on Android).
export function CustomerVehicleForm({
  onSubmit,
  submitting = false,
  totalAmount,
}: CustomerVehicleFormProps) {
  const [details, setDetails] = useState<CustomerVehicleDetails>(EMPTY_DETAILS);

  // All existing customer+vehicle records, fetched once when the form
  // mounts, then filtered locally as the user types (no extra network
  // calls per keystroke).
  const [records, setRecords] = useState<VehicleWithCustomerDto[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);

  // Which field currently "owns" the suggestions dropdown.
  const [activeSearchKey, setActiveSearchKey] = useState<
    "customerName" | "customerPhone" | "plateNumber" | null
  >(null);

  useEffect(() => {
    let cancelled = false;

    setLoadingRecords(true);
    getAllVehiclesWithCustomerApi()
      .then((result: VehicleWithCustomerDto[]) => {
        if (!cancelled) {
          setRecords(result);
        }
      })
      .catch((err: unknown) => {
        console.log(
          "[CustomerVehicleForm] Failed to load vehicles/customers for search:",
          err,
        );
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingRecords(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const set = (key: keyof CustomerVehicleDetails) => (text: string) =>
    setDetails((current) => ({ ...current, [key]: text }));

  // Same as `set`, but also marks this field as the active search field so
  // its suggestions dropdown renders and stays in sync with what's typed.
  const setAndSearch =
    (key: "customerName" | "customerPhone" | "plateNumber") =>
    (text: string) => {
      set(key)(text);
      setActiveSearchKey(key);
    };

  const suggestions = useMemo(() => {
    if (!activeSearchKey) {
      return [];
    }

    const query = details[activeSearchKey].trim().toLowerCase();
    if (query.length === 0) {
      return [];
    }

    return records
      .filter((record) => {
        const haystack = [
          record.customer.name,
          record.customer.phone,
          record.customer.email,
          record.plateNumber,
          record.make,
          record.model,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return haystack.includes(query);
      })
      .slice(0, 8);
  }, [activeSearchKey, details, records]);

  const applyRecord = (record: VehicleWithCustomerDto) => {
    setDetails((current) => ({
      ...current,
      customerName: record.customer.name,
      customerPhone: record.customer.phone,
      customerEmail: record.customer.email ?? "",
      customerAddress: record.customer.address ?? "",
      customerNotes: record.customer.notes ?? "",
      plateNumber: record.plateNumber,
      make: record.make ?? "",
      model: record.model ?? "",
      year: record.year ? String(record.year) : "",
      vehicleType: record.vehicleType ?? "",
      odometerReading: record.odometerReading
        ? String(record.odometerReading)
        : "",
    }));
    setActiveSearchKey(null);
  };

  const getMissingFields = () => {
    const missing: string[] = [];
    const customerStarted = hasCustomerInput(details);
    const vehicleStarted = hasVehicleInput(details);

    // If they've started filling in customer details, both name and phone
    // are needed to actually identify/create that customer.
    if (customerStarted) {
      if (!details.customerName.trim()) missing.push("Customer name");
      if (!details.customerPhone.trim()) missing.push("Customer phone");
    }

    // A vehicle can't be attached to an invoice without an owning customer
    // (matches the backend rule — a new vehicle always needs a customer).
    if (vehicleStarted && !customerStarted) {
      missing.push(
        "Customer name and phone (required when a vehicle is entered)",
      );
    }

    return missing;
  };

  const handlePress = () => {
    console.log("[CustomerVehicleForm] Confirm & Submit pressed", details);
    const missing = getMissingFields();
    if (missing.length > 0) {
      console.log("[CustomerVehicleForm] Missing required fields:", missing);
      Alert.alert("Missing details", `Please fill in: ${missing.join(", ")}`);
      return;
    }
    console.log("[CustomerVehicleForm] Validation passed, calling onSubmit");
    onSubmit(details);
  };

  return (
    <View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ maxHeight: 420 }}
      >
        <Text className="mb-2 text-sm font-semibold text-slate-300">
          Customer
        </Text>
        <Text className="mb-2 text-xs text-slate-500">
          Leave blank for a walk-in sale with no customer record.
        </Text>
        {loadingRecords && (
          <Text className="mb-2 text-xs text-slate-500">
            Loading existing customers…
          </Text>
        )}
        <Field
          label="Name"
          value={details.customerName}
          onChangeText={setAndSearch("customerName")}
          onFocus={() => setActiveSearchKey("customerName")}
        />
        {activeSearchKey === "customerName" && (
          <SearchSuggestionsList results={suggestions} onSelect={applyRecord} />
        )}
        <Field
          label="Phone"
          value={details.customerPhone}
          onChangeText={setAndSearch("customerPhone")}
          onFocus={() => setActiveSearchKey("customerPhone")}
          keyboardType="phone-pad"
        />
        {activeSearchKey === "customerPhone" && (
          <SearchSuggestionsList results={suggestions} onSelect={applyRecord} />
        )}
        <Field
          label="Email"
          value={details.customerEmail}
          onChangeText={set("customerEmail")}
          onFocus={() => setActiveSearchKey(null)}
          keyboardType="email-address"
        />
        <Field
          label="Address"
          value={details.customerAddress}
          onChangeText={set("customerAddress")}
          onFocus={() => setActiveSearchKey(null)}
        />
        <Field
          label="Customer notes"
          value={details.customerNotes}
          onChangeText={set("customerNotes")}
          onFocus={() => setActiveSearchKey(null)}
          multiline
        />

        <Text className="mb-2 mt-2 text-sm font-semibold text-slate-300">
          Vehicle
        </Text>
        <Text className="mb-2 text-xs text-slate-500">
          Leave blank for a counter sale with no vehicle attached.
        </Text>
        <Field
          label="Plate number"
          value={details.plateNumber}
          onChangeText={setAndSearch("plateNumber")}
          onFocus={() => setActiveSearchKey("plateNumber")}
        />
        {activeSearchKey === "plateNumber" && (
          <SearchSuggestionsList results={suggestions} onSelect={applyRecord} />
        )}
        <Field
          label="Make"
          value={details.make}
          onChangeText={set("make")}
          onFocus={() => setActiveSearchKey(null)}
        />
        <Field
          label="Model"
          value={details.model}
          onChangeText={set("model")}
          onFocus={() => setActiveSearchKey(null)}
        />
        <Field
          label="Year"
          value={details.year}
          onChangeText={set("year")}
          onFocus={() => setActiveSearchKey(null)}
          keyboardType="numeric"
        />
        <Field
          label="Vehicle type"
          value={details.vehicleType}
          onChangeText={set("vehicleType")}
          onFocus={() => setActiveSearchKey(null)}
        />
        <Field
          label="Odometer reading"
          value={details.odometerReading}
          onChangeText={set("odometerReading")}
          onFocus={() => setActiveSearchKey(null)}
          keyboardType="numeric"
        />

        <Text className="mb-2 mt-2 text-sm font-semibold text-slate-300">
          Sale
        </Text>
        <Field
          label="Invoice notes"
          value={details.invoiceNotes}
          onChangeText={set("invoiceNotes")}
          onFocus={() => setActiveSearchKey(null)}
          multiline
        />
        <Field
          label="Payment reference no."
          value={details.referenceNo}
          onChangeText={set("referenceNo")}
          onFocus={() => setActiveSearchKey(null)}
        />
      </ScrollView>

      <TouchableOpacity
        disabled={submitting}
        activeOpacity={0.85}
        onPress={handlePress}
        className={`mt-4 items-center rounded-2xl py-5 ${
          submitting ? "bg-slate-700" : "bg-[#22c7b6]"
        }`}
      >
        <Text
          className={`text-base font-bold ${
            submitting ? "text-slate-400" : "text-[#121720]"
          }`}
        >
          {submitting
            ? "Submitting…"
            : `Confirm & Submit — $${totalAmount.toLocaleString()}`}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
