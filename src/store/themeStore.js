import { create } from 'zustand';

export const useThemeStore = create((set, get) => ({
  isDark: false,
  toggle: () => set((s) => ({ isDark: !s.isDark })),
  setDark: (isDark) => set({ isDark }),
}));
