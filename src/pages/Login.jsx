import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Zap, Loader2, Mail, Lock } from 'lucide-react'
import { supabase } from '../lib/supabase'
import useAuthStore from '../stores/authStore'
import toast from 'react-hot-toast'

const schema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
})

const isDemoMode = () => {
  const url = import.meta.env.VITE_SUPABASE_URL || ''
  return !url || url.includes('placeholder') || url === 'your_supabase_project_url'
}

export default function Login() {
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { setUser, setProfile, fetchProfile } = useAuthStore()

  const { register, handleSubmit, formState: { errors }, setError } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async ({ email, password }) => {
    setLoading(true)
    try {
      if (isDemoMode()) {
        // Demo mode
        const mockUser = { id: `demo-${Date.now()}`, email }
        const mockProfile = email.toLowerCase().includes('admin')
          ? { id: mockUser.id, full_name: 'Admin NexusGear', role: 'admin', email }
          : { id: mockUser.id, full_name: email.split('@')[0], role: 'user', email }
        setUser(mockUser)
        setProfile(mockProfile)
        toast.success('Login berhasil! (Mode Demo)')
        if (mockProfile.role === 'admin') navigate('/admin/dashboard')
        else navigate(location.state?.from?.pathname || '/')
        return
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        // Handle error spesifik
        if (error.message.includes('Invalid login credentials')) {
          setError('email', { message: '' })
          setError('password', { message: 'Email atau password salah' })
        } else if (error.message.includes('Email not confirmed')) {
          toast.error('Email belum dikonfirmasi. Cek inbox kamu.')
        } else {
          toast.error(error.message)
        }
        return
      }

      setUser(data.user)
      await fetchProfile(data.user.id)

      toast.success('Login berhasil!')

      const currentProfile = useAuthStore.getState().profile
      const from = location.state?.from?.pathname || '/'
      if (currentProfile?.role === 'admin') navigate('/admin/dashboard')
      else navigate(from)
    } catch (err) {
      // Network error
      if (err?.message?.includes('fetch') || err?.message?.includes('network')) {
        toast.error('Tidak bisa terhubung ke server. Cek koneksi internet.')
      } else {
        toast.error('Terjadi kesalahan. Coba lagi.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center pt-16 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-nexus-cyan to-nexus-purple flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="font-rajdhani text-3xl font-bold gradient-text">NEXUSGEAR</span>
          </Link>
          <h1 className="font-rajdhani text-4xl font-bold text-nexus-text mb-2">MASUK</h1>
          <p className="text-nexus-muted">Selamat datang kembali, gamer!</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm text-nexus-muted mb-1.5">Email</label>
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
              {errors.email && errors.email.message && (
                <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-nexus-muted mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nexus-muted" />
                <input
                  {...register('password')}
                  type={showPass ? 'text' : 'password'}
                  className="input-field pl-10 pr-10"
                  placeholder="••••••••"
                  autoComplete="current-password"
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

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => toast('Fitur reset password segera hadir!', { icon: '🔐' })}
                className="text-nexus-cyan text-sm hover:underline"
              >
                Lupa Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 text-base"
            >
              {loading
                ? <><Loader2 className="w-5 h-5 animate-spin" /> Masuk...</>
                : 'Masuk'
              }
            </button>
          </form>

          <div className="mt-4 text-center">
            <div className="relative flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-nexus-border" />
              <span className="text-nexus-muted text-sm">atau</span>
              <div className="flex-1 h-px bg-nexus-border" />
            </div>
            <p className="text-nexus-muted text-sm">
              Belum punya akun?{' '}
              <Link to="/register" className="text-nexus-cyan hover:underline font-medium">
                Daftar Sekarang
              </Link>
            </p>
          </div>
        </div>

        {/* Demo mode hint */}
        {isDemoMode() && (
          <div className="mt-4 p-3 rounded-xl bg-nexus-surface border border-nexus-border text-center">
            <p className="text-nexus-muted text-xs">
              💡 <strong className="text-nexus-text">Mode Demo:</strong> gunakan email apapun berisi "admin" untuk login sebagai admin, atau email lainnya sebagai user biasa
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
