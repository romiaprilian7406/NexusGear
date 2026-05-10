import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { X, ShoppingCart, Trash2, Plus, Minus, ArrowRight } from 'lucide-react'
import useCartStore from '../../stores/cartStore'
import useUIStore from '../../stores/uiStore'
import { formatCurrency, calculateShipping, FREE_SHIPPING_THRESHOLD } from '../../lib/utils'

export default function CartDrawer() {
  const { cartOpen, closeCart } = useUIStore()
  const { items, removeItem, updateQuantity, total } = useCartStore()

  const subtotal = items.reduce((s, i) => s + i.product.price * i.quantity, 0)
  const shipping = calculateShipping(subtotal)
  const grandTotal = subtotal + shipping

  useEffect(() => {
    if (cartOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [cartOpen])

  if (!cartOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full sm:w-[420px] bg-nexus-surface border-l border-nexus-border z-50 flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-nexus-border">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-5 h-5 text-nexus-cyan" />
            <h2 className="font-rajdhani text-xl font-bold text-nexus-text">Keranjang</h2>
            <span className="px-2 py-0.5 rounded-full bg-nexus-cyan/10 text-nexus-cyan text-xs font-bold border border-nexus-cyan/30">
              {items.reduce((s, i) => s + i.quantity, 0)}
            </span>
          </div>
          <button onClick={closeCart} className="p-2 text-nexus-muted hover:text-nexus-cyan transition-colors rounded-lg hover:bg-nexus-border/30">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-10 text-center">
              <ShoppingCart className="w-16 h-16 text-nexus-border mb-4" />
              <p className="font-rajdhani text-xl text-nexus-muted mb-2">Keranjang Kosong</p>
              <p className="text-nexus-muted text-sm mb-6">Tambahkan produk untuk mulai belanja</p>
              <Link to="/shop" onClick={closeCart} className="btn-primary text-sm">
                Mulai Belanja
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.product.id} className="flex gap-4 p-3 rounded-xl bg-nexus-bg border border-nexus-border">
                <img
                  src={item.product.image_url}
                  alt={item.product.name}
                  className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-nexus-text text-sm leading-tight mb-1 truncate">{item.product.name}</h4>
                  <p className="text-nexus-cyan font-bold text-sm mb-2">{formatCurrency(item.product.price)}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 bg-nexus-surface rounded-lg p-1">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="w-6 h-6 flex items-center justify-center rounded text-nexus-muted hover:text-nexus-cyan hover:bg-nexus-border/50 transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-sm font-bold text-nexus-text">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock}
                        className="w-6 h-6 flex items-center justify-center rounded text-nexus-muted hover:text-nexus-cyan hover:bg-nexus-border/50 transition-colors disabled:opacity-40"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="p-1.5 text-nexus-muted hover:text-red-400 transition-colors rounded-lg hover:bg-red-400/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-6 py-4 border-t border-nexus-border space-y-3">
            {subtotal < FREE_SHIPPING_THRESHOLD && (
              <div className="text-xs text-nexus-muted text-center p-2 rounded-lg bg-nexus-bg border border-nexus-border">
                Tambah {formatCurrency(FREE_SHIPPING_THRESHOLD - subtotal)} lagi untuk <span className="text-nexus-cyan font-semibold">gratis ongkir!</span>
              </div>
            )}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-nexus-muted">
                <span>Subtotal</span>
                <span className="text-nexus-text">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-nexus-muted">
                <span>Ongkir</span>
                <span className={shipping === 0 ? 'text-green-400 font-semibold' : 'text-nexus-text'}>
                  {shipping === 0 ? 'GRATIS' : formatCurrency(shipping)}
                </span>
              </div>
              <div className="flex justify-between font-bold text-base pt-2 border-t border-nexus-border">
                <span className="text-nexus-text">Total</span>
                <span className="text-nexus-cyan">{formatCurrency(grandTotal)}</span>
              </div>
            </div>
            <Link
              to="/checkout"
              onClick={closeCart}
              className="flex items-center justify-center gap-2 w-full btn-primary"
            >
              Checkout <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
