import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Zap, Shield, Truck, Headphones, ChevronRight } from 'lucide-react'
import { useProducts, useCategories } from '../hooks/useProducts'
import ProductCard from '../components/product/ProductCard'
import { Loading } from '../components/shared/Loading'

// Animated particle background
function ParticleCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId
    const particles = []

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.5 + 0.1,
        color: Math.random() > 0.5 ? '#00D4FF' : '#7C3AED',
      })
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = p.color + Math.floor(p.alpha * 255).toString(16).padStart(2, '0')
        ctx.fill()
      })

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 120) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(0,212,255,${0.05 * (1 - dist / 120)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }
      animId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}

// Countdown timer
function CountdownTimer({ target }) {
  const [time, setTime] = useState({ h: 0, m: 0, s: 0 })

  useEffect(() => {
    const update = () => {
      const now = new Date()
      const end = new Date(target)
      const diff = Math.max(0, end - now)
      setTime({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      })
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [target])

  const pad = (n) => String(n).padStart(2, '0')

  return (
    <div className="flex items-center gap-3">
      {[{ label: 'JAM', value: time.h }, { label: 'MENIT', value: time.m }, { label: 'DETIK', value: time.s }].map(({ label, value }, i) => (
        <div key={label} className="flex items-center gap-3">
          <div className="text-center">
            <div className="w-16 h-16 bg-nexus-bg border border-nexus-cyan/30 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(0,212,255,0.2)]">
              <span className="font-rajdhani text-3xl font-bold text-nexus-cyan">{pad(value)}</span>
            </div>
            <p className="text-nexus-muted text-xs mt-1">{label}</p>
          </div>
          {i < 2 && <span className="font-rajdhani text-2xl text-nexus-cyan/60 mb-4">:</span>}
        </div>
      ))}
    </div>
  )
}

export default function Home() {
  const { products: featured, loading: featuredLoading } = useProducts({ featured: true })
  const { categories } = useCategories()

  // Promo target: next midnight
  const promoTarget = new Date()
  promoTarget.setHours(24, 0, 0, 0)

  const features = [
    { icon: Shield, title: 'Garansi Resmi', desc: 'Semua produk bergaransi resmi distributor' },
    { icon: Truck, title: 'Gratis Ongkir', desc: 'Gratis ongkos kirim untuk pembelian >Rp500rb' },
    { icon: Zap, title: 'Fast Delivery', desc: 'Pengiriman ekspres 1-2 hari ke seluruh Indonesia' },
    { icon: Headphones, title: '24/7 Support', desc: 'Customer service siap membantu kapan saja' },
  ]

  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-nexus-bg via-[#0D0D18] to-nexus-bg" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(0,212,255,0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(124,58,237,0.08),transparent_50%)]" />

        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'linear-gradient(rgba(0,212,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,0.5) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />

        <ParticleCanvas />

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-nexus-cyan/30 bg-nexus-cyan/5 text-nexus-cyan text-sm font-medium mb-8 animate-fade-in">
            <Zap className="w-4 h-4" />
            Gear Gaming Premium — Harga Terbaik Indonesia
          </div>

          <h1 className="font-rajdhani text-6xl sm:text-7xl md:text-8xl font-bold leading-none mb-6 animate-fade-in">
            <span className="gradient-text">LEVEL UP</span>
            <br />
            <span className="text-nexus-text">YOUR SETUP</span>
          </h1>

          <p className="text-nexus-muted text-lg sm:text-xl max-w-2xl mx-auto mb-10 animate-fade-in">
            Temukan koleksi gaming gear terlengkap dari brand-brand terbaik dunia. Razer, Logitech, HyperX, SteelSeries, dan masih banyak lagi.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in">
            <Link to="/shop" className="btn-primary flex items-center gap-2 text-lg px-8 py-3.5">
              Shop Now <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/shop?featured=true" className="btn-outline flex items-center gap-2 text-lg px-8 py-3.5">
              Featured Products
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 pt-8 border-t border-nexus-border/50 max-w-lg mx-auto animate-fade-in">
            {[['500+', 'Produk'], ['50K+', 'Pelanggan'], ['4.9★', 'Rating']].map(([val, label]) => (
              <div key={label} className="text-center">
                <p className="font-rajdhani text-3xl font-bold text-nexus-cyan">{val}</p>
                <p className="text-nexus-muted text-sm">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-nexus-muted flex items-center justify-center">
            <div className="w-1 h-2 rounded-full bg-nexus-cyan animate-pulse" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-nexus-surface border-y border-nexus-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-4 p-4 rounded-xl hover:bg-nexus-border/20 transition-colors duration-200">
                <div className="w-10 h-10 rounded-lg bg-nexus-cyan/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-nexus-cyan" />
                </div>
                <div>
                  <p className="font-semibold text-nexus-text text-sm">{title}</p>
                  <p className="text-nexus-muted text-xs">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-rajdhani text-4xl font-bold text-nexus-text">
              <span className="gradient-text">FEATURED</span> PRODUCTS
            </h2>
            <p className="text-nexus-muted mt-1">Produk terpilih para gaming enthusiast</p>
          </div>
          <Link to="/shop?featured=true" className="btn-outline flex items-center gap-2 text-sm">
            Lihat Semua <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {featuredLoading ? (
          <div className="flex justify-center py-16"><Loading size="lg" /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featured.slice(0, 8).map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      {/* Categories */}
      <section className="py-16 bg-nexus-surface border-y border-nexus-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="font-rajdhani text-4xl font-bold text-nexus-text mb-2">
              SHOP BY <span className="gradient-text">CATEGORY</span>
            </h2>
            <p className="text-nexus-muted">Pilih kategori gaming gear favoritmu</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/shop?category=${cat.id}`}
                className="group flex flex-col items-center gap-3 p-4 rounded-xl bg-nexus-bg border border-nexus-border hover:border-nexus-cyan hover:shadow-[0_0_20px_rgba(0,212,255,0.15)] transition-all duration-300"
              >
                <span className="text-3xl group-hover:scale-110 transition-transform duration-200">{cat.icon}</span>
                <span className="font-rajdhani font-semibold text-sm text-nexus-muted group-hover:text-nexus-cyan transition-colors duration-200 text-center">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Promo Banner */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-nexus-cyan/20 via-nexus-purple/20 to-nexus-cyan/20 animate-gradient-x" style={{ backgroundSize: '200% 200%' }} />
          <div className="absolute inset-0 bg-nexus-surface/80 backdrop-blur-sm" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 p-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-bold mb-4">
                🔥 FLASH SALE
              </div>
              <h3 className="font-rajdhani text-4xl font-bold text-nexus-text mb-2">
                DISKON HINGGA <span className="text-nexus-cyan">50%</span>
              </h3>
              <p className="text-nexus-muted mb-4">Penawaran terbatas! Jangan sampai kehabisan.</p>
              <Link to="/shop" className="btn-primary inline-flex items-center gap-2">
                Belanja Sekarang <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="text-center">
              <p className="text-nexus-muted text-sm mb-3 font-semibold tracking-wider uppercase">Berakhir Dalam</p>
              <CountdownTimer target={promoTarget} />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
