import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = {
  itemId: string;
  group: string;
  label: string;
  category: string;
  price: string;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const storageKey = "roth-digital-cart-v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try { return JSON.parse(localStorage.getItem(storageKey) ?? "[]") as CartItem[]; } catch { return []; }
  });

  useEffect(() => { localStorage.setItem(storageKey, JSON.stringify(items)); }, [items]);
  const value = useMemo<CartContextValue>(() => ({
    items,
    count: items.reduce((sum, item) => sum + item.quantity, 0),
    addItem: (item) => setItems((current) => {
      const found = current.find((entry) => entry.itemId === item.itemId);
      return found ? current.map((entry) => entry.itemId === item.itemId ? { ...entry, quantity: entry.quantity + 1 } : entry) : [...current, { ...item, quantity: 1 }];
    }),
    removeItem: (itemId) => setItems((current) => current.filter((entry) => entry.itemId !== itemId)),
    updateQuantity: (itemId, quantity) => setItems((current) => quantity < 1 ? current.filter((entry) => entry.itemId !== itemId) : current.map((entry) => entry.itemId === itemId ? { ...entry, quantity } : entry)),
    clearCart: () => setItems([]),
  }), [items]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
