import { Navigate, useLocation } from 'react-router-dom'
import useAuthStore from '../stores/authStore'
import { PageLoading } from '../components/shared/Loading'

function getPersistedAuth() {
  try {
    const raw = localStorage.getItem('nexusgear-auth')
    if (!raw) return { user: null, profile: null }
    return JSON.parse(raw)?.state ?? { user: null, profile: null }
  } catch { return { user: null, profile: null } }
}

export default function ProtectedRoute({ children }) {
  const { user } = useAuthStore()
  const location = useLocation()
  const persisted = getPersistedAuth()

  // If Zustand hasn't hydrated yet but localStorage has data, show loading
  const isHydrating = !user && !!persisted.user

  if (isHydrating) return <PageLoading />

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}
