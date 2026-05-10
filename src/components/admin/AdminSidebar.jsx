import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Package, ShoppingBag, Users, Zap, ChevronRight } from 'lucide-react'

const NAV = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/products', icon: Package, label: 'Produk' },
  { to: '/admin/orders', icon: ShoppingBag, label: 'Pesanan' },
  { to: '/admin/users', icon: Users, label: 'Users' },
]

export default function AdminSidebar() {
  const { pathname } = useLocation()

  return (
    <aside className="w-64 min-h-screen bg-nexus-surface border-r border-nexus-border flex flex-col pt-16">
      <div className="p-6 border-b border-nexus-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-nexus-cyan to-nexus-purple flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-rajdhani font-bold text-nexus-text">Admin Panel</p>
            <p className="text-nexus-muted text-xs">NexusGear</p>
          </div>
        </div>
      </div>
      <nav className="p-4 space-y-1 flex-1">
        {NAV.map(({ to, icon: Icon, label }) => {
          const active = pathname === to
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                active
                  ? 'bg-nexus-cyan/10 text-nexus-cyan border border-nexus-cyan/20'
                  : 'text-nexus-muted hover:text-nexus-text hover:bg-nexus-border/30'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{label}</span>
              {active && <ChevronRight className="w-4 h-4 ml-auto" />}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
