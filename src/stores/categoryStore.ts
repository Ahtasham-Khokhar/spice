import { create } from "zustand";
import { supabase } from "@/integrations/supabase/client";

export type CategoryItem = {
  id: string;
  name: string;
  image_url: string;
  tagline: string;
  sort_order: number;
};

type CategoryState = {
  categories: CategoryItem[];
  loading: boolean;
  /** Fetch all categories from Supabase */
  fetchCategories: () => Promise<void>;
  /** Add a new category (with optional image file OR image URL) */
  addCategory: (
    data: { name: string; tagline: string; sort_order?: number },
    imageFile?: File,
    imageUrl?: string
  ) => Promise<void>;
  /** Update an existing category (with optional new image file OR image URL) */
  updateCategory: (
    id: string,
    updates: Partial<Pick<CategoryItem, "name" | "tagline" | "sort_order">>,
    imageFile?: File,
    imageUrl?: string
  ) => Promise<void>;
  /** Delete a category and its image */
  deleteCategory: (id: string) => Promise<void>;
  /** Convenience: get just the category names */
  getCategoryNames: () => string[];
};

/** Upload file to Supabase Storage and return the public URL */
async function uploadCategoryImage(file: File, categoryId: string): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${categoryId}.${ext}`;

  // Upsert: overwrite if it already exists
  const { error } = await supabase.storage
    .from("category-images")
    .upload(path, file, { upsert: true });

  if (error) throw error;

  const { data } = supabase.storage
    .from("category-images")
    .getPublicUrl(path);

  // Append cache-buster so browsers see the new image immediately
  return `${data.publicUrl}?t=${Date.now()}`;
}

/** Delete the image file from Storage for a given category */
async function deleteCategoryImage(imageUrl: string) {
  if (!imageUrl) return;
  try {
    // Extract the file path from the URL
    const url = new URL(imageUrl.split("?")[0]); // strip query
    const parts = url.pathname.split("/category-images/");
    if (parts.length < 2) return;
    const filePath = decodeURIComponent(parts[1]);
    await supabase.storage.from("category-images").remove([filePath]);
  } catch {
    // Non-critical — log but don't block
    console.warn("Could not delete old category image");
  }
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  loading: true,

  fetchCategories: async () => {
    set({ loading: true });
    const { data, error } = await supabase
      .from("categories")
      .select("id, name, tagline, image_url, sort_order")
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Failed to fetch categories:", error);
      set({ loading: false });
      return;
    }
    set({ categories: data ?? [], loading: false });
  },

  addCategory: async (catData, imageFile, imageUrl) => {
    // 1. Insert row first to get the id
    const { data: inserted, error } = await supabase
      .from("categories")
      .insert({
        name: catData.name,
        tagline: catData.tagline,
        sort_order: catData.sort_order ?? get().categories.length + 1,
      })
      .select("id, name, tagline, image_url, sort_order")
      .single();

    if (error || !inserted) throw error ?? new Error("Insert failed");

    // 2. Upload file if provided, otherwise use pasted URL
    let image_url = "";
    if (imageFile) {
      image_url = await uploadCategoryImage(imageFile, inserted.id);
    } else if (imageUrl) {
      image_url = imageUrl;
    }

    // 3. Update the row with the image URL if we have one
    if (image_url) {
      await supabase
        .from("categories")
        .update({ image_url })
        .eq("id", inserted.id);
    }

    set({
      categories: [
        ...get().categories,
        { ...inserted, image_url },
      ],
    });
  },

  updateCategory: async (id, updates, imageFile, imageUrl) => {
    let image_url: string | undefined;

    if (imageFile) {
      image_url = await uploadCategoryImage(imageFile, id);
    } else if (imageUrl !== undefined) {
      image_url = imageUrl;
    }

    const payload: Record<string, unknown> = { ...updates };
    if (image_url !== undefined) payload.image_url = image_url;

    const { error } = await supabase
      .from("categories")
      .update(payload)
      .eq("id", id);

    if (error) throw error;

    set({
      categories: get().categories.map((c) =>
        c.id === id
          ? { ...c, ...updates, ...(image_url !== undefined ? { image_url } : {}) }
          : c
      ),
    });
  },

  deleteCategory: async (id) => {
    const cat = get().categories.find((c) => c.id === id);
    if (cat?.image_url) {
      await deleteCategoryImage(cat.image_url);
    }

    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) throw error;

    set({ categories: get().categories.filter((c) => c.id !== id) });
  },

  getCategoryNames: () => get().categories.map((c) => c.name),
}));
