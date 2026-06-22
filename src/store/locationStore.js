import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@foodorder_location';

export const useLocationStore = create((set, get) => ({
  /** Current delivery address info */
  address: null,       // { name, street, city, region, country, postalCode }
  coords: null,        // { latitude, longitude }
  isLocationSet: false, // true once user picks or auto-detects location
  isLoading: false,

  /** Restore saved location from AsyncStorage (called on app start) */
  initialize: async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        const { address, coords } = JSON.parse(saved);
        set({ address, coords, isLocationSet: true });
      }
    } catch {
      // No saved location — user will pick on first signup
    }
  },

  /** Save location to store + AsyncStorage */
  setLocation: async (address, coords) => {
    set({ address, coords, isLocationSet: true });
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ address, coords }));
    } catch {
      // Storage write failed — non-critical
    }
  },

  /** Clear saved location */
  clearLocation: async () => {
    set({ address: null, coords: null, isLocationSet: false });
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  },

  setLoading: (isLoading) => set({ isLoading }),
}));
