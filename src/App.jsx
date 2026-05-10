import { useEffect } from 'react'
import AppRouter from './router/AppRouter'
import { useAuth } from './hooks/useAuth'
import useAuthStore from './stores/authStore'

function AuthInitializer() {
  useAuth()

  useEffect(() => {
    // Force Zustand persist to rehydrate from localStorage immediately
    useAuthStore.persist.rehydrate()
  }, [])

  return null
}

export default function App() {
  return (
    <>
      <AuthInitializer />
      <AppRouter />
    </>
  )
}
