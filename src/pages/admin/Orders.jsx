import { useState } from 'react'
import { Eye, X, RefreshCw, Loader2, Search } from 'lucide-react'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { formatCurrency, formatDate, STATUS_LABELS, STATUS_COLORS } from '../../lib/utils'
import { useAllOrders } from '../../hooks/useOrders'
import toast from 'react-hot-toast'

const ALL_STATUSES = ['all', 'pending', 'processing', 'shipped', 'completed', 'cancelled']
const NEXT_STATUS = {
  pending: 'processing',
  processing: 'shipped',
  shipped: 'completed',
}

// Mapping payment method ke label
const PAYMENT_LABELS = {
  bca: 'Transfer BCA',
  mandiri: 'Transfer Mandiri',
  bri: 'Transfer BRI',
  qris: 'QRIS',
  va: 'Virtual Account',
  cod: 'COD',
}

export default function AdminOrders() {
  const { orders, loading, error, updateStatus, refetch } = useAllOrders()
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [detailOrder, setDetailOrder] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)

  const filtered = orders.filter((o) => {
    const matchStatus = filter === 'all' || o.status === filter
    const name = o.profiles?.full_name || ''
    const matchSearch = !search ||
      name.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId)
    const result = await updateStatus(orderId, newStatus)
    if (result.success) {
      toast.success(`Status diperbarui: ${STATUS_LABELS[newStatus]}`)
      // Update detail modal jika sedang terbuka
      if (detailOrder?.id === orderId) {
        setDetailOrder((prev) => ({ ...prev, status: newStatus }))
      }
    } else {
      toast.error('Gagal update status: ' + result.error)
    }
    setUpdatingId(null)
  }

  return (
    <div className="flex pt-16">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-rajdhani text-4xl font-bold text-nexus-text">MANAJEMEN PESANAN</h1>
            <p className="text-nexus-muted">
              {loading ? 'Memuat...' : `${orders.length} total pesanan`}
            </p>
          </div>
          <button
            onClick={refetch}
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
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nexus-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama / order ID..."
              className="input-field pl-10 w-64"
            />
          </div>

          {/* Status filter */}
          <div className="flex gap-2 flex-wrap">
            {ALL_STATUSES.map((s) => {
              const count = s === 'all'
                ? orders.length
                : orders.filter((o) => o.status === s).length
              return (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    filter === s
                      ? 'bg-nexus-cyan text-nexus-bg'
                      : 'border border-nexus-border text-nexus-muted hover:border-nexus-cyan hover:text-nexus-cyan'
                  }`}
                >
                  {s === 'all' ? `Semua (${count})` : `${STATUS_LABELS[s]} (${count})`}
                </button>
              )
            })}
          </div>
        </div>

        {/* Table */}
        <div className="card overflow-hidden p-0">
          {loading ? (
            <div className="flex items-center justify-center py-20 gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-nexus-cyan" />
              <span className="text-nexus-muted">Memuat pesanan...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-nexus-border">
                  <tr>
                    {['Order ID', 'Customer', 'Total', 'Pembayaran', 'Status', 'Tanggal', 'Aksi'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-nexus-muted uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-nexus-border">
                  {filtered.map((order) => (
                    <tr key={order.id} className="hover:bg-nexus-border/10 transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-nexus-cyan font-mono font-semibold text-sm">
                          NXG-{order.id.slice(0, 6).toUpperCase()}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-nexus-text text-sm font-medium">
                          {order.profiles?.full_name || 'Unknown'}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-nexus-text font-semibold text-sm whitespace-nowrap">
                        {formatCurrency(order.total_amount)}
                      </td>
                      <td className="px-4 py-3 text-nexus-muted text-sm">
                        {PAYMENT_LABELS[order.payment_method] || order.payment_method || '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-semibold border whitespace-nowrap ${STATUS_COLORS[order.status]}`}>
                          {STATUS_LABELS[order.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-nexus-muted text-sm whitespace-nowrap">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {NEXT_STATUS[order.status] && (
                            <button
                              onClick={() => handleUpdateStatus(order.id, NEXT_STATUS[order.status])}
                              disabled={updatingId === order.id}
                              className="text-xs px-2 py-1 rounded-lg bg-nexus-cyan/10 text-nexus-cyan border border-nexus-cyan/30 hover:bg-nexus-cyan/20 transition-colors whitespace-nowrap disabled:opacity-50"
                            >
                              {updatingId === order.id
                                ? '...'
                                : `→ ${STATUS_LABELS[NEXT_STATUS[order.status]]}`
                              }
                            </button>
                          )}
                          <button
                            onClick={() => setDetailOrder(order)}
                            className="p-1.5 text-nexus-muted hover:text-nexus-cyan hover:bg-nexus-cyan/10 rounded-lg transition-all"
                            title="Lihat detail"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && !loading && (
                <div className="py-16 text-center text-nexus-muted">
                  {error ? 'Gagal memuat data' : 'Tidak ada pesanan ditemukan'}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Detail Modal */}
      {detailOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setDetailOrder(null)}
          />
          <div className="relative w-full max-w-lg bg-nexus-surface border border-nexus-border rounded-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-nexus-border sticky top-0 bg-nexus-surface z-10">
              <h2 className="font-rajdhani text-2xl font-bold text-nexus-text">Detail Pesanan</h2>
              <button
                onClick={() => setDetailOrder(null)}
                className="p-2 text-nexus-muted hover:text-nexus-cyan rounded-lg hover:bg-nexus-border/30"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Order ID & Status */}
              <div className="flex justify-between items-center">
                <span className="text-nexus-cyan font-bold font-mono">
                  NXG-{detailOrder.id.slice(0, 6).toUpperCase()}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${STATUS_COLORS[detailOrder.status]}`}>
                  {STATUS_LABELS[detailOrder.status]}
                </span>
              </div>

              {/* Customer */}
              <div className="p-4 rounded-xl bg-nexus-bg border border-nexus-border">
                <p className="text-xs text-nexus-muted uppercase tracking-wider mb-2">Customer</p>
                <p className="font-medium text-nexus-text">
                  {detailOrder.profiles?.full_name || 'Unknown User'}
                </p>
                <p className="text-nexus-muted text-sm">{formatDate(detailOrder.created_at)}</p>
              </div>

              {/* Shipping Address */}
              {detailOrder.shipping_address && (
                <div className="p-4 rounded-xl bg-nexus-bg border border-nexus-border">
                  <p className="text-xs text-nexus-muted uppercase tracking-wider mb-2">Alamat Pengiriman</p>
                  <p className="font-medium text-nexus-text">
                    {detailOrder.shipping_address.recipient_name}
                  </p>
                  <p className="text-nexus-muted text-sm">{detailOrder.shipping_address.phone}</p>
                  <p className="text-nexus-muted text-sm">{detailOrder.shipping_address.address}</p>
                  <p className="text-nexus-muted text-sm">
                    {detailOrder.shipping_address.city}, {detailOrder.shipping_address.province}
                  </p>
                </div>
              )}

              {/* Payment Method */}
              <div className="p-4 rounded-xl bg-nexus-bg border border-nexus-border">
                <p className="text-xs text-nexus-muted uppercase tracking-wider mb-2">Metode Pembayaran</p>
                <p className="text-nexus-text font-medium">
                  {PAYMENT_LABELS[detailOrder.payment_method] || detailOrder.payment_method || '-'}
                </p>
              </div>

              {/* Items */}
              {detailOrder.order_items && detailOrder.order_items.length > 0 && (
                <div className="p-4 rounded-xl bg-nexus-bg border border-nexus-border space-y-3">
                  <p className="text-xs text-nexus-muted uppercase tracking-wider">Item Pesanan</p>
                  {detailOrder.order_items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <img
                        src={item.products?.image_url || 'https://placehold.co/40x40/111118/00D4FF?text=?'}
                        alt={item.products?.name}
                        className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-nexus-text text-sm truncate">
                          {item.products?.name || 'Produk dihapus'}
                        </p>
                        <p className="text-nexus-muted text-xs">
                          ×{item.quantity} × {formatCurrency(item.price_at_purchase)}
                        </p>
                      </div>
                      <p className="text-nexus-cyan text-sm font-semibold flex-shrink-0">
                        {formatCurrency(item.price_at_purchase * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Total */}
              <div className="flex justify-between font-bold text-lg border-t border-nexus-border pt-3">
                <span className="text-nexus-text">Total</span>
                <span className="text-nexus-cyan">{formatCurrency(detailOrder.total_amount)}</span>
              </div>

              {/* Action Button */}
              {NEXT_STATUS[detailOrder.status] && (
                <button
                  onClick={() => handleUpdateStatus(detailOrder.id, NEXT_STATUS[detailOrder.status])}
                  disabled={updatingId === detailOrder.id}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {updatingId === detailOrder.id
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Memperbarui...</>
                    : `Proses ke: ${STATUS_LABELS[NEXT_STATUS[detailOrder.status]]}`
                  }
                </button>
              )}

              {/* Cancel button untuk pending */}
              {detailOrder.status === 'pending' && (
                <button
                  onClick={() => handleUpdateStatus(detailOrder.id, 'cancelled')}
                  disabled={updatingId === detailOrder.id}
                  className="w-full px-4 py-2.5 rounded-lg border border-red-400/30 text-red-400 hover:bg-red-400/10 text-sm font-medium transition-colors"
                >
                  Batalkan Pesanan
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
