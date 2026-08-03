import { createContext, ReactNode, useContext, useMemo, useState } from "react";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  kind: "service" | "part" | "package";
  note?: string;
}

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  tax: number;
  total: number;
  addItem: (item: Omit<CartItem, "qty"> & { qty?: number }) => void;
  updateQuantity: (id: string, delta: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (item: Omit<CartItem, "qty"> & { qty?: number }) => {
    setItems((current) => {
      const quantity = item.qty ?? 1;
      const existing = current.find((entry) => entry.id === item.id);

      if (existing) {
        return current.map((entry) =>
          entry.id === item.id ? { ...entry, qty: entry.qty + quantity } : entry,
        );
      }

      return [...current, { ...item, qty: quantity }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setItems((current) =>
      current
        .map((entry) =>
          entry.id === id ? { ...entry, qty: entry.qty + delta } : entry,
        )
        .filter((entry) => entry.qty > 0),
    );
  };

  const removeItem = (id: string) => {
    setItems((current) => current.filter((entry) => entry.id !== id));
  };

  const clearCart = () => setItems([]);

  const value = useMemo(() => {
    const subtotal = items.reduce((sum, entry) => sum + entry.price * entry.qty, 0);
    const tax = subtotal * 0.08;
    const total = subtotal + tax;

    return {
      items,
      itemCount: items.reduce((sum, entry) => sum + entry.qty, 0),
      subtotal,
      tax,
      total,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
