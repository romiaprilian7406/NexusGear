import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ShoppingCart, User, Menu, X, Search, Zap, LogOut, Settings, Package } from 'lucide-react'
import useAuthStore from '../../stores/authStore'
import useCartStore from '../../stores/cartStore'
import useUIStore from '../../stores/uiStore'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { user, profile, logout } = useAuthStore()
  const { items } = useCartStore()
  const { openCart, mobileMenuOpen, toggleMobileMenu, closeMobileMenu } = useUIStore()
  const navigate = useNavigate()
  const location = useLocation()

  const itemCount = items.reduce((s, i) => s + i.quantity, 0)
  const isAdmin = profile?.role === 'admin'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { closeMobileMenu() }, [location.pathname])

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/shop', label: 'Shop' },
  ]

  const handleLogout = async () => {
    await logout()
    setUserMenuOpen(false)
    navigate('/')
  }

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-nexus-surface/95 backdrop-blur-md border-b border-nexus-border shadow-lg' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-nexus-cyan to-nexus-purple flex items-center justify-center group-hover:shadow-[0_0_15px_rgba(0,212,255,0.5)] transition-all duration-300">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-rajdhani text-2xl font-bold gradient-text tracking-wider">NEXUSGEAR</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`font-medium transition-colors duration-200 hover:text-nexus-cyan ${location.pathname === l.to ? 'text-nexus-cyan' : 'text-nexus-muted'}`}
              >
                {l.label}
              </Link>
            ))}
            {isAdmin && (
              <Link to="/admin/dashboard" className="text-nexus-purple hover:text-nexus-purple/80 font-medium transition-colors duration-200">
                Admin
              </Link>
            )}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Cart */}
            <button
              onClick={openCart}
              className="relative p-2 text-nexus-muted hover:text-nexus-cyan transition-colors duration-200"
            >
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-nexus-cyan text-nexus-bg text-xs font-bold flex items-center justify-center animate-pulse-glow">
                  {itemCount}
                </span>
              )}
            </button>

            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-2 rounded-lg border border-nexus-border hover:border-nexus-cyan transition-all duration-200"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-nexus-cyan to-nexus-purple flex items-center justify-center">
                    <span className="text-xs font-bold text-white">
                      {profile?.full_name?.[0] || user.email?.[0]?.toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden sm:block text-sm text-nexus-text max-w-[120px] truncate">
                    {profile?.full_name || user.email}
                  </span>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-nexus-surface border border-nexus-border rounded-xl shadow-xl overflow-hidden animate-fade-in z-50">
                    <div className="px-4 py-3 border-b border-nexus-border">
                      <p className="text-sm font-medium text-nexus-text truncate">{profile?.full_name}</p>
                      <p className="text-xs text-nexus-muted truncate">{user.email}</p>
                    </div>
                    <div className="py-1">
                      <Link to="/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-nexus-muted hover:text-nexus-cyan hover:bg-nexus-border/30 transition-colors">
                        <User className="w-4 h-4" /> Profil Saya
                      </Link>
                      <Link to="/orders" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-nexus-muted hover:text-nexus-cyan hover:bg-nexus-border/30 transition-colors">
                        <Package className="w-4 h-4" /> Riwayat Pesanan
                      </Link>
                      {isAdmin && (
                        <Link to="/admin/dashboard" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-nexus-purple hover:bg-nexus-border/30 transition-colors">
                          <Settings className="w-4 h-4" /> Admin Panel
                        </Link>
                      )}
                      <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-400/10 transition-colors">
                        <LogOut className="w-4 h-4" /> Keluar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="btn-primary text-sm py-2 px-4">
                Masuk
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button onClick={toggleMobileMenu} className="md:hidden p-2 text-nexus-muted hover:text-nexus-cyan">
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-nexus-surface border-b border-nexus-border animate-fade-in">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((l) => (
              <Link key={l.to} to={l.to} className="block px-4 py-3 rounded-lg text-nexus-muted hover:text-nexus-cyan hover:bg-nexus-border/30 transition-colors">
                {l.label}
              </Link>
            ))}
            {isAdmin && (
              <Link to="/admin/dashboard" className="block px-4 py-3 rounded-lg text-nexus-purple hover:bg-nexus-border/30 transition-colors">
                Admin Panel
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Overlay for user menu */}
      {userMenuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
      )}
    </header>
  )
}
