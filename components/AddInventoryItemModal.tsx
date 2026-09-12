import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { CreateInventoryItemPayload } from "../api/inventory.api";
import { Colors } from "../constants/colors";
import { Fonts } from "../constants/typography";

export interface LinkableProduct {
  id: string;
  name: string;
  brand: string;
  partNumber: string;
}

export interface ServiceOption {
  id: string;
  name: string;
}

type LinkMode = "none" | "link" | "create";

const UNIT_OPTIONS = ["piece", "Liter"];

interface AddInventoryItemModalProps {
  visible: boolean;
  onClose: () => void;
  /** Should call the create API and throw on failure (message surfaced in the form). */
  onSubmit: (payload: CreateInventoryItemPayload) => Promise<void>;
  /** Products with inventoryItemId == null — the only ones eligible to link. */
  linkableProducts: LinkableProduct[];
  services: ServiceOption[];
}

export function AddInventoryItemModal({
  visible,
  onClose,
  onSubmit,
  linkableProducts,
  services,
}: AddInventoryItemModalProps) {
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [unit, setUnit] = useState("piece");
  const [unitPickerVisible, setUnitPickerVisible] = useState(false);
  const [quantityOnHand, setQuantityOnHand] = useState("0");
  const [reorderLevel, setReorderLevel] = useState("0");
  const [unitCost, setUnitCost] = useState("0");

  const [linkMode, setLinkMode] = useState<LinkMode>("none");
  const [productSearch, setProductSearch] = useState("");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null,
  );

  const [productBrand, setProductBrand] = useState("");
  const [productPartNumber, setProductPartNumber] = useState("");
  const [productVehicleType, setProductVehicleType] = useState("");
  const [productSellingPrice, setProductSellingPrice] = useState("");
  const [productServiceId, setProductServiceId] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    if (!q) return linkableProducts;
    return linkableProducts.filter((p) =>
      `${p.name} ${p.brand} ${p.partNumber}`.toLowerCase().includes(q),
    );
  }, [linkableProducts, productSearch]);

  const resetForm = () => {
    setName("");
    setSku("");
    setUnit("piece");
    setUnitPickerVisible(false);
    setQuantityOnHand("0");
    setReorderLevel("0");
    setUnitCost("0");
    setLinkMode("none");
    setProductSearch("");
    setSelectedProductId(null);
    setProductBrand("");
    setProductPartNumber("");
    setProductVehicleType("");
    setProductSellingPrice("");
    setProductServiceId(null);
    setError(null);
  };

  const handleClose = () => {
    if (submitting) return;
    resetForm();
    onClose();
  };

  const validate = (): string | null => {
    if (!name.trim()) return "Name is required.";
    if (!unit.trim()) return "Unit is required.";

    const qty = Number(quantityOnHand);
    const reorder = Number(reorderLevel);
    const cost = Number(unitCost);
    if (Number.isNaN(qty) || qty < 0)
      return "Quantity on hand must be a valid number.";
    if (Number.isNaN(reorder) || reorder < 0)
      return "Reorder level must be a valid number.";
    if (Number.isNaN(cost) || cost < 0)
      return "Unit cost must be a valid number.";

    if (linkMode === "link" && !selectedProductId) {
      return "Select a product to link to.";
    }

    if (linkMode === "create") {
      if (!productBrand.trim()) return "Product brand is required.";
      if (
        !productSellingPrice.trim() ||
        Number.isNaN(Number(productSellingPrice))
      ) {
        return "A valid selling price is required.";
      }
    }

    return null;
  };

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setSubmitting(true);

    const payload: CreateInventoryItemPayload = {
      name: name.trim(),
      sku: sku.trim() || undefined,
      unit: unit.trim(),
      quantityOnHand: Number(quantityOnHand),
      reorderLevel: Number(reorderLevel),
      unitCost: Number(unitCost),
      createAsProduct: linkMode === "create",
      linkToExistingProductId:
        linkMode === "link" ? selectedProductId! : undefined,
      productBrand: linkMode === "create" ? productBrand.trim() : undefined,
      productPartNumber:
        linkMode === "create" && productPartNumber.trim()
          ? productPartNumber.trim()
          : undefined,
      productCompatibleVehicleType:
        linkMode === "create" && productVehicleType.trim()
          ? productVehicleType.trim()
          : undefined,
      productSellingPrice:
        linkMode === "create" ? Number(productSellingPrice) : undefined,
      productServiceId:
        linkMode === "create" ? (productServiceId ?? undefined) : undefined,
    };

    try {
      await onSubmit(payload);
      resetForm();
      onClose();
    } catch (err: any) {
      setError(err?.message ?? "Failed to create inventory item.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={handleClose}
      >
        <View style={styles.overlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.sheetWrap}
          >
            <View style={styles.sheet}>
              <View style={styles.headerRow}>
                <Text style={styles.title}>New Inventory Item</Text>
                <TouchableOpacity onPress={handleClose} hitSlop={10}>
                  <Ionicons name="close" size={22} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ gap: 16, paddingBottom: 20 }}
                keyboardShouldPersistTaps="handled"
              >
                {/* Base inventory fields — always required */}
                <View style={{ gap: 12 }}>
                  <Field label="Name *">
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. Engine Oil 5W-30"
                      placeholderTextColor={Colors.textMuted}
                      value={name}
                      onChangeText={setName}
                    />
                  </Field>

                  <View style={styles.row}>
                    <Field label="SKU" style={{ flex: 1 }}>
                      <TextInput
                        style={styles.input}
                        placeholder="Optional"
                        placeholderTextColor={Colors.textMuted}
                        value={sku}
                        onChangeText={setSku}
                      />
                    </Field>
                    <Field label="Unit *" style={{ flex: 1 }}>
                      <TouchableOpacity
                        style={[styles.input, styles.dropdownTrigger]}
                        onPress={() => setUnitPickerVisible(true)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.dropdownValueText}>{unit}</Text>
                        <Ionicons
                          name="chevron-down"
                          size={16}
                          color={Colors.textMuted}
                        />
                      </TouchableOpacity>
                    </Field>
                  </View>

                  <View style={styles.row}>
                    <Field label="Qty on hand" style={{ flex: 1 }}>
                      <TextInput
                        style={styles.input}
                        keyboardType="decimal-pad"
                        value={quantityOnHand}
                        onChangeText={setQuantityOnHand}
                      />
                    </Field>
                    <Field label="Reorder level" style={{ flex: 1 }}>
                      <TextInput
                        style={styles.input}
                        keyboardType="decimal-pad"
                        value={reorderLevel}
                        onChangeText={setReorderLevel}
                      />
                    </Field>
                    <Field label="Unit cost" style={{ flex: 1 }}>
                      <TextInput
                        style={styles.input}
                        keyboardType="decimal-pad"
                        value={unitCost}
                        onChangeText={setUnitCost}
                      />
                    </Field>
                  </View>
                </View>

                {/* Scenario selector — drives which fields below apply */}
                <View style={{ gap: 10 }}>
                  <Text style={styles.sectionLabel}>
                    Link to a sellable product?
                  </Text>
                  <View style={styles.segmentRow}>
                    <SegmentButton
                      label="No"
                      active={linkMode === "none"}
                      onPress={() => setLinkMode("none")}
                    />
                    <SegmentButton
                      label="Link existing"
                      active={linkMode === "link"}
                      onPress={() => setLinkMode("link")}
                    />
                    <SegmentButton
                      label="Create new"
                      active={linkMode === "create"}
                      onPress={() => setLinkMode("create")}
                    />
                  </View>
                </View>

                {linkMode === "link" && (
                  <View style={{ gap: 10 }}>
                    <TextInput
                      style={styles.input}
                      placeholder="Search unlinked products..."
                      placeholderTextColor={Colors.textMuted}
                      value={productSearch}
                      onChangeText={setProductSearch}
                    />
                    <View style={styles.productList}>
                      {filteredProducts.length === 0 && (
                        <Text style={styles.emptyText}>
                          No unlinked products found.
                        </Text>
                      )}
                      {filteredProducts.map((p) => {
                        const selected = selectedProductId === p.id;
                        return (
                          <TouchableOpacity
                            key={p.id}
                            style={[
                              styles.productRow,
                              selected && styles.productRowActive,
                            ]}
                            onPress={() => setSelectedProductId(p.id)}
                          >
                            <View style={{ flex: 1 }}>
                              <Text style={styles.productName}>{p.name}</Text>
                              <Text style={styles.productMeta}>
                                {p.brand} · {p.partNumber}
                              </Text>
                            </View>
                            {selected && (
                              <Ionicons
                                name="checkmark-circle"
                                size={20}
                                color={Colors.primary}
                              />
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                )}

                {linkMode === "create" && (
                  <View style={{ gap: 12 }}>
                    <Field label="Brand *">
                      <TextInput
                        style={styles.input}
                        placeholder="e.g. Bosch"
                        placeholderTextColor={Colors.textMuted}
                        value={productBrand}
                        onChangeText={setProductBrand}
                      />
                    </Field>
                    <View style={styles.row}>
                      <Field label="Part #" style={{ flex: 1 }}>
                        <TextInput
                          style={styles.input}
                          placeholderTextColor={Colors.textMuted}
                          value={productPartNumber}
                          onChangeText={setProductPartNumber}
                        />
                      </Field>
                      <Field label="Selling price *" style={{ flex: 1 }}>
                        <TextInput
                          style={styles.input}
                          keyboardType="decimal-pad"
                          placeholderTextColor={Colors.textMuted}
                          value={productSellingPrice}
                          onChangeText={setProductSellingPrice}
                        />
                      </Field>
                    </View>
                    <Field label="Compatible vehicle">
                      <TextInput
                        style={styles.input}
                        placeholder="e.g. Toyota Corolla 2015-2020"
                        placeholderTextColor={Colors.textMuted}
                        value={productVehicleType}
                        onChangeText={setProductVehicleType}
                      />
                    </Field>

                    <Field label="Attach to service (optional)">
                      <View style={styles.chipRow}>
                        <TouchableOpacity
                          style={[
                            styles.chip,
                            !productServiceId && styles.chipActive,
                          ]}
                          onPress={() => setProductServiceId(null)}
                        >
                          <Text
                            style={[
                              styles.chipText,
                              !productServiceId && styles.chipTextActive,
                            ]}
                          >
                            None
                          </Text>
                        </TouchableOpacity>
                        {services.map((s) => {
                          const active = productServiceId === s.id;
                          return (
                            <TouchableOpacity
                              key={s.id}
                              style={[styles.chip, active && styles.chipActive]}
                              onPress={() => setProductServiceId(s.id)}
                            >
                              <Text
                                style={[
                                  styles.chipText,
                                  active && styles.chipTextActive,
                                ]}
                              >
                                {s.name}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </Field>
                  </View>
                )}

                {error && <Text style={styles.errorText}>{error}</Text>}
              </ScrollView>

              <TouchableOpacity
                style={[styles.submitButton, submitting && { opacity: 0.7 }]}
                onPress={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color={Colors.black} />
                ) : (
                  <Text style={styles.submitText}>Create Item</Text>
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {unitPickerVisible && (
        <Modal
          visible={unitPickerVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setUnitPickerVisible(false)}
        >
          <TouchableOpacity
            style={styles.pickerOverlay}
            activeOpacity={1}
            onPress={() => setUnitPickerVisible(false)}
          >
            <View style={styles.pickerCard}>
              {UNIT_OPTIONS.map((opt) => {
                const selected = unit === opt;
                return (
                  <TouchableOpacity
                    key={opt}
                    style={styles.pickerOption}
                    onPress={() => {
                      setUnit(opt);
                      setUnitPickerVisible(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.pickerOptionText,
                        selected && { color: Colors.primary },
                      ]}
                    >
                      {opt}
                    </Text>
                    {selected && (
                      <Ionicons
                        name="checkmark"
                        size={18}
                        color={Colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </>
  );
}

function Field({
  label,
  children,
  style,
}: {
  label: string;
  children: React.ReactNode;
  style?: any;
}) {
  return (
    <View style={[{ gap: 6 }, style]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

function SegmentButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.segmentButton, active && styles.segmentButtonActive]}
      onPress={onPress}
    >
      <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  dropdownTrigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dropdownValueText: {
    color: Colors.textPrimary,
    fontFamily: Fonts.body,
    fontSize: 19,
    textTransform: "capitalize",
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  pickerCard: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 8,
    gap: 2,
  },
  pickerOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
  },
  pickerOptionText: {
    color: Colors.textPrimary,
    fontFamily: Fonts.body,
    fontSize: 17,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  sheetWrap: { width: "100%" },
  sheet: {
    maxHeight: "88%",
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: 20,
    gap: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: { color: Colors.textPrimary, fontFamily: Fonts.bold, fontSize: 26 },
  fieldLabel: {
    color: Colors.textMuted,
    fontFamily: Fonts.semibold,
    fontSize: 19,
  },
  input: {
    minHeight: 46,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    color: Colors.textPrimary,
    paddingHorizontal: 12,
    fontFamily: Fonts.body,
    fontSize: 21,
  },
  row: { flexDirection: "row", gap: 10 },
  sectionLabel: {
    color: Colors.textPrimary,
    fontFamily: Fonts.semibold,
    fontSize: 21,
  },
  segmentRow: { flexDirection: "row", gap: 8 },
  segmentButton: {
    flex: 1,
    minHeight: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentButtonActive: {
    borderColor: Colors.primary,
    backgroundColor: "rgba(0,212,170,0.12)",
  },
  segmentText: {
    color: Colors.textMuted,
    fontFamily: Fonts.semibold,
    fontSize: 19,
  },
  segmentTextActive: { color: Colors.primary },
  productList: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    maxHeight: 220,
    overflow: "hidden",
  },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 10,
  },
  productRowActive: { backgroundColor: "rgba(0,212,170,0.08)" },
  productName: {
    color: Colors.textPrimary,
    fontFamily: Fonts.semibold,
    fontSize: 20,
  },
  productMeta: {
    color: Colors.textMuted,
    fontFamily: Fonts.body,
    fontSize: 18,
    marginTop: 2,
  },
  emptyText: {
    color: Colors.textMuted,
    fontFamily: Fonts.body,
    fontSize: 19,
    padding: 14,
    textAlign: "center",
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    minHeight: 34,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  chipActive: {
    borderColor: Colors.primary,
    backgroundColor: "rgba(0,212,170,0.12)",
  },
  chipText: {
    color: Colors.textMuted,
    fontFamily: Fonts.semibold,
    fontSize: 18,
  },
  chipTextActive: { color: Colors.primary },
  errorText: {
    color: Colors.warning,
    fontFamily: Fonts.body,
    fontSize: 19,
  },
  submitButton: {
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  submitText: { color: Colors.black, fontFamily: Fonts.bold, fontSize: 23 },
});
