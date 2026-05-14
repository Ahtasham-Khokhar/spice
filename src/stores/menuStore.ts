import { create } from "zustand";
import { persist } from "zustand/middleware";
import { products as defaultProducts, type Product, type Category } from "@/data/menu";

export type MenuProduct = Product;

type MenuState = {
  products: MenuProduct[];
  addProduct: (p: Omit<MenuProduct, "id">) => void;
  updateProduct: (id: string, updates: Partial<MenuProduct>) => void;
  deleteProduct: (id: string) => void;
  getByCategory: (cat: Category | "All") => MenuProduct[];

};

export const useMenuStore = create<MenuState>()(
  persist(
    (set, get) => ({
      products: defaultProducts,

      addProduct: (p) => {
        const id = "p-" + Math.random().toString(36).slice(2, 8);
        set({ products: [...get().products, { ...p, id } as MenuProduct] });
      },

      updateProduct: (id, updates) => {
        set({
          products: get().products.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        });
      },

      deleteProduct: (id) => {
        set({ products: get().products.filter((p) => p.id !== id) });
      },

      getByCategory: (cat) => {
        if (cat === "All") return get().products;
        return get().products.filter((p) => p.category === cat);
      },


    }),
    { name: "ahsam-menu-v2" }
  )
);
