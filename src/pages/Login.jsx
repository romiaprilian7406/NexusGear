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

export default function Login() {
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { setUser, setProfile, fetchProfile } = useAuthStore()

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async ({ email, password }) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error

      setUser(data.user)
      await fetchProfile(data.user.id)
      const profile = useAuthStore.getState().profile
      toast.success('Login berhasil!')

      const from = location.state?.from?.pathname || '/'
      if (profile?.role === 'admin') navigate('/admin/dashboard')
      else navigate(from)
    } catch (err) {
      // Demo mode: simulate login
      if (err.message?.includes('fetch') || err.message?.includes('network') || err.message?.includes('placeholder')) {
        const mockUser = { id: 'demo-user', email }
        const mockProfile = email.includes('admin')
          ? { id: 'demo-user', full_name: 'Admin NexusGear', role: 'admin', email }
          : { id: 'demo-user', full_name: 'Demo User', role: 'user', email }
        setUser(mockUser)
        setProfile(mockProfile)
        toast.success('Login berhasil! (Mode Demo)')
        if (mockProfile.role === 'admin') navigate('/admin/dashboard')
        else navigate(location.state?.from?.pathname || '/')
      } else {
        toast.error(err.message || 'Login gagal')
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
                <input {...register('email')} type="email" className="input-field pl-10" placeholder="gamer@email.com" />
              </div>
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
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
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-nexus-muted hover:text-nexus-cyan transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div className="flex justify-end">
              <a href="#" className="text-nexus-cyan text-sm hover:underline">Lupa Password?</a>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 text-base">
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Masuk...</> : 'Masuk'}
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
              <Link to="/register" className="text-nexus-cyan hover:underline font-medium">Daftar Sekarang</Link>
            </p>
          </div>
        </div>

        {/* Demo hint */}
        <div className="mt-4 p-3 rounded-xl bg-nexus-surface border border-nexus-border text-center">
          <p className="text-nexus-muted text-xs">
            💡 Demo: gunakan email berisi "admin" untuk login sebagai admin
          </p>
        </div>
      </div>
    </div>
  )
}
