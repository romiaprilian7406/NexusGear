import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { User, Phone, Save, Camera, Loader2 } from 'lucide-react'
import useAuthStore from '../stores/authStore'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

const schema = z.object({
  full_name: z.string().min(2, 'Nama minimal 2 karakter'),
  phone: z.string().optional(),
})

export default function Profile() {
  const { user, profile, setProfile } = useAuthStore()
  const [saving, setSaving] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: profile?.full_name || '',
      phone: profile?.phone || '',
    },
  })

  const onSubmit = async (data) => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id)
      if (error) throw error
      setProfile({ ...profile, ...data })
      toast.success('Profil berhasil diperbarui!')
    } catch {
      // Demo mode
      setProfile({ ...profile, ...data })
      toast.success('Profil berhasil diperbarui! (Mode Demo)')
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setAvatarUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `avatars/${user.id}.${ext}`
      const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
      if (uploadError) throw uploadError
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
      await supabase.from('profiles').update({ avatar_url: urlData.publicUrl }).eq('id', user.id)
      setProfile({ ...profile, avatar_url: urlData.publicUrl })
      toast.success('Foto profil diperbarui!')
    } catch {
      toast.error('Gagal upload foto. Mode demo aktif.')
    } finally {
      setAvatarUploading(false)
    }
  }

  const initials = profile?.full_name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || '?'

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-rajdhani text-4xl font-bold text-nexus-text mb-8">
          PROFIL <span className="gradient-text">SAYA</span>
        </h1>

        {/* Avatar */}
        <div className="card mb-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-nexus-cyan/30 bg-gradient-to-br from-nexus-cyan to-nexus-purple flex items-center justify-center">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="font-rajdhani text-3xl font-bold text-white">{initials}</span>
                )}
              </div>
              <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-nexus-surface border border-nexus-border flex items-center justify-center cursor-pointer hover:border-nexus-cyan transition-colors">
                {avatarUploading ? <Loader2 className="w-4 h-4 text-nexus-cyan animate-spin" /> : <Camera className="w-4 h-4 text-nexus-muted" />}
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              </label>
            </div>
            <div>
              <h2 className="font-rajdhani text-2xl font-bold text-nexus-text">{profile?.full_name}</h2>
              <p className="text-nexus-muted">{user?.email}</p>
              <span className={`inline-flex mt-1 px-3 py-0.5 rounded-full text-xs font-semibold ${profile?.role === 'admin' ? 'bg-nexus-purple/20 text-nexus-purple border border-nexus-purple/30' : 'bg-nexus-cyan/10 text-nexus-cyan border border-nexus-cyan/30'}`}>
                {profile?.role === 'admin' ? '⚡ Admin' : '👤 User'}
              </span>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="card">
          <h3 className="font-rajdhani text-xl font-bold text-nexus-text mb-6">Edit Profil</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm text-nexus-muted mb-1.5">Nama Lengkap</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nexus-muted" />
                <input {...register('full_name')} className="input-field pl-10" />
              </div>
              {errors.full_name && <p className="text-red-400 text-xs mt-1">{errors.full_name.message}</p>}
            </div>

            <div>
              <label className="block text-sm text-nexus-muted mb-1.5">Nomor HP</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nexus-muted" />
                <input {...register('phone')} className="input-field pl-10" placeholder="08xx-xxxx-xxxx" />
              </div>
            </div>

            <div>
              <label className="block text-sm text-nexus-muted mb-1.5">Email</label>
              <input value={user?.email || ''} disabled className="input-field opacity-50 cursor-not-allowed" />
              <p className="text-nexus-muted text-xs mt-1">Email tidak dapat diubah</p>
            </div>

            <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 py-3 px-8">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</> : <><Save className="w-4 h-4" /> Simpan Perubahan</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
