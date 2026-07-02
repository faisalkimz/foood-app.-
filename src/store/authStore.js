import { create } from 'zustand';
import { supabase } from '../services/supabase';
import { getProfile } from '../services/authService';

export const useAuthStore = create((set, get) => ({
  user: null,
  role: null,
  isOnboarded: false,
  isAuthenticated: false,
  isLoading: true,
  _initialized: false,

  initialize: async () => {
    if (get()._initialized) return;
    set({ _initialized: true });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        try {
          const profile = await getProfile(session.user.id);
          set({
            user: { ...session.user, ...profile },
            role: profile.role || 'customer',
            isAuthenticated: true,
            isOnboarded: true,
            isLoading: false,
          });
        } catch (err) {
          console.log('Auth: profile fetch failed, using session user:', err?.message);
          set({ user: session.user, isAuthenticated: true, isLoading: false });
        }
      } else {
        set({ isLoading: false });
      }
    } catch (err) {
      console.log('Auth: session restore failed:', err?.message);
      set({ isLoading: false });
    }
  },

  login: (user, role = 'customer') =>
    set({ user, role, isAuthenticated: true, isOnboarded: true }),

  logout: () =>
    set({ user: null, role: null, isAuthenticated: false }),

  completeOnboarding: () => set({ isOnboarded: true }),

  updateUser: (updates) =>
    set((state) => ({ user: { ...state.user, ...updates } })),

  setLoading: (isLoading) => set({ isLoading }),
}));
