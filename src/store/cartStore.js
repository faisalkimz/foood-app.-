import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEY = '@foodorder_cart_v4';
const SCHEMA_VERSION = 2;

export const useCartStore = create((set, get) => ({
  items: [],
  restaurantId: null,

  _saveCache: async () => {
    const { items, restaurantId } = get();
    try {
      await AsyncStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ _version: SCHEMA_VERSION, items, restaurantId })
      );
    } catch { /* non-critical */ }
  },

  _loadCache: async () => {
    try {
      const raw = await AsyncStorage.getItem(CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed._version === SCHEMA_VERSION) {
          set({ items: parsed.items || [], restaurantId: parsed.restaurantId || null });
        }
      }
    } catch { /* ignore */ }
  },

  addItem: (item) => {
    const { items, restaurantId } = get();
    const qty = item.quantity || 1;

    if (restaurantId && restaurantId !== item.restaurantId) {
      return { error: 'Cart contains items from another restaurant' };
    }

    const existing = items.find((i) => i.id === item.id);
    if (existing) {
      set({
        items: items.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + qty } : i
        ),
        restaurantId: item.restaurantId,
      });
    } else {
      set({
        items: [...items, { ...item, quantity: qty }],
        restaurantId: item.restaurantId,
      });
    }
    get()._saveCache();
    return { error: null };
  },

  removeItem: (id) => {
    const items = get().items.filter((i) => i.id !== id);
    set({
      items,
      restaurantId: items.length === 0 ? null : get().restaurantId,
    });
    get()._saveCache();
  },

  updateQuantity: (id, quantity) => {
    if (quantity <= 0) {
      get().removeItem(id);
      return;
    }
    set({
      items: get().items.map((i) => (i.id === id ? { ...i, quantity } : i)),
    });
    get()._saveCache();
  },

  clearCart: () => {
    set({ items: [], restaurantId: null });
    get()._saveCache();
  },

  getSubtotal: () =>
    get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),

  getItemCount: () =>
    get().items.reduce((sum, item) => sum + item.quantity, 0),
}));

useCartStore.getState()._loadCache();
