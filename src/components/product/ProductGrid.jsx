import ProductCard from './ProductCard'
import { Loading } from '../shared/Loading'
import { EmptyState } from '../shared/EmptyState'
import { ShoppingBag } from 'lucide-react'

export default function ProductGrid({ products, loading }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loading size="lg" text="Memuat produk..." />
      </div>
    )
  }

  if (!products.length) {
    return (
      <EmptyState
        icon={<ShoppingBag className="w-12 h-12 text-nexus-muted" />}
        title="Produk tidak ditemukan"
        description="Coba ubah filter atau kata kunci pencarian."
      />
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
