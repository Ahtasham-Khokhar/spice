import { create } from "zustand";
import { supabase } from "@/integrations/supabase/client";
import type { Product, Category } from "@/data/menu";

export type MenuProduct = Product;

type MenuState = {
  products: MenuProduct[];
  loading: boolean;
  /** Fetch all menu items from Supabase */
  fetchProducts: () => Promise<void>;
  /** Add a new menu item to Supabase */
  addProduct: (p: Omit<MenuProduct, "id">) => Promise<void>;
  /** Update an existing menu item in Supabase */
  updateProduct: (id: string, updates: Partial<MenuProduct>) => Promise<void>;
  /** Delete a menu item from Supabase */
  deleteProduct: (id: string) => Promise<void>;
  /** Get products filtered by category */
  getByCategory: (cat: Category | "All") => MenuProduct[];
};

export const useMenuStore = create<MenuState>((set, get) => ({
  products: [],
  loading: true,

  fetchProducts: async () => {
    set({ loading: true });
    const { data, error } = await supabase
      .from("menu_items")
      .select("id, name, description, price, image, category, rating, reviews")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Failed to fetch menu items:", error);
      set({ loading: false });
      return;
    }
    set({ products: (data ?? []) as MenuProduct[], loading: false });
  },

  addProduct: async (p) => {
    const { data: inserted, error } = await supabase
      .from("menu_items")
      .insert({
        name: p.name,
        description: p.description,
        price: p.price,
        image: p.image || "/placeholder.svg",
        category: p.category,
        rating: p.rating ?? 4.5,
        reviews: p.reviews ?? 0,
      })
      .select("id, name, description, price, image, category, rating, reviews")
      .single();

    if (error || !inserted) throw error ?? new Error("Insert failed");

    set({
      products: [...get().products, inserted as MenuProduct],
    });
  },

  updateProduct: async (id, updates) => {
    const payload: {
      name?: string;
      description?: string;
      price?: number;
      image?: string;
      category?: string;
      rating?: number;
      reviews?: number;
    } = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.price !== undefined) payload.price = updates.price;
    if (updates.image !== undefined) payload.image = updates.image;
    if (updates.category !== undefined) payload.category = updates.category;
    if (updates.rating !== undefined) payload.rating = updates.rating;
    if (updates.reviews !== undefined) payload.reviews = updates.reviews;

    const { error } = await supabase
      .from("menu_items")
      .update(payload)
      .eq("id", id);

    if (error) throw error;

    set({
      products: get().products.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    });
  },

  deleteProduct: async (id) => {
    const { error } = await supabase
      .from("menu_items")
      .delete()
      .eq("id", id);

    if (error) throw error;

    set({ products: get().products.filter((p) => p.id !== id) });
  },

  getByCategory: (cat) => {
    if (cat === "All") return get().products;
    return get().products.filter((p) => p.category === cat);
  },
}));
