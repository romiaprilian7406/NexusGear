import { useState } from 'react'
import { Plus, Edit2, Trash2, Search, Star, X, Loader2, Zap } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { MOCK_PRODUCTS, MOCK_CATEGORIES, formatCurrency } from '../../lib/utils'
import toast from 'react-hot-toast'

const productSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  price: z.number().min(1000, 'Harga minimal Rp1.000'),
  stock: z.number().min(0, 'Stok tidak boleh negatif'),
  category_id: z.number().min(1, 'Pilih kategori'),
  description: z.string().optional(),
  image_url: z.string().url('URL gambar tidak valid').optional().or(z.literal('')),
})

export default function AdminProducts() {
  const [products, setProducts] = useState([...MOCK_PRODUCTS])
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(productSchema),
  })

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchCat = filterCat === 0 || p.category_id === filterCat
    return matchSearch && matchCat
  })

  const openAdd = () => {
    setEditProduct(null)
    reset({ name: '', price: 0, stock: 0, category_id: 1, description: '', image_url: '' })
    setModalOpen(true)
  }

  const openEdit = (product) => {
    setEditProduct(product)
    reset({
      name: product.name,
      price: product.price,
      stock: product.stock,
      category_id: product.category_id,
      description: product.description,
      image_url: product.image_url,
    })
    setModalOpen(true)
  }

  const onSubmit = async (data) => {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 500)) // Simulate async
    if (editProduct) {
      setProducts((prev) => prev.map((p) => p.id === editProduct.id ? { ...p, ...data } : p))
      toast.success('Produk berhasil diperbarui!')
    } else {
      const newProduct = { ...data, id: Date.now(), rating: 4.5, is_featured: false, created_at: new Date().toISOString() }
      setProducts((prev) => [newProduct, ...prev])
      toast.success('Produk berhasil ditambahkan!')
    }
    setSaving(false)
    setModalOpen(false)
  }

  const handleDelete = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id))
    setDeleteConfirm(null)
    toast.success('Produk berhasil dihapus!')
  }

  const toggleFeatured = (id) => {
    setProducts((prev) => prev.map((p) => p.id === id ? { ...p, is_featured: !p.is_featured } : p))
    toast.success('Status featured diperbarui!')
  }

  return (
    <div className="flex pt-16">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-rajdhani text-4xl font-bold text-nexus-text">MANAJEMEN PRODUK</h1>
            <p className="text-nexus-muted">{products.length} produk total</p>
          </div>
          <button onClick={openAdd} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Tambah Produk
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nexus-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari produk..."
              className="input-field pl-10 w-64"
            />
          </div>
          <select
            value={filterCat}
            onChange={(e) => setFilterCat(parseInt(e.target.value))}
            className="input-field w-40"
          >
            <option value={0}>Semua Kategori</option>
            {MOCK_CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-nexus-border">
                <tr>
                  {['Produk', 'Kategori', 'Harga', 'Stok', 'Rating', 'Featured', 'Aksi'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-nexus-muted uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-nexus-border">
                {filtered.map((product) => {
                  const cat = MOCK_CATEGORIES.find((c) => c.id === product.category_id)
                  return (
                    <tr key={product.id} className="hover:bg-nexus-border/10 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img src={product.image_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                          <p className="text-nexus-text font-medium text-sm">{product.name}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1 text-nexus-muted text-sm">
                          {cat?.icon} {cat?.name}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-nexus-cyan font-semibold text-sm">{formatCurrency(product.price)}</td>
                      <td className="px-4 py-3">
                        <span className={`text-sm font-medium ${product.stock === 0 ? 'text-red-400' : product.stock <= 5 ? 'text-yellow-400' : 'text-green-400'}`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                          <span className="text-nexus-text text-sm">{product.rating}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleFeatured(product.id)}
                          className={`relative w-10 h-5 rounded-full transition-all duration-200 ${product.is_featured ? 'bg-nexus-cyan' : 'bg-nexus-border'}`}
                        >
                          <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${product.is_featured ? 'left-5' : 'left-0.5'}`} />
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEdit(product)} className="p-1.5 text-nexus-muted hover:text-nexus-cyan hover:bg-nexus-cyan/10 rounded-lg transition-all">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => setDeleteConfirm(product.id)} className="p-1.5 text-nexus-muted hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="py-16 text-center text-nexus-muted">Tidak ada produk ditemukan</div>
            )}
          </div>
        </div>
      </main>

      {/* Product Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-nexus-surface border border-nexus-border rounded-2xl shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-nexus-border">
              <h2 className="font-rajdhani text-2xl font-bold text-nexus-text">
                {editProduct ? 'Edit Produk' : 'Tambah Produk'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="p-2 text-nexus-muted hover:text-nexus-cyan rounded-lg hover:bg-nexus-border/30">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-nexus-muted mb-1.5">Nama Produk *</label>
                <input {...register('name')} className="input-field" placeholder="Nama produk" />
                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-nexus-muted mb-1.5">Harga (IDR) *</label>
                  <input {...register('price', { valueAsNumber: true })} type="number" className="input-field" placeholder="1000000" />
                  {errors.price && <p className="text-red-400 text-xs mt-1">{errors.price.message}</p>}
                </div>
                <div>
                  <label className="block text-sm text-nexus-muted mb-1.5">Stok *</label>
                  <input {...register('stock', { valueAsNumber: true })} type="number" className="input-field" placeholder="0" />
                  {errors.stock && <p className="text-red-400 text-xs mt-1">{errors.stock.message}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm text-nexus-muted mb-1.5">Kategori *</label>
                <select {...register('category_id', { valueAsNumber: true })} className="input-field">
                  {MOCK_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                  ))}
                </select>
                {errors.category_id && <p className="text-red-400 text-xs mt-1">{errors.category_id.message}</p>}
              </div>
              <div>
                <label className="block text-sm text-nexus-muted mb-1.5">URL Gambar</label>
                <input {...register('image_url')} className="input-field" placeholder="https://..." />
                {errors.image_url && <p className="text-red-400 text-xs mt-1">{errors.image_url.message}</p>}
              </div>
              <div>
                <label className="block text-sm text-nexus-muted mb-1.5">Deskripsi</label>
                <textarea {...register('description')} className="input-field h-24 resize-none" placeholder="Deskripsi produk..." />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="btn-outline flex-1">Batal</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</> : (editProduct ? 'Update' : 'Tambah')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative w-full max-w-sm bg-nexus-surface border border-nexus-border rounded-2xl p-6 animate-fade-in">
            <h3 className="font-rajdhani text-xl font-bold text-nexus-text mb-2">Hapus Produk?</h3>
            <p className="text-nexus-muted mb-6">Tindakan ini tidak dapat dibatalkan.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="btn-outline flex-1">Batal</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 px-6 py-2.5 rounded-lg font-semibold transition-all">
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
