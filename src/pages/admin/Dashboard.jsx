import { Package, ShoppingBag, Users, DollarSign, TrendingUp, Clock } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import AdminSidebar from '../../components/admin/AdminSidebar'
import StatCard from '../../components/admin/StatCard'
import { formatCurrency, STATUS_LABELS, STATUS_COLORS } from '../../lib/utils'
import { MOCK_PRODUCTS } from '../../lib/utils'

// Generate dummy chart data for last 7 days
const chartData = Array.from({ length: 7 }, (_, i) => {
  const date = new Date()
  date.setDate(date.getDate() - (6 - i))
  return {
    date: date.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' }),
    orders: Math.floor(Math.random() * 20 + 5),
    revenue: Math.floor(Math.random() * 15000000 + 2000000),
  }
})

const recentOrders = [
  { id: 'ord-001', user: 'Ahmad Rizki', total: 2600000, status: 'completed', date: '10 Mei 2026' },
  { id: 'ord-002', user: 'Sari Dewi', total: 1215000, status: 'shipped', date: '10 Mei 2026' },
  { id: 'ord-003', user: 'Budi Santoso', total: 4500000, status: 'processing', date: '9 Mei 2026' },
  { id: 'ord-004', user: 'Rina Wulandari', total: 8515000, status: 'pending', date: '9 Mei 2026' },
  { id: 'ord-005', user: 'Dimas Prayoga', total: 950000, status: 'cancelled', date: '8 Mei 2026' },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-nexus-surface border border-nexus-border rounded-lg p-3 text-sm">
        <p className="text-nexus-muted mb-1">{label}</p>
        <p className="text-nexus-cyan font-semibold">{payload[0]?.value} pesanan</p>
        <p className="text-nexus-purple">{formatCurrency(payload[1]?.value)}</p>
      </div>
    )
  }
  return null
}

export default function AdminDashboard() {
  const totalRevenue = recentOrders.filter(o => o.status === 'completed').reduce((s, o) => s + o.total, 0)

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
          <StatCard icon={Package} label="Total Produk" value={MOCK_PRODUCTS.length} sub="23 aktif" color="cyan" />
          <StatCard icon={ShoppingBag} label="Total Pesanan" value={recentOrders.length} sub="3 butuh tindakan" color="purple" />
          <StatCard icon={Users} label="Total Users" value="1,247" sub="+12 minggu ini" color="green" />
          <StatCard icon={DollarSign} label="Pendapatan Bulan Ini" value={formatCurrency(totalRevenue)} sub="+23% dari bulan lalu" color="yellow" />
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
                <Area type="monotone" dataKey="orders" stroke="#00D4FF" strokeWidth={2} fillOpacity={1} fill="url(#colorOrders)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Orders */}
          <div className="card">
            <div className="flex items-center gap-2 mb-6">
              <Clock className="w-5 h-5 text-nexus-cyan" />
              <h2 className="font-rajdhani text-xl font-bold text-nexus-text">Pesanan Terbaru</h2>
            </div>
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-nexus-bg border border-nexus-border">
                  <div className="min-w-0">
                    <p className="text-nexus-text text-sm font-medium truncate">{order.user}</p>
                    <p className="text-nexus-muted text-xs">{order.date}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-nexus-cyan text-sm font-bold">{formatCurrency(order.total)}</p>
                    <span className={`text-xs px-2 py-0.5 rounded border ${STATUS_COLORS[order.status]}`}>
                      {STATUS_LABELS[order.status]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
