-- ============================================================
-- MIGRATION 1: user_addresses table
-- Run in: Supabase Dashboard → SQL Editor → New query → Run
-- ============================================================

CREATE TABLE IF NOT EXISTS public.user_addresses (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  label         text NOT NULL DEFAULT 'Home',
  icon          text NOT NULL DEFAULT 'home-outline',
  name          text NOT NULL DEFAULT '',
  street        text NOT NULL DEFAULT '',
  city          text NOT NULL DEFAULT '',
  region        text NOT NULL DEFAULT '',
  country       text NOT NULL DEFAULT '',
  postal_code   text NOT NULL DEFAULT '',
  note          text NOT NULL DEFAULT '',
  latitude      double precision,
  longitude     double precision,
  is_selected   boolean NOT NULL DEFAULT false,
  created_at    timestamptz DEFAULT now() NOT NULL,
  updated_at    timestamptz DEFAULT now() NOT NULL
);

-- Index for fast user lookups
CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON public.user_addresses(user_id);

-- Row Level Security
ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;

-- Users can only see/manage their own addresses
CREATE POLICY "Users manage their own addresses"
  ON public.user_addresses
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Auto-update updated_at on changes
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_address_updated ON public.user_addresses;
CREATE TRIGGER on_address_updated
  BEFORE UPDATE ON public.user_addresses
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


-- ============================================================
-- MIGRATION 2: restaurants, menu_items, orders, order_items
-- Run AFTER migration 1 (or in the same query, both together)
-- ============================================================

-- 1. Extend the restaurants table with missing columns
ALTER TABLE public.restaurants
  ADD COLUMN IF NOT EXISTS image_url      text DEFAULT '',
  ADD COLUMN IF NOT EXISTS description    text DEFAULT '',
  ADD COLUMN IF NOT EXISTS delivery_fee   decimal(10,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS min_order      decimal(10,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS address        text DEFAULT '',
  ADD COLUMN IF NOT EXISTS phone          text DEFAULT '',
  ADD COLUMN IF NOT EXISTS opening_hours  text DEFAULT '08:00 - 22:00',
  ADD COLUMN IF NOT EXISTS updated_at     timestamptz DEFAULT now();

-- 2. menu_items table
CREATE TABLE IF NOT EXISTS public.menu_items (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id uuid REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
  name          text NOT NULL,
  description   text DEFAULT '',
  price         decimal(10,2) NOT NULL DEFAULT 0,
  image_url     text DEFAULT '',
  category      text DEFAULT 'Main',
  is_available  boolean DEFAULT true NOT NULL,
  created_at    timestamptz DEFAULT now() NOT NULL,
  updated_at    timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant ON public.menu_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_available  ON public.menu_items(restaurant_id, is_available);

ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

-- Everyone can read menu items
CREATE POLICY "Public read menu items" ON public.menu_items
  FOR SELECT USING (true);

-- Only the owning chef can manage their menu items
CREATE POLICY "Chef manages own menu items" ON public.menu_items
  FOR ALL USING (
    restaurant_id IN (
      SELECT id FROM public.restaurants WHERE chef_id = auth.uid()
    )
  );

-- 3. Extend orders table
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS customer_id     uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS restaurant_id   uuid REFERENCES public.restaurants(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS status          text DEFAULT 'pending'
    CHECK (status IN ('pending','confirmed','preparing','ready','delivering','delivered','cancelled')),
  ADD COLUMN IF NOT EXISTS delivery_address jsonb,
  ADD COLUMN IF NOT EXISTS subtotal        decimal(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS delivery_fee    decimal(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS notes           text DEFAULT '',
  ADD COLUMN IF NOT EXISTS created_at      timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at      timestamptz DEFAULT now();

-- 4. order_items table
CREATE TABLE IF NOT EXISTS public.order_items (
  id             uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id       uuid REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  menu_item_id   uuid REFERENCES public.menu_items(id) ON DELETE SET NULL,
  name           text NOT NULL,
  image_url      text DEFAULT '',
  unit_price     decimal(10,2) NOT NULL,
  quantity       int NOT NULL DEFAULT 1,
  subtotal       decimal(10,2) GENERATED ALWAYS AS (unit_price * quantity) STORED
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Order item access" ON public.order_items
  FOR SELECT USING (
    order_id IN (
      SELECT id FROM public.orders
      WHERE customer_id = auth.uid()
         OR restaurant_id IN (
           SELECT id FROM public.restaurants WHERE chef_id = auth.uid()
         )
    )
  );

-- 5. RLS on orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Order access" ON public.orders;
CREATE POLICY "Order access" ON public.orders
  FOR ALL USING (
    customer_id = auth.uid()
    OR restaurant_id IN (
      SELECT id FROM public.restaurants WHERE chef_id = auth.uid()
    )
  );

-- 6. RLS on restaurants (public read for active ones)
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read restaurants" ON public.restaurants;
CREATE POLICY "Public read restaurants" ON public.restaurants
  FOR SELECT USING (is_active = true OR chef_id = auth.uid());

DROP POLICY IF EXISTS "Chef manages own restaurant" ON public.restaurants;
CREATE POLICY "Chef manages own restaurant" ON public.restaurants
  FOR ALL USING (chef_id = auth.uid());

-- ============================================================
-- MIGRATION 6: push_token column on profiles
-- ============================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS push_token text DEFAULT '';
