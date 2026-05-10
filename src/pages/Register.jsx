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
  full_name: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  confirm_password: z.string(),
}).refine((d) => d.password === d.confirm_password, {
  message: 'Password tidak cocok',
  path: ['confirm_password'],
})

export default function Register() {
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { setUser, setProfile, fetchProfile } = useAuthStore()

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async ({ full_name, email, password }) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name } } })
      if (error) throw error

      if (data.user) {
        // Insert profile
        await supabase.from('profiles').insert({
          id: data.user.id,
          full_name,
          role: 'user',
        })
        setUser(data.user)
        await fetchProfile(data.user.id)
        toast.success('Akun berhasil dibuat!')
        navigate('/')
      }
    } catch (err) {
      // Demo mode
      if (err.message?.includes('fetch') || err.message?.includes('network') || err.message?.includes('placeholder')) {
        const mockUser = { id: `demo-${Date.now()}`, email }
        const mockProfile = { id: mockUser.id, full_name, role: 'user', email }
        setUser(mockUser)
        setProfile(mockProfile)
        toast.success('Akun berhasil dibuat! (Mode Demo)')
        navigate('/')
      } else {
        toast.error(err.message || 'Registrasi gagal')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center pt-16 px-4 py-8">
      <div className="w-full max-w-md">
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
              <label className="block text-sm text-nexus-muted mb-1.5">Nama Lengkap</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nexus-muted" />
                <input {...register('full_name')} className="input-field pl-10" placeholder="John Gamer" />
              </div>
              {errors.full_name && <p className="text-red-400 text-xs mt-1">{errors.full_name.message}</p>}
            </div>

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
                  placeholder="Min. 6 karakter"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-nexus-muted hover:text-nexus-cyan">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm text-nexus-muted mb-1.5">Konfirmasi Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nexus-muted" />
                <input {...register('confirm_password')} type="password" className="input-field pl-10" placeholder="Ulangi password" />
              </div>
              {errors.confirm_password && <p className="text-red-400 text-xs mt-1">{errors.confirm_password.message}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 text-base">
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Mendaftar...</> : 'Daftar Sekarang'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-nexus-muted text-sm">
              Sudah punya akun?{' '}
              <Link to="/login" className="text-nexus-cyan hover:underline font-medium">Masuk</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
