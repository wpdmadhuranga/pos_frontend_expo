import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { AppHeader } from "../components/AppHeader";
import { BottomSheet } from "../components/BottomSheet";
import { CartBar } from "../components/CartBar";
import { Colors } from "../constants/colors";
import { Fonts } from "../constants/typography";
import { FILTER_MODELS, mockParts, mockServices, OIL_BRANDS, OIL_QUANTITIES, OIL_VISCOSITIES } from "../data/mock";
import { useCart } from "../context/CartContext";
import { StatusBadge } from "../components/StatusBadge";

const categoryColors: Record<string, string> = {
  Maintenance: "#10b981",
  Tires: "#3b82f6",
  Brakes: "#ef4444",
  AC: "#06b6d4",
  Electrical: "#f59e0b",
  Diagnostic: "#8b5cf6",
  Package: "#00d4aa",
  Parts: "#ff6b35",
};

export function POSScreen() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [configuringOil, setConfiguringOil] = useState(false);
  const [filterPickerOpen, setFilterPickerOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(OIL_BRANDS[0]);
  const [selectedViscosity, setSelectedViscosity] = useState(OIL_VISCOSITIES[1]);
  const [selectedQty, setSelectedQty] = useState(4);
  const [includeFilter, setIncludeFilter] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState(FILTER_MODELS[0]);
  const { addItem, items, subtotal, tax, total, updateQuantity, clearCart } = useCart();

  const categories = ["All", ...new Set(mockServices.map((item) => item.category))];
  const services = useMemo(() => mockServices.filter((item) => (category === "All" ? true : item.category === category) && `${item.name} ${item.category}`.toLowerCase().includes(query.toLowerCase())), [category, query]);
  const parts = useMemo(() => mockParts.filter((item) => `${item.name} ${item.sku}`.toLowerCase().includes(query.toLowerCase())), [query]);

  const openOilConfigurator = () => setConfiguringOil(true);

  const addService = (item: (typeof mockServices)[number]) => {
    addItem({ id: `service-${item.id}`, name: item.name, price: item.price, kind: "service" });
  };

  const addPart = (item: (typeof mockParts)[number]) => {
    if (item.configurable) {
      openOilConfigurator();
      return;
    }
    addItem({ id: `part-${item.id}`, name: item.name, price: item.price, kind: "part" });
  };

  const oilPrice = useMemo(() => {
    const filterPrice = includeFilter ? (selectedFilter?.price ?? 0) : 0;
    return selectedBrand.pricePerL * selectedQty + filterPrice;
  }, [includeFilter, selectedBrand, selectedFilter, selectedQty]);

  return (
    <View style={styles.screen}>
      <AppHeader title="POS" />

      <FlatList
        data={services}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.headerWrap}>
            <View style={styles.searchRow}>
              <View style={styles.searchBar}>
                <Ionicons name="search-outline" size={18} color={Colors.textMuted} />
                <TextInput placeholder="Search customer or service" placeholderTextColor={Colors.textMuted} value={query} onChangeText={setQuery} style={styles.searchInput} />
              </View>
              <TouchableOpacity style={styles.newJobButton}><Text style={styles.newJobText}>New Job</Text></TouchableOpacity>
            </View>

            <FlatList
              data={categories}
              horizontal
              keyExtractor={(item) => item}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryRow}
              renderItem={({ item, index }) => {
                const active = category === item;
                return (
                  <TouchableOpacity style={[styles.categoryPill, active && styles.categoryPillActive, { borderColor: active ? categoryColors[item] ?? Colors.primary : Colors.border }]} onPress={() => setCategory(item)}>
                    <Text style={[styles.categoryText, active && styles.categoryTextActive]}>{item}</Text>
                    <View style={[styles.categoryDot, { backgroundColor: active ? Colors.black : categoryColors[item] ?? Colors.primary }]} />
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity activeOpacity={0.88} style={styles.serviceCard} onPress={() => (item.configurable === "oil" ? openOilConfigurator() : addService(item))}>
            <View style={styles.serviceTop}>
              <View style={[styles.iconBox, { backgroundColor: `${categoryColors[item.category] ?? Colors.primary}22` }]}>
                <Ionicons name={item.category === "Brakes" ? "disc-outline" : item.category === "Tires" ? "car-sport-outline" : item.category === "AC" ? "snow-outline" : "construct-outline"} size={18} color={categoryColors[item.category] ?? Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.serviceName}>{item.name}</Text>
                <Text style={styles.serviceDuration}>{item.duration}</Text>
              </View>
            </View>
            <View style={styles.serviceBottom}>
              <Text style={styles.servicePrice}>${item.price.toFixed(2)}</Text>
              {item.configurable === "oil" ? <StatusBadge label="CONFIGURE" tone="amber" /> : <View style={styles.addPill}><Text style={styles.addPillText}>Add</Text></View>}
            </View>
          </TouchableOpacity>
        )}
        ListFooterComponent={
          <View style={{ gap: 12, paddingBottom: 120 }}>
            <Text style={styles.sectionTitle}>Parts</Text>
            <FlatList
              data={parts}
              keyExtractor={(item) => String(item.id)}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.partRow} onPress={() => addPart(item)} activeOpacity={0.86}>
                  <View style={styles.partIcon}><Ionicons name="cube-outline" size={18} color={Colors.primary} /></View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.partName}>{item.name}</Text>
                    <Text style={styles.partMeta}>{item.sku} · Stock {item.stock}</Text>
                  </View>
                  <View style={styles.partRight}>
                    <Text style={styles.partPrice}>${item.price.toFixed(2)}</Text>
                    {item.configurable ? <View style={styles.selectBadge}><Text style={styles.selectBadgeText}>SELECT</Text></View> : null}
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

      <BottomSheet visible={configuringOil} onClose={() => setConfiguringOil(false)} title="Oil Configurator" snapPoints={["86%"]}>
        <View style={styles.sheetBlock}>
          <Text style={styles.sectionTitle}>Oil Brand</Text>
          {OIL_BRANDS.map((brand) => {
            const active = selectedBrand.id === brand.id;
            return (
              <TouchableOpacity key={brand.id} style={[styles.brandRow, active && styles.brandRowActive]} onPress={() => setSelectedBrand(brand)}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.brandName}>{brand.name}</Text>
                  <Text style={styles.brandMeta}>${brand.pricePerL}/L Premium</Text>
                </View>
                <StatusBadge label={brand.tier.toUpperCase()} tone={brand.tier === "premium" ? "amber" : brand.tier === "mid" ? "blue" : "green"} />
              </TouchableOpacity>
            );
          })}

          <Text style={styles.sectionTitle}>Viscosity</Text>
          <FlatList
            data={OIL_VISCOSITIES}
            horizontal
            keyExtractor={(item) => item}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}
            renderItem={({ item }) => {
              const active = selectedViscosity === item;
              return (
                <TouchableOpacity style={[styles.chip, active && styles.chipActive]} onPress={() => setSelectedViscosity(item)}>
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{item}</Text>
                </TouchableOpacity>
              );
            }}
          />

          <Text style={styles.sectionTitle}>Quantity</Text>
          <FlatList
            data={OIL_QUANTITIES}
            horizontal
            keyExtractor={(item) => String(item)}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}
            renderItem={({ item }) => {
              const active = selectedQty === item;
              return (
                <TouchableOpacity style={[styles.chip, active && styles.chipActive]} onPress={() => setSelectedQty(item)}>
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{item}L</Text>
                </TouchableOpacity>
              );
            }}
          />

          <TouchableOpacity style={styles.switchRow} onPress={() => setIncludeFilter((value) => !value)}>
            <View style={[styles.switchTrack, includeFilter && styles.switchTrackActive]}>
              <View style={[styles.switchThumb, includeFilter && styles.switchThumbActive]} />
            </View>
            <Text style={styles.switchLabel}>Include Oil Filter?</Text>
          </TouchableOpacity>

          {includeFilter ? (
            <TouchableOpacity style={styles.selectFilterButton} onPress={() => setFilterPickerOpen(true)}>
              <Text style={styles.selectFilterButtonText}>Select filter model</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
            </TouchableOpacity>
          ) : null}

          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Estimated Price</Text>
            <Text style={styles.summaryValue}>${oilPrice.toFixed(2)}</Text>
          </View>

          <TouchableOpacity
            style={styles.confirmButton}
            onPress={() => {
              addItem({ id: `oil-${Date.now()}`, name: `${selectedBrand.name} ${selectedViscosity}${includeFilter ? ` + ${selectedFilter.model}` : ""}`, price: oilPrice, kind: "service" });
              setConfiguringOil(false);
            }}
          >
            <Text style={styles.confirmButtonText}>Add to Cart — ${oilPrice.toFixed(2)}</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>

      <BottomSheet visible={filterPickerOpen} onClose={() => setFilterPickerOpen(false)} title="Filter Model Picker" snapPoints={["82%"]}>
        <View style={styles.sheetBlock}>
          <FlatList
            data={["All", "FRAM", "Bosch", "WIX", "Mann", "Purolator", "K&N", "ACDelco", "OEM"]}
            horizontal
            keyExtractor={(item) => item}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.chip}><Text style={styles.chipText}>{item}</Text></TouchableOpacity>
            )}
          />

          <FlatList
            data={FILTER_MODELS}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            renderItem={({ item }) => (
              <TouchableOpacity style={[styles.filterRow, selectedFilter.id === item.id && styles.filterRowActive]} onPress={() => { setSelectedFilter(item); setFilterPickerOpen(false); }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.filterTitle}>{item.brand} <Text style={styles.filterCode}>{item.model}</Text></Text>
                  <Text style={styles.filterMeta}>{item.compatible}</Text>
                </View>
                <Text style={styles.filterPrice}>${item.price.toFixed(2)}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </BottomSheet>

      <BottomSheet visible={cartOpen} onClose={() => setCartOpen(false)} title="Cart" snapPoints={["72%"]}>
        <View style={styles.sheetBlock}>
          {items.map((item) => (
            <View key={item.id} style={styles.cartRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cartName}>{item.name}</Text>
                <Text style={styles.cartMeta}>{item.kind}</Text>
              </View>
              <View style={styles.qtyRow}>
                <TouchableOpacity style={styles.qtyButton} onPress={() => updateQuantity(item.id, -1)}><Text style={styles.qtyButtonText}>-</Text></TouchableOpacity>
                <Text style={styles.qtyValue}>{item.qty}</Text>
                <TouchableOpacity style={styles.qtyButton} onPress={() => updateQuantity(item.id, 1)}><Text style={styles.qtyButtonText}>+</Text></TouchableOpacity>
              </View>
              <Text style={styles.cartPrice}>${(item.price * item.qty).toFixed(2)}</Text>
            </View>
          ))}
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Subtotal</Text><Text style={styles.summaryValueSmall}>${subtotal.toFixed(2)}</Text></View>
            <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Tax 8%</Text><Text style={styles.summaryValueSmall}>${tax.toFixed(2)}</Text></View>
            <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Total</Text><Text style={styles.summaryValueSmall}>${total.toFixed(2)}</Text></View>
          </View>
          <View style={styles.paymentRow}>
            {(["Card", "Cash", "Transfer"] as const).map((method, index) => (
              <TouchableOpacity key={method} style={[styles.paymentChip, index === 0 && styles.paymentChipActive]}><Text style={[styles.paymentChipText, index === 0 && styles.paymentChipTextActive]}>{method}</Text></TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.confirmButton} onPress={() => { setCartOpen(false); setSuccessVisible(true); clearCart(); }}>
            <Text style={styles.confirmButtonText}>Charge ${total.toFixed(2)}</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>

      <Modal visible={successVisible} transparent animationType="fade" onRequestClose={() => setSuccessVisible(false)}>
        <View style={styles.successOverlay}>
          <View style={styles.successCard}>
            <View style={styles.successIcon}><Ionicons name="checkmark" size={28} color={Colors.black} /></View>
            <Text style={styles.successTitle}>Payment completed</Text>
            <Text style={styles.successText}>Invoice has been charged and posted to service history.</Text>
            <TouchableOpacity style={styles.confirmButton} onPress={() => setSuccessVisible(false)}>
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
  listContent: { paddingHorizontal: 16, paddingBottom: 0 },
  headerWrap: { gap: 14, paddingBottom: 10 },
  searchRow: { flexDirection: "row", gap: 10, alignItems: "center" },
  searchBar: { flex: 1, minHeight: 48, borderRadius: 18, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14 },
  searchInput: { flex: 1, color: Colors.textPrimary, fontFamily: Fonts.body },
  newJobButton: { minHeight: 48, paddingHorizontal: 14, borderRadius: 18, backgroundColor: Colors.primary, alignItems: "center", justifyContent: "center" },
  newJobText: { color: Colors.black, fontFamily: Fonts.bold },
  categoryRow: { gap: 10, paddingVertical: 2 },
  categoryPill: { flexDirection: "row", alignItems: "center", gap: 8, minHeight: 38, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1, backgroundColor: Colors.surface },
  categoryPillActive: { backgroundColor: "rgba(0,212,170,0.12)" },
  categoryText: { color: Colors.textMuted, fontFamily: Fonts.semibold, fontSize: 12 },
  categoryTextActive: { color: Colors.primary },
  categoryDot: { width: 7, height: 7, borderRadius: 999 },
  columnWrapper: { gap: 12 },
  serviceCard: { flex: 1, minHeight: 142, borderRadius: 22, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, padding: 14, justifyContent: "space-between" },
  serviceTop: { gap: 10 },
  iconBox: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  serviceName: { color: Colors.textPrimary, fontFamily: Fonts.semibold, fontSize: 14 },
  serviceDuration: { color: Colors.textMuted, fontFamily: Fonts.body, fontSize: 12, marginTop: 3 },
  serviceBottom: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  servicePrice: { color: Colors.textPrimary, fontFamily: Fonts.monoBold, fontSize: 16 },
  addPill: { minHeight: 28, paddingHorizontal: 10, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.05)", alignItems: "center", justifyContent: "center" },
  addPillText: { color: Colors.textPrimary, fontFamily: Fonts.semibold, fontSize: 11 },
  sectionTitle: { color: Colors.textPrimary, fontFamily: Fonts.semibold, fontSize: 16, marginBottom: 2 },
  partRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 20, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.card },
  partIcon: { width: 40, height: 40, borderRadius: 14, backgroundColor: "rgba(0,212,170,0.12)", alignItems: "center", justifyContent: "center" },
  partName: { color: Colors.textPrimary, fontFamily: Fonts.semibold, fontSize: 14 },
  partMeta: { color: Colors.textMuted, fontFamily: Fonts.body, fontSize: 12, marginTop: 2 },
  partRight: { alignItems: "flex-end", gap: 6 },
  partPrice: { color: Colors.textPrimary, fontFamily: Fonts.monoBold, fontSize: 15 },
  selectBadge: { minHeight: 26, paddingHorizontal: 10, borderRadius: 999, backgroundColor: "rgba(255,107,53,0.12)", alignItems: "center", justifyContent: "center" },
  selectBadgeText: { color: Colors.warning, fontFamily: Fonts.bold, fontSize: 10 },
  sheetBlock: { gap: 14 },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 18, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border },
  brandRowActive: { borderColor: Colors.primary, backgroundColor: "rgba(0,212,170,0.08)" },
  brandName: { color: Colors.textPrimary, fontFamily: Fonts.semibold, fontSize: 14 },
  brandMeta: { color: Colors.textMuted, fontFamily: Fonts.body, fontSize: 12, marginTop: 3 },
  chipRow: { gap: 10 },
  chip: { minHeight: 38, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface, alignItems: "center", justifyContent: "center" },
  chipActive: { borderColor: Colors.primary, backgroundColor: "rgba(0,212,170,0.12)" },
  chipText: { color: Colors.textMuted, fontFamily: Fonts.semibold, fontSize: 12 },
  chipTextActive: { color: Colors.primary },
  switchRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  switchTrack: { width: 50, height: 30, borderRadius: 999, padding: 3, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, justifyContent: "center" },
  switchTrackActive: { backgroundColor: "rgba(0,212,170,0.14)", borderColor: "rgba(0,212,170,0.22)" },
  switchThumb: { width: 22, height: 22, borderRadius: 999, backgroundColor: Colors.textMuted },
  switchThumbActive: { backgroundColor: Colors.primary, alignSelf: "flex-end" },
  switchLabel: { color: Colors.textPrimary, fontFamily: Fonts.semibold, fontSize: 13 },
  selectFilterButton: { minHeight: 46, borderRadius: 16, paddingHorizontal: 14, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  selectFilterButtonText: { color: Colors.primary, fontFamily: Fonts.semibold },
  summaryCard: { borderRadius: 18, padding: 14, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, gap: 6 },
  summaryLabel: { color: Colors.textMuted, fontFamily: Fonts.medium, fontSize: 12 },
  summaryValue: { color: Colors.primary, fontFamily: Fonts.monoBold, fontSize: 24 },
  confirmButton: { minHeight: 50, borderRadius: 18, backgroundColor: Colors.primary, alignItems: "center", justifyContent: "center" },
  confirmButtonText: { color: Colors.black, fontFamily: Fonts.bold, fontSize: 14 },
  filterRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 18, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border },
  filterRowActive: { borderColor: Colors.primary, backgroundColor: "rgba(0,212,170,0.08)" },
  filterTitle: { color: Colors.textPrimary, fontFamily: Fonts.semibold, fontSize: 14 },
  filterCode: { color: Colors.warning },
  filterMeta: { color: Colors.textMuted, fontFamily: Fonts.body, fontSize: 12, marginTop: 3 },
  filterPrice: { color: Colors.textPrimary, fontFamily: Fonts.monoBold, fontSize: 14 },
  cartRow: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 18, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border },
  cartName: { color: Colors.textPrimary, fontFamily: Fonts.semibold, fontSize: 14 },
  cartMeta: { color: Colors.textMuted, fontFamily: Fonts.body, fontSize: 12, marginTop: 2 },
  qtyRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  qtyButton: { width: 34, height: 34, borderRadius: 12, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, alignItems: "center", justifyContent: "center" },
  qtyButtonText: { color: Colors.textPrimary, fontFamily: Fonts.bold, fontSize: 18 },
  qtyValue: { minWidth: 18, textAlign: "center", color: Colors.textPrimary, fontFamily: Fonts.monoBold },
  cartPrice: { color: Colors.textPrimary, fontFamily: Fonts.monoBold, fontSize: 14 },
  summaryRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  summaryValueSmall: { color: Colors.textPrimary, fontFamily: Fonts.monoBold, fontSize: 16 },
  paymentRow: { flexDirection: "row", gap: 10 },
  paymentChip: { flex: 1, minHeight: 44, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface, alignItems: "center", justifyContent: "center" },
  paymentChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  paymentChipText: { color: Colors.textMuted, fontFamily: Fonts.semibold, fontSize: 12 },
  paymentChipTextActive: { color: Colors.black },
  successOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.72)", alignItems: "center", justifyContent: "center", padding: 24 },
  successCard: { width: "100%", maxWidth: 340, borderRadius: 24, padding: 20, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, alignItems: "center", gap: 10 },
  successIcon: { width: 64, height: 64, borderRadius: 22, backgroundColor: Colors.primary, alignItems: "center", justifyContent: "center" },
  successTitle: { color: Colors.textPrimary, fontFamily: Fonts.bold, fontSize: 18 },
  successText: { color: Colors.textMuted, textAlign: "center", fontFamily: Fonts.body, fontSize: 13 },
});
