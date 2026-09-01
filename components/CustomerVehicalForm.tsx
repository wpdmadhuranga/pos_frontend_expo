import { useState } from "react";
import {
    Alert,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

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

interface FieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  required?: boolean;
  keyboardType?: "default" | "numeric" | "email-address" | "phone-pad";
  multiline?: boolean;
}

function Field({
  label,
  value,
  onChangeText,
  required,
  keyboardType = "default",
  multiline,
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

  const set = (key: keyof CustomerVehicleDetails) => (text: string) =>
    setDetails((current) => ({ ...current, [key]: text }));

  const getMissingFields = () => {
    const missing: string[] = [];
    if (!details.customerName.trim()) missing.push("Customer name");
    if (!details.customerPhone.trim()) missing.push("Customer phone");
    if (!details.plateNumber.trim()) missing.push("Plate number");
    if (!details.odometerReading.trim()) missing.push("Odometer reading");
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
        <Field
          label="Name"
          value={details.customerName}
          onChangeText={set("customerName")}
          required
        />
        <Field
          label="Phone"
          value={details.customerPhone}
          onChangeText={set("customerPhone")}
          keyboardType="phone-pad"
          required
        />
        <Field
          label="Email"
          value={details.customerEmail}
          onChangeText={set("customerEmail")}
          keyboardType="email-address"
        />
        <Field
          label="Address"
          value={details.customerAddress}
          onChangeText={set("customerAddress")}
        />
        <Field
          label="Customer notes"
          value={details.customerNotes}
          onChangeText={set("customerNotes")}
          multiline
        />

        <Text className="mb-2 mt-2 text-sm font-semibold text-slate-300">
          Vehicle
        </Text>
        <Field
          label="Plate number"
          value={details.plateNumber}
          onChangeText={set("plateNumber")}
          required
        />
        <Field label="Make" value={details.make} onChangeText={set("make")} />
        <Field
          label="Model"
          value={details.model}
          onChangeText={set("model")}
        />
        <Field
          label="Year"
          value={details.year}
          onChangeText={set("year")}
          keyboardType="numeric"
        />
        <Field
          label="Vehicle type"
          value={details.vehicleType}
          onChangeText={set("vehicleType")}
        />
        <Field
          label="Odometer reading"
          value={details.odometerReading}
          onChangeText={set("odometerReading")}
          keyboardType="numeric"
          required
        />

        <Text className="mb-2 mt-2 text-sm font-semibold text-slate-300">
          Sale
        </Text>
        <Field
          label="Invoice notes"
          value={details.invoiceNotes}
          onChangeText={set("invoiceNotes")}
          multiline
        />
        <Field
          label="Payment reference no."
          value={details.referenceNo}
          onChangeText={set("referenceNo")}
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
