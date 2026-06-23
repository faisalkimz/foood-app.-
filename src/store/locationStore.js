/**
 * locationStore.js
 * Manages delivery addresses backed by Supabase (source of truth)
 * + AsyncStorage as an offline cache.
 *
 * Flow:
 *  1. App starts → initialize() loads cache from AsyncStorage instantly
 *  2. Then fetches fresh data from Supabase and replaces cache
 *  3. All mutations (add/update/delete/select) write to Supabase first, then update local state
 */
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  fetchAddresses,
  createAddress,
  updateAddress as updateAddressInDB,
  deleteAddress,
  selectAddressInDB,
} from '../services/addressService';

const CACHE_KEY = '@foodorder_addresses_v3';

export const useLocationStore = create((set, get) => ({
  /** All saved delivery addresses (from Supabase) */
  savedAddresses: [],

  /** ID of the currently selected delivery address */
  selectedAddressId: null,

  /** GPS coords of selected address (for restaurant proximity, etc.) */
  coords: null,

  /** True while fetching from Supabase */
  isSyncing: false,

  /** True if Supabase data has been loaded at least once */
  isLoaded: false,

  // ─── Derived (computed in component via store selectors) ─────────────────

  /** True once at least one address exists */
  get isLocationSet() {
    return get().savedAddresses.length > 0;
  },

  // ─── Cache helpers ────────────────────────────────────────────────────────

  _saveCache: async () => {
    const { savedAddresses, selectedAddressId, coords } = get();
    try {
      await AsyncStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ savedAddresses, selectedAddressId, coords })
      );
    } catch { /* non-critical */ }
  },

  _loadCache: async () => {
    try {
      const raw = await AsyncStorage.getItem(CACHE_KEY);
      if (raw) {
        const { savedAddresses, selectedAddressId, coords } = JSON.parse(raw);
        set({ savedAddresses: savedAddresses || [], selectedAddressId, coords });
      }
    } catch { /* ignore */ }
  },

  // ─── Initialize (call once on app start, after user is authenticated) ─────

  initialize: async () => {
    // 1. Show cached data immediately (feels instant)
    await get()._loadCache();

    // 2. Fetch fresh from Supabase
    set({ isSyncing: true });
    try {
      const addresses = await fetchAddresses();
      const selected = addresses.find((a) => a.isSelected);
      const selectedId = selected?.id || addresses[0]?.id || null;
      const coords = selected
        ? { latitude: selected.latitude, longitude: selected.longitude }
        : null;

      set({
        savedAddresses: addresses,
        selectedAddressId: selectedId,
        coords,
        isLoaded: true,
      });

      // Update cache with fresh data
      await get()._saveCache();
    } catch {
      // Supabase unavailable — keep using cache
    } finally {
      set({ isSyncing: false });
    }
  },

  // ─── Address CRUD (all write to Supabase first) ───────────────────────────

  /**
   * Add a new delivery address and optionally select it.
   * @param {object} addressData - { label, icon, name, street, city, region, country, postalCode, note }
   * @param {object|null} coords - { latitude, longitude } from GPS
   * @param {boolean} select     - whether to select this address immediately
   */
  addAddress: async (addressData, coords = null, select = true) => {
    try {
      const created = await createAddress(addressData, coords);

      // If this is the first or selected address, mark it in DB
      const { savedAddresses } = get();
      const shouldSelect = select || savedAddresses.length === 0;

      if (shouldSelect) {
        await selectAddressInDB(created.id);
        created.isSelected = true;
      }

      set((state) => ({
        savedAddresses: [...state.savedAddresses, created],
        selectedAddressId: shouldSelect ? created.id : state.selectedAddressId,
        coords: shouldSelect ? coords : state.coords,
      }));

      await get()._saveCache();
      return created;
    } catch (err) {
      throw new Error(err.message || 'Failed to save address.');
    }
  },

  /**
   * Update an existing address.
   */
  updateAddress: async (id, updates) => {
    try {
      const updated = await updateAddressInDB(id, updates);

      set((state) => ({
        savedAddresses: state.savedAddresses.map((a) => (a.id === id ? updated : a)),
      }));

      await get()._saveCache();
      return updated;
    } catch (err) {
      throw new Error(err.message || 'Failed to update address.');
    }
  },

  /**
   * Delete an address. If it was selected, auto-selects the next available one.
   */
  removeAddress: async (id) => {
    try {
      await deleteAddress(id);

      const { savedAddresses, selectedAddressId } = get();
      const remaining = savedAddresses.filter((a) => a.id !== id);

      let newSelectedId = selectedAddressId;
      let newCoords = get().coords;

      if (selectedAddressId === id) {
        const next = remaining[0] || null;
        newSelectedId = next?.id || null;
        newCoords = next ? { latitude: next.latitude, longitude: next.longitude } : null;
        if (next) await selectAddressInDB(next.id);
      }

      set({ savedAddresses: remaining, selectedAddressId: newSelectedId, coords: newCoords });
      await get()._saveCache();
    } catch (err) {
      throw new Error(err.message || 'Failed to delete address.');
    }
  },

  /**
   * Select a saved address as the active delivery location.
   */
  selectAddress: async (id) => {
    try {
      await selectAddressInDB(id);

      const addr = get().savedAddresses.find((a) => a.id === id);
      const coords =
        addr?.latitude != null
          ? { latitude: addr.latitude, longitude: addr.longitude }
          : null;

      set((state) => ({
        selectedAddressId: id,
        coords,
        savedAddresses: state.savedAddresses.map((a) => ({ ...a, isSelected: a.id === id })),
      }));

      await get()._saveCache();
    } catch (err) {
      throw new Error(err.message || 'Failed to select address.');
    }
  },

  /**
   * Legacy helper used by location.js onboarding screen.
   * Adds address as "Home" and selects it if none exist.
   */
  setLocation: async (addressData, coords) => {
    const { savedAddresses } = get();
    const homeData = {
      ...addressData,
      label: savedAddresses.length === 0 ? 'Home' : (addressData.label || 'Home'),
      icon: savedAddresses.length === 0 ? 'home-outline' : (addressData.icon || 'home-outline'),
    };
    await get().addAddress(homeData, coords, true);
  },

  /** Clear all local state (call on logout) */
  clearLocation: async () => {
    set({ savedAddresses: [], selectedAddressId: null, coords: null, isLoaded: false });
    try { await AsyncStorage.removeItem(CACHE_KEY); } catch {}
  },
}));
