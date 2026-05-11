<div align="center">

<img src="https://placehold.co/120x120/0A0A0F/00D4FF?text=NXG&font=raleway" alt="NexusGear Logo" width="120" height="120" style="border-radius: 16px;" />

# NexusGear

**Premium Gaming Gear E-Commerce Platform**

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com)
[![Zustand](https://img.shields.io/badge/Zustand-v5-FF6B35)](https://zustand-demo.pmnd.rs)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel&logoColor=white)](https://vercel.com)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[Live Demo](https://nexus-gear.vercel.app) · [Report Bug](https://github.com/romiaprilian7406/NexusGear/issues) · [Request Feature](https://github.com/romiaprilian7406/NexusGear/issues)

</div>

---

## Daftar Isi

- [Tentang Proyek](#tentang-proyek)
- [Fitur](#fitur)
- [Tech Stack](#tech-stack)
- [Struktur Proyek](#struktur-proyek)
- [Skema Database](#skema-database)
- [Memulai](#memulai)
  - [Prasyarat](#prasyarat)
  - [Instalasi](#instalasi)
  - [Setup Supabase](#setup-supabase)
  - [Environment Variables](#environment-variables)
- [Penggunaan](#penggunaan)
  - [Mode Demo](#mode-demo)
  - [Akses Admin](#akses-admin)
- [Deployment](#deployment)
- [Arsitektur](#arsitektur)
- [Kontribusi](#kontribusi)
- [Lisensi](#lisensi)

---

## Tentang Proyek

**NexusGear** adalah platform e-commerce gaming gear full-featured yang dibangun dengan teknologi modern. Menampilkan UI dark-themed dengan aksen cyan dan purple, produk gaming dari berbagai brand ternama, sistem checkout multi-step, manajemen pesanan, dan admin panel lengkap — semua didukung backend PostgreSQL real-time via Supabase.

Aplikasi mendukung dua mode:
- **Mode Supabase (Production)** — terhubung ke database real dengan autentikasi penuh
- **Mode Demo (Development)** — offline tanpa backend, cocok untuk development lokal cepat

---

## Fitur

### Untuk Customer
- **Home** — Hero banner dengan animasi partikel, produk featured, kategori, flash sale countdown
- **Shop** — Browse produk dengan filter kategori, rentang harga, rating, pencarian; sortable; paginasi
- **Product Detail** — Info produk lengkap, zoom gambar, pilih quantity, add to cart
- **Shopping Cart** — Drawer slide-in, manajemen item, indikator free shipping threshold
- **Checkout 3 Langkah** — Alamat pengiriman → Metode pembayaran → Konfirmasi, validasi via Zod
- **Order Receipt** — Invoice lengkap dengan print/download, fetch dari Supabase jika halaman di-refresh
- **Riwayat Pesanan** — Semua pesanan dengan filter status dan thumbnail produk
- **Profil User** — Upload foto profil ke Supabase Storage, edit nama & nomor HP

### Admin Panel (`/admin`)
- **Dashboard** — Stats real-time (produk, pesanan, users, revenue), grafik 7 hari, pesanan terbaru
- **Manajemen Produk** — CRUD lengkap ke Supabase, toggle featured, filter kategori & pencarian
- **Manajemen Pesanan** — Lihat semua pesanan, update status (pending → processing → shipped → completed), batalkan
- **Manajemen Users** — Lihat semua user, toggle role admin/user langsung dari tabel

### Platform
- Dark mode by default dengan custom Nexus color palette
- Fully responsive (mobile, tablet, desktop)
- Persistent cart dan auth state via localStorage
- Toast notifications untuk semua aksi user
- Route guards untuk halaman protected dan admin-only
- Error Boundary untuk menangkap runtime errors
- Halaman 404 custom

---

## Tech Stack

| Kategori | Teknologi |
|---|---|
| **Frontend Framework** | React 19 |
| **Build Tool** | Vite 6 |
| **Styling** | Tailwind CSS v4 (CSS-first config) |
| **Routing** | React Router DOM v7 |
| **State Management** | Zustand v5 dengan `persist` middleware |
| **Backend / Database** | Supabase (PostgreSQL + Auth + Storage) |
| **Form Handling** | React Hook Form v7 + Zod v4 |
| **UI Primitives** | Radix UI (Dialog, Select, Checkbox, Slider, dll) |
| **Icons** | Lucide React |
| **Charts** | Recharts (AreaChart) |
| **Notifications** | React Hot Toast |
| **Deployment** | Vercel |
| **Utilities** | clsx, tailwind-merge, class-variance-authority |

---

## Struktur Proyek

```
NexusGear/
├── public/
├── src/
│   ├── components/
│   │   ├── admin/
│   │   │   ├── AdminSidebar.jsx      # Navigasi sidebar admin
│   │   │   └── StatCard.jsx          # Kartu metrik dashboard
│   │   ├── cart/
│   │   │   └── CartDrawer.jsx        # Drawer keranjang slide-in
│   │   ├── layout/
│   │   │   ├── Navbar.jsx            # Navigasi global
│   │   │   └── Footer.jsx            # Footer global
│   │   ├── product/
│   │   │   ├── ProductCard.jsx       # Kartu produk di grid
│   │   │   └── ProductGrid.jsx       # Wrapper grid produk responsif
│   │   └── shared/
│   │       ├── Badge.jsx             # Komponen badge status
│   │       ├── EmptyState.jsx        # Placeholder state kosong
│   │       ├── ErrorBoundary.jsx     # React Error Boundary
│   │       └── Loading.jsx           # Skeleton & full-page loader
│   ├── hooks/
│   │   ├── useAuth.js                # Supabase auth listener
│   │   ├── useProducts.js            # Fetch produk & kategori
│   │   └── useOrders.js              # CRUD orders (user & admin)
│   ├── lib/
│   │   ├── supabase.js               # Inisialisasi Supabase client
│   │   └── utils.js                  # Formatter, konstanta, mock data
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Shop.jsx
│   │   ├── ProductDetail.jsx
│   │   ├── Cart.jsx
│   │   ├── Checkout.jsx
│   │   ├── Receipt.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Profile.jsx
│   │   ├── OrderHistory.jsx
│   │   ├── NotFound.jsx              # Halaman 404
│   │   └── admin/
│   │       ├── Dashboard.jsx
│   │       ├── Products.jsx
│   │       ├── Orders.jsx
│   │       └── Users.jsx
│   ├── router/
│   │   ├── AppRouter.jsx             # Definisi route & layout wrapper
│   │   ├── ProtectedRoute.jsx        # Guard auth (redirect ke /login)
│   │   └── AdminRoute.jsx            # Guard admin (redirect ke /)
│   ├── stores/
│   │   ├── authStore.js              # State auth + profile (persisted)
│   │   ├── cartStore.js              # State keranjang (persisted)
│   │   └── uiStore.js                # State UI (cart drawer, menu)
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── supabase_migration.sql            # Schema DB + RLS + Storage + seed data
├── update_product_images.sql         # Update URL gambar produk ke brand asli
├── .env.example
├── vercel.json
├── vite.config.js
├── package.json
└── README.md
```

---

## Skema Database

```sql
profiles          -- Extend Supabase auth.users
  id              UUID (FK → auth.users, CASCADE)
  full_name       TEXT
  role            TEXT ('admin' | 'user')
  avatar_url      TEXT
  phone           TEXT
  created_at      TIMESTAMPTZ
  updated_at      TIMESTAMPTZ

categories
  id              SERIAL
  name            TEXT
  slug            TEXT UNIQUE
  icon            TEXT (emoji)

products
  id              SERIAL
  name            TEXT
  description     TEXT
  price           DECIMAL(12,2)
  stock           INTEGER
  rating          DECIMAL(3,2)
  image_url       TEXT
  category_id     INTEGER (FK → categories)
  is_featured     BOOLEAN
  created_at      TIMESTAMPTZ
  updated_at      TIMESTAMPTZ

orders
  id              UUID
  user_id         UUID (FK → profiles, CASCADE)
  status          TEXT ('pending'|'processing'|'shipped'|'completed'|'cancelled')
  total_amount    DECIMAL(12,2)
  shipping_address JSONB
  payment_method  TEXT
  notes           TEXT
  created_at      TIMESTAMPTZ

order_items
  id              SERIAL
  order_id        UUID (FK → orders, CASCADE)
  product_id      INTEGER (FK → products, SET NULL)
  quantity        INTEGER
  price_at_purchase DECIMAL(12,2)
```

### Row Level Security

| Tabel | Kebijakan |
|---|---|
| `profiles` | RLS **dinonaktifkan** (solusi infinite recursion) — data tidak sensitif |
| `products` | Public SELECT; admin ALL |
| `categories` | Public SELECT; admin ALL |
| `orders` | User baca/insert milik sendiri; admin baca/update semua |
| `order_items` | Mengikuti akses orders |

### Storage Buckets

| Bucket | Akses | Ukuran Maks | Tipe File |
|---|---|---|---|
| `avatars` | Public | 2 MB | JPG, PNG, WebP, GIF |
| `products` | Public | 5 MB | JPG, PNG, WebP |

---

## Memulai

### Prasyarat

- **Node.js** v18 atau lebih baru
- **npm** v9 atau lebih baru
- Akun **Supabase** (free tier cukup) — atau gunakan Mode Demo tanpa backend

### Instalasi

```bash
# Clone repository
git clone https://github.com/romiaprilian7406/NexusGear.git
cd NexusGear

# Install dependencies
npm install

# Salin template environment variable
cp .env.example .env
```

### Setup Supabase

1. Buat project baru di [supabase.com](https://supabase.com)
2. Buka **SQL Editor** di dashboard Supabase
3. Jalankan isi file `supabase_migration.sql` — ini akan:
   - Membuat semua tabel dengan constraints yang tepat
   - Mengaktifkan Row Level Security dengan policies yang benar
   - Membuat trigger auto-create profile saat user register
   - Mengkonfigurasi Storage bucket `avatars` dan `products`
   - Menyeed 7 kategori dan 23 produk
4. *(Opsional)* Jalankan `update_product_images.sql` untuk mengganti gambar placeholder ke gambar brand asli
5. Di Supabase → **Authentication → Providers**, pastikan **Email** aktif
6. Di Supabase → **Authentication → Settings**, matikan **Confirm email** untuk development
7. Salin **Project URL** dan **anon public key** dari **Settings → API → Legacy anon**

### Environment Variables

Edit file `.env` dengan kredensial Supabase kamu:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_public_key_here
```

> ⚠️ **Penting:** Gunakan key dari tab **Legacy anon** (bukan `sb_publishable`), dan jangan pernah commit file `.env` ke Git.

Jalankan development server:

```bash
npm run dev
```

Buka [http://localhost:5173](http://localhost:5173) di browser.

---

## Penggunaan

### Mode Demo

Jika Supabase belum dikonfigurasi (URL mengandung "placeholder" atau kosong), aplikasi otomatis masuk **Mode Demo**:
- Produk ditampilkan dari data lokal (23 mock products)
- Login/Register menggunakan autentikasi simulasi
- Cart dan auth state tetap tersimpan via `localStorage`
- Tidak ada data yang tersimpan ke database

### Akses Admin

**Dengan Supabase (production):**

1. Register akun baru atau buat via Supabase Authentication dashboard
2. Jalankan SQL berikut di SQL Editor:
   ```sql
   UPDATE profiles
   SET role = 'admin'
   WHERE id = (SELECT id FROM auth.users WHERE email = 'email@kamu.com');
   ```
3. Hapus localStorage lama di browser DevTools Console:
   ```js
   localStorage.removeItem('nexusgear-auth')
   ```
4. Login ulang → akan otomatis diarahkan ke `/admin/dashboard`

**Dalam Mode Demo:**
- Login dengan email apapun yang mengandung kata `admin` (contoh: `admin@nexusgear.com`)
- Password bebas apapun
- Otomatis mendapat hak akses admin

---

## Deployment

### Vercel (Direkomendasikan)

Project ini sudah dikonfigurasi untuk deployment zero-config di Vercel via `vercel.json`.

#### Opsi 1: Via Vercel Dashboard

1. Push kode ke GitHub
2. Buka [vercel.com](https://vercel.com) → **Add New Project**
3. Import repository `NexusGear`
4. Tambahkan **Environment Variables**:
   ```
   VITE_SUPABASE_URL      = https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY = your_anon_key
   ```
5. Klik **Deploy**

#### Opsi 2: Via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Tambah environment variables
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY

# Deploy ke production
vercel --prod
```

#### Build Settings (auto-detected)

| Setting | Value |
|---|---|
| Framework | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

> File `vercel.json` memastikan React Router bekerja dengan benar di semua route — tanpa ini semua URL selain `/` akan return 404.

---

## Arsitektur

### State Management

```
authStore (persisted → localStorage: "nexusgear-auth")
  ├── user          Supabase User object
  ├── profile       Row dari tabel profiles (termasuk role)
  ├── loading       Boolean loading state
  ├── isAdmin       Computed dari profile.role
  ├── setUser()
  ├── setProfile()
  ├── fetchProfile()
  └── logout()

cartStore (persisted → localStorage: "nexusgear-cart")
  ├── items[]       Array { product, quantity }
  ├── itemCount     Total quantity
  ├── total         Total harga
  ├── addItem()
  ├── removeItem()
  ├── updateQuantity()
  └── clearCart()

uiStore (in-memory, tidak persisted)
  ├── cartOpen
  └── mobileMenuOpen
```

### Alur Autentikasi

```
App mount
  └── AuthInitializer
        ├── useAuthStore.persist.rehydrate()   ← load dari localStorage
        └── useAuth()
              └── supabase.auth.onAuthStateChange()
                    ├── SIGNED_IN  → fetchProfile(userId)
                    └── SIGNED_OUT → setUser(null), setProfile(null)

Akses route protected
  └── ProtectedRoute / AdminRoute
        ├── Baca Zustand store (post-hydration)
        ├── Baca localStorage langsung (selama hydration gap)
        └── Tampilkan <PageLoading /> selama hydrating
```

### Routing

| Route | Akses | Komponen |
|---|---|---|
| `/` | Public | Home |
| `/shop` | Public | Shop |
| `/product/:id` | Public | ProductDetail |
| `/cart` | Public | Cart |
| `/login` | Public | Login |
| `/register` | Public | Register |
| `/checkout` | Auth required | Checkout |
| `/receipt/:orderId` | Auth required | Receipt |
| `/profile` | Auth required | Profile |
| `/orders` | Auth required | OrderHistory |
| `/admin/dashboard` | Admin only | Dashboard |
| `/admin/products` | Admin only | Products |
| `/admin/orders` | Admin only | Orders |
| `/admin/users` | Admin only | Users |
| `*` | Public | NotFound (404) |

---

## Kontribusi

Kontribusi, issues, dan feature requests sangat disambut!

1. Fork repository ini
2. Buat feature branch: `git checkout -b feature/nama-fitur`
3. Commit perubahan: `git commit -m 'feat: tambah fitur X'`
4. Push ke branch: `git push origin feature/nama-fitur`
5. Buka Pull Request

Pastikan kode mengikuti style yang ada dan build berhasil sebelum submit PR.

---

## Lisensi

Project ini dilisensikan di bawah MIT License. Lihat file [LICENSE](LICENSE) untuk detail.

---

<div align="center">

Dibuat dengan ❤️ oleh [romiaprilian7406](https://github.com/romiaprilian7406)

⭐ Jika project ini membantu, berikan bintang!

</div>