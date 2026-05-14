export type Category = string;

export type Modifier = {
  id: string;
  name: string;
  price: number;
};

export type ModifierGroup = {
  id: string;
  name: string;
  type: "single" | "multi";
  required?: boolean;
  options: Modifier[];
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: Category;
  rating: number;
  reviews: number;
  modifiers?: ModifierGroup[];
};

// Static categories kept as fallback reference only.
// The app now uses dynamic categories from Supabase (categoryStore).
export const categories: { name: Category; image: string; tagline: string }[] = [];

// Default products list is empty — all menu items are managed
// through the admin dashboard and persisted via Zustand.
export const products: Product[] = [];
