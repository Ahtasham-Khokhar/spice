import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Modifier, Product } from "@/data/menu";

export type CartItem = {
  lineId: string;          // unique per configuration
  product: Product;
  quantity: number;
  selectedMods: Modifier[];
  unitPrice: number;       // price + modifiers
  notes?: string;
};

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, "lineId"> & { lineId?: string }) => void;
  removeItem: (lineId: string) => void;
  updateQty: (lineId: string, qty: number) => void;
  clear: () => void;
  setOpen: (v: boolean) => void;
  toggle: () => void;
  subtotal: () => number;
  count: () => number;
};

const sig = (productId: string, mods: Modifier[]) =>
  `${productId}::${mods.map((m) => m.id).sort().join(",")}`;

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      addItem: (item) => {
        const lineId = item.lineId ?? sig(item.product.id, item.selectedMods);
        const existing = get().items.find((i) => i.lineId === lineId);
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.lineId === lineId ? { ...i, quantity: i.quantity + item.quantity } : i,
            ),
          });
        } else {
          set({ items: [...get().items, { ...item, lineId }] });
        }
      },
      removeItem: (lineId) => set({ items: get().items.filter((i) => i.lineId !== lineId) }),
      updateQty: (lineId, qty) => {
        if (qty <= 0) return get().removeItem(lineId);
        set({ items: get().items.map((i) => (i.lineId === lineId ? { ...i, quantity: qty } : i)) });
      },
      clear: () => set({ items: [] }),
      setOpen: (v) => set({ isOpen: v }),
      toggle: () => set({ isOpen: !get().isOpen }),
      subtotal: () => get().items.reduce((s, i) => s + i.unitPrice * i.quantity, 0),
      count: () => get().items.reduce((s, i) => s + i.quantity, 0),
    }),
    { name: "ahsam-cart-v1" },
  ),
);
