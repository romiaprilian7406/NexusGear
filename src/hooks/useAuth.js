import { useEffect } from 'react'
import { supabase } from '../lib/supabase'
import useAuthStore from '../stores/authStore'

export function useAuth() {
  const { user, profile, setUser, setProfile, fetchProfile, logout, loading } = useAuthStore()

  useEffect(() => {
    // Skip Supabase auth if using placeholder/demo config
    const url = import.meta.env.VITE_SUPABASE_URL || ''
    const isDemoMode = url.includes('placeholder') || !url || url === 'your_supabase_project_url'

    if (isDemoMode) return // Let demo auth state (from login) persist untouched

    // Get initial session from real Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        fetchProfile(session.user.id)
      }
    }).catch(() => {}) // silently ignore if Supabase unreachable

    // Listen for auth changes
    let subscription
    try {
      const { data } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (session?.user) {
            setUser(session.user)
            fetchProfile(session.user.id)
          } else if (event === 'SIGNED_OUT') {
            setUser(null)
            setProfile(null)
          }
        }
      )
      subscription = data.subscription
    } catch {}

    return () => subscription?.unsubscribe()
  }, [])

  return { user, profile, logout, loading, isAdmin: profile?.role === 'admin' }
}
