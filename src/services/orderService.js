/**
 * orderService.js
 * Customer-facing order operations against Supabase.
 */
import { supabase } from './supabase';

/**
 * Place a new order.
 * @param {{ restaurantId, items: [{ id, name, image, price, quantity }], deliveryAddress, notes, deliveryFee }} payload
 * @returns The created order ID
 */
export async function placeOrder({ restaurantId, items, deliveryAddress, notes = '', deliveryFee = 0 }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const total = subtotal + deliveryFee;

  // 1. Insert order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      customer_id: user.id,
      restaurant_id: restaurantId,
      status: 'pending',
      delivery_address: deliveryAddress || null,
      subtotal,
      delivery_fee: deliveryFee,
      total_amount: total,
      notes,
    })
    .select()
    .single();

  if (orderError) throw orderError;

  // 2. Insert order items
  const orderItems = items.map((i) => ({
    order_id: order.id,
    menu_item_id: i.id || null,
    name: i.name,
    image_url: i.image || '',
    unit_price: i.price,
    quantity: i.quantity,
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);

  if (itemsError) throw itemsError;

  return order.id;
}

/**
 * Fetch customer's orders (both ongoing and history).
 */
export async function fetchMyOrders() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items ( id, name, image_url, unit_price, quantity ),
      restaurants ( id, name, image_url, cuisine )
    `)
    .eq('customer_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map((o) => ({
    id: o.id,
    restaurant: o.restaurants?.name || 'Restaurant',
    restaurantId: o.restaurants?.id || o.restaurant_id,
    restaurantImage: o.restaurants?.image_url || null,
    status: mapStatus(o.status),
    statusRaw: o.status,
    total: parseFloat(o.total_amount || 0),
    items: (o.order_items || []).map((i) => ({
      name: i.name,
      qty: i.quantity,
      price: parseFloat(i.unit_price),
      image: i.image_url,
    })),
    itemCount: `${(o.order_items || []).reduce((s, i) => s + i.quantity, 0)} Items`,
    date: formatDate(o.created_at),
    orderId: `#${o.id.slice(-6).toUpperCase()}`,
    address: o.delivery_address
      ? [o.delivery_address.name, o.delivery_address.street, o.delivery_address.city]
          .filter(Boolean).join(', ')
      : '',
    notes: o.notes || '',
    createdAt: o.created_at,
  }));
}

/**
 * Fetch a single order by ID (for tracking).
 */
export async function fetchOrder(orderId) {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items ( id, name, image_url, unit_price, quantity ),
      restaurants ( id, name, image_url, cuisine, address, phone )
    `)
    .eq('id', orderId)
    .single();

  if (error) throw error;

  return {
    id: data.id,
    status: data.status,
    restaurant: {
      id: data.restaurants?.id,
      name: data.restaurants?.name || 'Restaurant',
      image: data.restaurants?.image_url || null,
      address: data.restaurants?.address || '',
      phone: data.restaurants?.phone || '',
    },
    items: (data.order_items || []).map((i) => ({
      name: i.name,
      qty: i.quantity,
      price: parseFloat(i.unit_price),
      image: i.image_url,
    })),
    total: parseFloat(data.total_amount || 0),
    subtotal: parseFloat(data.subtotal || 0),
    deliveryFee: parseFloat(data.delivery_fee || 0),
    address: data.delivery_address
      ? [data.delivery_address.name, data.delivery_address.street, data.delivery_address.city]
          .filter(Boolean).join(', ')
      : '',
    notes: data.notes || '',
    createdAt: data.created_at,
  };
}

/**
 * Cancel an order.
 */
export async function cancelOrder(orderId) {
  const { error } = await supabase
    .from('orders')
    .update({ status: 'cancelled' })
    .eq('id', orderId);
  if (error) throw error;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function mapStatus(raw) {
  const map = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    preparing: 'Preparing',
    ready: 'Ready',
    delivering: 'On the way',
    delivered: 'Completed',
    cancelled: 'Cancelled',
  };
  return map[raw] || raw;
}

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'pm' : 'am';
  return `${d.getDate()} ${months[d.getMonth()]}, ${h % 12 || 12}:${m}${ampm}`;
}
