import { useState, useEffect } from 'react'
import { Package, ShoppingBag, Users, DollarSign, TrendingUp, Clock, Loader2 } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import AdminSidebar from '../../components/admin/AdminSidebar'
import StatCard from '../../components/admin/StatCard'
import { formatCurrency, formatDate, STATUS_LABELS, STATUS_COLORS } from '../../lib/utils'
import { supabase } from '../../lib/supabase'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-nexus-surface border border-nexus-border rounded-lg p-3 text-sm">
        <p className="text-nexus-muted mb-1">{label}</p>
        <p className="text-nexus-cyan font-semibold">{payload[0]?.value} pesanan</p>
        {payload[1] && <p className="text-nexus-purple">{formatCurrency(payload[1]?.value)}</p>}
      </div>
    )
  }
  return null
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    revenue: 0,
  })
  const [recentOrders, setRecentOrders] = useState([])
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      // Fetch semua data paralel
      const [productsRes, ordersRes, usersRes] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact' }),
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('id', { count: 'exact' }),
      ])

      const allOrders = ordersRes.data || []

      // Hitung revenue dari order completed
      const revenue = allOrders
        .filter((o) => o.status === 'completed')
        .reduce((sum, o) => sum + Number(o.total_amount), 0)

      setStats({
        totalProducts: productsRes.count || 0,
        totalOrders: allOrders.length,
        totalUsers: usersRes.count || 0,
        revenue,
      })

      // 5 pesanan terbaru
      setRecentOrders(allOrders.slice(0, 5))

      // Chart data: 7 hari terakhir
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - (6 - i))
        date.setHours(0, 0, 0, 0)
        return date
      })

      const chartArr = last7Days.map((day) => {
        const nextDay = new Date(day)
        nextDay.setDate(nextDay.getDate() + 1)

        const dayOrders = allOrders.filter((o) => {
          const created = new Date(o.created_at)
          return created >= day && created < nextDay
        })

        return {
          date: day.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' }),
          orders: dayOrders.length,
          revenue: dayOrders.reduce((sum, o) => sum + Number(o.total_amount), 0),
        }
      })

      setChartData(chartArr)

      // Fetch profil untuk recent orders
      if (allOrders.length > 0) {
        const userIds = [...new Set(allOrders.slice(0, 5).map((o) => o.user_id))]
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', userIds)

        const profileMap = {}
        profiles?.forEach((p) => { profileMap[p.id] = p.full_name })

        setRecentOrders(allOrders.slice(0, 5).map((o) => ({
          ...o,
          user_name: profileMap[o.user_id] || o.shipping_address?.recipient_name || 'Unknown',
        })))
      }
    } catch (err) {
      console.error('Dashboard error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex pt-16">
        <AdminSidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-nexus-cyan" />
            <span className="text-nexus-muted text-lg">Memuat dashboard...</span>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex pt-16">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="mb-8">
          <h1 className="font-rajdhani text-4xl font-bold text-nexus-text">DASHBOARD</h1>
          <p className="text-nexus-muted">Selamat datang di Admin Panel NexusGear</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Package}
            label="Total Produk"
            value={stats.totalProducts}
            sub="produk aktif"
            color="cyan"
          />
          <StatCard
            icon={ShoppingBag}
            label="Total Pesanan"
            value={stats.totalOrders}
            sub={`${recentOrders.filter(o => o.status === 'pending').length} menunggu tindakan`}
            color="purple"
          />
          <StatCard
            icon={Users}
            label="Total Users"
            value={stats.totalUsers}
            sub="user terdaftar"
            color="green"
          />
          <StatCard
            icon={DollarSign}
            label="Total Pendapatan"
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
              <div className="h-[250px] flex items-center justify-center">
                <p className="text-nexus-muted text-sm">Belum ada pesanan dalam 7 hari terakhir</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00D4FF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E1E2E" />
                  <XAxis dataKey="date" stroke="#64748B" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#64748B" tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="orders"
                    stroke="#00D4FF"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorOrders)"
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
              <div className="py-8 text-center text-nexus-muted text-sm">Belum ada pesanan</div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-nexus-bg border border-nexus-border">
                    <div className="min-w-0">
                      <p className="text-nexus-text text-sm font-medium truncate">
                        {order.user_name || order.shipping_address?.recipient_name || 'Unknown'}
                      </p>
                      <p className="text-nexus-muted text-xs">{formatDate(order.created_at)}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-nexus-cyan text-sm font-bold">{formatCurrency(order.total_amount)}</p>
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
      </main>
    </div>
  )
}
