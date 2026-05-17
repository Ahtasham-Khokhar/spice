-- ============================================================
-- Create the menu_items table for storing menu products
-- Run this SQL in your Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Create the table
CREATE TABLE IF NOT EXISTS public.menu_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  price numeric NOT NULL CHECK (price > 0),
  image text NOT NULL DEFAULT '/placeholder.svg',
  category text NOT NULL,
  rating numeric NOT NULL DEFAULT 4.5,
  reviews integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Enable Row Level Security
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

-- 3. Allow anyone (including anonymous visitors) to read menu items
CREATE POLICY "Anyone can view menu items"
  ON public.menu_items
  FOR SELECT
  USING (true);

-- 4. Allow admins to insert menu items
CREATE POLICY "Admins can insert menu items"
  ON public.menu_items
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'
    )
  );

-- 5. Allow admins to update menu items (requires SELECT policy too)
CREATE POLICY "Admins can update menu items"
  ON public.menu_items
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'
    )
  );

-- 6. Allow admins to delete menu items
CREATE POLICY "Admins can delete menu items"
  ON public.menu_items
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'
    )
  );

-- 7. Grant access to the Data API roles
GRANT SELECT ON public.menu_items TO anon;
GRANT ALL ON public.menu_items TO authenticated;
