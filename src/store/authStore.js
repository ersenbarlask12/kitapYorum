import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      loading: true,

      setUser: (user) => set({ user }),
      setSession: (session) => set({ session, user: session?.user ?? null }),
      setLoading: (loading) => set({ loading }),

      logout: async () => {
        await supabase.auth.signOut()
        set({ user: null, session: null })
      },

      // Getter helpers
      isAuthenticated: () => !!get().user,
      getAdSoyad: () => get().user?.user_metadata?.ad_soyad ?? '',
      getTcKimlikNo: () => get().user?.user_metadata?.tc_kimlik_no ?? '',
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        session: state.session,
      }),
    }
  )
)
