-- Categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  tagline TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Anyone can read categories (public menu)
CREATE POLICY "Categories are publicly readable"
  ON public.categories FOR SELECT TO anon, authenticated USING (true);

-- Only admins can insert
CREATE POLICY "Admins can insert categories"
  ON public.categories FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can update
CREATE POLICY "Admins can update categories"
  ON public.categories FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete
CREATE POLICY "Admins can delete categories"
  ON public.categories FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Auto-update timestamp
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed initial categories
INSERT INTO public.categories (name, tagline, sort_order) VALUES
  ('Burgers',   'Stacked & sizzling',       1),
  ('Pizza',     'Wood-fired perfection',     2),
  ('Pasta',     'Creamy comfort bowls',      3),
  ('Wraps',     'Freshly rolled goodness',   4),
  ('Chicken',   'Crispy juicy bites',        5),
  ('Wings',     'Saucy spicy cravings',      6),
  ('Fries',     'Golden crunchy treats',     7),
  ('Drinks',    'Sip the refreshment',       8),
  ('Ice Cream', 'Sweet frozen delight',      9);

-- ============================================================
-- Storage bucket for category images
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'category-images',
  'category-images',
  true,
  5242880,  -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']
);

-- Anyone can view category images (public bucket)
CREATE POLICY "Public read category images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'category-images');

-- Authenticated users (admins will be the only ones using the UI) can upload
CREATE POLICY "Authenticated upload category images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'category-images');

-- Authenticated users can update (overwrite) category images
CREATE POLICY "Authenticated update category images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'category-images');

-- Authenticated users can delete category images
CREATE POLICY "Authenticated delete category images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'category-images');
