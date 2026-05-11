import { useState, useEffect } from 'react'
import { Package, ShoppingBag, Users, DollarSign, TrendingUp, Clock, Loader2, RefreshCw } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import AdminSidebar from '../../components/admin/AdminSidebar'
import StatCard from '../../components/admin/StatCard'
import { formatCurrency, formatDate, STATUS_LABELS, STATUS_COLORS } from '../../lib/utils'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-nexus-surface border border-nexus-border rounded-lg p-3 text-sm shadow-xl">
        <p className="text-nexus-muted mb-1 font-medium">{label}</p>
        {payload[0] && (
          <p className="text-nexus-cyan font-semibold">{payload[0].value} pesanan</p>
        )}
        {payload[1] && (
          <p className="text-nexus-purple">{formatCurrency(payload[1].value)}</p>
        )}
      </div>
    )
  }
  return null
}

// Hitung label hari untuk 7 hari terakhir
function getLast7DaysLabels() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return {
      date: d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' }),
      fullDate: d.toISOString().split('T')[0],
    }
  })
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    revenue: 0,
    pendingOrders: 0,
  })
  const [chartData, setChartData] = useState([])
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      // Fetch semua data secara parallel
      const [
        productsRes,
        ordersRes,
        usersRes,
      ] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('id, status, total_amount, created_at, profiles(full_name)').order('created_at', { ascending: false }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
      ])

      const orders = ordersRes.data || []

      // Hitung stats
      const completedRevenue = orders
        .filter((o) => o.status === 'completed')
        .reduce((sum, o) => sum + (o.total_amount || 0), 0)

      const pendingCount = orders.filter((o) => o.status === 'pending').length

      setStats({
        totalProducts: productsRes.count || 0,
        totalOrders: orders.length,
        totalUsers: usersRes.count || 0,
        revenue: completedRevenue,
        pendingOrders: pendingCount,
      })

      // Recent orders (5 terbaru)
      setRecentOrders(orders.slice(0, 5))

      // Chart data: jumlah order per hari, 7 hari terakhir
      const days = getLast7DaysLabels()
      const chartPoints = days.map(({ date, fullDate }) => {
        const dayOrders = orders.filter((o) => {
          const orderDate = o.created_at?.split('T')[0]
          return orderDate === fullDate
        })
        return {
          date,
          orders: dayOrders.length,
          revenue: dayOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0),
        }
      })
      setChartData(chartPoints)
    } catch (err) {
      console.error('Dashboard fetch error:', err)
      toast.error('Gagal memuat data dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  return (
    <div className="flex pt-16">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-rajdhani text-4xl font-bold text-nexus-text">DASHBOARD</h1>
            <p className="text-nexus-muted">Selamat datang di Admin Panel NexusGear</p>
          </div>
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="btn-outline flex items-center gap-2 text-sm"
            title="Refresh data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-nexus-cyan" />
            <span className="text-nexus-muted text-lg">Memuat dashboard...</span>
          </div>
        ) : (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
              <StatCard
                icon={Package}
                label="Total Produk"
                value={stats.totalProducts}
                sub="di database"
                color="cyan"
              />
              <StatCard
                icon={ShoppingBag}
                label="Total Pesanan"
                value={stats.totalOrders}
                sub={`${stats.pendingOrders} menunggu tindakan`}
                color="purple"
              />
              <StatCard
                icon={Users}
                label="Total Users"
                value={stats.totalUsers.toLocaleString('id-ID')}
                sub="terdaftar"
                color="green"
              />
              <StatCard
                icon={DollarSign}
                label="Total Revenue"
                value={formatCurrency(stats.revenue)}
                sub="dari pesanan selesai"
                color="yellow"
              />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Chart */}
              <div className="xl:col-span-2 card">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-rajdhani text-2xl font-bold text-nexus-text">Grafik Pesanan</h2>
                    <p className="text-nexus-muted text-sm">7 hari terakhir</p>
                  </div>
                  <TrendingUp className="w-5 h-5 text-nexus-cyan" />
                </div>

                {chartData.every((d) => d.orders === 0) ? (
                  <div className="flex items-center justify-center h-64 text-nexus-muted text-sm">
                    Belum ada pesanan dalam 7 hari terakhir
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#00D4FF" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E1E2E" />
                      <XAxis dataKey="date" stroke="#64748B" tick={{ fontSize: 12 }} />
                      <YAxis stroke="#64748B" tick={{ fontSize: 12 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="orders"
                        stroke="#00D4FF"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorOrders)"
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#7C3AED"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Recent Orders */}
              <div className="card">
                <div className="flex items-center gap-2 mb-6">
                  <Clock className="w-5 h-5 text-nexus-cyan" />
                  <h2 className="font-rajdhani text-xl font-bold text-nexus-text">Pesanan Terbaru</h2>
                </div>

                {recentOrders.length === 0 ? (
                  <p className="text-nexus-muted text-sm text-center py-8">Belum ada pesanan</p>
                ) : (
                  <div className="space-y-3">
                    {recentOrders.map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between gap-3 p-3 rounded-xl bg-nexus-bg border border-nexus-border"
                      >
                        <div className="min-w-0">
                          <p className="text-nexus-text text-sm font-medium truncate">
                            {order.profiles?.full_name || 'Unknown User'}
                          </p>
                          <p className="text-nexus-muted text-xs">{formatDate(order.created_at)}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-nexus-cyan text-sm font-bold">
                            {formatCurrency(order.total_amount)}
                          </p>
                          <span className={`text-xs px-2 py-0.5 rounded border ${STATUS_COLORS[order.status]}`}>
                            {STATUS_LABELS[order.status]}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
