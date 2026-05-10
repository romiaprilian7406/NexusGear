import { useState } from 'react'
import { Search, Shield, User } from 'lucide-react'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { formatDate } from '../../lib/utils'

const DEMO_USERS = [
  { id: '1', full_name: 'Ahmad Rizki', email: 'ahmad@email.com', role: 'user', phone: '081234567890', created_at: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(), orders: 3 },
  { id: '2', full_name: 'Sari Dewi', email: 'sari@email.com', role: 'user', phone: '089876543210', created_at: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(), orders: 1 },
  { id: '3', full_name: 'Budi Santoso', email: 'budi@email.com', role: 'user', phone: '082111222333', created_at: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(), orders: 2 },
  { id: '4', full_name: 'Admin NexusGear', email: 'admin@nexusgear.com', role: 'admin', phone: '081000000001', created_at: new Date(Date.now() - 365 * 24 * 3600 * 1000).toISOString(), orders: 0 },
  { id: '5', full_name: 'Rina Wulandari', email: 'rina@email.com', role: 'user', phone: '085444555666', created_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(), orders: 1 },
]

export default function AdminUsers() {
  const [users] = useState(DEMO_USERS)
  const [search, setSearch] = useState('')

  const filtered = users.filter((u) =>
    u.full_name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex pt-16">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-rajdhani text-4xl font-bold text-nexus-text">MANAJEMEN USERS</h1>
            <p className="text-nexus-muted">{users.length} user terdaftar</p>
          </div>
        </div>

        <div className="relative mb-6 w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nexus-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari user..."
            className="input-field pl-10"
          />
        </div>

        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-nexus-border">
                <tr>
                  {['User', 'Email', 'Role', 'HP', 'Total Pesanan', 'Bergabung'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-nexus-muted uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-nexus-border">
                {filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-nexus-border/10 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-nexus-cyan to-nexus-purple flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-sm font-bold">{user.full_name[0]}</span>
                        </div>
                        <p className="text-nexus-text font-medium text-sm">{user.full_name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-nexus-muted text-sm">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold border ${user.role === 'admin' ? 'text-nexus-purple bg-nexus-purple/10 border-nexus-purple/30' : 'text-nexus-cyan bg-nexus-cyan/10 border-nexus-cyan/30'}`}>
                        {user.role === 'admin' ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-nexus-muted text-sm">{user.phone}</td>
                    <td className="px-4 py-3 text-nexus-text text-sm text-center">{user.orders}</td>
                    <td className="px-4 py-3 text-nexus-muted text-sm">{formatDate(user.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
