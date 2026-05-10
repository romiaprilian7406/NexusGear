import { Link } from 'react-router-dom'
import { ShoppingCart, Star, Eye, Zap } from 'lucide-react'
import { formatCurrency } from '../../lib/utils'
import useCartStore from '../../stores/cartStore'
import toast from 'react-hot-toast'

export default function ProductCard({ product }) {
  const { addItem } = useCartStore()

  const handleAddToCart = (e) => {
    e.preventDefault()
    addItem(product, 1)
    toast.success(`${product.name} ditambahkan ke keranjang!`)
  }

  const stockStatus = product.stock === 0
    ? { label: 'Habis', color: 'text-red-400 bg-red-400/10 border-red-400/30' }
    : product.stock <= 5
    ? { label: `Sisa ${product.stock}`, color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30' }
    : { label: 'Tersedia', color: 'text-green-400 bg-green-400/10 border-green-400/30' }

  return (
    <Link to={`/product/${product.id}`} className="group block">
      <div className="card card-hover overflow-hidden h-full flex flex-col">
        {/* Image */}
        <div className="relative overflow-hidden rounded-lg mb-4 bg-nexus-bg aspect-square">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          {product.is_featured && (
            <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded bg-gradient-to-r from-nexus-cyan to-nexus-purple text-xs font-bold text-white">
              <Zap className="w-3 h-3" /> FEATURED
            </div>
          )}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="flex items-center gap-1 text-nexus-cyan text-sm font-medium">
              <Eye className="w-4 h-4" /> Lihat Detail
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col flex-1">
          <p className="text-nexus-muted text-xs mb-1">Gaming Gear</p>
          <h3 className="font-rajdhani text-lg font-semibold text-nexus-text group-hover:text-nexus-cyan transition-colors duration-200 leading-tight mb-2">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mb-3">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-nexus-border'}`}
                />
              ))}
            </div>
            <span className="text-nexus-muted text-xs">{product.rating}</span>
          </div>

          <div className="mt-auto">
            {/* Stock */}
            <span className={`inline-flex text-xs px-2 py-0.5 rounded border mb-3 ${stockStatus.color}`}>
              {stockStatus.label}
            </span>

            {/* Price + Cart */}
            <div className="flex items-center justify-between gap-2">
              <p className="font-rajdhani text-xl font-bold text-nexus-cyan">
                {formatCurrency(product.price)}
              </p>
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="p-2 rounded-lg border border-nexus-border hover:border-nexus-cyan hover:bg-nexus-cyan/10 hover:text-nexus-cyan text-nexus-muted transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                title="Tambah ke keranjang"
              >
                <ShoppingCart className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
