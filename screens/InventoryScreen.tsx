import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { AppHeader } from "../components/AppHeader";
import { BottomSheet } from "../components/BottomSheet";
import { Colors, AccentColors } from "../constants/colors";
import { Fonts } from "../constants/typography";
import { mockParts } from "../data/mock";
import { StockBar } from "../components/StockBar";

const categories = ["All", "Fluids", "Filters", "Brakes", "AC", "Ignition", "Electrical", "Exterior"];

export function InventoryScreen() {
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState<"All" | "Low Stock" | "Out">("All");
  const [category, setCategory] = useState<string>("All");
  const [sheetMode, setSheetMode] = useState<"stock" | "price" | "add" | null>(null);
  const [activePart, setActivePart] = useState(mockParts[0]);
  const [stockAdjust, setStockAdjust] = useState(5);
  const [priceValue, setPriceValue] = useState(String(mockParts[0].price));

  const filtered = useMemo(() => {
    return mockParts.filter((part) => {
      const query = `${part.name} ${part.sku}`.toLowerCase();
      const matchesSearch = query.includes(search.toLowerCase());
      const matchesCategory = category === "All" || part.category === category;
      const low = part.stock <= 0 ? "Out" : part.stock <= part.minStock ? "Low Stock" : "All";
      const matchesStock = stockFilter === "All" || stockFilter === low;
      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [search, stockFilter, category]);

  const openSheet = (mode: "stock" | "price" | "add", part = mockParts[0]) => {
    setActivePart(part);
    setSheetMode(mode);
    setPriceValue(String(part.price));
    setStockAdjust(5);
  };

  return (
    <View style={styles.screen}>
      <AppHeader title="Inventory" />

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.searchBar}>
              <Ionicons name="search-outline" size={18} color={Colors.textMuted} />
              <TextInput
                placeholder="Search SKU or name"
                placeholderTextColor={Colors.textMuted}
                value={search}
                onChangeText={setSearch}
                style={styles.searchInput}
              />
            </View>

            <View style={styles.stockRow}>
              {(["All", "Low Stock", "Out"] as const).map((item) => (
                <TouchableOpacity key={item} style={[styles.stockPill, stockFilter === item && styles.stockPillActive]} onPress={() => setStockFilter(item)}>
                  <Text style={[styles.stockText, stockFilter === item && styles.stockTextActive]}>{item}</Text>
                </TouchableOpacity>
              ))}
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
                  <TouchableOpacity
                    style={[styles.categoryPill, active && styles.categoryPillActive]}
                    onPress={() => setCategory(item)}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.categoryText, active && styles.categoryTextActive]}>{item}</Text>
                    <View style={[styles.colorDot, { backgroundColor: AccentColors[index % AccentColors.length] }]} />
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        }
        renderItem={({ item }) => {
          const status = item.stock <= 0 ? "Out" : item.stock <= item.minStock ? "Low" : "OK";
          return (
            <View style={styles.card}>
              <View style={{ flex: 1 }}>
                <View style={styles.cardTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.partName}>{item.name}</Text>
                    <Text style={styles.partMeta}>{item.sku} · {item.category}</Text>
                  </View>
                  <View style={styles.cardRight}>
                    <Text style={styles.price}>${item.price.toFixed(2)}</Text>
                    {(item.configurable ? ["oil", "filter"].includes(item.configurable) : false) ? (
                      <View style={styles.badge}><Text style={styles.badgeText}>BRANDS</Text></View>
                    ) : null}
                  </View>
                </View>
                <View style={styles.stockRowCard}>
                  <StockBar stock={item.stock} minStock={item.minStock} capacity={Math.max(item.minStock, item.stock + 12)} />
                  <View style={[styles.statusPill, status === "Out" ? styles.out : status === "Low" ? styles.low : styles.ok]}>
                    <Text style={styles.statusText}>{status}</Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity style={styles.menuButton} onPress={() => openSheet("stock", item)}>
                <Ionicons name="ellipsis-vertical" size={18} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>
          );
        }}
        ListFooterComponent={
          <View style={{ paddingBottom: 100 }}>
            <TouchableOpacity style={styles.addButton} onPress={() => openSheet("add")}>
              <Ionicons name="add" size={18} color={Colors.black} />
              <Text style={styles.addButtonText}>Add Part</Text>
            </TouchableOpacity>
          </View>
        }
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <BottomSheet visible={sheetMode === "stock"} onClose={() => setSheetMode(null)} title="Update Stock" snapPoints={["66%"]}>
        <View style={styles.sheetBlock}>
          <View style={styles.infoCard}>
            <Text style={styles.partName}>{activePart?.name}</Text>
            <Text style={styles.partMeta}>{activePart?.sku}</Text>
          </View>
          <View style={styles.previewRow}>
            <Text style={styles.previewValue}>{activePart?.stock}</Text>
            <Ionicons name="arrow-forward" size={20} color={Colors.primary} />
            <Text style={styles.previewValue}>{Math.max(0, (activePart?.stock ?? 0) + stockAdjust)}</Text>
          </View>
          <View style={styles.toggleRow}>
            <TouchableOpacity style={[styles.toggleButton, styles.toggleActive]}><Text style={styles.toggleTextActive}>Add Stock</Text></TouchableOpacity>
            <TouchableOpacity style={styles.toggleButton}><Text style={styles.toggleText}>Remove</Text></TouchableOpacity>
          </View>
          <View style={styles.stepRow}>
            <TouchableOpacity style={styles.stepButton} onPress={() => setStockAdjust((value) => Math.max(1, value - 1))}><Text style={styles.stepText}>-</Text></TouchableOpacity>
            <View style={styles.counterBox}><Text style={styles.counterText}>{stockAdjust}</Text></View>
            <TouchableOpacity style={styles.stepButton} onPress={() => setStockAdjust((value) => value + 1)}><Text style={styles.stepText}>+</Text></TouchableOpacity>
          </View>
          <View style={styles.quickRow}>
            {[5, 10, 20, 50].map((value) => (
              <TouchableOpacity key={value} style={styles.quickButton} onPress={() => setStockAdjust(value)}>
                <Text style={styles.quickText}>+{value}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.confirmButton}><Text style={styles.confirmButtonText}>Update Stock to {Math.max(0, (activePart?.stock ?? 0) + stockAdjust)} units</Text></TouchableOpacity>
        </View>
      </BottomSheet>

      <BottomSheet visible={sheetMode === "price"} onClose={() => setSheetMode(null)} title="Update Price" snapPoints={["50%"]}>
        <View style={styles.sheetBlock}>
          <View style={styles.infoCard}>
            <Text style={styles.partName}>{activePart?.name}</Text>
            <Text style={styles.partMeta}>{activePart?.sku}</Text>
          </View>
          <Text style={styles.bigPrice}>${Number(priceValue || 0).toFixed(2)}</Text>
          <TextInput value={priceValue} onChangeText={setPriceValue} keyboardType="numeric" style={styles.priceInput} placeholder="0.00" placeholderTextColor={Colors.textDim} />
          <View style={styles.quickRow}>
            {[-10, -5, 5, 10, 20].map((delta) => (
              <TouchableOpacity key={delta} style={styles.quickButton} onPress={() => setPriceValue(String(Math.max(0, Number(priceValue || 0) + delta)))}>
                <Text style={styles.quickText}>{delta > 0 ? "+" : ""}{delta}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.confirmButton}><Text style={styles.confirmButtonText}>Update Price to ${Number(priceValue || 0).toFixed(2)}</Text></TouchableOpacity>
        </View>
      </BottomSheet>

      <BottomSheet visible={sheetMode === "add"} onClose={() => setSheetMode(null)} title="Add New Part" snapPoints={["74%"]}>
        <View style={styles.sheetBlock}>
          {["Part Name", "SKU / Part Number", "Unit Price", "Initial Stock", "Min Stock Alert"].map((label) => (
            <View key={label} style={styles.fieldGroup}>
              <Text style={styles.inputLabel}>{label}</Text>
              <TextInput placeholder={label} placeholderTextColor={Colors.textDim} style={styles.input} />
            </View>
          ))}
          <View style={styles.categoryWrap}>
            {categories.filter((item) => item !== "All").map((item) => (
              <TouchableOpacity key={item} style={styles.categoryChip}><Text style={styles.categoryChipText}>{item}</Text></TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.confirmButton}><Text style={styles.confirmButtonText}>Add Part to Inventory</Text></TouchableOpacity>
        </View>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 16, gap: 14 },
  searchBar: { flexDirection: "row", alignItems: "center", gap: 10, minHeight: 48, borderRadius: 18, paddingHorizontal: 14, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  searchInput: { flex: 1, color: Colors.textPrimary, fontFamily: Fonts.body },
  stockRow: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  stockPill: { minHeight: 36, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface, alignItems: "center", justifyContent: "center" },
  stockPillActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  stockText: { color: Colors.textMuted, fontFamily: Fonts.semibold, fontSize: 12 },
  stockTextActive: { color: Colors.black },
  categoryRow: { gap: 10, paddingVertical: 2 },
  categoryPill: { flexDirection: "row", alignItems: "center", gap: 8, minHeight: 38, paddingHorizontal: 12, borderRadius: 999, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  categoryPillActive: { backgroundColor: "rgba(0,212,170,0.12)", borderColor: "rgba(0,212,170,0.18)" },
  categoryText: { color: Colors.textMuted, fontFamily: Fonts.semibold, fontSize: 12 },
  categoryTextActive: { color: Colors.primary },
  colorDot: { width: 7, height: 7, borderRadius: 999 },
  listContent: { paddingHorizontal: 16, paddingBottom: 20 },
  card: { flexDirection: "row", gap: 12, padding: 14, borderRadius: 22, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, alignItems: "flex-start" },
  cardTop: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  partName: { color: Colors.textPrimary, fontFamily: Fonts.semibold, fontSize: 15 },
  partMeta: { color: Colors.textMuted, fontFamily: Fonts.body, fontSize: 12, marginTop: 3 },
  cardRight: { alignItems: "flex-end", gap: 8 },
  price: { color: Colors.textPrimary, fontFamily: Fonts.monoBold, fontSize: 16 },
  badge: { paddingHorizontal: 8, paddingVertical: 5, borderRadius: 999, backgroundColor: "rgba(0,212,170,0.12)", borderWidth: 1, borderColor: "rgba(0,212,170,0.18)" },
  badgeText: { color: Colors.primary, fontFamily: Fonts.bold, fontSize: 10 },
  stockRowCard: { marginTop: 12, flexDirection: "row", alignItems: "center", gap: 10 },
  statusPill: { minWidth: 48, minHeight: 28, borderRadius: 999, alignItems: "center", justifyContent: "center", paddingHorizontal: 10 },
  ok: { backgroundColor: "rgba(16,185,129,0.12)" },
  low: { backgroundColor: "rgba(255,107,53,0.12)" },
  out: { backgroundColor: "rgba(239,68,68,0.12)" },
  statusText: { color: Colors.textPrimary, fontFamily: Fonts.semibold, fontSize: 11 },
  menuButton: { width: 40, height: 40, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.03)" },
  addButton: { minHeight: 52, borderRadius: 18, backgroundColor: Colors.primary, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 6 },
  addButtonText: { color: Colors.black, fontFamily: Fonts.bold, fontSize: 14 },
  sheetBlock: { gap: 14 },
  infoCard: { borderRadius: 18, padding: 14, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, gap: 4 },
  previewRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 16 },
  previewValue: { color: Colors.textPrimary, fontFamily: Fonts.monoBold, fontSize: 32 },
  toggleRow: { flexDirection: "row", gap: 10 },
  toggleButton: { flex: 1, minHeight: 44, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface, alignItems: "center", justifyContent: "center" },
  toggleActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  toggleText: { color: Colors.textPrimary, fontFamily: Fonts.semibold },
  toggleTextActive: { color: Colors.black, fontFamily: Fonts.bold },
  stepRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12 },
  stepButton: { width: 48, height: 48, borderRadius: 18, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, alignItems: "center", justifyContent: "center" },
  stepText: { color: Colors.textPrimary, fontFamily: Fonts.bold, fontSize: 24 },
  counterBox: { minWidth: 90, height: 48, borderRadius: 18, backgroundColor: "rgba(0,212,170,0.08)", borderWidth: 1, borderColor: "rgba(0,212,170,0.16)", alignItems: "center", justifyContent: "center" },
  counterText: { color: Colors.primary, fontFamily: Fonts.monoBold, fontSize: 20 },
  quickRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  quickButton: { flexGrow: 1, minWidth: 64, minHeight: 42, borderRadius: 14, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, alignItems: "center", justifyContent: "center" },
  quickText: { color: Colors.textPrimary, fontFamily: Fonts.semibold },
  confirmButton: { minHeight: 50, borderRadius: 18, backgroundColor: Colors.primary, alignItems: "center", justifyContent: "center" },
  confirmButtonText: { color: Colors.black, fontFamily: Fonts.bold, fontSize: 14 },
  bigPrice: { color: Colors.primary, fontFamily: Fonts.monoBold, fontSize: 34, textAlign: "center" },
  priceInput: { minHeight: 50, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface, color: Colors.primary, textAlign: "center", fontFamily: Fonts.monoBold, fontSize: 20 },
  fieldGroup: { gap: 8 },
  inputLabel: { color: Colors.textMuted, fontFamily: Fonts.medium, fontSize: 12 },
  input: { minHeight: 48, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface, color: Colors.textPrimary, paddingHorizontal: 14, fontFamily: Fonts.body },
  categoryWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  categoryChip: { minHeight: 38, paddingHorizontal: 12, borderRadius: 999, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, alignItems: "center", justifyContent: "center" },
  categoryChipText: { color: Colors.textPrimary, fontFamily: Fonts.semibold, fontSize: 12 },
});
