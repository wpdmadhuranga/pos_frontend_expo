import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
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
    if (!searchQuery.trim()) return item.products;
    return item.products.filter((product) =>
      product.partNumber
        ?.toLowerCase()
        .includes(searchQuery.trim().toLowerCase()),
    );
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

  const increaseQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  const decreaseQuantity = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

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

        <View className="max-h-[88%] rounded-t-[32px] bg-[#121720] px-5 pb-8 pt-3">
          <View className="mb-5 items-center">
            <View className="h-1.5 w-12 rounded-full bg-slate-600" />
          </View>

          <View className="mb-4 flex-row items-start justify-between">
            <View className="flex-1 pr-4">
              <Text className="mb-1 text-xs font-bold uppercase tracking-widest text-[#22c7b6]">
                Select Product
              </Text>

              <Text className="text-2xl font-bold text-white">{item.name}</Text>

              {!!item.description && (
                <Text className="mt-1 text-sm text-slate-400">
                  {item.description}
                </Text>
              )}
            </View>

            <TouchableOpacity
              onPress={onClose}
              className="h-10 w-10 items-center justify-center rounded-full bg-[#1a1f28]"
            >
              <Ionicons name="close" size={22} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          <View className="mb-4 flex-row items-center rounded-2xl border border-[#27303c] bg-[#1a1f28] px-4 py-3">
            <Ionicons
              name="search"
              size={18}
              color="#94a3b8"
              style={{ marginRight: 8 }}
            />
            <TextInput
              placeholder="Search by part number..."
              placeholderTextColor="#64748b"
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="flex-1 text-sm text-white"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={18} color="#94a3b8" />
              </TouchableOpacity>
            )}
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerClassName="gap-3 pb-5"
          >
            {filteredProducts.length === 0 ? (
              <View className="py-8 items-center">
                <Text className="text-xs text-slate-500 italic">
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
                    className={`rounded-2xl border p-4 ${
                      isSelected
                        ? "border-[#22c7b6] bg-[#16302e]"
                        : "border-[#27303c] bg-[#1a1f28]"
                    }`}
                  >
                    <View className="flex-row items-center">
                      <View
                        className={`mr-3 h-12 w-12 items-center justify-center rounded-xl ${
                          isSelected ? "bg-[#22c7b6]/20" : "bg-white/5"
                        }`}
                      >
                        <Ionicons
                          name="cube-outline"
                          size={22}
                          color={isSelected ? "#22c7b6" : "#94a3b8"}
                        />
                      </View>

                      <View className="flex-1">
                        <Text className="text-base font-bold text-white">
                          {product.brand} {product.name}
                        </Text>

                        <Text className="mt-1 text-xs text-slate-400">
                          {product.partNumber ?? "No part number"}
                        </Text>
                      </View>

                      <View className="items-end">
                        <Text className="font-mono text-lg font-bold text-white">
                          ${product.sellingPrice.toLocaleString()}
                        </Text>

                        {isSelected && (
                          <Ionicons
                            name="checkmark-circle"
                            size={20}
                            color="#22c7b6"
                          />
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>

          <View className="mb-4">
            <Text className="mb-2 text-sm font-semibold text-slate-400">
              Price
            </Text>

            <View className="flex-row items-center rounded-2xl border border-[#27303c] bg-[#1a1f28] px-4 py-3">
              <Text className="mr-2 text-lg font-bold text-slate-400">$</Text>
              <TextInput
                keyboardType="numeric"
                value={customPrice}
                onChangeText={setCustomPrice}
                placeholder="0"
                placeholderTextColor="#64748b"
                className="flex-1 font-mono text-lg font-bold text-white"
              />
            </View>
          </View>

          <View className="mb-4">
            <Text className="mb-2 text-sm font-semibold text-slate-400">
              Quantity
            </Text>

            <View className="flex-row items-center justify-between rounded-2xl border border-[#27303c] bg-[#1a1f28] p-2">
              <TouchableOpacity
                disabled={quantity <= 1}
                onPress={decreaseQuantity}
                className={`h-12 w-12 items-center justify-center rounded-xl ${
                  quantity <= 1 ? "bg-white/5 opacity-40" : "bg-white/5"
                }`}
              >
                <Ionicons name="remove" size={22} color="white" />
              </TouchableOpacity>

              <Text className="font-mono text-2xl font-bold text-white">
                {quantity}
              </Text>

              <TouchableOpacity
                onPress={increaseQuantity}
                className="h-12 w-12 items-center justify-center rounded-xl bg-[#22c7b6]/15"
              >
                <Ionicons name="add" size={22} color="#22c7b6" />
              </TouchableOpacity>
            </View>
          </View>

          <View className="mb-4 flex-row items-center justify-between rounded-2xl border border-[#27303c] bg-[#1a1f28] p-4">
            <View>
              <Text className="text-xs text-slate-500">Total</Text>

              <Text className="mt-1 text-sm text-slate-400">
                {selectedProduct
                  ? `${quantity} × ${priceValue.toLocaleString()}`
                  : "No product selected"}
              </Text>
            </View>

            <Text className="font-mono text-2xl font-bold text-[#22c7b6]">
              ${total.toLocaleString()}
            </Text>
          </View>

          <TouchableOpacity
            disabled={!selectedProduct}
            activeOpacity={0.85}
            onPress={handleAdd}
            className={`items-center rounded-2xl py-5 ${
              selectedProduct ? "bg-[#22c7b6]" : "bg-slate-700"
            }`}
          >
            <Text className="text-base font-bold text-[#121720]">
              Add to Cart
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
