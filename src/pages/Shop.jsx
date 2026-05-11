import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import { useProducts, useCategories } from '../hooks/useProducts'
import { debounce } from '../lib/utils'
import ProductGrid from '../components/product/ProductGrid'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Terbaru' },
  { value: 'price_asc', label: 'Harga Terendah' },
  { value: 'price_desc', label: 'Harga Tertinggi' },
  { value: 'rating', label: 'Rating Tertinggi' },
]

const PRICE_RANGES = [
  { label: 'Semua Harga', min: 0, max: Infinity },
  { label: 'Di bawah Rp500rb', min: 0, max: 500000 },
  { label: 'Rp500rb - Rp1jt', min: 500000, max: 1000000 },
  { label: 'Rp1jt - Rp3jt', min: 1000000, max: 3000000 },
  { label: 'Rp3jt - Rp6jt', min: 3000000, max: 6000000 },
  { label: 'Di atas Rp6jt', min: 6000000, max: Infinity },
]

export default function Shop() {
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get('category') ? parseInt(searchParams.get('category')) : null
  )
  const [featuredOnly, setFeaturedOnly] = useState(
    searchParams.get('featured') === 'true'
  )
  const [selectedPriceRange, setSelectedPriceRange] = useState(0)
  const [minRating, setMinRating] = useState(0)
  const [sort, setSort] = useState('newest')
  const [filterOpen, setFilterOpen] = useState(false)
  const [page, setPage] = useState(1)
  const ITEMS_PER_PAGE = 12

  const { categories } = useCategories()

  const debouncedSetSearch = useCallback(
    debounce((val) => setDebouncedSearch(val), 300),
    []
  )

  useEffect(() => { debouncedSetSearch(search) }, [search])

  const priceRange = PRICE_RANGES[selectedPriceRange]
  const filters = {
    search: debouncedSearch || undefined,
    category_id: selectedCategory || undefined,
    minPrice: priceRange.min || undefined,
    maxPrice: priceRange.max === Infinity ? undefined : priceRange.max,
    minRating: minRating || undefined,
    featured: featuredOnly === true ? true : undefined,
    sort,
  }

  const { products, loading } = useProducts(filters)

  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE)
  const paginated = products.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const clearFilters = () => {
    setSearch('')
    setSelectedCategory(null)
    setSelectedPriceRange(0)
    setMinRating(0)
    setSort('newest')
    setFeaturedOnly(false)
    setPage(1)
  }

  const hasActiveFilters = selectedCategory || selectedPriceRange > 0 || minRating > 0 || search || featuredOnly

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-rajdhani text-4xl font-bold text-nexus-text">
              {featuredOnly
                ? <><span className="gradient-text">FEATURED</span> PRODUCTS</>
                : <span className="gradient-text">SHOP</span>
              }
            </h1>
            <p className="text-nexus-muted">
              {products.length} produk ditemukan
              {featuredOnly && ' · Featured only'}
            </p>
          </div>

          {/* Search + Sort */}
          <div className="flex gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nexus-muted" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari produk..."
                className="input-field pl-10"
              />
            </div>
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all duration-200 ${filterOpen ? 'border-nexus-cyan text-nexus-cyan bg-nexus-cyan/10' : 'border-nexus-border text-nexus-muted hover:border-nexus-cyan hover:text-nexus-cyan'}`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Filter</span>
              {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-nexus-cyan" />}
            </button>
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => { setSort(e.target.value); setPage(1) }}
                className="input-field appearance-none pr-8 cursor-pointer"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-nexus-muted pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {filterOpen && (
          <div className="card mb-6 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Categories */}
              <div>
                <h3 className="font-semibold text-nexus-text mb-3 text-sm uppercase tracking-wider">Kategori</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => { setSelectedCategory(null); setPage(1) }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!selectedCategory ? 'bg-nexus-cyan/10 text-nexus-cyan border border-nexus-cyan/30' : 'text-nexus-muted hover:text-nexus-text hover:bg-nexus-border/30'}`}
                  >
                    Semua Kategori
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => { setSelectedCategory(cat.id); setPage(1) }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${selectedCategory === cat.id ? 'bg-nexus-cyan/10 text-nexus-cyan border border-nexus-cyan/30' : 'text-nexus-muted hover:text-nexus-text hover:bg-nexus-border/30'}`}
                    >
                      <span>{cat.icon}</span> {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="font-semibold text-nexus-text mb-3 text-sm uppercase tracking-wider">Rentang Harga</h3>
                <div className="space-y-2">
                  {PRICE_RANGES.map((range, i) => (
                    <button
                      key={i}
                      onClick={() => { setSelectedPriceRange(i); setPage(1) }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedPriceRange === i ? 'bg-nexus-cyan/10 text-nexus-cyan border border-nexus-cyan/30' : 'text-nexus-muted hover:text-nexus-text hover:bg-nexus-border/30'}`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating + Featured + Reset */}
              <div>
                <h3 className="font-semibold text-nexus-text mb-3 text-sm uppercase tracking-wider">Rating Minimum</h3>
                <div className="space-y-2">
                  {[0, 4, 4.5, 4.8].map((r) => (
                    <button
                      key={r}
                      onClick={() => { setMinRating(r); setPage(1) }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${minRating === r ? 'bg-nexus-cyan/10 text-nexus-cyan border border-nexus-cyan/30' : 'text-nexus-muted hover:text-nexus-text hover:bg-nexus-border/30'}`}
                    >
                      {r === 0 ? 'Semua Rating' : `★ ${r}+`}
                    </button>
                  ))}
                </div>

                {/* Featured toggle */}
                <div className="mt-4">
                  <h3 className="font-semibold text-nexus-text mb-3 text-sm uppercase tracking-wider">Tipe Produk</h3>
                  <button
                    onClick={() => { setFeaturedOnly(!featuredOnly); setPage(1) }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${featuredOnly ? 'bg-nexus-cyan/10 text-nexus-cyan border border-nexus-cyan/30' : 'text-nexus-muted hover:text-nexus-text hover:bg-nexus-border/30'}`}
                  >
                    ⚡ Featured Only
                  </button>
                </div>

                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-red-400/30 text-red-400 hover:bg-red-400/10 text-sm transition-colors"
                  >
                    <X className="w-4 h-4" /> Reset Filter
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Active filter tags */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mb-6">
            {featuredOnly && (
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-nexus-cyan/10 border border-nexus-cyan/30 text-nexus-cyan text-sm">
                ⚡ Featured
                <button onClick={() => setFeaturedOnly(false)}><X className="w-3 h-3" /></button>
              </span>
            )}
            {selectedCategory && categories.find((c) => c.id === selectedCategory) && (
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-nexus-cyan/10 border border-nexus-cyan/30 text-nexus-cyan text-sm">
                {categories.find((c) => c.id === selectedCategory)?.name}
                <button onClick={() => setSelectedCategory(null)}><X className="w-3 h-3" /></button>
              </span>
            )}
            {selectedPriceRange > 0 && (
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-nexus-cyan/10 border border-nexus-cyan/30 text-nexus-cyan text-sm">
                {PRICE_RANGES[selectedPriceRange].label}
                <button onClick={() => setSelectedPriceRange(0)}><X className="w-3 h-3" /></button>
              </span>
            )}
            {search && (
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-nexus-cyan/10 border border-nexus-cyan/30 text-nexus-cyan text-sm">
                "{search}"
                <button onClick={() => setSearch('')}><X className="w-3 h-3" /></button>
              </span>
            )}
          </div>
        )}

        {/* Products */}
        <ProductGrid products={paginated} loading={loading} />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-lg border border-nexus-border text-nexus-muted hover:border-nexus-cyan hover:text-nexus-cyan disabled:opacity-40 transition-all text-sm"
            >
              Prev
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${page === i + 1 ? 'bg-nexus-cyan text-nexus-bg' : 'border border-nexus-border text-nexus-muted hover:border-nexus-cyan hover:text-nexus-cyan'}`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-lg border border-nexus-border text-nexus-muted hover:border-nexus-cyan hover:text-nexus-cyan disabled:opacity-40 transition-all text-sm"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}