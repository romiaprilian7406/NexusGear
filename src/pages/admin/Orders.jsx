import { useState, useEffect } from 'react'
import { Eye, X, Loader2, RefreshCw } from 'lucide-react'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { formatCurrency, formatDate, STATUS_LABELS, STATUS_COLORS } from '../../lib/utils'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

const ALL_STATUSES = ['all', 'pending', 'processing', 'shipped', 'completed', 'cancelled']
const NEXT_STATUS = { pending: 'processing', processing: 'shipped', shipped: 'completed' }

const PAYMENT_LABELS = {
  bca: 'Transfer BCA',
  mandiri: 'Transfer Mandiri',
  bri: 'Transfer BRI',
  qris: 'QRIS',
  va: 'Virtual Account',
  cod: 'COD',
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [detailOrder, setDetailOrder] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          profiles(id, full_name, phone),
          order_items(
            id,
            quantity,
            price_at_purchase,
            products(id, name, image_url)
          )
        `)
        .order('created_at', { ascending: false })
      if (error) throw error
      setOrders(data || [])
    } catch (err) {
      toast.error('Gagal memuat pesanan: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter)

  const updateStatus = async (id, status) => {
    setUpdatingId(id)
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id)
      if (error) throw error
      toast.success(`Status diperbarui: ${STATUS_LABELS[status]}`)
      setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status } : o))
      if (detailOrder?.id === id) setDetailOrder((o) => ({ ...o, status }))
    } catch (err) {
      toast.error('Gagal update status: ' + err.message)
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="flex pt-16">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-rajdhani text-4xl font-bold text-nexus-text">MANAJEMEN PESANAN</h1>
            <p className="text-nexus-muted">{orders.length} total pesanan</p>
          </div>
          <button onClick={fetchOrders} className="btn-outline flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {/* Status filter */}
        <div className="flex gap-2 flex-wrap mb-6">
          {ALL_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                filter === s
                  ? 'bg-nexus-cyan text-nexus-bg'
                  : 'border border-nexus-border text-nexus-muted hover:border-nexus-cyan hover:text-nexus-cyan'
              }`}
            >
              {s === 'all'
                ? `Semua (${orders.length})`
                : `${STATUS_LABELS[s]} (${orders.filter((o) => o.status === s).length})`
              }
            </button>
          ))}
        </div>

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
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-nexus-muted uppercase tracking-wider">{h}</th>
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
                          {order.profiles?.full_name || order.shipping_address?.recipient_name || '-'}
                        </p>
                        <p className="text-nexus-muted text-xs">
                          {order.profiles?.phone || order.shipping_address?.phone || '-'}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-nexus-text font-semibold text-sm">
                        {formatCurrency(order.total_amount)}
                      </td>
                      <td className="px-4 py-3 text-nexus-muted text-sm">
                        {PAYMENT_LABELS[order.payment_method] || order.payment_method}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-semibold border ${STATUS_COLORS[order.status]}`}>
                          {STATUS_LABELS[order.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-nexus-muted text-sm">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {NEXT_STATUS[order.status] && (
                            <button
                              onClick={() => updateStatus(order.id, NEXT_STATUS[order.status])}
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
                <div className="py-16 text-center text-nexus-muted">Tidak ada pesanan</div>
              )}
            </div>
          )}
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
                  {detailOrder.profiles?.full_name || detailOrder.shipping_address?.recipient_name || '-'}
                </p>
                <p className="text-nexus-muted text-sm">
                  {detailOrder.profiles?.phone || detailOrder.shipping_address?.phone || '-'}
                </p>
              </div>

              {/* Alamat */}
              {detailOrder.shipping_address && (
                <div className="p-4 rounded-xl bg-nexus-bg border border-nexus-border">
                  <p className="text-xs text-nexus-muted uppercase tracking-wider mb-2">Alamat Pengiriman</p>
                  <p className="font-medium text-nexus-text">{detailOrder.shipping_address.recipient_name}</p>
                  <p className="text-nexus-muted text-sm">{detailOrder.shipping_address.phone}</p>
                  <p className="text-nexus-muted text-sm">{detailOrder.shipping_address.address}</p>
                  <p className="text-nexus-muted text-sm">
                    {detailOrder.shipping_address.district}, {detailOrder.shipping_address.city}, {detailOrder.shipping_address.province} {detailOrder.shipping_address.postal_code}
                  </p>
                </div>
              )}

              {/* Items */}
              <div className="p-4 rounded-xl bg-nexus-bg border border-nexus-border space-y-3">
                <p className="text-xs text-nexus-muted uppercase tracking-wider">Item Pesanan</p>
                {detailOrder.order_items?.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <img
                      src={item.products?.image_url || 'https://placehold.co/40x40/111118/00D4FF?text=?'}
                      alt=""
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-nexus-text text-sm truncate">{item.products?.name || '-'}</p>
                      <p className="text-nexus-muted text-xs">×{item.quantity}</p>
                    </div>
                    <p className="text-nexus-cyan text-sm font-semibold">
                      {formatCurrency(item.price_at_purchase * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Pembayaran & Total */}
              <div className="p-4 rounded-xl bg-nexus-bg border border-nexus-border">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-nexus-muted">Metode Bayar</span>
                  <span className="text-nexus-text">{PAYMENT_LABELS[detailOrder.payment_method] || detailOrder.payment_method}</span>
                </div>
                <div className="flex justify-between font-bold text-base border-t border-nexus-border pt-2 mt-2">
                  <span className="text-nexus-text">Total</span>
                  <span className="text-nexus-cyan">{formatCurrency(detailOrder.total_amount)}</span>
                </div>
              </div>

              {/* Action */}
              {NEXT_STATUS[detailOrder.status] && (
                <button
                  onClick={() => updateStatus(detailOrder.id, NEXT_STATUS[detailOrder.status])}
                  disabled={updatingId === detailOrder.id}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {updatingId === detailOrder.id
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Memproses...</>
                    : `Proses ke: ${STATUS_LABELS[NEXT_STATUS[detailOrder.status]]}`
                  }
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
