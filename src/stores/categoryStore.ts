import { create } from "zustand";
import { persist } from "zustand/middleware";
import { categories as defaultCategories } from "@/data/menu";

export type CategoryItem = {
  id: string;
  name: string;
  image: string;
  tagline: string;
};

type CategoryState = {
  categories: CategoryItem[];
  addCategory: (c: Omit<CategoryItem, "id">) => void;
  updateCategory: (id: string, updates: Partial<CategoryItem>) => void;
  deleteCategory: (id: string) => void;
  getCategoryNames: () => string[];
};

export const useCategoryStore = create<CategoryState>()(
  persist(
    (set, get) => ({
      categories: defaultCategories.map((c, i) => ({
        id: `cat-${i}`,
        name: c.name,
        image: c.image,
        tagline: c.tagline,
      })),

      addCategory: (c) => {
        const id = "cat-" + Math.random().toString(36).slice(2, 8);
        set({ categories: [...get().categories, { ...c, id }] });
      },

      updateCategory: (id, updates) => {
        set({
          categories: get().categories.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        });
      },

      deleteCategory: (id) => {
        set({ categories: get().categories.filter((c) => c.id !== id) });
      },

      getCategoryNames: () => get().categories.map((c) => c.name),
    }),
    { name: "ahsam-categories-v1" }
  )
);
