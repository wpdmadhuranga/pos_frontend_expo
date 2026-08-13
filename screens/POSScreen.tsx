import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { AppHeader } from "../components/AppHeader";
import { CartBar } from "../components/CartBar";
import { ServiceProductSheet } from "../components/ServiceProductSheet";
import { Colors } from "../constants/colors";
import { Fonts } from "../constants/typography";
import { useCart } from "../context/CartContext";
import { CatalogItem, CatalogProduct } from "../data/types/Catalog";
import { useCatalog } from "../hooks/usecatalog/Usecatalog";

const categoryColors: Record<string, string> = {
  "Body Wash": "#10b981",
  "Full Service": "#3b82f6",
  "under vehicle wash": "#ef4444",
  "Air Filter": "#f59e0b",
  "Oil Filters": "#8b5cf6",
  "Oil Refilling": "#00d4aa",
  "grease filling": "#ff6b35",
  "Vacuum Cleaning": "#06b6d4",
};

const FALLBACK_COLOR = Colors.primary;

export function POSScreen() {
  const { items: catalog, loading, error, refresh } = useCatalog();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [activeItem, setActiveItem] = useState<CatalogItem | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<CatalogProduct | null>(
    null,
  );
  const [qty, setQty] = useState(1);
  const [cartOpen, setCartOpen] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const { addItem, items, subtotal, tax, total, updateQuantity, clearCart } =
    useCart();

  const categories = useMemo(
    () => ["All", ...new Set(catalog.map((item) => item.category.name))],
    [catalog],
  );

  const filteredCatalog = useMemo(
    () =>
      catalog
        .filter((item) =>
          category === "All" ? true : item.category.name === category,
        )
        .filter((item) =>
          `${item.name} ${item.category.name}`
            .toLowerCase()
            .includes(query.toLowerCase()),
        )
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [catalog, category, query],
  );

  // pricingType "1" -> direct-add cards (grid). pricingType "0" -> opens the product picker (list).
  const directItems = filteredCatalog.filter(
    (item) => item.pricingType === "1",
  );
  const pickerItems = filteredCatalog.filter(
    (item) => item.pricingType === "0",
  );

  const openPicker = (item: CatalogItem) => {
    setActiveItem(item);
    setSelectedProduct(item.products[0] ?? null);
    setQty(1);
  };

  const handleCardPress = (item: CatalogItem) => {
    const hasProducts = item.products && item.products.length > 0;

    if (hasProducts) {
      setActiveItem(item);
      return;
    }

    addItem({
      id: `item-${item.id}`,
      name: item.name,
      price: item.defaultPrice,
      kind: "service",
    });
  };

  const pickerTotal = useMemo(
    () => (selectedProduct ? selectedProduct.sellingPrice * qty : 0),
    [selectedProduct, qty],
  );

  // const confirmPicker = () => {
  //   if (!activeItem || !selectedProduct) return;
  //   addItem({
  //     id: `product-${selectedProduct.id}`,
  //     name: `${activeItem.name} — ${selectedProduct.brand} ${selectedProduct.name}`,
  //     price: selectedProduct.sellingPrice,
  //     kind: "part",
  //   });
  //   if (qty > 1) {
  //     updateQuantity(`product-${selectedProduct.id}`, qty - 1);
  //   }
  //   setActiveItem(null);
  // };

  if (loading) {
    return (
      <View style={[styles.screen, styles.centered]}>
        <AppHeader title="POS" />
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.screen, styles.centered]}>
        <AppHeader title="POS" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.confirmButton} onPress={refresh}>
          <Text style={styles.confirmButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <AppHeader title="POS" />

      <FlatList
        data={directItems}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.headerWrap}>
            <View style={styles.searchRow}>
              <View style={styles.searchBar}>
                <Ionicons
                  name="search-outline"
                  size={18}
                  color={Colors.textMuted}
                />
                <TextInput
                  placeholder="Search customer or service"
                  placeholderTextColor={Colors.textMuted}
                  value={query}
                  onChangeText={setQuery}
                  style={styles.searchInput}
                />
              </View>
              <TouchableOpacity style={styles.newJobButton}>
                <Text style={styles.newJobText}>New Job</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={categories}
              horizontal
              keyExtractor={(item) => item}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryRow}
              renderItem={({ item }) => {
                const active = category === item;
                const dotColor = categoryColors[item] ?? FALLBACK_COLOR;
                return (
                  <TouchableOpacity
                    style={[
                      styles.categoryPill,
                      active && styles.categoryPillActive,
                      { borderColor: active ? dotColor : Colors.border },
                    ]}
                    onPress={() => setCategory(item)}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        active && styles.categoryTextActive,
                      ]}
                    >
                      {item}
                    </Text>
                    <View
                      style={[
                        styles.categoryDot,
                        { backgroundColor: active ? Colors.black : dotColor },
                      ]}
                    />
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.88}
            style={styles.serviceCard}
            onPress={() => handleCardPress(item)}
          >
            <View style={styles.serviceTop}>
              <View
                style={[
                  styles.iconBox,
                  {
                    backgroundColor: `${categoryColors[item.category.name] ?? FALLBACK_COLOR}22`,
                  },
                ]}
              >
                <Ionicons
                  name="construct-outline"
                  size={18}
                  color={categoryColors[item.category.name] ?? FALLBACK_COLOR}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.serviceName}>{item.name}</Text>
                <Text style={styles.serviceDuration}>{item.unit}</Text>
              </View>
            </View>
            <View style={styles.serviceBottom}>
              <Text style={styles.servicePrice}>
                ${item.defaultPrice.toFixed(2)}
              </Text>
              <View style={styles.addPill}>
                <Text style={styles.addPillText}>Add</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListFooterComponent={
          <View style={{ gap: 12, paddingBottom: 120 }}>
            <Text style={styles.sectionTitle}>Parts &amp; Products</Text>
            <FlatList
              data={pickerItems}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.partRow}
                  onPress={() => openPicker(item)}
                  activeOpacity={0.86}
                >
                  <View style={styles.partIcon}>
                    <Ionicons
                      name="cube-outline"
                      size={18}
                      color={Colors.primary}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.partName}>{item.name}</Text>
                    <Text style={styles.partMeta}>
                      {item.products.length} option
                      {item.products.length === 1 ? "" : "s"} ·{" "}
                      {item.category.name}
                    </Text>
                  </View>
                  <View style={styles.partRight}>
                    <Text style={styles.partPrice}>
                      from $
                      {Math.min(
                        ...item.products.map(
                          (p: CatalogProduct) => p.sellingPrice,
                        ),
                        item.defaultPrice,
                      ).toFixed(2)}
                    </Text>
                    <View style={styles.selectBadge}>
                      <Text style={styles.selectBadgeText}>SELECT</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        }
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        showsVerticalScrollIndicator={false}
      />

      <CartBar onPress={() => setCartOpen(true)} />

      {/* Generic product picker — replaces the oil-only configurator */}
      <ServiceProductSheet
        item={activeItem}
        onClose={() => setActiveItem(null)}
        onAdd={(selectedProduct, quantity, customPrice) => {
          if (!activeItem) return;

          if (selectedProduct) {
            addItem({
              id: `product-${selectedProduct.id}`,
              name: `${activeItem.name} — ${selectedProduct.brand} ${selectedProduct.name}`,
              price: selectedProduct.sellingPrice,
              kind: "part",
            });

            if (quantity > 1) {
              updateQuantity(`product-${selectedProduct.id}`, quantity - 1);
            }
          } else {
            addItem({
              id: `item-${activeItem.id}`,
              name: activeItem.name,
              price: activeItem.defaultPrice,
              kind: "service",
            });

            if (quantity > 1) {
              updateQuantity(`item-${activeItem.id}`, quantity - 1);
            }
          }

          setActiveItem(null);
        }}
      />

      <Modal
        visible={successVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSuccessVisible(false)}
      >
        <View style={styles.successOverlay}>
          <View style={styles.successCard}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark" size={28} color={Colors.black} />
            </View>
            <Text style={styles.successTitle}>Payment completed</Text>
            <Text style={styles.successText}>
              Invoice has been charged and posted to service history.
            </Text>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={() => setSuccessVisible(false)}
            >
              <Text style={styles.confirmButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  centered: { alignItems: "center", justifyContent: "center", gap: 16 },
  errorText: {
    color: Colors.textMuted,
    fontFamily: Fonts.body,
    textAlign: "center",
    paddingHorizontal: 24,
  },
  listContent: { paddingHorizontal: 16, paddingBottom: 0 },
  headerWrap: { gap: 14, paddingBottom: 10 },
  searchRow: { flexDirection: "row", gap: 10, alignItems: "center" },
  searchBar: {
    flex: 1,
    minHeight: 48,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
  },
  searchInput: { flex: 1, color: Colors.textPrimary, fontFamily: Fonts.body },
  newJobButton: {
    minHeight: 48,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  newJobText: { color: Colors.black, fontFamily: Fonts.bold },
  categoryRow: { gap: 10, paddingVertical: 2 },
  categoryPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minHeight: 38,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: Colors.surface,
  },
  categoryPillActive: { backgroundColor: "rgba(0,212,170,0.12)" },
  categoryText: {
    color: Colors.textMuted,
    fontFamily: Fonts.semibold,
    fontSize: 12,
  },
  categoryTextActive: { color: Colors.primary },
  categoryDot: { width: 7, height: 7, borderRadius: 999 },
  columnWrapper: { gap: 12 },
  serviceCard: {
    flex: 1,
    minHeight: 142,
    borderRadius: 22,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    justifyContent: "space-between",
  },
  serviceTop: { gap: 10 },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  serviceName: {
    color: Colors.textPrimary,
    fontFamily: Fonts.semibold,
    fontSize: 14,
  },
  serviceDuration: {
    color: Colors.textMuted,
    fontFamily: Fonts.body,
    fontSize: 12,
    marginTop: 3,
  },
  serviceBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  servicePrice: {
    color: Colors.textPrimary,
    fontFamily: Fonts.monoBold,
    fontSize: 16,
  },
  addPill: {
    minHeight: 28,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  addPillText: {
    color: Colors.textPrimary,
    fontFamily: Fonts.semibold,
    fontSize: 11,
  },
  sectionTitle: {
    color: Colors.textPrimary,
    fontFamily: Fonts.semibold,
    fontSize: 16,
    marginBottom: 2,
  },
  partRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  partIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "rgba(0,212,170,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  partName: {
    color: Colors.textPrimary,
    fontFamily: Fonts.semibold,
    fontSize: 14,
  },
  partMeta: {
    color: Colors.textMuted,
    fontFamily: Fonts.body,
    fontSize: 12,
    marginTop: 2,
  },
  partRight: { alignItems: "flex-end", gap: 6 },
  partPrice: {
    color: Colors.textPrimary,
    fontFamily: Fonts.monoBold,
    fontSize: 15,
  },
  selectBadge: {
    minHeight: 26,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,107,53,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  selectBadgeText: {
    color: Colors.warning,
    fontFamily: Fonts.bold,
    fontSize: 10,
  },
  sheetBlock: { gap: 14 },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 18,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  brandRowActive: {
    borderColor: Colors.primary,
    backgroundColor: "rgba(0,212,170,0.08)",
  },
  brandName: {
    color: Colors.textPrimary,
    fontFamily: Fonts.semibold,
    fontSize: 14,
  },
  brandMeta: {
    color: Colors.textMuted,
    fontFamily: Fonts.body,
    fontSize: 12,
    marginTop: 3,
  },
  summaryCard: {
    borderRadius: 18,
    padding: 14,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  summaryLabel: {
    color: Colors.textMuted,
    fontFamily: Fonts.medium,
    fontSize: 12,
  },
  summaryValue: {
    color: Colors.primary,
    fontFamily: Fonts.monoBold,
    fontSize: 24,
  },
  confirmButton: {
    minHeight: 50,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmButtonText: {
    color: Colors.black,
    fontFamily: Fonts.bold,
    fontSize: 14,
  },
  cartRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 18,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cartName: {
    color: Colors.textPrimary,
    fontFamily: Fonts.semibold,
    fontSize: 14,
  },
  cartMeta: {
    color: Colors.textMuted,
    fontFamily: Fonts.body,
    fontSize: 12,
    marginTop: 2,
  },
  qtyRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  qtyButton: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyButtonText: {
    color: Colors.textPrimary,
    fontFamily: Fonts.bold,
    fontSize: 18,
  },
  qtyValue: {
    minWidth: 18,
    textAlign: "center",
    color: Colors.textPrimary,
    fontFamily: Fonts.monoBold,
  },
  cartPrice: {
    color: Colors.textPrimary,
    fontFamily: Fonts.monoBold,
    fontSize: 14,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  summaryValueSmall: {
    color: Colors.textPrimary,
    fontFamily: Fonts.monoBold,
    fontSize: 16,
  },
  paymentRow: { flexDirection: "row", gap: 10 },
  paymentChip: {
    flex: 1,
    minHeight: 44,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  paymentChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  paymentChipText: {
    color: Colors.textMuted,
    fontFamily: Fonts.semibold,
    fontSize: 12,
  },
  paymentChipTextActive: { color: Colors.black },
  successOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.72)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  successCard: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 24,
    padding: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    gap: 10,
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  successTitle: {
    color: Colors.textPrimary,
    fontFamily: Fonts.bold,
    fontSize: 18,
  },
  successText: {
    color: Colors.textMuted,
    textAlign: "center",
    fontFamily: Fonts.body,
    fontSize: 13,
  },
});
