import { create } from "zustand";
import { persist } from "zustand/middleware";

type StockState = {
  outOfStock: Record<string, boolean>;
  toggle: (productId: string) => void;
  setStock: (productId: string, inStock: boolean) => void;
  isOut: (productId: string) => boolean;
};

export const useStock = create<StockState>()(
  persist(
    (set, get) => ({
      outOfStock: {},
      toggle: (id) => set({ outOfStock: { ...get().outOfStock, [id]: !get().outOfStock[id] } }),
      setStock: (id, inStock) => set({ outOfStock: { ...get().outOfStock, [id]: !inStock } }),
      isOut: (id) => !!get().outOfStock[id],
    }),
    { name: "ahsam-stock-v1" },
  ),
);
