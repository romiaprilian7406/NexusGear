import { Link, useNavigate } from 'react-router-dom'
import { Home, ArrowLeft, Search } from 'lucide-react'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      {/* Background Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,212,255,0.05),transparent_60%)]" />

      <div className="relative text-center max-w-lg">
        {/* 404 Text */}
        <div className="font-rajdhani text-[10rem] font-bold leading-none select-none mb-4">
          <span className="gradient-text opacity-20">404</span>
        </div>

        {/* Decorative line */}
        <div className="w-24 h-1 bg-gradient-to-r from-nexus-cyan to-nexus-purple mx-auto mb-8 rounded-full" />

        <h1 className="font-rajdhani text-4xl font-bold text-nexus-text mb-3">
          HALAMAN TIDAK DITEMUKAN
        </h1>
        <p className="text-nexus-muted mb-10 text-lg">
          Halaman yang kamu cari tidak ada atau sudah dipindahkan. Jangan khawatir, gaming gear terbaik masih ada di sini!
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="btn-outline flex items-center justify-center gap-2 py-3 px-6"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali
          </button>
          <Link to="/" className="btn-primary flex items-center justify-center gap-2 py-3 px-6">
            <Home className="w-4 h-4" /> Ke Beranda
          </Link>
          <Link to="/shop" className="btn-outline flex items-center justify-center gap-2 py-3 px-6">
            <Search className="w-4 h-4" /> Ke Shop
          </Link>
        </div>
      </div>
    </div>
  )
}
