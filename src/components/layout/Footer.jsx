import { Link } from 'react-router-dom'
import { Zap, Send, Globe, Play, Camera, Code } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function Footer() {
  const [email, setEmail] = useState('')

  const handleNewsletter = (e) => {
    e.preventDefault()
    if (!email) return
    toast.success('Berhasil subscribe newsletter!')
    setEmail('')
  }

  return (
    <footer className="bg-nexus-surface border-t border-nexus-border mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-nexus-cyan to-nexus-purple flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="font-rajdhani text-2xl font-bold gradient-text tracking-wider">NEXUSGEAR</span>
            </Link>
            <p className="text-nexus-muted text-sm leading-relaxed mb-6">
              Destinasi gaming gear terbaik di Indonesia. Level up your setup dengan produk premium pilihan para pro player.
            </p>
            <div className="flex gap-3">
              {[
                { icon: Globe, label: 'Twitter / X' },
                { icon: Play, label: 'YouTube' },
                { icon: Camera, label: 'Instagram' },
                { icon: Code, label: 'GitHub' },
              ].map(({ icon: Icon, label }) => (
                <button
                  key={label}
                  className="w-9 h-9 rounded-lg bg-nexus-border hover:bg-nexus-cyan/10 hover:text-nexus-cyan text-nexus-muted flex items-center justify-center transition-all duration-200"
                  aria-label={label}
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-rajdhani text-lg font-semibold text-nexus-text mb-4 tracking-wide">SHOP</h4>
            <ul className="space-y-2">
              {['Keyboard', 'Mouse', 'Headset', 'Monitor', 'Mousepad', 'Controller', 'Gaming Chair'].map((cat) => (
                <li key={cat}>
                  <Link to={`/shop?category=${cat.toLowerCase().replace(' ', '-')}`} className="text-nexus-muted hover:text-nexus-cyan text-sm transition-colors duration-200">
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-rajdhani text-lg font-semibold text-nexus-text mb-4 tracking-wide">SUPPORT</h4>
            <ul className="space-y-2">
              {['FAQ', 'Cara Order', 'Pengiriman & Retur', 'Garansi Produk', 'Hubungi Kami'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-nexus-muted hover:text-nexus-cyan text-sm transition-colors duration-200">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-rajdhani text-lg font-semibold text-nexus-text mb-4 tracking-wide">NEWSLETTER</h4>
            <p className="text-nexus-muted text-sm mb-4">Dapatkan info promo eksklusif dan produk terbaru langsung di inbox kamu.</p>
            <form onSubmit={handleNewsletter} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email kamu..."
                className="input-field flex-1 text-sm"
              />
              <button type="submit" className="p-2.5 rounded-lg bg-gradient-to-r from-nexus-cyan to-nexus-purple hover:opacity-90 transition-opacity">
                <Send className="w-4 h-4 text-white" />
              </button>
            </form>
            <div className="mt-6 p-3 rounded-lg bg-nexus-bg border border-nexus-border">
              <p className="text-xs text-nexus-muted">💳 Metode Pembayaran</p>
              <div className="flex gap-2 mt-2 flex-wrap">
                {['BCA', 'Mandiri', 'BRI', 'QRIS', 'COD'].map((m) => (
                  <span key={m} className="text-xs px-2 py-1 rounded bg-nexus-border text-nexus-muted">{m}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-nexus-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-nexus-muted text-sm">© 2026 NexusGear. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="text-nexus-muted hover:text-nexus-cyan text-sm transition-colors">Kebijakan Privasi</a>
            <a href="#" className="text-nexus-muted hover:text-nexus-cyan text-sm transition-colors">Syarat & Ketentuan</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
