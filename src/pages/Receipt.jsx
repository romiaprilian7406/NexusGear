import { useParams, useLocation, Link } from 'react-router-dom'
import { Zap, Printer, Package, CheckCircle2 } from 'lucide-react'
import { formatCurrency, formatDateTime, calculateShipping } from '../lib/utils'
import useAuthStore from '../stores/authStore'

const PAYMENT_LABELS = {
  bca: 'Transfer Bank BCA',
  mandiri: 'Transfer Bank Mandiri',
  bri: 'Transfer Bank BRI',
  qris: 'QRIS',
  va: 'Virtual Account',
  cod: 'COD (Bayar di Tempat)',
}

export default function Receipt() {
  const { orderId } = useParams()
  const { state } = useLocation()
  const { profile } = useAuthStore()
  const order = state?.order

  const handlePrint = () => window.print()

  if (!order) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-nexus-muted mb-4">Data pesanan tidak ditemukan.</p>
          <Link to="/orders" className="btn-primary">Lihat Riwayat Pesanan</Link>
        </div>
      </div>
    )
  }

  const subtotal = order.items?.reduce((s, i) => s + i.product.price * i.quantity, 0) || order.total_amount
  const shipping = calculateShipping(subtotal)
  const total = order.total_amount

  const displayOrderId = orderId.startsWith('mock-')
    ? `NXG-${orderId.slice(-6).toUpperCase()}`
    : `NXG-${orderId.slice(0, 6).toUpperCase()}`

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Banner */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-green-500/10 border-2 border-green-500/30 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="font-rajdhani text-4xl font-bold text-nexus-text mb-2">Pesanan Berhasil!</h1>
          <p className="text-nexus-muted">Terima kasih telah berbelanja di NexusGear</p>
        </div>

        {/* Receipt Card */}
        <div id="receipt" className="card border-nexus-cyan/20 shadow-[0_0_30px_rgba(0,212,255,0.08)] print:shadow-none">
          {/* Header */}
          <div className="flex items-center justify-between pb-6 border-b border-nexus-border mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-nexus-cyan to-nexus-purple flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-rajdhani text-2xl font-bold gradient-text">NEXUSGEAR</p>
                <p className="text-nexus-muted text-xs">Gaming Gear Premium</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-nexus-muted text-xs">No. Invoice</p>
              <p className="font-rajdhani text-lg font-bold text-nexus-cyan">{displayOrderId}</p>
              <p className="text-nexus-muted text-xs">{formatDateTime(new Date())}</p>
            </div>
          </div>

          {/* Customer & Shipping */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-nexus-muted text-xs uppercase tracking-wider mb-2">Pembeli</p>
              <p className="font-semibold text-nexus-text">{profile?.full_name || 'Customer'}</p>
            </div>
            {order.shipping_address && (
              <div>
                <p className="text-nexus-muted text-xs uppercase tracking-wider mb-2">Dikirim ke</p>
                <p className="font-semibold text-nexus-text">{order.shipping_address.recipient_name}</p>
                <p className="text-nexus-muted text-sm">{order.shipping_address.phone}</p>
                <p className="text-nexus-muted text-sm">{order.shipping_address.address}</p>
                <p className="text-nexus-muted text-sm">{order.shipping_address.city}, {order.shipping_address.province}</p>
              </div>
            )}
          </div>

          {/* Items */}
          <div className="mb-6">
            <p className="text-nexus-muted text-xs uppercase tracking-wider mb-3">Item Pesanan</p>
            <div className="space-y-3 bg-nexus-bg rounded-xl p-4 border border-nexus-border">
              <div className="grid grid-cols-4 text-xs text-nexus-muted uppercase tracking-wider pb-2 border-b border-nexus-border">
                <span className="col-span-2">Produk</span>
                <span className="text-center">Qty</span>
                <span className="text-right">Harga</span>
              </div>
              {order.items?.map((item) => (
                <div key={item.product.id} className="grid grid-cols-4 text-sm items-center">
                  <div className="col-span-2 flex items-center gap-2">
                    <img src={item.product.image_url} alt="" className="w-8 h-8 rounded object-cover" />
                    <span className="text-nexus-text truncate">{item.product.name}</span>
                  </div>
                  <span className="text-center text-nexus-muted">×{item.quantity}</span>
                  <span className="text-right text-nexus-text font-medium">{formatCurrency(item.product.price * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="space-y-2 text-sm mb-6 pb-6 border-b border-nexus-border">
            <div className="flex justify-between text-nexus-muted">
              <span>Subtotal</span>
              <span className="text-nexus-text">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-nexus-muted">
              <span>Ongkos Kirim</span>
              <span className={shipping === 0 ? 'text-green-400' : 'text-nexus-text'}>
                {shipping === 0 ? 'GRATIS' : formatCurrency(shipping)}
              </span>
            </div>
            <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t border-nexus-border">
              <span className="text-nexus-text font-rajdhani text-xl">TOTAL PEMBAYARAN</span>
              <span className="text-nexus-cyan font-rajdhani text-2xl">{formatCurrency(total)}</span>
            </div>
          </div>

          {/* Payment & Status */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-nexus-muted text-xs uppercase tracking-wider mb-1">Metode Bayar</p>
              <p className="text-nexus-text font-medium">{PAYMENT_LABELS[order.payment_method] || order.payment_method}</p>
            </div>
            <div className="px-4 py-2 rounded-xl border border-yellow-400/30 bg-yellow-400/10">
              <p className="text-yellow-400 font-semibold text-sm">⏳ Menunggu Pembayaran</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <button
            onClick={handlePrint}
            className="btn-outline flex-1 flex items-center justify-center gap-2 py-3"
          >
            <Printer className="w-4 h-4" /> Download / Print Invoice
          </button>
          <Link to="/orders" className="btn-primary flex-1 flex items-center justify-center gap-2 py-3">
            <Package className="w-4 h-4" /> Lihat Riwayat Pesanan
          </Link>
        </div>

        <div className="text-center mt-4">
          <Link to="/" className="text-nexus-muted hover:text-nexus-cyan text-sm transition-colors">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  )
}
