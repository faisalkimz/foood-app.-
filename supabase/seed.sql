-- ============================================================
-- FOODORDER SEED DATA
-- Single user: Mbabali Faisal
-- ID: 15b9c14b-40f6-42bd-b09e-464f8bc59181
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ============================================================
-- STEP 1: Restaurants (all owned by you)
-- ============================================================

INSERT INTO public.restaurants (id, chef_id, name, description, cuisine, rating, delivery_fee, free_delivery, delivery_time, image_url, is_active, phone)
VALUES
  (
    'bbbbbbbb-0001-0001-0001-000000000001',
    '15b9c14b-40f6-42bd-b09e-464f8bc59181',
    'Kampala Kitchen',
    'Authentic Ugandan home cooking. Matooke, posho, groundnut stew — made fresh daily.',
    'Ugandan', 4.8, 3000, false, 25,
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800', true,
    '+256 700 123 456'
  ),
  (
    'bbbbbbbb-0001-0001-0001-000000000002',
    '15b9c14b-40f6-42bd-b09e-464f8bc59181',
    'Rolex Palace',
    'Famous Ugandan street food — rolex, chips, and more. Quick bites done right.',
    'Street Food', 4.5, 2000, false, 15,
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800', true,
    '+256 770 987 654'
  ),
  (
    'bbbbbbbb-0001-0001-0001-000000000003',
    '15b9c14b-40f6-42bd-b09e-464f8bc59181',
    'Nile Grill',
    'Grilled tilapia, nyama choma, and smoked meats from the shores of Lake Victoria.',
    'Grill & BBQ', 4.6, 4000, false, 35,
    'https://images.unsplash.com/photo-1544025162-d76694265947?w=800', true,
    '+256 772 345 678'
  ),
  (
    'bbbbbbbb-0001-0001-0001-000000000004',
    '15b9c14b-40f6-42bd-b09e-464f8bc59181',
    'Boda Bites',
    'Fast delivery, faster food. Burgers, wraps, and snacks for when you''re on the move.',
    'Fast Food', 4.2, 1500, true, 20,
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800', true,
    '+256 701 234 567'
  ),
  (
    'bbbbbbbb-0001-0001-0001-000000000005',
    '15b9c14b-40f6-42bd-b09e-464f8bc59181',
    'Mama''s Pilau House',
    'Rich, spiced pilau rice, biryani, and samosas. Swahili coast flavors in every bite.',
    'Swahili', 4.7, 2500, false, 30,
    'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800', true,
    '+256 775 678 901'
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- STEP 2: Menu Items
-- ============================================================

INSERT INTO public.menu_items (id, restaurant_id, name, description, price, image_url, category, is_available)
VALUES
  -- Kampala Kitchen
  ('cccccccc-0001-0001-0001-000000000001', 'bbbbbbbb-0001-0001-0001-000000000001',
   'Matooke & Groundnut Stew', 'Steamed green bananas with rich peanut-based stew and smoked fish.', 12000,
   'https://images.unsplash.com/photo-1512058454905-6b841e7ad132?w=800', 'Main', true),
  ('cccccccc-0001-0001-0001-000000000002', 'bbbbbbbb-0001-0001-0001-000000000001',
   'Posho & Beans', 'White maize flour ugali with slow-cooked kidney beans.', 8000,
   'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800', 'Main', true),
  ('cccccccc-0001-0001-0001-000000000003', 'bbbbbbbb-0001-0001-0001-000000000001',
   'Luwombo (Chicken)', 'Tender chicken steamed in banana leaves with groundnuts and mushrooms.', 18000,
   'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=800', 'Main', true),
  ('cccccccc-0001-0001-0001-000000000004', 'bbbbbbbb-0001-0001-0001-000000000001',
   'Mandazi', 'Freshly fried East African doughnuts — crispy outside, soft inside.', 3000,
   'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=800', 'Snack', true),
  ('cccccccc-0001-0001-0001-000000000005', 'bbbbbbbb-0001-0001-0001-000000000001',
   'Fresh Passion Juice', 'Cold-pressed passion fruit juice, slightly sweetened.', 4000,
   'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=800', 'Drink', true),

  -- Rolex Palace
  ('cccccccc-0001-0001-0001-000000000006', 'bbbbbbbb-0001-0001-0001-000000000002',
   'Classic Rolex', 'Chapati rolled with eggs, veggies, and hot sauce. The Ugandan icon.', 5000,
   'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800', 'Main', true),
  ('cccccccc-0001-0001-0001-000000000007', 'bbbbbbbb-0001-0001-0001-000000000002',
   'Chicken Rolex', 'Chapati with egg, shredded chicken, cabbage and pepper sauce.', 8000,
   'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800', 'Main', true),
  ('cccccccc-0001-0001-0001-000000000008', 'bbbbbbbb-0001-0001-0001-000000000002',
   'Chips Mwitu', 'Street-style fried chips with egg and kachumbari salsa.', 6000,
   'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800', 'Sides', true),
  ('cccccccc-0001-0001-0001-000000000009', 'bbbbbbbb-0001-0001-0001-000000000002',
   'Samosa (3 pcs)', 'Crispy golden samosas filled with spiced beef or veggie.', 4500,
   'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800', 'Snack', true),

  -- Nile Grill
  ('cccccccc-0001-0001-0001-000000000010', 'bbbbbbbb-0001-0001-0001-000000000003',
   'Grilled Tilapia', 'Whole tilapia grilled over charcoal, served with chips and kachumbari.', 22000,
   'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800', 'Main', true),
  ('cccccccc-0001-0001-0001-000000000011', 'bbbbbbbb-0001-0001-0001-000000000003',
   'Nyama Choma (500g)', 'Slow-grilled goat meat, seasoned with rock salt and rosemary.', 25000,
   'https://images.unsplash.com/photo-1544025162-d76694265947?w=800', 'Main', true),
  ('cccccccc-0001-0001-0001-000000000012', 'bbbbbbbb-0001-0001-0001-000000000003',
   'Chicken Wings (6 pcs)', 'Smoky BBQ wings with a side of piri-piri dipping sauce.', 16000,
   'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=800', 'Main', true),
  ('cccccccc-0001-0001-0001-000000000013', 'bbbbbbbb-0001-0001-0001-000000000003',
   'Kachumbari Salad', 'Tomato, red onion, coriander and chilli — the perfect grill side.', 5000,
   'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800', 'Sides', true),
  ('cccccccc-0001-0001-0001-000000000014', 'bbbbbbbb-0001-0001-0001-000000000003',
   'Nile Beer (500ml)', 'Ice cold Nile Special lager.', 6000,
   'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=800', 'Drink', true),

  -- Boda Bites
  ('cccccccc-0001-0001-0001-000000000015', 'bbbbbbbb-0001-0001-0001-000000000004',
   'Smash Burger', 'Double smash patty, American cheese, pickles, special sauce.', 18000,
   'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800', 'Main', true),
  ('cccccccc-0001-0001-0001-000000000016', 'bbbbbbbb-0001-0001-0001-000000000004',
   'Chicken Wrap', 'Crispy chicken, lettuce, tomato, garlic mayo in a flour tortilla.', 14000,
   'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800', 'Main', true),
  ('cccccccc-0001-0001-0001-000000000017', 'bbbbbbbb-0001-0001-0001-000000000004',
   'Loaded Fries', 'Crispy fries topped with cheese sauce, jalapeños, and pulled chicken.', 12000,
   'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800', 'Sides', true),
  ('cccccccc-0001-0001-0001-000000000018', 'bbbbbbbb-0001-0001-0001-000000000004',
   'Mango Smoothie', 'Thick mango blend with a hint of ginger.', 7000,
   'https://images.unsplash.com/photo-1546173159-315724a31696?w=800', 'Drink', true),

  -- Mama's Pilau House
  ('cccccccc-0001-0001-0001-000000000019', 'bbbbbbbb-0001-0001-0001-000000000005',
   'Pilau Rice (Chicken)', 'Fragrant spiced rice with whole chicken pieces, topped with fried onions.', 15000,
   'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800', 'Main', true),
  ('cccccccc-0001-0001-0001-000000000020', 'bbbbbbbb-0001-0001-0001-000000000005',
   'Beef Biryani', 'Slow-cooked basmati with tender beef, saffron and yogurt.', 18000,
   'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800', 'Main', true),
  ('cccccccc-0001-0001-0001-000000000021', 'bbbbbbbb-0001-0001-0001-000000000005',
   'Samosa Chaat (4 pcs)', 'Crispy samosas topped with tamarind chutney and yogurt sauce.', 8000,
   'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800', 'Snack', true),
  ('cccccccc-0001-0001-0001-000000000022', 'bbbbbbbb-0001-0001-0001-000000000005',
   'Chai Tea', 'Spiced milk tea with cardamom, ginger and cinnamon.', 3500,
   'https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?w=800', 'Drink', true)

ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- STEP 3: Orders
-- ============================================================

INSERT INTO public.orders (id, customer_id, restaurant_id, status, total_amount, delivery_fee, delivery_address, payment_method, payment_status, created_at)
VALUES
  ('dddddddd-0001-0001-0001-000000000001',
   '15b9c14b-40f6-42bd-b09e-464f8bc59181', 'bbbbbbbb-0001-0001-0001-000000000001',
   'delivered', 33000, 3000, 'Acholi Road, Gulu', 'cash', 'paid',
   NOW() - INTERVAL '5 days'),

  ('dddddddd-0001-0001-0001-000000000002',
   '15b9c14b-40f6-42bd-b09e-464f8bc59181', 'bbbbbbbb-0001-0001-0001-000000000002',
   'delivered', 15500, 2000, 'Acholi Road, Gulu', 'mobile_money', 'paid',
   NOW() - INTERVAL '3 days'),

  ('dddddddd-0001-0001-0001-000000000003',
   '15b9c14b-40f6-42bd-b09e-464f8bc59181', 'bbbbbbbb-0001-0001-0001-000000000004',
   'delivered', 31500, 1500, 'Acholi Road, Gulu', 'cash', 'paid',
   NOW() - INTERVAL '1 day'),

  ('dddddddd-0001-0001-0001-000000000004',
   '15b9c14b-40f6-42bd-b09e-464f8bc59181', 'bbbbbbbb-0001-0001-0001-000000000005',
   'preparing', 36500, 2500, 'Acholi Road, Gulu', 'cash', 'pending',
   NOW() - INTERVAL '20 minutes')

ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- STEP 4: Order Items
-- ============================================================

INSERT INTO public.order_items (order_id, menu_item_id, name, quantity, unit_price)
VALUES
  ('dddddddd-0001-0001-0001-000000000001', 'cccccccc-0001-0001-0001-000000000001', 'Rolex Special', 2, 12000),
  ('dddddddd-0001-0001-0001-000000000001', 'cccccccc-0001-0001-0001-000000000005', 'Fresh Juice', 1, 4000),
  ('dddddddd-0001-0001-0001-000000000002', 'cccccccc-0001-0001-0001-000000000007', 'Mega Beef Burger', 1, 8000),
  ('dddddddd-0001-0001-0001-000000000002', 'cccccccc-0001-0001-0001-000000000008', 'Chicken Burger', 1, 6000),
  ('dddddddd-0001-0001-0001-000000000002', 'cccccccc-0001-0001-0001-000000000009', 'Chips & Sausage', 1, 4500),
  ('dddddddd-0001-0001-0001-000000000003', 'cccccccc-0001-0001-0001-000000000015', 'Whole Tilapia', 1, 18000),
  ('dddddddd-0001-0001-0001-000000000003', 'cccccccc-0001-0001-0001-000000000017', 'Groundnut Sauce', 1, 12000),
  ('dddddddd-0001-0001-0001-000000000004', 'cccccccc-0001-0001-0001-000000000019', 'Pilau Chicken', 2, 15000),
  ('dddddddd-0001-0001-0001-000000000004', 'cccccccc-0001-0001-0001-000000000022', 'Samosa (Beef)', 2, 3500)
ON CONFLICT DO NOTHING;

-- ============================================================
-- STEP 5: Favorites
-- ============================================================

INSERT INTO public.favorites (customer_id, restaurant_id)
VALUES
  ('15b9c14b-40f6-42bd-b09e-464f8bc59181', 'bbbbbbbb-0001-0001-0001-000000000001'),
  ('15b9c14b-40f6-42bd-b09e-464f8bc59181', 'bbbbbbbb-0001-0001-0001-000000000003')
ON CONFLICT DO NOTHING;

-- ============================================================
-- Check counts
-- ============================================================
SELECT 'Restaurants' as table_name, COUNT(*) FROM public.restaurants
UNION ALL SELECT 'Menu Items', COUNT(*) FROM public.menu_items
UNION ALL SELECT 'Orders', COUNT(*) FROM public.orders
UNION ALL SELECT 'Order Items', COUNT(*) FROM public.order_items
UNION ALL SELECT 'Favorites', COUNT(*) FROM public.favorites;
