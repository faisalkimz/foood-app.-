-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. PROFILES TABLE
-- ==========================================
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    role TEXT CHECK (role IN ('customer', 'chef', 'admin')) DEFAULT 'customer',
    full_name TEXT,
    email TEXT UNIQUE NOT NULL,
    phone_number TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Auto-create profile on signup trigger
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- 2. RESTAURANTS TABLE
-- ==========================================
CREATE TABLE public.restaurants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    chef_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    cuisine TEXT NOT NULL,
    rating NUMERIC(3,2) DEFAULT 0.00,
    delivery_fee NUMERIC(10,2) DEFAULT 0.00,
    free_delivery BOOLEAN DEFAULT false,
    delivery_time INTEGER NOT NULL,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 3. MENU ITEMS TABLE
-- ==========================================
CREATE TABLE public.menu_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL,
    image_url TEXT,
    category TEXT NOT NULL,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 4. ORDERS TABLE
-- ==========================================
CREATE TABLE public.orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    status TEXT CHECK (status IN ('pending', 'accepted', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled')) DEFAULT 'pending',
    total_amount NUMERIC(10,2) NOT NULL,
    delivery_fee NUMERIC(10,2) NOT NULL,
    delivery_address TEXT NOT NULL,
    payment_method TEXT CHECK (payment_method IN ('cash', 'card', 'mobile_money')) NOT NULL,
    payment_status TEXT CHECK (payment_status IN ('pending', 'paid', 'failed')) DEFAULT 'pending',
    transaction_id TEXT,
    special_instructions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 5. ORDER ITEMS TABLE
-- ==========================================
CREATE TABLE public.order_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 6. FAVORITES TABLE
-- ==========================================
CREATE TABLE public.favorites (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CHECK (restaurant_id IS NOT NULL OR menu_item_id IS NOT NULL)
);

-- ==========================================
-- 7. USER_ADDRESSES TABLE
-- ==========================================
CREATE TABLE public.user_addresses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    address_line TEXT NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read everyone, but only update themselves
CREATE POLICY "Profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Restaurants: Viewable by everyone. Only chefs can update their own.
CREATE POLICY "Restaurants are viewable by everyone." ON public.restaurants FOR SELECT USING (true);
CREATE POLICY "Chefs can update own restaurant." ON public.restaurants FOR UPDATE USING (auth.uid() = chef_id);
CREATE POLICY "Chefs can create their own restaurant." ON public.restaurants FOR INSERT WITH CHECK (auth.uid() = chef_id);

-- Menu Items: Viewable by everyone. Chefs manage their own items.
CREATE POLICY "Menu items are viewable by everyone." ON public.menu_items FOR SELECT USING (true);
CREATE POLICY "Chefs can manage their menu items." ON public.menu_items FOR ALL USING (
  auth.uid() IN (SELECT chef_id FROM public.restaurants WHERE id = menu_items.restaurant_id)
);

-- Orders: Customers see/create own. Chefs see/update own restaurant's.
CREATE POLICY "Customers view own orders." ON public.orders FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Customers can insert own orders." ON public.orders FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Chefs view own restaurant orders." ON public.orders FOR SELECT USING (
  auth.uid() IN (SELECT chef_id FROM public.restaurants WHERE id = orders.restaurant_id)
);
CREATE POLICY "Chefs can update own restaurant orders." ON public.orders FOR UPDATE USING (
  auth.uid() IN (SELECT chef_id FROM public.restaurants WHERE id = orders.restaurant_id)
);

-- Order Items: Corresponds to order logic
CREATE POLICY "Customers view own order items." ON public.order_items FOR SELECT USING (
  auth.uid() IN (SELECT customer_id FROM public.orders WHERE id = order_items.order_id)
);
CREATE POLICY "Customers can insert own order items." ON public.order_items FOR INSERT WITH CHECK (
  auth.uid() IN (SELECT customer_id FROM public.orders WHERE id = order_items.order_id)
);
CREATE POLICY "Chefs view own restaurant order items." ON public.order_items FOR SELECT USING (
  auth.uid() IN (
    SELECT r.chef_id FROM public.restaurants r 
    JOIN public.orders o ON o.restaurant_id = r.id 
    WHERE o.id = order_items.order_id
  )
);

-- Favorites
CREATE POLICY "Users manage own favorites." ON public.favorites FOR ALL USING (auth.uid() = customer_id);

-- User Addresses
CREATE POLICY "Users manage own addresses." ON public.user_addresses FOR ALL USING (auth.uid() = customer_id);

-- ==========================================
-- INDEXES
-- ==========================================
CREATE INDEX idx_restaurants_chef ON public.restaurants(chef_id);
CREATE INDEX idx_menu_items_restaurant ON public.menu_items(restaurant_id);
CREATE INDEX idx_orders_customer ON public.orders(customer_id);
CREATE INDEX idx_orders_restaurant ON public.orders(restaurant_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_order_items_order ON public.order_items(order_id);
CREATE INDEX idx_favorites_customer ON public.favorites(customer_id);
CREATE UNIQUE INDEX idx_addresses_single_default ON public.user_addresses(customer_id) WHERE is_default = true;
CREATE UNIQUE INDEX idx_favorites_restaurant ON public.favorites(customer_id, restaurant_id) WHERE restaurant_id IS NOT NULL;
CREATE UNIQUE INDEX idx_favorites_menu_item ON public.favorites(customer_id, menu_item_id) WHERE menu_item_id IS NOT NULL;
