/**
 * restaurantService.js
 * All data fetching for restaurants and menu items.
 * Uses the Supabase anon client — reads are public (active restaurants only via RLS).
 */
import { supabase } from './supabase';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function rowToRestaurant(row) {
  return {
    id: row.id,
    chefId: row.chef_id,
    name: row.name || 'Unnamed Restaurant',
    cuisine: row.cuisine || 'Various',
    description: row.description || '',
    rating: row.rating || 0,
    deliveryTime: row.delivery_time || 30,
    deliveryFee: parseFloat(row.delivery_fee || 0),
    freeDelivery: parseFloat(row.delivery_fee || 0) === 0,
    minOrder: parseFloat(row.min_order || 0),
    image: row.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
    address: row.address || '',
    phone: row.phone || '',
    openingHours: row.opening_hours || '08:00 - 22:00',
    isActive: row.is_active,
  };
}

function rowToMenuItem(row) {
  return {
    id: row.id,
    restaurantId: row.restaurant_id,
    name: row.name,
    description: row.description || '',
    price: parseFloat(row.price),
    image: row.image_url || 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300',
    category: row.category || 'Main',
    isAvailable: row.is_available,
  };
}

// ─── Customer-facing ─────────────────────────────────────────────────────────

/**
 * Fetch all active restaurants.
 */
export async function fetchRestaurants() {
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('is_active', true)
    .order('rating', { ascending: false });

  if (error) throw error;
  return (data || []).map(rowToRestaurant);
}

/**
 * Fetch a single restaurant by ID.
 */
export async function fetchRestaurant(id) {
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return rowToRestaurant(data);
}

/**
 * Fetch all available menu items for a restaurant.
 */
export async function fetchMenuItems(restaurantId) {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .eq('is_available', true)
    .order('category')
    .order('name');

  if (error) throw error;
  return (data || []).map(rowToMenuItem);
}

// ─── Chef-facing ─────────────────────────────────────────────────────────────

/**
 * Fetch the restaurant owned by the current chef.
 */
export async function fetchMyRestaurant() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('chef_id', user.id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null; // Chef has no restaurant yet
  return rowToRestaurant(data);
}

/**
 * Create or update the chef's restaurant info.
 * If the chef has no restaurant yet, inserts a new one.
 */
export async function updateMyRestaurant(updates) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const row = {};
  if (updates.name !== undefined)         row.name = updates.name;
  if (updates.cuisine !== undefined)      row.cuisine = updates.cuisine;
  if (updates.description !== undefined)  row.description = updates.description;
  if (updates.deliveryTime !== undefined) row.delivery_time = updates.deliveryTime;
  if (updates.deliveryFee !== undefined)  row.delivery_fee = updates.deliveryFee;
  if (updates.minOrder !== undefined)     row.min_order = updates.minOrder;
  if (updates.image !== undefined)        row.image_url = updates.image;
  if (updates.address !== undefined)      row.address = updates.address;
  if (updates.phone !== undefined)        row.phone = updates.phone;
  if (updates.openingHours !== undefined) row.opening_hours = updates.openingHours;
  if (updates.isActive !== undefined)     row.is_active = updates.isActive;

  // Check if restaurant exists
  const existing = await fetchMyRestaurant();

  if (existing) {
    // Update existing
    const { data, error } = await supabase
      .from('restaurants')
      .update(row)
      .eq('chef_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return rowToRestaurant(data);
  } else {
    // Create new restaurant for this chef
    row.chef_id = user.id;
    if (!row.name) row.name = updates.name || 'My Restaurant';

    const { data, error } = await supabase
      .from('restaurants')
      .insert(row)
      .select()
      .single();

    if (error) throw error;
    return rowToRestaurant(data);
  }
}

/**
 * Fetch ALL menu items for the chef's restaurant (including unavailable).
 */
export async function fetchMyMenuItems() {
  const restaurant = await fetchMyRestaurant();
  if (!restaurant) return { restaurant: null, items: [] };

  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('restaurant_id', restaurant.id)
    .order('category')
    .order('name');

  if (error) throw error;
  return { restaurant, items: (data || []).map(rowToMenuItem) };
}

/**
 * Add a new menu item.
 */
export async function addMenuItem(restaurantId, item) {
  const { data, error } = await supabase
    .from('menu_items')
    .insert({
      restaurant_id: restaurantId,
      name: item.name,
      description: item.description || '',
      price: parseFloat(item.price),
      image_url: item.image || '',
      category: item.category || 'Main',
      is_available: item.isAvailable ?? true,
    })
    .select()
    .single();

  if (error) throw error;
  return rowToMenuItem(data);
}

/**
 * Update a menu item.
 */
export async function updateMenuItem(id, updates) {
  const row = {};
  if (updates.name !== undefined)        row.name = updates.name;
  if (updates.description !== undefined) row.description = updates.description;
  if (updates.price !== undefined)       row.price = parseFloat(updates.price);
  if (updates.image !== undefined)       row.image_url = updates.image;
  if (updates.category !== undefined)    row.category = updates.category;
  if (updates.isAvailable !== undefined) row.is_available = updates.isAvailable;

  const { data, error } = await supabase
    .from('menu_items')
    .update(row)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return rowToMenuItem(data);
}

/**
 * Delete a menu item.
 */
export async function deleteMenuItem(id) {
  const { error } = await supabase.from('menu_items').delete().eq('id', id);
  if (error) throw error;
}

// ─── Orders (chef-facing) ─────────────────────────────────────────────────────

/**
 * Fetch all orders for the chef's restaurant with their items.
 */
export async function fetchMyOrders(status = null) {
  const restaurant = await fetchMyRestaurant();
  if (!restaurant) return [];

  let query = supabase
    .from('orders')
    .select(`
      *,
      order_items ( id, name, image_url, unit_price, quantity ),
      profiles:customer_id ( full_name, avatar_url, phone_number )
    `)
    .eq('restaurant_id', restaurant.id)
    .order('created_at', { ascending: false });

  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) throw error;

  return (data || []).map((o) => ({
    id: o.id,
    status: o.status || 'pending',
    customer: o.profiles?.full_name || 'Customer',
    customerImage: o.profiles?.avatar_url || null,
    customerPhone: o.profiles?.phone_number || '',
    items: (o.order_items || []).map((i) => ({
      name: i.name,
      qty: i.quantity,
      price: i.unit_price,
      image: i.image_url,
    })),
    total: parseFloat(o.total_amount || 0),
    subtotal: parseFloat(o.subtotal || 0),
    deliveryFee: parseFloat(o.delivery_fee || 0),
    address: o.delivery_address
      ? [o.delivery_address.name, o.delivery_address.street, o.delivery_address.city]
          .filter(Boolean).join(', ')
      : '',
    notes: o.notes || '',
    createdAt: o.created_at,
  }));
}

/**
 * Update order status.
 */
export async function updateOrderStatus(orderId, status) {
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId);
  if (error) throw error;
}

/**
 * Fetch chef stats (today orders, revenue, rating).
 */
export async function fetchChefStats() {
  const restaurant = await fetchMyRestaurant();
  if (!restaurant) return { todayOrders: 0, todayRevenue: 0, activeOrders: 0, avgRating: 0 };
  const today = new Date().toISOString().split('T')[0];

  const [{ data: todayOrders }, { data: allOrders }] = await Promise.all([
    supabase
      .from('orders')
      .select('total_amount, status')
      .eq('restaurant_id', restaurant.id)
      .gte('created_at', `${today}T00:00:00`)
      .neq('status', 'cancelled'),
    supabase
      .from('orders')
      .select('total_amount, status')
      .eq('restaurant_id', restaurant.id)
      .neq('status', 'cancelled'),
  ]);

  const todayRevenue = (todayOrders || []).reduce((s, o) => s + parseFloat(o.total_amount || 0), 0);
  const activeOrders = (todayOrders || []).filter((o) => ['confirmed','preparing','ready'].includes(o.status)).length;

  return {
    todayOrders: (todayOrders || []).length,
    todayRevenue,
    activeOrders,
    avgRating: restaurant.rating,
  };
}
