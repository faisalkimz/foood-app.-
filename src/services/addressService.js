/**
 * addressService.js
 * All CRUD operations for user delivery addresses.
 * Uses the Supabase client directly (same pattern as authService / getProfile).
 * Row Level Security ensures users only ever see their own rows.
 */
import { supabase } from './supabase';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Map a DB row → app address object */
function rowToAddress(row) {
  return {
    id: row.id,
    label: row.label,
    icon: row.icon,
    name: row.name,
    street: row.street,
    city: row.city,
    region: row.region,
    country: row.country,
    postalCode: row.postal_code,
    note: row.note,
    latitude: row.latitude,
    longitude: row.longitude,
    isSelected: row.is_selected,
    createdAt: row.created_at,
  };
}

/** Map an app address object → DB insert/update shape */
function addressToRow(addr, userId) {
  const row = {
    label: addr.label || 'Home',
    icon: addr.icon || 'home-outline',
    name: addr.name || '',
    street: addr.street || '',
    city: addr.city || '',
    region: addr.region || '',
    country: addr.country || '',
    postal_code: addr.postalCode || '',
    note: addr.note || '',
    latitude: addr.latitude ?? addr.coords?.latitude ?? null,
    longitude: addr.longitude ?? addr.coords?.longitude ?? null,
    is_selected: addr.isSelected ?? false,
  };
  if (userId) row.user_id = userId;
  return row;
}

// ─── API ─────────────────────────────────────────────────────────────────────

/**
 * Fetch all saved addresses for the current user, ordered by creation date.
 * @returns {Promise<Address[]>}
 */
export async function fetchAddresses() {
  const { data, error } = await supabase
    .from('user_addresses')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data || []).map(rowToAddress);
}

/**
 * Insert a new address for the current user.
 * @param {object} addressData  - app-shaped address object
 * @param {object|null} coords  - { latitude, longitude } from GPS
 * @returns {Promise<Address>}  - the created address
 */
export async function createAddress(addressData, coords = null) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const row = addressToRow(
    { ...addressData, latitude: coords?.latitude, longitude: coords?.longitude },
    user.id
  );

  const { data, error } = await supabase
    .from('user_addresses')
    .insert(row)
    .select()
    .single();

  if (error) throw error;
  return rowToAddress(data);
}

/**
 * Update an existing address.
 * @param {string} id      - address ID
 * @param {object} updates - partial address fields to update
 * @returns {Promise<Address>}
 */
export async function updateAddress(id, updates) {
  const row = addressToRow(updates);

  const { data, error } = await supabase
    .from('user_addresses')
    .update(row)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return rowToAddress(data);
}

/**
 * Delete an address by ID.
 * @param {string} id
 */
export async function deleteAddress(id) {
  const { error } = await supabase
    .from('user_addresses')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

/**
 * Mark one address as selected and deselect all others (for this user).
 * @param {string} id  - the address to select
 */
export async function selectAddressInDB(id) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // Deselect all, then select the one
  const { error: deselectError } = await supabase
    .from('user_addresses')
    .update({ is_selected: false })
    .eq('user_id', user.id);

  if (deselectError) throw deselectError;

  const { error: selectError } = await supabase
    .from('user_addresses')
    .update({ is_selected: true })
    .eq('id', id);

  if (selectError) throw selectError;
}
