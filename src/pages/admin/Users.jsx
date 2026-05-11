import { useState, useEffect } from 'react'
import { Search, Shield, User, RefreshCw, Loader2, Mail, Phone, Calendar } from 'lucide-react'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { formatDate } from '../../lib/utils'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [updatingId, setUpdatingId] = useState(null)

  const fetchUsers = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (err) {
      setError(err.message)
      toast.error('Gagal memuat data users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const toggleRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin'
    const confirmMsg = newRole === 'admin'
      ? 'Jadikan user ini sebagai Admin?'
      : 'Cabut hak admin dari user ini?'
    if (!window.confirm(confirmMsg)) return

    setUpdatingId(userId)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId)
      if (error) throw error

      setUsers((prev) =>
        prev.map((u) => u.id === userId ? { ...u, role: newRole } : u)
      )
      toast.success(`Role diperbarui menjadi ${newRole}`)
    } catch (err) {
      toast.error('Gagal mengubah role: ' + err.message)
    } finally {
      setUpdatingId(null)
    }
  }

  const filtered = users.filter((u) => {
    const matchSearch = !search ||
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.phone?.includes(search)
    const matchRole = roleFilter === 'all' || u.role === roleFilter
    return matchSearch && matchRole
  })

  const adminCount = users.filter((u) => u.role === 'admin').length
  const userCount = users.filter((u) => u.role === 'user').length

  return (
    <div className="flex pt-16">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-rajdhani text-4xl font-bold text-nexus-text">MANAJEMEN USERS</h1>
            <p className="text-nexus-muted">
              {loading ? 'Memuat...' : `${users.length} user terdaftar · ${adminCount} admin · ${userCount} user`}
            </p>
          </div>
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="btn-outline flex items-center gap-2 text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            Gagal memuat data: {error}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nexus-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama / nomor HP..."
              className="input-field pl-10 w-64"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'admin', 'user'].map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  roleFilter === r
                    ? 'bg-nexus-cyan text-nexus-bg'
                    : 'border border-nexus-border text-nexus-muted hover:border-nexus-cyan hover:text-nexus-cyan'
                }`}
              >
                {r === 'all' ? 'Semua' : r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
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
                    {['User', 'Nomor HP', 'Role', 'Bergabung', 'Aksi'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-nexus-muted uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-nexus-border">
                  {filtered.map((user) => (
                    <tr key={user.id} className="hover:bg-nexus-border/10 transition-colors">
                      {/* User Info */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-nexus-cyan to-nexus-purple flex items-center justify-center flex-shrink-0">
                            {user.avatar_url ? (
                              <img
                                src={user.avatar_url}
                                alt=""
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-white text-sm font-bold">
                                {user.full_name?.[0]?.toUpperCase() || '?'}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="text-nexus-text font-medium text-sm">{user.full_name || '-'}</p>
                            <p className="text-nexus-muted text-xs font-mono truncate max-w-[160px]">
                              {user.id.slice(0, 8)}...
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-nexus-muted text-sm">
                          <Phone className="w-3 h-3" />
                          {user.phone || '-'}
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold border ${
                          user.role === 'admin'
                            ? 'text-nexus-purple bg-nexus-purple/10 border-nexus-purple/30'
                            : 'text-nexus-cyan bg-nexus-cyan/10 border-nexus-cyan/30'
                        }`}>
                          {user.role === 'admin'
                            ? <Shield className="w-3 h-3" />
                            : <User className="w-3 h-3" />
                          }
                          {user.role}
                        </span>
                      </td>

                      {/* Joined */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-nexus-muted text-sm">
                          <Calendar className="w-3 h-3" />
                          {formatDate(user.created_at)}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleRole(user.id, user.role)}
                          disabled={updatingId === user.id}
                          className={`text-xs px-3 py-1 rounded-lg border transition-all ${
                            user.role === 'admin'
                              ? 'border-red-400/30 text-red-400 hover:bg-red-400/10'
                              : 'border-nexus-purple/30 text-nexus-purple hover:bg-nexus-purple/10'
                          } disabled:opacity-50`}
                        >
                          {updatingId === user.id
                            ? '...'
                            : user.role === 'admin' ? 'Cabut Admin' : 'Jadikan Admin'
                          }
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filtered.length === 0 && !loading && (
                <div className="py-16 text-center text-nexus-muted">
                  {error ? 'Gagal memuat data' : 'Tidak ada user ditemukan'}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Info Note */}
        <p className="text-nexus-muted text-xs mt-4">
          * Email user tidak ditampilkan untuk menjaga privasi. Gunakan Supabase Auth dashboard untuk manajemen email.
        </p>
      </main>
    </div>
  )
}
