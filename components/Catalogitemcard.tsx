import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";
import { StockBar } from "./StockBar";

export interface CatalogItemMeta {
  label: string;
  value: string;
}

export interface CatalogItemCardProps {
  name: string;
  brand: string;
  categoryName: string;
  price: number;
  meta?: CatalogItemMeta[];
  stockQuantity?: number;
  minStock?: number;
  actionIcon?: keyof typeof Ionicons.glyphMap;
  onPressAction?: () => void;

  onPress?: () => void;
}

export function CatalogItemCard({
  name,
  brand,
  categoryName,
  price,
  meta = [],
  stockQuantity,
  minStock,
  actionIcon = "ellipsis-vertical",
  onPressAction,
  onPress,
}: CatalogItemCardProps) {
  const hasStock = typeof stockQuantity === "number";
  const status = !hasStock
    ? null
    : stockQuantity! <= 0
      ? "Out"
      : stockQuantity! <= (minStock ?? 0)
        ? "Low"
        : "OK";

  const safePrice = typeof price === "number" ? price : 0;

  const Wrapper = onPress ? TouchableOpacity : View;

  return (
    <Wrapper
      {...(onPress ? { activeOpacity: 0.85, onPress } : {})}
      className="flex-row gap-3 p-4 rounded-[22px] bg-neutral-900 border border-neutral-800 items-start"
    >
      <View className="flex-1">
        <View className="flex-row items-start gap-2.5">
          <View className="flex-1">
            <Text className="text-white font-semibold text-[26px]">{name}</Text>
            <Text className="text-neutral-400 text-lg mt-1">
              Brand: <Text className="text-neutral-200">{brand}</Text>
            </Text>
            {meta
              .filter((row) => row.value)
              .map((row) => (
                <Text key={row.label} className="text-neutral-400 text-lg mt-1">
                  {row.label}: {row.value}
                </Text>
              ))}
          </View>
          <View className="items-end gap-2">
            <Text className="text-emerald-400 font-bold text-2xl">
              ${safePrice.toFixed(2)}
            </Text>
            <View className="px-2.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <Text className="text-emerald-400 font-bold text-[15px]">
                {String(categoryName || "GENERAL").toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        {hasStock && (
          <View className="mt-3 flex-row items-center gap-2.5">
            <StockBar
              stock={stockQuantity!}
              minStock={minStock ?? 0}
              capacity={Math.max(minStock ?? 0, stockQuantity! + 12)}
            />
            <View
              className={`min-w-[64px] h-9 rounded-full items-center justify-center px-3.5 ${
                status === "Out"
                  ? "bg-red-500/20"
                  : status === "Low"
                    ? "bg-amber-500/20"
                    : "bg-emerald-500/20"
              }`}
            >
              <Text
                className={`font-semibold text-[19px] ${
                  status === "Out"
                    ? "text-red-400"
                    : status === "Low"
                      ? "text-amber-400"
                      : "text-emerald-400"
                }`}
              >
                {status}
              </Text>
            </View>
          </View>
        )}
      </View>

      {onPressAction && (
        <TouchableOpacity
          className="w-11 h-11 rounded-2xl items-center justify-center bg-white/5"
          onPress={onPressAction}
        >
          <Ionicons name={actionIcon} size={20} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </Wrapper>
  );
}
