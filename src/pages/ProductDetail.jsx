import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Star, ShoppingCart, Zap, ChevronRight, Minus, Plus, ArrowLeft } from 'lucide-react'
import { useProduct } from '../hooks/useProducts'
import { MOCK_CATEGORIES, formatCurrency } from '../lib/utils'
import useCartStore from '../stores/cartStore'
import { PageLoading } from '../components/shared/Loading'
import toast from 'react-hot-toast'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { product, loading } = useProduct(id)
  const { addItem } = useCartStore()
  const [qty, setQty] = useState(1)
  const [zoomed, setZoomed] = useState(false)

  if (loading) return <PageLoading />
  if (!product) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="font-rajdhani text-3xl text-nexus-muted mb-4">Produk tidak ditemukan</p>
        <Link to="/shop" className="btn-primary">Kembali ke Shop</Link>
      </div>
    </div>
  )

  const category = MOCK_CATEGORIES.find((c) => c.id === product.category_id)

  const handleAddToCart = () => {
    addItem(product, qty)
    toast.success(`${product.name} × ${qty} ditambahkan ke keranjang!`)
  }

  const handleBuyNow = () => {
    addItem(product, qty)
    navigate('/checkout')
  }

  const stockStatus = product.stock === 0
    ? { label: 'Stok Habis', color: 'text-red-400' }
    : product.stock <= 5
    ? { label: `Sisa ${product.stock} unit`, color: 'text-yellow-400' }
    : { label: `${product.stock} unit tersedia`, color: 'text-green-400' }

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-nexus-muted mb-8">
          <Link to="/" className="hover:text-nexus-cyan transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link to="/shop" className="hover:text-nexus-cyan transition-colors">Shop</Link>
          {category && (
            <>
              <ChevronRight className="w-4 h-4" />
              <Link to={`/shop?category=${category.id}`} className="hover:text-nexus-cyan transition-colors">
                {category.name}
              </Link>
            </>
          )}
          <ChevronRight className="w-4 h-4" />
          <span className="text-nexus-text truncate max-w-[200px]">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image */}
          <div className="relative">
            <div
              className="relative overflow-hidden rounded-2xl bg-nexus-surface border border-nexus-border aspect-square cursor-zoom-in group"
              onMouseEnter={() => setZoomed(true)}
              onMouseLeave={() => setZoomed(false)}
            >
              <img
                src={product.image_url}
                alt={product.name}
                className={`w-full h-full object-cover transition-transform duration-500 ${zoomed ? 'scale-125' : 'scale-100'}`}
              />
              {product.is_featured && (
                <div className="absolute top-4 left-4 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-nexus-cyan to-nexus-purple text-sm font-bold text-white">
                  <Zap className="w-4 h-4" /> FEATURED
                </div>
              )}
              <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-lg bg-nexus-bg/80 backdrop-blur-sm text-xs text-nexus-muted border border-nexus-border">
                Hover untuk zoom
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-col justify-center">
            {category && (
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{category.icon}</span>
                <span className="text-nexus-muted text-sm uppercase tracking-wider font-medium">{category.name}</span>
              </div>
            )}

            <h1 className="font-rajdhani text-4xl sm:text-5xl font-bold text-nexus-text leading-tight mb-4">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-nexus-border'}`} />
                ))}
              </div>
              <span className="text-nexus-text font-semibold">{product.rating}</span>
              <span className="text-nexus-muted text-sm">• {Math.floor(Math.random() * 200 + 50)} ulasan</span>
            </div>

            {/* Price */}
            <div className="mb-6">
              <p className="font-rajdhani text-5xl font-bold text-nexus-cyan mb-2">
                {formatCurrency(product.price)}
              </p>
              <p className={`text-sm font-medium ${stockStatus.color}`}>
                ● {stockStatus.label}
              </p>
            </div>

            {/* Description */}
            <div className="prose prose-invert mb-8">
              <p className="text-nexus-muted leading-relaxed">{product.description}</p>
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-nexus-muted text-sm font-medium">Jumlah:</span>
              <div className="flex items-center gap-1 bg-nexus-bg border border-nexus-border rounded-lg p-1">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 flex items-center justify-center text-nexus-muted hover:text-nexus-cyan transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-bold text-nexus-text">{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                  disabled={qty >= product.stock}
                  className="w-8 h-8 flex items-center justify-center text-nexus-muted hover:text-nexus-cyan transition-colors disabled:opacity-40"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <span className="text-nexus-muted text-sm">Subtotal: <span className="text-nexus-text font-semibold">{formatCurrency(product.price * qty)}</span></span>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 flex items-center justify-center gap-2 btn-outline py-3.5 font-semibold"
              >
                <ShoppingCart className="w-5 h-5" /> Tambah ke Keranjang
              </button>
              <button
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                className="flex-1 flex items-center justify-center gap-2 btn-primary py-3.5 text-base"
              >
                <Zap className="w-5 h-5" /> Beli Sekarang
              </button>
            </div>

            {/* Specs mini */}
            <div className="mt-8 p-4 rounded-xl bg-nexus-bg border border-nexus-border">
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  ['Kategori', category?.name || '-'],
                  ['Rating', `${product.rating}/5.0`],
                  ['Stok', product.stock > 0 ? `${product.stock} unit` : 'Habis'],
                  ['Status', product.is_featured ? 'Featured' : 'Regular'],
                ].map(([key, val]) => (
                  <div key={key}>
                    <span className="text-nexus-muted">{key}:</span>
                    <span className="text-nexus-text font-medium ml-2">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={() => navigate(-1)} className="mt-6 flex items-center gap-2 text-nexus-muted hover:text-nexus-cyan transition-colors text-sm self-start">
              <ArrowLeft className="w-4 h-4" /> Kembali
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
