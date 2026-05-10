import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { supabase } from '../lib/supabase'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      profile: null,

      get isAdmin() {
        return get().profile?.role === 'admin'
      },

      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),

      logout: async () => {
        try { await supabase.auth.signOut() } catch {}
        set({ user: null, profile: null })
      },

      fetchProfile: async (userId) => {
        try {
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single()
          if (data) set({ profile: data })
        } catch {}
      },
    }),
    {
      name: 'nexusgear-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, profile: state.profile }),
    }
  )
)

export default useAuthStore
