import { useState } from 'react'
import { ChevronDown, Eye, X } from 'lucide-react'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { formatCurrency, formatDate, STATUS_LABELS, STATUS_COLORS } from '../../lib/utils'
import toast from 'react-hot-toast'

const DEMO_ORDERS = [
  {
    id: 'ord-001', user_name: 'Ahmad Rizki', user_email: 'ahmad@email.com',
    total_amount: 2600000, status: 'completed', payment_method: 'bca',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    shipping_address: { recipient_name: 'Ahmad Rizki', phone: '081234567890', city: 'Jakarta', province: 'DKI Jakarta', address: 'Jl. Sudirman No. 1' },
    items: [
      { name: 'Razer BlackWidow V4', qty: 1, price: 1850000, image: 'https://placehold.co/60x60/111118/00D4FF?text=BW' },
      { name: 'Razer DeathAdder V3', qty: 1, price: 750000, image: 'https://placehold.co/60x60/111118/00D4FF?text=DA' },
    ]
  },
  {
    id: 'ord-002', user_name: 'Sari Dewi', user_email: 'sari@email.com',
    total_amount: 1215000, status: 'shipped', payment_method: 'qris',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    shipping_address: { recipient_name: 'Sari Dewi', phone: '089876543210', city: 'Bandung', province: 'Jawa Barat', address: 'Jl. Dago No. 5' },
    items: [{ name: 'HyperX Cloud Alpha', qty: 1, price: 1200000, image: 'https://placehold.co/60x60/111118/7C3AED?text=HA' }]
  },
  {
    id: 'ord-003', user_name: 'Budi Santoso', user_email: 'budi@email.com',
    total_amount: 4515000, status: 'processing', payment_method: 'mandiri',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    shipping_address: { recipient_name: 'Budi Santoso', phone: '082111222333', city: 'Surabaya', province: 'Jawa Timur', address: 'Jl. Pemuda No. 20' },
    items: [{ name: 'ASUS ROG Swift 27" 144Hz', qty: 1, price: 4500000, image: 'https://placehold.co/60x60/111118/00D4FF?text=ROG' }]
  },
  {
    id: 'ord-004', user_name: 'Rina Wulandari', user_email: 'rina@email.com',
    total_amount: 8515000, status: 'pending', payment_method: 'va',
    created_at: new Date().toISOString(),
    shipping_address: { recipient_name: 'Rina Wulandari', phone: '085444555666', city: 'Yogyakarta', province: 'DI Yogyakarta', address: 'Jl. Malioboro No. 100' },
    items: [{ name: 'Secretlab TITAN Evo 2022', qty: 1, price: 8500000, image: 'https://placehold.co/60x60/111118/00D4FF?text=SE' }]
  },
  {
    id: 'ord-005', user_name: 'Dimas Prayoga', user_email: 'dimas@email.com',
    total_amount: 965000, status: 'cancelled', payment_method: 'cod',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    shipping_address: { recipient_name: 'Dimas Prayoga', phone: '087777888999', city: 'Semarang', province: 'Jawa Tengah', address: 'Jl. Pandanaran No. 15' },
    items: [{ name: 'SteelSeries Rival 600', qty: 1, price: 950000, image: 'https://placehold.co/60x60/111118/7C3AED?text=SR' }]
  },
]

const ALL_STATUSES = ['all', 'pending', 'processing', 'shipped', 'completed', 'cancelled']
const NEXT_STATUS = { pending: 'processing', processing: 'shipped', shipped: 'completed' }

export default function AdminOrders() {
  const [orders, setOrders] = useState(DEMO_ORDERS)
  const [filter, setFilter] = useState('all')
  const [detailOrder, setDetailOrder] = useState(null)

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter)

  const updateStatus = (id, status) => {
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status } : o))
    toast.success(`Status diperbarui: ${STATUS_LABELS[status]}`)
    if (detailOrder?.id === id) setDetailOrder((o) => ({ ...o, status }))
  }

  return (
    <div className="flex pt-16">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="mb-8">
          <h1 className="font-rajdhani text-4xl font-bold text-nexus-text">MANAJEMEN PESANAN</h1>
          <p className="text-nexus-muted">{orders.length} total pesanan</p>
        </div>

        {/* Status filter */}
        <div className="flex gap-2 flex-wrap mb-6">
          {ALL_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${filter === s ? 'bg-nexus-cyan text-nexus-bg' : 'border border-nexus-border text-nexus-muted hover:border-nexus-cyan hover:text-nexus-cyan'}`}
            >
              {s === 'all' ? `Semua (${orders.length})` : `${STATUS_LABELS[s]} (${orders.filter((o) => o.status === s).length})`}
            </button>
          ))}
        </div>

        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-nexus-border">
                <tr>
                  {['Order ID', 'Customer', 'Total', 'Status', 'Tanggal', 'Aksi'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-nexus-muted uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-nexus-border">
                {filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-nexus-border/10 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-nexus-cyan font-mono font-semibold text-sm">NXG-{order.id.slice(-3).toUpperCase()}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-nexus-text text-sm font-medium">{order.user_name}</p>
                      <p className="text-nexus-muted text-xs">{order.user_email}</p>
                    </td>
                    <td className="px-4 py-3 text-nexus-text font-semibold text-sm">{formatCurrency(order.total_amount)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold border ${STATUS_COLORS[order.status]}`}>
                        {STATUS_LABELS[order.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-nexus-muted text-sm">{formatDate(order.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {NEXT_STATUS[order.status] && (
                          <button
                            onClick={() => updateStatus(order.id, NEXT_STATUS[order.status])}
                            className="text-xs px-2 py-1 rounded-lg bg-nexus-cyan/10 text-nexus-cyan border border-nexus-cyan/30 hover:bg-nexus-cyan/20 transition-colors whitespace-nowrap"
                          >
                            → {STATUS_LABELS[NEXT_STATUS[order.status]]}
                          </button>
                        )}
                        <button
                          onClick={() => setDetailOrder(order)}
                          className="p-1.5 text-nexus-muted hover:text-nexus-cyan hover:bg-nexus-cyan/10 rounded-lg transition-all"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="py-16 text-center text-nexus-muted">Tidak ada pesanan</div>
            )}
          </div>
        </div>
      </main>

      {/* Detail Modal */}
      {detailOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDetailOrder(null)} />
          <div className="relative w-full max-w-lg bg-nexus-surface border border-nexus-border rounded-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-nexus-border">
              <h2 className="font-rajdhani text-2xl font-bold text-nexus-text">Detail Pesanan</h2>
              <button onClick={() => setDetailOrder(null)} className="p-2 text-nexus-muted hover:text-nexus-cyan rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between">
                <span className="text-nexus-cyan font-bold">NXG-{detailOrder.id.slice(-3).toUpperCase()}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${STATUS_COLORS[detailOrder.status]}`}>
                  {STATUS_LABELS[detailOrder.status]}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-nexus-bg border border-nexus-border">
                <p className="text-xs text-nexus-muted uppercase tracking-wider mb-2">Customer</p>
                <p className="font-medium text-nexus-text">{detailOrder.user_name}</p>
                <p className="text-nexus-muted text-sm">{detailOrder.user_email}</p>
              </div>
              <div className="p-4 rounded-xl bg-nexus-bg border border-nexus-border">
                <p className="text-xs text-nexus-muted uppercase tracking-wider mb-2">Alamat Pengiriman</p>
                <p className="font-medium text-nexus-text">{detailOrder.shipping_address.recipient_name}</p>
                <p className="text-nexus-muted text-sm">{detailOrder.shipping_address.phone}</p>
                <p className="text-nexus-muted text-sm">{detailOrder.shipping_address.address}, {detailOrder.shipping_address.city}</p>
              </div>
              <div className="p-4 rounded-xl bg-nexus-bg border border-nexus-border space-y-3">
                <p className="text-xs text-nexus-muted uppercase tracking-wider">Item</p>
                {detailOrder.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <img src={item.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                    <div className="flex-1">
                      <p className="text-nexus-text text-sm">{item.name}</p>
                      <p className="text-nexus-muted text-xs">×{item.qty}</p>
                    </div>
                    <p className="text-nexus-cyan text-sm font-semibold">{formatCurrency(item.price)}</p>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span className="text-nexus-text">Total</span>
                <span className="text-nexus-cyan">{formatCurrency(detailOrder.total_amount)}</span>
              </div>
              {NEXT_STATUS[detailOrder.status] && (
                <button
                  onClick={() => updateStatus(detailOrder.id, NEXT_STATUS[detailOrder.status])}
                  className="btn-primary w-full"
                >
                  Proses ke: {STATUS_LABELS[NEXT_STATUS[detailOrder.status]]}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
