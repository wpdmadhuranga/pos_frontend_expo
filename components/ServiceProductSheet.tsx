import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

import { CatalogItem, CatalogProduct } from "../data/types/Catalog";

interface ServiceProductSheetProps {
  item: CatalogItem | null;
  onClose: () => void;
  onAdd: (
    product: CatalogProduct,
    quantity: number,
    customPrice: number,
  ) => void;
}

export function ServiceProductSheet({
  item,
  onClose,
  onAdd,
}: ServiceProductSheetProps) {
  const { height } = useWindowDimensions();
  const [selectedProduct, setSelectedProduct] = useState<CatalogProduct | null>(
    null,
  );
  const [quantity, setQuantity] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [customPrice, setCustomPrice] = useState("0");

  useEffect(() => {
    if (item) {
      const firstProduct = item.products?.[0] ?? null;
      setSelectedProduct(firstProduct);
      setQuantity(1);
      setSearchQuery("");
      setCustomPrice(firstProduct ? String(firstProduct.sellingPrice) : "0");
    }
  }, [item]);

  const filteredProducts = useMemo(() => {
    if (!item?.products) return [];
    const query = searchQuery.trim().toLowerCase();
    if (!query) return item.products;

    return item.products.filter((product) => {
      const name = product.name?.toLowerCase() ?? "";
      const brand = product.brand?.toLowerCase() ?? "";
      const partNumber = product.partNumber?.toLowerCase() ?? "";

      return (
        name.includes(query) ||
        brand.includes(query) ||
        partNumber.includes(query)
      );
    });
  }, [item, searchQuery]);

  const priceValue = useMemo(() => {
    const parsed = parseFloat(customPrice);
    return Number.isNaN(parsed) ? 0 : parsed;
  }, [customPrice]);

  const total = useMemo(() => {
    if (!selectedProduct) return 0;
    return priceValue * quantity;
  }, [selectedProduct, priceValue, quantity]);

  if (!item) return null;

  const increaseQuantity = () => setQuantity((prev) => prev + 1);
  const decreaseQuantity = () => setQuantity((prev) => Math.max(1, prev - 1));

  const handleAdd = () => {
    if (!selectedProduct) return;
    onAdd(selectedProduct, quantity, priceValue);
  };

  return (
    <Modal
      visible={!!item}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/70">
        <TouchableOpacity
          activeOpacity={1}
          className="absolute inset-0"
          onPress={onClose}
        />

        <View
          style={{ maxHeight: height * 0.88 }}
          className="rounded-t-[28px] bg-[#121720] px-4 pb-5 pt-2.5"
        >
          {/* Handle */}
          <View className="mb-3 items-center">
            <View className="h-1 w-10 rounded-full bg-slate-600" />
          </View>

          <View className="mb-3 flex-row items-start justify-between">
            <View className="flex-1 pr-3">
              <Text className="mb-0.5 text-[10px] font-bold uppercase tracking-widest text-[#22c7b6]">
                Select Product
              </Text>
              <Text className="text-xl font-bold text-white" numberOfLines={1}>
                {item.name}
              </Text>
              {!!item.description && (
                <Text
                  className="mt-0.5 text-xs text-slate-400"
                  numberOfLines={2}
                >
                  {item.description}
                </Text>
              )}
            </View>

            <TouchableOpacity
              onPress={onClose}
              className="h-9 w-9 items-center justify-center rounded-full bg-[#1a1f28]"
            >
              <Ionicons name="close" size={20} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          <View className="mb-3 flex-row items-center rounded-xl border border-[#27303c] bg-[#1a1f28] px-3 py-2.5">
            <Ionicons
              name="search"
              size={16}
              color="#94a3b8"
              style={{ marginRight: 6 }}
            />
            <TextInput
              placeholder="Search by name, brand or part number..."
              placeholderTextColor="#64748b"
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="flex-1 text-sm text-white"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={16} color="#94a3b8" />
              </TouchableOpacity>
            )}
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{ flexGrow: 0, maxHeight: height * 0.38 }}
            contentContainerStyle={{ gap: 8, paddingBottom: 8 }}
          >
            {filteredProducts.length === 0 ? (
              <View className="items-center py-6">
                <Text className="text-xs italic text-slate-500">
                  No products match this part number.
                </Text>
              </View>
            ) : (
              filteredProducts.map((product) => {
                const isSelected = selectedProduct?.id === product.id;

                return (
                  <TouchableOpacity
                    key={product.id}
                    activeOpacity={0.85}
                    onPress={() => {
                      setSelectedProduct(product);
                      setCustomPrice(String(product.sellingPrice));
                    }}
                    className={`rounded-xl border p-3 ${
                      isSelected
                        ? "border-[#22c7b6] bg-[#16302e]"
                        : "border-[#27303c] bg-[#1a1f28]"
                    }`}
                  >
                    <View className="flex-row items-center">
                      <View
                        className={`mr-2.5 h-10 w-10 items-center justify-center rounded-lg ${
                          isSelected ? "bg-[#22c7b6]/20" : "bg-white/5"
                        }`}
                      >
                        <Ionicons
                          name="cube-outline"
                          size={18}
                          color={isSelected ? "#22c7b6" : "#94a3b8"}
                        />
                      </View>

                      <View className="flex-1">
                        <Text
                          className="text-sm font-bold text-white"
                          numberOfLines={1}
                        >
                          {product.brand} {product.name}
                        </Text>
                        <Text className="mt-0.5 text-[11px] text-slate-400">
                          {product.partNumber ?? "No part number"}
                        </Text>
                      </View>

                      <View className="items-end">
                        <Text className="font-mono text-base font-bold text-white">
                          ${product.sellingPrice.toLocaleString()}
                        </Text>
                        {isSelected && (
                          <Ionicons
                            name="checkmark-circle"
                            size={16}
                            color="#22c7b6"
                            style={{ marginTop: 2 }}
                          />
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>

          <View className="mt-1 gap-2.5">
            <View>
              <Text className="mb-1 text-xs font-semibold text-slate-400">
                Price
              </Text>
              <View className="flex-row items-center rounded-xl border border-[#27303c] bg-[#1a1f28] px-3 py-2">
                <Text className="mr-1.5 text-base font-bold text-slate-400">
                  $
                </Text>
                <TextInput
                  keyboardType="numeric"
                  value={customPrice}
                  onChangeText={setCustomPrice}
                  placeholder="0"
                  placeholderTextColor="#64748b"
                  className="flex-1 font-mono text-base font-bold text-white"
                />
              </View>
            </View>

            <View>
              <Text className="mb-1 text-xs font-semibold text-slate-400">
                Quantity
              </Text>
              <View className="flex-row items-center justify-between rounded-xl border border-[#27303c] bg-[#1a1f28] p-1.5">
                <TouchableOpacity
                  disabled={quantity <= 1}
                  onPress={decreaseQuantity}
                  className={`h-10 w-10 items-center justify-center rounded-lg ${
                    quantity <= 1 ? "bg-white/5 opacity-40" : "bg-white/5"
                  }`}
                >
                  <Ionicons name="remove" size={20} color="white" />
                </TouchableOpacity>

                <Text className="font-mono text-xl font-bold text-white">
                  {quantity}
                </Text>

                <TouchableOpacity
                  onPress={increaseQuantity}
                  className="h-10 w-10 items-center justify-center rounded-lg bg-[#22c7b6]/15"
                >
                  <Ionicons name="add" size={20} color="#22c7b6" />
                </TouchableOpacity>
              </View>
            </View>

            <View className="flex-row items-center justify-between rounded-xl border border-[#27303c] bg-[#1a1f28] px-3 py-2.5">
              <View>
                <Text className="text-[10px] text-slate-500">Total</Text>
                <Text className="text-xs text-slate-400">
                  {selectedProduct
                    ? `${quantity} × ${priceValue.toLocaleString()}`
                    : "No product selected"}
                </Text>
              </View>
              <Text className="font-mono text-xl font-bold text-[#22c7b6]">
                ${total.toLocaleString()}
              </Text>
            </View>

            <TouchableOpacity
              disabled={!selectedProduct}
              activeOpacity={0.85}
              onPress={handleAdd}
              className={`items-center rounded-xl py-3.5 ${
                selectedProduct ? "bg-[#22c7b6]" : "bg-slate-700"
              }`}
            >
              <Text className="text-sm font-bold text-[#121720]">
                Add to Cart
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
