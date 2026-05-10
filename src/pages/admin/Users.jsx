import { useState, useEffect } from 'react'
import { Search, Shield, User, Loader2, RefreshCw } from 'lucide-react'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { formatDate } from '../../lib/utils'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      setUsers(data || [])
    } catch (err) {
      toast.error('Gagal memuat users: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const filtered = users.filter((u) =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.id?.toLowerCase().includes(search.toLowerCase())
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
          <button
            onClick={fetchUsers}
            className="btn-outline flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
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
          {loading ? (
            <div className="flex items-center justify-center py-20 gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-nexus-cyan" />
              <span className="text-nexus-muted">Memuat users...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-nexus-border">
                  <tr>
                    {['User', 'Role', 'HP', 'Bergabung'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-nexus-muted uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-nexus-border">
                  {filtered.map((user) => (
                    <tr key={user.id} className="hover:bg-nexus-border/10 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0">
                            {user.avatar_url ? (
                              <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-nexus-cyan to-nexus-purple flex items-center justify-center">
                                <span className="text-white text-sm font-bold">
                                  {user.full_name?.[0]?.toUpperCase() || '?'}
                                </span>
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-nexus-text font-medium text-sm">{user.full_name || '-'}</p>
                            <p className="text-nexus-muted text-xs font-mono">{user.id.slice(0, 8)}...</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold border ${
                          user.role === 'admin'
                            ? 'text-nexus-purple bg-nexus-purple/10 border-nexus-purple/30'
                            : 'text-nexus-cyan bg-nexus-cyan/10 border-nexus-cyan/30'
                        }`}>
                          {user.role === 'admin' ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-nexus-muted text-sm">{user.phone || '-'}</td>
                      <td className="px-4 py-3 text-nexus-muted text-sm">{formatDate(user.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && !loading && (
                <div className="py-16 text-center text-nexus-muted">Tidak ada user ditemukan</div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
