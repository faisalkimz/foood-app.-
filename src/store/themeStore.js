import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEY = '@foodorder_theme_v3';
const SCHEMA_VERSION = 1;

export const useThemeStore = create((set, get) => ({
  isDark: false,

  _saveCache: async () => {
    try {
      await AsyncStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ _version: SCHEMA_VERSION, isDark: get().isDark })
      );
    } catch { /* non-critical */ }
  },

  _loadCache: async () => {
    try {
      const raw = await AsyncStorage.getItem(CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed._version === SCHEMA_VERSION) {
          set({ isDark: parsed.isDark });
        }
      }
    } catch { /* ignore */ }
  },

  toggle: () => {
    set((s) => ({ isDark: !s.isDark }));
    get()._saveCache();
  },

  setDark: (isDark) => {
    set({ isDark });
    get()._saveCache();
  },
}));

useThemeStore.getState()._loadCache();
