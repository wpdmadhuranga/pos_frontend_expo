import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { AppHeader } from "../components/AppHeader";
import { BottomSheet } from "../components/BottomSheet";
import { CatalogItemCard } from "../components/Catalogitemcard";
import { AccentColors, Colors } from "../constants/colors";

const STORAGE_KEY = "pos_catalog";
interface CategoryDto {
  id: string;
  name: string;
  sortOrder: number;
}

interface ProductDto {
  id: string;
  brand: string;
  name?: string;
  compatibleVehicleType?: string;
  costPrice?: number;
  isActive?: boolean;
  partNumber?: string;
  sellingPrice?: number;
  stockQuantity?: number;
  minStock?: number;
  unit?: string;
}

interface ServiceCatalogDto {
  id: string;
  name: string;
  description?: string;
  category?: CategoryDto;
  defaultPrice?: number;
  isActive?: boolean;
  maxPrice?: number;
  minPrice?: number;
  pricingType?: string;
  products?: ProductDto[];
  sortOrder?: number;
  unit?: string;
}
interface ProductItem {
  id: string;
  serviceId: string;
  name: string;
  brand: string;
  partNumber: string;
  compatibleVehicleType: string;
  sellingPrice: number;
  stockQuantity: number;
  minStock: number;
  categoryName: string;
  unit: string;
}

function flattenServicesToProducts(
  services: ServiceCatalogDto[],
): ProductItem[] {
  if (!Array.isArray(services)) return [];

  const items: ProductItem[] = [];

  for (const service of services) {
    if (!Array.isArray(service.products) || service.products.length === 0) {
      continue;
    }

    for (const product of service.products) {
      items.push({
        id: product.id,
        serviceId: service.id,
        name: product.name || service.name,
        brand: product.brand || "Generic",
        partNumber: product.partNumber || "N/A",
        compatibleVehicleType: product.compatibleVehicleType || "",
        sellingPrice: product.sellingPrice ?? service.defaultPrice ?? 0,
        stockQuantity: Number(product.stockQuantity ?? 0),
        minStock: Number(product.minStock ?? 5),
        categoryName: service.category?.name || "General",
        unit: product.unit || service.unit || "piece",
      });
    }
  }

  return items;
}

export function InventoryScreen() {
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState<"All" | "Low Stock" | "Out">(
    "All",
  );
  const [activeTab, setActiveTab] = useState<string>("All");
  const [sheetMode, setSheetMode] = useState<"stock" | "price" | "add" | null>(
    null,
  );
  const [activePart, setActivePart] = useState<ProductItem | null>(null);
  const [stockAdjust, setStockAdjust] = useState(5);
  const [rawCatalog, setRawCatalog] = useState<ServiceCatalogDto[]>([]);
  const [loading, setLoading] = useState(true);

  const catalogItems = useMemo(
    () => flattenServicesToProducts(rawCatalog),
    [rawCatalog],
  );

  const categoryTabs = useMemo(() => {
    const unique = new Set<string>();
    catalogItems.forEach((item) => unique.add(item.categoryName));
    return ["All", ...Array.from(unique)];
  }, [catalogItems]);

  useEffect(() => {
    async function loadFromCache() {
      try {
        const cachedData = await AsyncStorage.getItem(STORAGE_KEY);
        if (cachedData) {
          const parsed: ServiceCatalogDto[] = JSON.parse(cachedData);
          setRawCatalog(Array.isArray(parsed) ? parsed : []);
        }
      } catch (error) {
        console.error("Failed to read pos_catalog from cache:", error);
      } finally {
        setLoading(false);
      }
    }

    loadFromCache();
  }, []);

  useEffect(() => {
    if (!activePart && catalogItems.length > 0) {
      setActivePart(catalogItems[0]);
    }
  }, [catalogItems, activePart]);

  const filtered = useMemo(() => {
    return catalogItems.filter((part) => {
      const query =
        `${part.name} ${part.brand} ${part.partNumber} ${part.compatibleVehicleType}`.toLowerCase();
      const matchesSearch = query.includes(search.toLowerCase());

      const matchesCategory =
        activeTab === "All" ||
        part.categoryName.toLowerCase() === activeTab.toLowerCase();

      const low =
        part.stockQuantity <= 0
          ? "Out"
          : part.stockQuantity <= part.minStock
            ? "Low Stock"
            : "All";
      const matchesStock = stockFilter === "All" || stockFilter === low;

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [search, stockFilter, activeTab, catalogItems]);

  const openSheet = (mode: "stock" | "price" | "add", part?: ProductItem) => {
    if (part) {
      setActivePart(part);
    }
    setSheetMode(mode);
    setStockAdjust(5);
  };

  const handleStockUpdate = async (isStockIn: boolean) => {
    if (!activePart) return;

    const adjustmentAmount = isStockIn ? stockAdjust : -stockAdjust;
    const newQuantity = Math.max(
      0,
      activePart.stockQuantity + adjustmentAmount,
    );

    try {
      const updatedRawCatalog = rawCatalog.map((service) => {
        if (service.id !== activePart.serviceId) return service;
        return {
          ...service,
          products: (service.products ?? []).map((product) =>
            product.id === activePart.id
              ? { ...product, stockQuantity: newQuantity }
              : product,
          ),
        };
      });

      setRawCatalog(updatedRawCatalog);
      setActivePart((prev) =>
        prev ? { ...prev, stockQuantity: newQuantity } : null,
      );

      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updatedRawCatalog),
      );
      setSheetMode(null);
    } catch (error) {
      console.error("Failed to update stock quantity:", error);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <AppHeader title="Inventory Catalog" />

      <FlatList
        data={filtered}
        keyExtractor={(item, index) => String(item.id || index)}
        ListHeaderComponent={
          <View className="px-4 gap-3.5">
            <View className="flex-row items-center gap-2.5 min-h-[48px] rounded-2xl px-3.5 bg-surface border border-border">
              <Ionicons
                name="search-outline"
                size={18}
                color={Colors.textMuted}
              />
              <TextInput
                placeholder="Search by brand, name, part #..."
                placeholderTextColor={Colors.textMuted}
                value={search}
                onChangeText={setSearch}
                className="flex-1 text-textPrimary font-normal"
              />
            </View>

            <View className="flex-row gap-2.5 flex-wrap">
              {(["All", "Low Stock", "Out"] as const).map((item) => {
                const active = stockFilter === item;
                return (
                  <TouchableOpacity
                    key={item}
                    className="min-h-[36px] px-3 rounded-full items-center justify-center"
                    style={{
                      borderWidth: 1,
                      borderColor: active ? Colors.primary : Colors.border,
                      backgroundColor: active ? Colors.primary : Colors.surface,
                    }}
                    onPress={() => setStockFilter(item)}
                  >
                    <Text
                      className="font-semibold text-xs"
                      style={{
                        color: active ? Colors.black : Colors.textMuted,
                      }}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <FlatList
              data={categoryTabs}
              horizontal
              keyExtractor={(item) => item}
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="gap-2.5 py-0.5"
              renderItem={({ item, index }) => {
                const active = activeTab === item;
                return (
                  <TouchableOpacity
                    className="flex-row items-center gap-2 min-h-[38px] px-3 rounded-full"
                    style={{
                      borderWidth: 1,
                      borderColor: active
                        ? `${Colors.primary}33`
                        : Colors.border,
                      backgroundColor: active
                        ? `${Colors.primary}1A`
                        : Colors.surface,
                    }}
                    onPress={() => setActiveTab(item)}
                    activeOpacity={0.85}
                  >
                    <Text
                      className="font-semibold text-xs"
                      style={{
                        color: active ? Colors.primary : Colors.textMuted,
                      }}
                    >
                      {item}
                    </Text>
                    <View
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        backgroundColor:
                          AccentColors[index % AccentColors.length],
                      }}
                    />
                  </TouchableOpacity>
                );
              }}
            />

            {loading && (
              <Text className="text-textMuted text-xs px-1">
                Loading cached catalog…
              </Text>
            )}
            {!loading && filtered.length === 0 && (
              <Text className="text-textMuted text-xs px-1">
                No products found in cache for this filter.
              </Text>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <CatalogItemCard
            name={item.name}
            brand={item.brand}
            categoryName={item.categoryName}
            price={item.sellingPrice}
            stockQuantity={item.stockQuantity}
            minStock={item.minStock}
            meta={[
              ...(item.compatibleVehicleType
                ? [{ label: "Vehicle", value: item.compatibleVehicleType }]
                : []),
              { label: "Part #", value: item.partNumber },
            ]}
            actionIcon="ellipsis-vertical"
            onPressAction={() => openSheet("stock", item)}
          />
        )}
        ListFooterComponent={
          <View className="pb-[100px]">
            <TouchableOpacity
              className="min-h-[52px] rounded-2xl bg-primary flex-row items-center justify-center gap-2 mt-1.5"
              onPress={() => openSheet("add")}
            >
              <Ionicons name="add" size={18} color={Colors.black} />
              <Text className="text-black font-bold text-sm">Add Part</Text>
            </TouchableOpacity>
          </View>
        }
        ItemSeparatorComponent={() => <View className="h-3" />}
        contentContainerClassName="px-4 pb-5"
        showsVerticalScrollIndicator={false}
      />

      <BottomSheet
        visible={sheetMode === "stock"}
        onClose={() => setSheetMode(null)}
        title="Update Stock"
        snapPoints={["66%"]}
      >
        <View className="gap-3.5">
          <View className="rounded-2xl p-3.5 bg-card border border-border gap-1">
            <Text className="text-textPrimary font-semibold text-[15px]">
              {activePart?.name}
            </Text>
            <Text className="text-textMuted text-xs">
              {activePart?.brand} · {activePart?.partNumber}
            </Text>
          </View>
          <View className="flex-row items-center justify-center gap-4">
            <Text className="text-textPrimary font-bold text-[32px]">
              {activePart?.stockQuantity ?? 0}
            </Text>
            <Ionicons name="arrow-forward" size={20} color={Colors.primary} />
            <Text className="text-textPrimary font-bold text-[32px]">
              {Math.max(0, (activePart?.stockQuantity ?? 0) + stockAdjust)}
            </Text>
          </View>
          <View className="flex-row gap-2.5">
            <TouchableOpacity
              className="flex-1 min-h-[44px] rounded-2xl border border-primary bg-primary items-center justify-center"
              onPress={() => handleStockUpdate(true)}
            >
              <Text className="text-black font-bold">Add Stock</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 min-h-[44px] rounded-2xl border border-border bg-surface items-center justify-center"
              onPress={() => handleStockUpdate(false)}
            >
              <Text className="text-textPrimary font-semibold">Remove</Text>
            </TouchableOpacity>
          </View>
          <View className="flex-row items-center justify-center gap-3">
            <TouchableOpacity
              className="w-12 h-12 rounded-2xl bg-surface border border-border items-center justify-center"
              onPress={() => setStockAdjust((value) => Math.max(1, value - 1))}
            >
              <Text className="text-textPrimary font-bold text-2xl">-</Text>
            </TouchableOpacity>
            <View className="min-w-[90px] h-12 rounded-2xl bg-primary/10 border border-primary/20 items-center justify-center">
              <Text className="text-primary font-bold text-xl">
                {stockAdjust}
              </Text>
            </View>
            <TouchableOpacity
              className="w-12 h-12 rounded-2xl bg-surface border border-border items-center justify-center"
              onPress={() => setStockAdjust((value) => value + 1)}
            >
              <Text className="text-textPrimary font-bold text-2xl">+</Text>
            </TouchableOpacity>
          </View>
          <View className="flex-row flex-wrap gap-2.5">
            {[5, 10, 20, 50].map((value) => (
              <TouchableOpacity
                key={value}
                className="flex-grow min-w-[64px] min-h-[42px] rounded-xl bg-surface border border-border items-center justify-center"
                onPress={() => setStockAdjust(value)}
              >
                <Text className="text-textPrimary font-semibold">+{value}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            className="min-h-[50px] rounded-2xl bg-primary items-center justify-center"
            onPress={() => handleStockUpdate(true)}
          >
            <Text className="text-black font-bold text-sm">
              Update Stock to{" "}
              {Math.max(0, (activePart?.stockQuantity ?? 0) + stockAdjust)}{" "}
              units
            </Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>
    </View>
  );
}
