import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Zap, Loader2, Mail, Lock, User } from 'lucide-react'
import { supabase } from '../lib/supabase'
import useAuthStore from '../stores/authStore'
import toast from 'react-hot-toast'

const schema = z.object({
  full_name: z.string().min(2, 'Nama minimal 2 karakter').max(100, 'Nama terlalu panjang'),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  confirm_password: z.string(),
}).refine((d) => d.password === d.confirm_password, {
  message: 'Password tidak cocok',
  path: ['confirm_password'],
})

const isDemoMode = () => {
  const url = import.meta.env.VITE_SUPABASE_URL || ''
  return !url || url.includes('placeholder') || url === 'your_supabase_project_url'
}

export default function Register() {
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { setUser, setProfile, fetchProfile } = useAuthStore()

  const { register, handleSubmit, formState: { errors }, setError } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async ({ full_name, email, password }) => {
    setLoading(true)
    try {
      if (isDemoMode()) {
        // Demo mode
        const mockUser = { id: `demo-${Date.now()}`, email }
        const mockProfile = { id: mockUser.id, full_name, role: 'user', email }
        setUser(mockUser)
        setProfile(mockProfile)
        toast.success('Akun berhasil dibuat! (Mode Demo)')
        navigate('/')
        return
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name },
        },
      })

      if (error) {
        if (error.message.includes('already registered') || error.message.includes('already been registered')) {
          setError('email', { message: 'Email sudah terdaftar. Silakan login.' })
        } else if (error.message.includes('Password should be')) {
          setError('password', { message: 'Password harus minimal 6 karakter dengan kombinasi yang kuat.' })
        } else {
          toast.error(error.message)
        }
        return
      }

      if (data.user) {
        setUser(data.user)

        // Tunggu sebentar agar trigger otomatis berjalan
        await new Promise((r) => setTimeout(r, 500))
        await fetchProfile(data.user.id)

        // Jika profile belum ada (trigger belum jalan), insert manual
        const currentProfile = useAuthStore.getState().profile
        if (!currentProfile) {
          const { error: insertError } = await supabase.from('profiles').insert({
            id: data.user.id,
            full_name,
            role: 'user',
          })
          if (!insertError) {
            await fetchProfile(data.user.id)
          }
        }

        toast.success('Akun berhasil dibuat! Selamat bergabung!')
        navigate('/')
      }
    } catch (err) {
      if (err?.message?.includes('fetch') || err?.message?.includes('network')) {
        toast.error('Tidak bisa terhubung ke server. Cek koneksi internet.')
      } else {
        toast.error('Terjadi kesalahan saat mendaftar. Coba lagi.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center pt-16 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-nexus-cyan to-nexus-purple flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="font-rajdhani text-3xl font-bold gradient-text">NEXUSGEAR</span>
          </Link>
          <h1 className="font-rajdhani text-4xl font-bold text-nexus-text mb-2">DAFTAR</h1>
          <p className="text-nexus-muted">Bergabung dengan komunitas gamer Indonesia</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm text-nexus-muted mb-1.5">
                Nama Lengkap <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nexus-muted" />
                <input
                  {...register('full_name')}
                  className="input-field pl-10"
                  placeholder="John Gamer"
                  autoComplete="name"
                />
              </div>
              {errors.full_name && (
                <p className="text-red-400 text-xs mt-1">{errors.full_name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-nexus-muted mb-1.5">
                Email <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nexus-muted" />
                <input
                  {...register('email')}
                  type="email"
                  className="input-field pl-10"
                  placeholder="gamer@email.com"
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-nexus-muted mb-1.5">
                Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nexus-muted" />
                <input
                  {...register('password')}
                  type={showPass ? 'text' : 'password'}
                  className="input-field pl-10 pr-10"
                  placeholder="Min. 6 karakter"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-nexus-muted hover:text-nexus-cyan transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-nexus-muted mb-1.5">
                Konfirmasi Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nexus-muted" />
                <input
                  {...register('confirm_password')}
                  type={showConfirm ? 'text' : 'password'}
                  className="input-field pl-10 pr-10"
                  placeholder="Ulangi password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-nexus-muted hover:text-nexus-cyan transition-colors"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirm_password && (
                <p className="text-red-400 text-xs mt-1">{errors.confirm_password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 text-base"
            >
              {loading
                ? <><Loader2 className="w-5 h-5 animate-spin" /> Mendaftar...</>
                : 'Daftar Sekarang'
              }
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-nexus-muted text-sm">
              Sudah punya akun?{' '}
              <Link to="/login" className="text-nexus-cyan hover:underline font-medium">
                Masuk
              </Link>
            </p>
          </div>
        </div>

        <p className="text-nexus-muted text-xs text-center mt-4">
          Dengan mendaftar, kamu menyetujui{' '}
          <span className="text-nexus-cyan cursor-pointer hover:underline">Syarat & Ketentuan</span>
          {' '}dan{' '}
          <span className="text-nexus-cyan cursor-pointer hover:underline">Kebijakan Privasi</span>{' '}
          NexusGear.
        </p>
      </div>
    </div>
  )
}
