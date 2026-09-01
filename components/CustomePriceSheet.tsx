import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import { Modal, Text, TextInput, TouchableOpacity, View } from "react-native";

import { CatalogItem, CatalogProduct } from "../data/types/Catalog";

interface CustomPriceSheetProps {
  item: CatalogItem | null;
  product?: CatalogProduct | null;
  quantity?: number;
  onClose: () => void;
  onAdd: (quantity: number, totalPrice: number) => void;
}

export function CustomPriceSheet({
  item,
  product = null,
  quantity: initialQuantity = 1,
  onClose,
  onAdd,
}: CustomPriceSheetProps) {
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState(initialQuantity);
  const [error, setError] = useState("");

  const isProduct = !!product;

  const defaultPrice = product?.sellingPrice ?? item?.defaultPrice ?? 0;
  const minPrice = product?.minPrice ?? item?.minPrice ?? 0;
  const maxPrice = product?.maxPrice ?? item?.maxPrice ?? 999999999;

  useEffect(() => {
    if (!item) return;

    setPrice(String(defaultPrice));
    setQuantity(initialQuantity);
    setError("");
  }, [item, product, defaultPrice, initialQuantity]);

  const numericPrice = Number(price.replace(/,/g, "")) || 0;

  const isValidPrice = numericPrice >= minPrice && numericPrice <= maxPrice;

  const totalPrice = useMemo(() => {
    return numericPrice * quantity;
  }, [numericPrice, quantity]);

  if (!item) return null;

  const handlePriceChange = (value: string) => {
    const cleanedValue = value.replace(/[^0-9]/g, "");
    setPrice(cleanedValue);
    setError("");
  };

  const increaseQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  const decreaseQuantity = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleConfirm = () => {
    if (numericPrice < minPrice) {
      setError(`Minimum price is ${minPrice.toLocaleString()}`);
      return;
    }

    if (numericPrice > maxPrice) {
      setError(`Maximum price is ${maxPrice.toLocaleString()}`);
      return;
    }

    onAdd(quantity, totalPrice);
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

        <View className="rounded-t-[32px] border-t border-[#27303c] bg-[#121720] px-5 pb-8 pt-3">
          <View className="mb-5 items-center">
            <View className="h-1.5 w-12 rounded-full bg-slate-600" />
          </View>

          <View className="mb-6 flex-row items-start justify-between">
            <View className="flex-1 pr-4">
              <Text className="mb-1 text-xs font-bold uppercase tracking-widest text-[#22c7b6]">
                {isProduct ? "Custom Product Price" : "Custom Service Price"}
              </Text>

              <Text className="text-2xl font-bold text-white">
                {isProduct ? `${product?.brand} ${product?.name}` : item.name}
              </Text>

              <Text className="mt-1 text-sm text-slate-400">
                {isProduct ? item.name : item.description}
              </Text>
            </View>

            <TouchableOpacity
              onPress={onClose}
              className="h-10 w-10 items-center justify-center rounded-full bg-[#1a1f28]"
            >
              <Ionicons name="close" size={22} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          <View className="mb-4">
            <View className="mb-2 flex-row items-center justify-between">
              <Text className="text-sm font-semibold text-slate-300">
                Enter Price
              </Text>

              <Text className="text-xs text-slate-500">
                {minPrice.toLocaleString()} - {maxPrice.toLocaleString()}
              </Text>
            </View>

            <View
              className={`flex-row items-center rounded-2xl border bg-[#1a1f28] px-4 py-3 ${
                error
                  ? "border-red-500"
                  : isValidPrice
                    ? "border-[#22c7b6]/50"
                    : "border-[#27303c]"
              }`}
            >
              <Text className="mr-2 font-mono text-2xl font-bold text-[#22c7b6]">
                $
              </Text>

              <TextInput
                value={price}
                onChangeText={handlePriceChange}
                keyboardType="numeric"
                placeholder="Enter amount"
                placeholderTextColor="#64748b"
                className="flex-1 font-mono text-3xl font-bold text-white"
              />
            </View>

            {error ? (
              <Text className="mt-2 text-xs text-red-400">{error}</Text>
            ) : (
              <Text className="mt-2 text-xs text-slate-500">
                Default price: {defaultPrice.toLocaleString()}
              </Text>
            )}
          </View>

          <View className="mb-6 flex-row gap-2">
            <TouchableOpacity
              onPress={() => setPrice(String(minPrice))}
              className="flex-1 items-center rounded-xl border border-[#27303c] bg-[#1a1f28] py-3"
            >
              <Text className="text-[10px] font-bold text-slate-400">MIN</Text>

              <Text className="mt-1 font-mono text-sm font-bold text-white">
                {minPrice.toLocaleString()}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setPrice(String(defaultPrice))}
              className="flex-1 items-center rounded-xl border border-[#22c7b6]/30 bg-[#22c7b6]/10 py-3"
            >
              <Text className="text-[10px] font-bold text-[#22c7b6]">
                DEFAULT
              </Text>

              <Text className="mt-1 font-mono text-sm font-bold text-[#22c7b6]">
                {defaultPrice.toLocaleString()}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setPrice(String(maxPrice))}
              className="flex-1 items-center rounded-xl border border-[#27303c] bg-[#1a1f28] py-3"
            >
              <Text className="text-[10px] font-bold text-slate-400">MAX</Text>

              <Text className="mt-1 font-mono text-sm font-bold text-white">
                {maxPrice.toLocaleString()}
              </Text>
            </TouchableOpacity>
          </View>

          <View className="mb-6">
            <Text className="mb-2 text-sm font-semibold text-slate-300">
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
                {quantity} × {numericPrice.toLocaleString()}
              </Text>
            </View>

            <Text className="font-mono text-2xl font-bold text-[#22c7b6]">
              ${totalPrice.toLocaleString()}
            </Text>
          </View>

          <TouchableOpacity
            disabled={!isValidPrice}
            activeOpacity={0.85}
            onPress={handleConfirm}
            className={`items-center rounded-2xl py-5 ${
              isValidPrice ? "bg-[#22c7b6]" : "bg-slate-700"
            }`}
          >
            <Text
              className={`text-base font-bold ${
                isValidPrice ? "text-[#121720]" : "text-slate-400"
              }`}
            >
              Add to Cart — ${totalPrice.toLocaleString()}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
