import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle2, MapPin, CreditCard, ClipboardList, ChevronRight, Loader2 } from 'lucide-react'
import useCartStore from '../stores/cartStore'
import useAuthStore from '../stores/authStore'
import { formatCurrency, calculateShipping } from '../lib/utils'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

const addressSchema = z.object({
  recipient_name: z.string().min(2, 'Nama minimal 2 karakter'),
  phone: z.string().min(10, 'Nomor HP tidak valid').max(15),
  province: z.string().min(2, 'Pilih provinsi'),
  city: z.string().min(2, 'Masukkan kota'),
  district: z.string().min(2, 'Masukkan kecamatan'),
  address: z.string().min(10, 'Alamat minimal 10 karakter'),
  postal_code: z.string().length(5, 'Kode pos harus 5 digit'),
})

const PAYMENT_METHODS = [
  { id: 'bca', label: 'Transfer Bank BCA', icon: '🏦', desc: 'No. Rek: 1234-5678-90' },
  { id: 'mandiri', label: 'Transfer Bank Mandiri', icon: '🏛️', desc: 'No. Rek: 0987-6543-21' },
  { id: 'bri', label: 'Transfer Bank BRI', icon: '🏢', desc: 'No. Rek: 1122-3344-55' },
  { id: 'qris', label: 'QRIS', icon: '📱', desc: 'Scan QR dari aplikasi apapun' },
  { id: 'va', label: 'Virtual Account', icon: '💳', desc: 'BCA VA / Mandiri VA / BRI VA' },
  { id: 'cod', label: 'COD (Bayar di Tempat)', icon: '💵', desc: 'Bayar saat barang tiba' },
]

const PROVINCES = [
  'DKI Jakarta', 'Jawa Barat', 'Jawa Tengah', 'Jawa Timur', 'DI Yogyakarta',
  'Banten', 'Bali', 'Sumatera Utara', 'Sumatera Selatan', 'Kalimantan Timur',
  'Sulawesi Selatan', 'Nusa Tenggara Barat', 'Papua',
]

const STEPS = [
  { id: 1, label: 'Alamat', icon: MapPin },
  { id: 2, label: 'Pembayaran', icon: CreditCard },
  { id: 3, label: 'Konfirmasi', icon: ClipboardList },
]

export default function Checkout() {
  const [step, setStep] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState('')
  const [shippingAddress, setShippingAddress] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const { items, clearCart } = useCartStore()
  const { user, profile } = useAuthStore()
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors }, getValues } = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      recipient_name: profile?.full_name || '',
      phone: profile?.phone || '',
    }
  })

  const subtotal = items.reduce((s, i) => s + i.product.price * i.quantity, 0)
  const shipping = calculateShipping(subtotal)
  const total = subtotal + shipping

  const onAddressSubmit = (data) => {
    setShippingAddress(data)
    setStep(2)
  }

  const onPaymentNext = () => {
    if (!paymentMethod) { toast.error('Pilih metode pembayaran'); return }
    setStep(3)
  }

  const onConfirm = async () => {
    setSubmitting(true)
    try {
      const orderData = {
        user_id: user.id,
        status: 'pending',
        total_amount: total,
        shipping_address: shippingAddress,
        payment_method: paymentMethod,
      }

      // Try Supabase, fallback to mock
      let orderId
      try {
        const { data: order, error } = await supabase.from('orders').insert(orderData).select().single()
        if (error) throw error
        await supabase.from('order_items').insert(
          items.map((i) => ({
            order_id: order.id,
            product_id: i.product.id,
            quantity: i.quantity,
            price_at_purchase: i.product.price,
          }))
        )
        orderId = order.id
      } catch {
        // Mock mode: generate fake order ID
        orderId = `mock-${Date.now()}`
      }

      clearCart()
      navigate(`/receipt/${orderId}`, { state: { order: { ...orderData, id: orderId, items } } })
      toast.success('Pesanan berhasil dibuat!')
    } catch (err) {
      toast.error('Gagal membuat pesanan. Coba lagi.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-rajdhani text-4xl font-bold text-nexus-text mb-8">
          <span className="gradient-text">CHECKOUT</span>
        </h1>

        {/* Step Indicator */}
        <div className="flex items-center mb-10">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center flex-1">
              <div className={`flex items-center gap-2 ${step >= s.id ? 'text-nexus-cyan' : 'text-nexus-muted'}`}>
                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${step >= s.id ? 'border-nexus-cyan bg-nexus-cyan/10 shadow-[0_0_10px_rgba(0,212,255,0.3)]' : 'border-nexus-border'}`}>
                  {step > s.id ? <CheckCircle2 className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
                </div>
                <span className="hidden sm:block font-semibold text-sm">{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 transition-all duration-300 ${step > s.id ? 'bg-nexus-cyan' : 'bg-nexus-border'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            {/* Step 1: Address */}
            {step === 1 && (
              <form onSubmit={handleSubmit(onAddressSubmit)} className="card space-y-4">
                <h2 className="font-rajdhani text-2xl font-bold text-nexus-text mb-2">Alamat Pengiriman</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-nexus-muted mb-1.5">Nama Penerima *</label>
                    <input {...register('recipient_name')} className="input-field" placeholder="Nama lengkap" />
                    {errors.recipient_name && <p className="text-red-400 text-xs mt-1">{errors.recipient_name.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm text-nexus-muted mb-1.5">Nomor HP *</label>
                    <input {...register('phone')} className="input-field" placeholder="08xx-xxxx-xxxx" />
                    {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm text-nexus-muted mb-1.5">Provinsi *</label>
                    <select {...register('province')} className="input-field">
                      <option value="">Pilih provinsi</option>
                      {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                    {errors.province && <p className="text-red-400 text-xs mt-1">{errors.province.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm text-nexus-muted mb-1.5">Kota *</label>
                    <input {...register('city')} className="input-field" placeholder="Nama kota/kabupaten" />
                    {errors.city && <p className="text-red-400 text-xs mt-1">{errors.city.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm text-nexus-muted mb-1.5">Kecamatan *</label>
                    <input {...register('district')} className="input-field" placeholder="Nama kecamatan" />
                    {errors.district && <p className="text-red-400 text-xs mt-1">{errors.district.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm text-nexus-muted mb-1.5">Kode Pos *</label>
                    <input {...register('postal_code')} className="input-field" placeholder="12345" maxLength={5} />
                    {errors.postal_code && <p className="text-red-400 text-xs mt-1">{errors.postal_code.message}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-nexus-muted mb-1.5">Alamat Lengkap *</label>
                  <textarea {...register('address')} className="input-field h-24 resize-none" placeholder="Jalan, nomor rumah, RT/RW, nama gedung, lantai, dll." />
                  {errors.address && <p className="text-red-400 text-xs mt-1">{errors.address.message}</p>}
                </div>
                <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 py-3.5">
                  Lanjut ke Pembayaran <ChevronRight className="w-5 h-5" />
                </button>
              </form>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <div className="card">
                <h2 className="font-rajdhani text-2xl font-bold text-nexus-text mb-4">Metode Pembayaran</h2>
                <div className="space-y-3 mb-6">
                  {PAYMENT_METHODS.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setPaymentMethod(m.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 text-left ${paymentMethod === m.id ? 'border-nexus-cyan bg-nexus-cyan/5 shadow-[0_0_15px_rgba(0,212,255,0.1)]' : 'border-nexus-border hover:border-nexus-cyan/50'}`}
                    >
                      <span className="text-2xl">{m.icon}</span>
                      <div className="flex-1">
                        <p className="font-semibold text-nexus-text">{m.label}</p>
                        <p className="text-nexus-muted text-sm">{m.desc}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === m.id ? 'border-nexus-cyan' : 'border-nexus-border'}`}>
                        {paymentMethod === m.id && <div className="w-2.5 h-2.5 rounded-full bg-nexus-cyan" />}
                      </div>
                    </button>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="btn-outline flex-1 py-3">Kembali</button>
                  <button onClick={onPaymentNext} className="btn-primary flex-1 py-3 flex items-center justify-center gap-2">
                    Review Pesanan <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Confirm */}
            {step === 3 && (
              <div className="card">
                <h2 className="font-rajdhani text-2xl font-bold text-nexus-text mb-4">Konfirmasi Pesanan</h2>

                {/* Address review */}
                <div className="mb-4 p-4 rounded-xl bg-nexus-bg border border-nexus-border">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-nexus-cyan" />
                    <span className="font-semibold text-nexus-text text-sm">Alamat Pengiriman</span>
                  </div>
                  {shippingAddress && (
                    <div className="text-nexus-muted text-sm space-y-1">
                      <p className="font-medium text-nexus-text">{shippingAddress.recipient_name} — {shippingAddress.phone}</p>
                      <p>{shippingAddress.address}</p>
                      <p>{shippingAddress.district}, {shippingAddress.city}, {shippingAddress.province} {shippingAddress.postal_code}</p>
                    </div>
                  )}
                </div>

                {/* Payment review */}
                <div className="mb-4 p-4 rounded-xl bg-nexus-bg border border-nexus-border">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="w-4 h-4 text-nexus-cyan" />
                    <span className="font-semibold text-nexus-text text-sm">Metode Pembayaran</span>
                  </div>
                  <p className="text-nexus-text text-sm">{PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.label}</p>
                </div>

                {/* Items */}
                <div className="mb-4 p-4 rounded-xl bg-nexus-bg border border-nexus-border space-y-3">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex items-center gap-3">
                      <img src={item.product.image_url} alt={item.product.name} className="w-12 h-12 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-nexus-text text-sm font-medium truncate">{item.product.name}</p>
                        <p className="text-nexus-muted text-xs">× {item.quantity}</p>
                      </div>
                      <p className="text-nexus-cyan text-sm font-bold">{formatCurrency(item.product.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(2)} className="btn-outline flex-1 py-3">Kembali</button>
                  <button
                    onClick={onConfirm}
                    disabled={submitting}
                    className="btn-primary flex-1 py-3 flex items-center justify-center gap-2"
                  >
                    {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Memproses...</> : <>Konfirmasi Pesanan <CheckCircle2 className="w-5 h-5" /></>}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div>
            <div className="card sticky top-24">
              <h3 className="font-rajdhani text-lg font-bold text-nexus-text mb-4">RINGKASAN</h3>
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.product.id} className="flex gap-3 text-sm">
                    <img src={item.product.image_url} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-nexus-text truncate">{item.product.name}</p>
                      <p className="text-nexus-muted">×{item.quantity}</p>
                    </div>
                    <p className="text-nexus-text font-medium">{formatCurrency(item.product.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-nexus-border pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-nexus-muted">
                  <span>Subtotal</span>
                  <span className="text-nexus-text">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-nexus-muted">
                  <span>Ongkir</span>
                  <span className={shipping === 0 ? 'text-green-400' : 'text-nexus-text'}>
                    {shipping === 0 ? 'GRATIS' : formatCurrency(shipping)}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-base border-t border-nexus-border pt-2 mt-2">
                  <span className="text-nexus-text">Total</span>
                  <span className="text-nexus-cyan">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
