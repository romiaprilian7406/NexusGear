import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { supabase } from '../lib/supabase'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      loading: false,

      get isAdmin() {
        return get().profile?.role === 'admin'
      },

      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),
      setLoading: (loading) => set({ loading }),

      logout: async () => {
        set({ loading: true })
        try {
          await supabase.auth.signOut()
        } catch {}
        set({ user: null, profile: null, loading: false })
      },

      fetchProfile: async (userId) => {
        if (!userId) return
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single()
          if (error) throw error
          if (data) set({ profile: data })
        } catch (err) {
          // Profile not found — could be new user, ignore silently
          console.warn('fetchProfile:', err?.message)
        }
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
