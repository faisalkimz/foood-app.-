-- ============================================================
-- MIGRATION 3: Fix RLS policies for order placement + Realtime
-- Run in: Supabase Dashboard → SQL Editor → New query → Run
-- ============================================================

-- 1. Allow customers to INSERT order_items for their own orders
CREATE POLICY "Customer inserts order items" ON public.order_items
  FOR INSERT WITH CHECK (
    order_id IN (
      SELECT id FROM public.orders WHERE customer_id = auth.uid()
    )
  );

-- 2. Allow chefs to read order_items for their restaurant orders
CREATE POLICY "Chef reads order items" ON public.order_items
  FOR SELECT USING (
    order_id IN (
      SELECT id FROM public.orders
      WHERE restaurant_id IN (
        SELECT id FROM public.restaurants WHERE chef_id = auth.uid()
      )
    )
  );

-- 3. Enable Supabase Realtime on the orders table
-- This lets the customer's tracking screen update live when chef changes status
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;

-- 4. Allow customers to INSERT orders
DROP POLICY IF EXISTS "Customer creates orders" ON public.orders;
CREATE POLICY "Customer creates orders" ON public.orders
  FOR INSERT WITH CHECK (customer_id = auth.uid());

-- 5. Allow chefs to UPDATE orders (status changes)
DROP POLICY IF EXISTS "Chef updates orders" ON public.orders;
CREATE POLICY "Chef updates orders" ON public.orders
  FOR UPDATE USING (
    restaurant_id IN (
      SELECT id FROM public.restaurants WHERE chef_id = auth.uid()
    )
  );
