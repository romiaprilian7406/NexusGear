import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, ChevronRight, Filter } from 'lucide-react'
import { useOrders } from '../hooks/useOrders'
import { formatCurrency, formatDate, STATUS_LABELS, STATUS_COLORS } from '../lib/utils'
import { Loading } from '../components/shared/Loading'
import { EmptyState } from '../components/shared/EmptyState'

const ALL_STATUSES = ['all', 'pending', 'processing', 'shipped', 'completed', 'cancelled']

export default function OrderHistory() {
  const { orders, loading } = useOrders()
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = statusFilter === 'all' ? orders : orders.filter((o) => o.status === statusFilter)

  // Demo orders when Supabase not configured
  const demoOrders = [
    {
      id: 'demo-001',
      status: 'completed',
      total_amount: 2600000,
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      payment_method: 'bca',
      order_items: [
        { id: 1, quantity: 1, price_at_purchase: 1850000, products: { name: 'Razer BlackWidow V4', image_url: 'https://placehold.co/400x400/111118/00D4FF?text=BlackWidow+V4' } },
        { id: 2, quantity: 1, price_at_purchase: 750000, products: { name: 'Razer DeathAdder V3', image_url: 'https://placehold.co/400x400/111118/00D4FF?text=DeathAdder+V3' } },
      ],
    },
    {
      id: 'demo-002',
      status: 'shipped',
      total_amount: 1215000,
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      payment_method: 'qris',
      order_items: [
        { id: 3, quantity: 1, price_at_purchase: 1200000, products: { name: 'HyperX Cloud Alpha', image_url: 'https://placehold.co/400x400/111118/00D4FF?text=Cloud+Alpha' } },
      ],
    },
  ]

  const displayOrders = orders.length > 0 ? filtered : demoOrders.filter((o) => statusFilter === 'all' || o.status === statusFilter)

  if (loading) return <div className="pt-20 flex justify-center py-20"><Loading size="lg" text="Memuat pesanan..." /></div>

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-rajdhani text-4xl font-bold text-nexus-text">
            RIWAYAT <span className="gradient-text">PESANAN</span>
          </h1>
        </div>

        {/* Status Filter */}
        <div className="flex gap-2 flex-wrap mb-6">
          {ALL_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${statusFilter === s ? 'bg-nexus-cyan text-nexus-bg' : 'border border-nexus-border text-nexus-muted hover:border-nexus-cyan hover:text-nexus-cyan'}`}
            >
              {s === 'all' ? 'Semua' : STATUS_LABELS[s]}
            </button>
          ))}
        </div>

        {displayOrders.length === 0 ? (
          <EmptyState
            icon={<Package className="w-16 h-16 text-nexus-border" />}
            title="Belum ada pesanan"
            description="Mulai belanja dan temukan gaming gear impianmu!"
            action={<Link to="/shop" className="btn-primary">Mulai Belanja</Link>}
          />
        ) : (
          <div className="space-y-4">
            {displayOrders.map((order) => (
              <div key={order.id} className="card card-hover">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-nexus-muted text-xs mb-1">No. Pesanan</p>
                    <p className="font-rajdhani text-lg font-bold text-nexus-cyan">
                      NXG-{order.id.slice(0, 6).toUpperCase()}
                    </p>
                    <p className="text-nexus-muted text-xs">{formatDate(order.created_at)}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${STATUS_COLORS[order.status]}`}>
                    {STATUS_LABELS[order.status]}
                  </span>
                </div>

                {/* Items preview */}
                <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide">
                  {order.order_items?.map((item) => (
                    <img
                      key={item.id}
                      src={item.products?.image_url || 'https://placehold.co/60x60/111118/00D4FF?text=?'}
                      alt={item.products?.name}
                      title={`${item.products?.name} ×${item.quantity}`}
                      className="w-14 h-14 rounded-lg object-cover flex-shrink-0 border border-nexus-border"
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-nexus-muted text-xs">Total Pembayaran</p>
                    <p className="font-rajdhani text-xl font-bold text-nexus-text">{formatCurrency(order.total_amount)}</p>
                  </div>
                  <Link
                    to={`/receipt/${order.id}`}
                    state={{ order }}
                    className="flex items-center gap-1 text-nexus-cyan text-sm hover:underline"
                  >
                    Lihat Detail <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
