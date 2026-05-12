import { Link, useNavigate } from 'react-router-dom'
import { Zap, LogOut, User } from 'lucide-react'
import useAuthStore from '../../stores/authStore'
import toast from 'react-hot-toast'

export default function AdminNavbar() {
  const { profile, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    toast.success('Berhasil logout')
    navigate('/login')
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-nexus-surface/95 backdrop-blur-md border-b border-nexus-border h-16 flex items-center">
      <div className="w-full px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/admin/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-nexus-cyan to-nexus-purple flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-rajdhani text-xl font-bold gradient-text">NEXUSGEAR</span>
            <span className="ml-2 text-xs text-nexus-purple font-semibold border border-nexus-purple/30 bg-nexus-purple/10 px-2 py-0.5 rounded-full">
              ADMIN
            </span>
          </div>
        </Link>

        {/* Admin info + logout */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-nexus-cyan to-nexus-purple flex items-center justify-center">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Avatar"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-white text-xs font-bold">
                  {profile?.full_name?.[0]?.toUpperCase() || 'A'}
                </span>
              )}
            </div>
            <div className="hidden sm:block">
              <p className="text-nexus-text text-sm font-medium leading-none">
                {profile?.full_name || 'Admin'}
              </p>
              <p className="text-nexus-purple text-xs mt-0.5">Administrator</p>
            </div>
          </div>

          <div className="w-px h-6 bg-nexus-border" />

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-nexus-muted hover:text-red-400 hover:bg-red-400/10 transition-all text-sm"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  )
}