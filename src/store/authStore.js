import { create } from 'zustand';

export const useAuthStore = create((set, get) => ({
  user: null,
  role: null, // 'customer' | 'chef'
  isOnboarded: false,
  isAuthenticated: false,

  completeOnboarding: () => set({ isOnboarded: true }),

  login: (user, role = 'customer') => set({ user, role, isAuthenticated: true }),

  logout: () => set({ user: null, role: null, isAuthenticated: false }),

  updateUser: (updates) =>
    set((state) => ({ user: { ...state.user, ...updates } })),

  get isChef() {
    return get().role === 'chef';
  },
}));
