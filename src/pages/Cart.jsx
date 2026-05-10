import { Link, useNavigate } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight, ArrowLeft } from 'lucide-react'
import useCartStore from '../stores/cartStore'
import { formatCurrency, calculateShipping, FREE_SHIPPING_THRESHOLD } from '../lib/utils'

export default function Cart() {
  const { items, removeItem, updateQuantity, clearCart } = useCartStore()
  const navigate = useNavigate()

  const subtotal = items.reduce((s, i) => s + i.product.price * i.quantity, 0)
  const shipping = calculateShipping(subtotal)
  const total = subtotal + shipping

  if (!items.length) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-32 h-32 rounded-full bg-nexus-surface border border-nexus-border flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="w-16 h-16 text-nexus-border" />
          </div>
          <h2 className="font-rajdhani text-4xl font-bold text-nexus-text mb-3">Keranjang Kosong</h2>
          <p className="text-nexus-muted mb-8">Temukan produk gaming gear favoritmu!</p>
          <Link to="/shop" className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-3">
            Mulai Belanja <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-rajdhani text-4xl font-bold text-nexus-text">
            KERANJANG <span className="gradient-text">BELANJA</span>
          </h1>
          <button onClick={clearCart} className="text-sm text-red-400 hover:text-red-300 transition-colors flex items-center gap-1">
            <Trash2 className="w-4 h-4" /> Hapus Semua
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.product.id} className="card card-hover flex gap-4">
                <img
                  src={item.product.image_url}
                  alt={item.product.name}
                  className="w-28 h-28 rounded-xl object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <Link to={`/product/${item.product.id}`} className="font-rajdhani text-xl font-semibold text-nexus-text hover:text-nexus-cyan transition-colors">
                        {item.product.name}
                      </Link>
                      <p className="text-nexus-muted text-sm">{formatCurrency(item.product.price)} / unit</p>
                    </div>
                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="p-1.5 text-nexus-muted hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2 bg-nexus-bg border border-nexus-border rounded-lg p-1">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center text-nexus-muted hover:text-nexus-cyan transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-10 text-center font-bold text-nexus-text">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock}
                        className="w-8 h-8 flex items-center justify-center text-nexus-muted hover:text-nexus-cyan transition-colors disabled:opacity-40"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="font-rajdhani text-xl font-bold text-nexus-cyan">
                      {formatCurrency(item.product.price * item.quantity)}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-nexus-muted hover:text-nexus-cyan transition-colors text-sm mt-4">
              <ArrowLeft className="w-4 h-4" /> Lanjut Belanja
            </button>
          </div>

          {/* Summary */}
          <div>
            <div className="card sticky top-24">
              <h3 className="font-rajdhani text-xl font-bold text-nexus-text mb-6">RINGKASAN PESANAN</h3>

              {subtotal < FREE_SHIPPING_THRESHOLD && (
                <div className="mb-4 p-3 rounded-lg bg-nexus-bg border border-nexus-border text-xs text-nexus-muted">
                  🚀 Tambah <span className="text-nexus-cyan font-semibold">{formatCurrency(FREE_SHIPPING_THRESHOLD - subtotal)}</span> lagi untuk gratis ongkir!
                  <div className="mt-2 h-1.5 bg-nexus-border rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-nexus-cyan to-nexus-purple rounded-full transition-all duration-300" style={{ width: `${Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)}%` }} />
                  </div>
                </div>
              )}

              <div className="space-y-3 text-sm border-b border-nexus-border pb-4 mb-4">
                <div className="flex justify-between text-nexus-muted">
                  <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} item)</span>
                  <span className="text-nexus-text">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-nexus-muted">
                  <span>Ongkos Kirim</span>
                  <span className={shipping === 0 ? 'text-green-400 font-semibold' : 'text-nexus-text'}>
                    {shipping === 0 ? '✓ GRATIS' : formatCurrency(shipping)}
                  </span>
                </div>
              </div>

              <div className="flex justify-between mb-6">
                <span className="font-rajdhani text-xl font-bold text-nexus-text">TOTAL</span>
                <span className="font-rajdhani text-2xl font-bold text-nexus-cyan">{formatCurrency(total)}</span>
              </div>

              <Link to="/checkout" className="btn-primary w-full flex items-center justify-center gap-2 text-base py-3.5">
                Lanjut ke Checkout <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
