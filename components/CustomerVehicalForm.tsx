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
  getAllCustomersWithVehiclesApi,
  PosCustomerVehicleDto,
  PosCustomerWithVehiclesDto,
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

// -----------------------------------------------------------------------------
// Invoice scenario detection
// -----------------------------------------------------------------------------
//
// Nothing entered:
//   -> walk-in sale
//
// Customer entered, no vehicle:
//   -> counter sale / customer-only invoice
//
// Customer + vehicle entered:
//   -> full vehicle service
//
// Vehicle entered without customer:
//   -> invalid
// -----------------------------------------------------------------------------

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

export function getInvoiceScope(details: CustomerVehicleDetails): InvoiceScope {
  const includeVehicle = hasVehicleInput(details);

  const includeCustomer = includeVehicle || hasCustomerInput(details);

  return {
    includeCustomer,
    includeVehicle,
  };
}

// -----------------------------------------------------------------------------
// Search record
// -----------------------------------------------------------------------------
//
// The backend now returns:
//
// Customer
//   -> vehicles[]
//
// But the search UI wants individual selectable records.
//
// Therefore:
//
// Customer with 2 vehicles
//   -> 2 search records
//
// Customer with no vehicle
//   -> 1 search record with vehicle = null
// -----------------------------------------------------------------------------

interface CustomerSearchRecord {
  customer: PosCustomerWithVehiclesDto;
  vehicle: PosCustomerVehicleDto | null;
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
      <Text className="mb-1 text-base font-semibold text-slate-400">
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
        className={`rounded-xl border border-[#27303c] bg-[#1a1f28] px-3 py-3 text-lg text-white ${
          multiline ? "min-h-[70px]" : ""
        }`}
        style={
          multiline
            ? {
                textAlignVertical: "top",
              }
            : undefined
        }
      />
    </View>
  );
}

interface SearchSuggestionsListProps {
  results: CustomerSearchRecord[];
  onSelect: (record: CustomerSearchRecord) => void;
}

function SearchSuggestionsList({
  results,
  onSelect,
}: SearchSuggestionsListProps) {
  if (results.length === 0) {
    return null;
  }

  return (
    <View className="mb-3 -mt-2 overflow-hidden rounded-xl border border-[#27303c] bg-[#1a1f28]">
      {results.map((record, index) => {
        const customer = record.customer;
        const vehicle = record.vehicle;

        return (
          <TouchableOpacity
            key={`${customer.id}-${vehicle?.id ?? "no-vehicle"}-${index}`}
            activeOpacity={0.7}
            onPress={() => onSelect(record)}
            className="border-b border-[#27303c] px-3 py-2"
          >
            {/* Customer */}
            <Text className="text-base font-semibold text-white">
              {customer.name}
            </Text>

            <Text className="text-sm text-slate-400">
              {customer.phone}
              {customer.email ? `  ·  ${customer.email}` : ""}
            </Text>

            {/* Vehicle */}
            {vehicle ? (
              <Text className="text-sm text-[#22c7b6]">
                {vehicle.plateNumber}
                {vehicle.make || vehicle.model
                  ? `  ·  ${[vehicle.make, vehicle.model]
                      .filter(Boolean)
                      .join(" ")}`
                  : ""}
              </Text>
            ) : (
              <Text className="text-sm text-slate-500">No vehicle</Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

interface CustomerVehicleFormProps {
  onSubmit: (details: CustomerVehicleDetails) => void;
  submitting?: boolean;
  totalAmount: number;
}

export function CustomerVehicleForm({
  onSubmit,
  submitting = false,
  totalAmount,
}: CustomerVehicleFormProps) {
  const [details, setDetails] = useState<CustomerVehicleDetails>(EMPTY_DETAILS);

  // ---------------------------------------------------------------------------
  // Customer + vehicle records
  // ---------------------------------------------------------------------------

  const [records, setRecords] = useState<CustomerSearchRecord[]>([]);

  const [loadingRecords, setLoadingRecords] = useState(false);

  // Which field owns the suggestions dropdown.
  const [activeSearchKey, setActiveSearchKey] = useState<
    "customerName" | "customerPhone" | "plateNumber" | null
  >(null);

  // ---------------------------------------------------------------------------
  // Load customers + vehicles
  // ---------------------------------------------------------------------------

  useEffect(() => {
    let cancelled = false;

    async function loadCustomersAndVehicles() {
      try {
        setLoadingRecords(true);

        const customers = await getAllCustomersWithVehiclesApi();

        if (cancelled) {
          return;
        }

        // Flatten:
        //
        // Customer A
        //   Vehicle 1
        //   Vehicle 2
        //
        // Customer B
        //   no vehicle
        //
        // into:
        //
        // [
        //   { customer: A, vehicle: Vehicle 1 },
        //   { customer: A, vehicle: Vehicle 2 },
        //   { customer: B, vehicle: null }
        // ]

        const flattenedRecords: CustomerSearchRecord[] = [];

        customers.forEach((customer: PosCustomerWithVehiclesDto) => {
          if (
            Array.isArray(customer.vehicles) &&
            customer.vehicles.length > 0
          ) {
            customer.vehicles.forEach((vehicle: PosCustomerVehicleDto) => {
              flattenedRecords.push({
                customer,
                vehicle,
              });
            });
          } else {
            flattenedRecords.push({
              customer,
              vehicle: null,
            });
          }
        });

        setRecords(flattenedRecords);

        console.log(
          "[CustomerVehicleForm] Loaded customers:",
          customers.length,
        );

        console.log(
          "[CustomerVehicleForm] Search records:",
          flattenedRecords.length,
        );
      } catch (err: unknown) {
        console.log(
          "[CustomerVehicleForm] Failed to load customers/vehicles:",
          err,
        );
      } finally {
        if (!cancelled) {
          setLoadingRecords(false);
        }
      }
    }

    loadCustomersAndVehicles();

    return () => {
      cancelled = true;
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Basic field setter
  // ---------------------------------------------------------------------------

  const set = (key: keyof CustomerVehicleDetails) => (text: string) => {
    setDetails((current) => ({
      ...current,
      [key]: text,
    }));
  };

  // ---------------------------------------------------------------------------
  // Search field setter
  // ---------------------------------------------------------------------------

  const setAndSearch =
    (key: "customerName" | "customerPhone" | "plateNumber") =>
    (text: string) => {
      setDetails((current) => ({
        ...current,
        [key]: text,
      }));

      setActiveSearchKey(key);
    };

  // ---------------------------------------------------------------------------
  // Local search
  // ---------------------------------------------------------------------------

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
        const customer = record.customer;
        const vehicle = record.vehicle;

        const haystack = [
          customer.name,
          customer.phone,
          customer.email,

          vehicle?.plateNumber,
          vehicle?.make,
          vehicle?.model,
          vehicle?.vehicleType,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return haystack.includes(query);
      })
      .slice(0, 8);
  }, [activeSearchKey, details, records]);

  // ---------------------------------------------------------------------------
  // Apply selected customer / vehicle
  // ---------------------------------------------------------------------------

  const applyRecord = (record: CustomerSearchRecord) => {
    const customer = record.customer;
    const vehicle = record.vehicle;

    setDetails((current) => ({
      ...current,

      // Customer
      customerName: customer.name,
      customerPhone: customer.phone,
      customerEmail: customer.email ?? "",
      customerAddress: customer.address ?? "",
      customerNotes: customer.notes ?? "",

      // Vehicle
      //
      // If this customer has no vehicle, these remain empty.
      plateNumber: vehicle?.plateNumber ?? "",
      make: vehicle?.make ?? "",
      model: vehicle?.model ?? "",
      year: vehicle?.year != null ? String(vehicle.year) : "",
      vehicleType: vehicle?.vehicleType ?? "",
      odometerReading:
        vehicle?.odometerReading != null && vehicle.odometerReading > 0
          ? String(vehicle.odometerReading)
          : "",
    }));

    setActiveSearchKey(null);
  };

  // ---------------------------------------------------------------------------
  // Validation
  // ---------------------------------------------------------------------------

  const getMissingFields = () => {
    const missing: string[] = [];

    const customerStarted = hasCustomerInput(details);

    const vehicleStarted = hasVehicleInput(details);

    // If customer details were started,
    // both name and phone are required.
    if (customerStarted) {
      if (!details.customerName.trim()) {
        missing.push("Customer name");
      }

      if (!details.customerPhone.trim()) {
        missing.push("Customer phone");
      }
    }

    // A vehicle requires an owning customer.
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

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ maxHeight: 420 }}
      >
        {/* ----------------------------------------------------------------- */}
        {/* CUSTOMER                                                         */}
        {/* ----------------------------------------------------------------- */}

        <Text className="mb-2 text-lg font-semibold text-slate-300">
          Customer
        </Text>

        <Text className="mb-2 text-sm text-slate-500">
          Leave blank for a walk-in sale with no customer record.
        </Text>

        {loadingRecords && (
          <Text className="mb-2 text-sm text-slate-500">
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

        {/* ----------------------------------------------------------------- */}
        {/* VEHICLE                                                          */}
        {/* ----------------------------------------------------------------- */}

        <Text className="mb-2 mt-2 text-lg font-semibold text-slate-300">
          Vehicle
        </Text>

        <Text className="mb-2 text-sm text-slate-500">
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

        {/* ----------------------------------------------------------------- */}
        {/* SALE                                                             */}
        {/* ----------------------------------------------------------------- */}

        <Text className="mb-2 mt-2 text-lg font-semibold text-slate-300">
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

      {/* ------------------------------------------------------------------- */}
      {/* SUBMIT                                                             */}
      {/* ------------------------------------------------------------------- */}

      <TouchableOpacity
        disabled={submitting}
        activeOpacity={0.85}
        onPress={handlePress}
        className={`mt-4 items-center rounded-2xl py-5 ${
          submitting ? "bg-slate-700" : "bg-[#22c7b6]"
        }`}
      >
        <Text
          className={`text-xl font-bold ${
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
