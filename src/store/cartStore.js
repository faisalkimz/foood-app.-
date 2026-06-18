import { create } from 'zustand';

export const useCartStore = create((set, get) => ({
  items: [],
  restaurantId: null,

  addItem: (item) => {
    const { items, restaurantId } = get();

    if (restaurantId && restaurantId !== item.restaurantId) {
      return { error: 'Cart contains items from another restaurant' };
    }

    const existing = items.find((i) => i.id === item.id);
    if (existing) {
      set({
        items: items.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        ),
        restaurantId: item.restaurantId,
      });
    } else {
      set({
        items: [...items, { ...item, quantity: 1 }],
        restaurantId: item.restaurantId,
      });
    }
    return { error: null };
  },

  removeItem: (id) => {
    const items = get().items.filter((i) => i.id !== id);
    set({
      items,
      restaurantId: items.length === 0 ? null : get().restaurantId,
    });
  },

  updateQuantity: (id, quantity) => {
    if (quantity <= 0) {
      get().removeItem(id);
      return;
    }
    set({
      items: get().items.map((i) => (i.id === id ? { ...i, quantity } : i)),
    });
  },

  clearCart: () => set({ items: [], restaurantId: null }),

  getSubtotal: () =>
    get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),

  getItemCount: () =>
    get().items.reduce((sum, item) => sum + item.quantity, 0),
}));
