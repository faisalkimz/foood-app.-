import { create } from 'zustand';
import { supabase } from '../services/supabase';
import { getProfile } from '../services/authService';

export const useAuthStore = create((set, get) => ({
  user: null,        // Supabase user object + profile merged
  role: null,        // 'customer' | 'chef' | 'admin'
  isOnboarded: false,
  isAuthenticated: false,
  isLoading: true,   // true while restoring session on app start

  /** Called by _layout.js on app start — restores session from AsyncStorage */
  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const profile = await getProfile(session.user.id);
        set({
          user: { ...session.user, ...profile },
          role: profile.role || 'customer',
          isAuthenticated: true,
          isOnboarded: true,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  /** Called after OTP is verified */
  login: (user, role = 'customer') =>
    set({ user, role, isAuthenticated: true, isOnboarded: true }),

  logout: () =>
    set({ user: null, role: null, isAuthenticated: false }),

  completeOnboarding: () => set({ isOnboarded: true }),

  updateUser: (updates) =>
    set((state) => ({ user: { ...state.user, ...updates } })),

  setLoading: (isLoading) => set({ isLoading }),
}));
