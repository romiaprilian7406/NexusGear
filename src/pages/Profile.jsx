import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { User, Phone, Save, Camera, Loader2, AlertCircle } from 'lucide-react'
import useAuthStore from '../stores/authStore'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

const schema = z.object({
  full_name: z.string().min(2, 'Nama minimal 2 karakter'),
  phone: z.string().optional(),
})

const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export default function Profile() {
  const { user, profile, setProfile } = useAuthStore()
  const [saving, setSaving] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [avatarError, setAvatarError] = useState(null)

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
        .update({
          full_name: data.full_name,
          phone: data.phone || null,
        })
        .eq('id', user.id)

      if (error) throw error

      setProfile({ ...profile, ...data })
      toast.success('Profil berhasil diperbarui!')
    } catch (err) {
      // Demo / offline mode
      if (err?.message?.includes('fetch') || err?.message?.includes('network')) {
        setProfile({ ...profile, ...data })
        toast.success('Profil berhasil diperbarui!')
      } else {
        toast.error('Gagal memperbarui profil: ' + err.message)
      }
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setAvatarError(null)

    // Validasi file
    if (!ALLOWED_TYPES.includes(file.type)) {
      setAvatarError('Format file tidak didukung. Gunakan JPG, PNG, WebP, atau GIF.')
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      setAvatarError('Ukuran file terlalu besar. Maksimal 2MB.')
      return
    }

    setAvatarUploading(true)
    try {
      const ext = file.name.split('.').pop().toLowerCase()
      const fileName = `${user.id}.${ext}`
      const filePath = `avatars/${fileName}`

      // Upload ke Supabase Storage bucket 'avatars'
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type,
        })

      if (uploadError) throw uploadError

      // Ambil public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      // Tambahkan cache-busting agar gambar langsung refresh
      const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`

      // Update profile di database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id)

      if (updateError) throw updateError

      setProfile({ ...profile, avatar_url: publicUrl })
      toast.success('Foto profil berhasil diperbarui!')
    } catch (err) {
      console.error('Avatar upload error:', err)
      if (err?.message?.includes('Bucket not found') || err?.message?.includes('storage')) {
        setAvatarError('Storage belum dikonfigurasi. Pastikan bucket "avatars" sudah dibuat di Supabase.')
      } else if (err?.message?.includes('not authorized') || err?.message?.includes('policy')) {
        setAvatarError('Tidak ada izin upload. Pastikan storage policy sudah dikonfigurasi.')
      } else {
        setAvatarError('Gagal upload foto: ' + err.message)
      }
      toast.error('Gagal upload foto profil')
    } finally {
      setAvatarUploading(false)
      // Reset file input agar bisa upload file yang sama lagi
      e.target.value = ''
    }
  }

  const initials = profile?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?'

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-rajdhani text-4xl font-bold text-nexus-text mb-8">
          PROFIL <span className="gradient-text">SAYA</span>
        </h1>

        {/* Avatar Section */}
        <div className="card mb-6">
          <div className="flex items-center gap-6">
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-nexus-cyan/30 bg-gradient-to-br from-nexus-cyan to-nexus-purple flex items-center justify-center">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none'
                    }}
                  />
                ) : (
                  <span className="font-rajdhani text-3xl font-bold text-white">{initials}</span>
                )}
              </div>
              <label
                className={`absolute bottom-0 right-0 w-8 h-8 rounded-full bg-nexus-surface border border-nexus-border flex items-center justify-center cursor-pointer hover:border-nexus-cyan transition-colors ${avatarUploading ? 'cursor-not-allowed' : ''}`}
                title="Upload foto profil"
              >
                {avatarUploading
                  ? <Loader2 className="w-4 h-4 text-nexus-cyan animate-spin" />
                  : <Camera className="w-4 h-4 text-nexus-muted" />
                }
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={avatarUploading}
                />
              </label>
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="font-rajdhani text-2xl font-bold text-nexus-text">{profile?.full_name}</h2>
              <p className="text-nexus-muted text-sm truncate">{user?.email}</p>
              <span className={`inline-flex mt-2 items-center gap-1 px-3 py-0.5 rounded-full text-xs font-semibold border ${
                profile?.role === 'admin'
                  ? 'bg-nexus-purple/20 text-nexus-purple border-nexus-purple/30'
                  : 'bg-nexus-cyan/10 text-nexus-cyan border-nexus-cyan/30'
              }`}>
                {profile?.role === 'admin' ? '⚡ Admin' : '👤 User'}
              </span>
              <p className="text-nexus-muted text-xs mt-2">
                Format: JPG, PNG, WebP, GIF • Maks. 2MB
              </p>
            </div>
          </div>

          {/* Avatar Error */}
          {avatarError && (
            <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm">{avatarError}</p>
            </div>
          )}
        </div>

        {/* Edit Form */}
        <div className="card">
          <h3 className="font-rajdhani text-xl font-bold text-nexus-text mb-6">Edit Profil</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm text-nexus-muted mb-1.5">
                Nama Lengkap <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nexus-muted" />
                <input
                  {...register('full_name')}
                  className="input-field pl-10"
                  placeholder="Nama lengkap"
                />
              </div>
              {errors.full_name && (
                <p className="text-red-400 text-xs mt-1">{errors.full_name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-nexus-muted mb-1.5">Nomor HP</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nexus-muted" />
                <input
                  {...register('phone')}
                  className="input-field pl-10"
                  placeholder="08xx-xxxx-xxxx"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-nexus-muted mb-1.5">Email</label>
              <input
                value={user?.email || ''}
                disabled
                className="input-field opacity-50 cursor-not-allowed"
              />
              <p className="text-nexus-muted text-xs mt-1">Email tidak dapat diubah</p>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex items-center gap-2 py-3 px-8"
            >
              {saving
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</>
                : <><Save className="w-4 h-4" /> Simpan Perubahan</>
              }
            </button>
          </form>
        </div>

        {/* Security Section */}
        <div className="card mt-6">
          <h3 className="font-rajdhani text-xl font-bold text-nexus-text mb-4">Keamanan Akun</h3>
          <div className="p-4 rounded-xl bg-nexus-bg border border-nexus-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-nexus-text font-medium text-sm">Password</p>
                <p className="text-nexus-muted text-xs">Terakhir diubah: belum pernah</p>
              </div>
              <button
                onClick={() => toast('Fitur ganti password segera hadir!', { icon: '🔐' })}
                className="text-nexus-cyan text-sm hover:underline"
              >
                Ubah Password
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
