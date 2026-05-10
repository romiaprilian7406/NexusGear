<![CDATA[<div align="center">

<img src="https://placehold.co/120x120/0A0A0F/00D4FF?text=NXG&font=raleway" alt="NexusGear Logo" width="120" height="120" style="border-radius: 16px;" />

# NexusGear

**Premium Gaming Gear E-Commerce Platform**

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com)
[![Zustand](https://img.shields.io/badge/Zustand-v5-FF6B35)](https://zustand-demo.pmnd.rs)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[Live Demo](#) · [Report Bug](https://github.com/romiaprilian7406/NexusGear/issues) · [Request Feature](https://github.com/romiaprilian7406/NexusGear/issues)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Screenshots](#screenshots)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Supabase Setup](#supabase-setup)
  - [Environment Variables](#environment-variables)
- [Usage](#usage)
  - [Demo Mode](#demo-mode)
  - [Admin Access](#admin-access)
- [Deployment](#deployment)
  - [Vercel](#vercel)
- [Architecture](#architecture)
  - [State Management](#state-management)
  - [Authentication Flow](#authentication-flow)
  - [Routing](#routing)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

**NexusGear** is a full-featured e-commerce platform built for gaming peripheral enthusiasts. It offers a sleek dark-themed UI with cyan and purple accents, full product browsing with filtering/sorting, a multi-step checkout flow, order management, and a complete admin panel — all powered by a real-time PostgreSQL backend via Supabase.

The app supports both **live Supabase mode** (production) and a **demo mode** (offline, with 23 mock products) for easy local development without any backend setup.

---

## Features

### Customer-Facing
- **Home Page** — Hero banner, featured products carousel, category grid, brand showcase
- **Shop Page** — Browse all products with real-time filtering by category, price range, rating, and keyword search; sortable by price or rating
- **Product Detail** — Full product info, stock indicator, add-to-cart with quantity selector
- **Shopping Cart** — Slide-in drawer with item management, free-shipping threshold indicator
- **Cart Page** — Full cart view with quantity editing and item removal
- **3-Step Checkout** — Shipping info → Payment method → Order review, with form validation via Zod
- **Order Receipt** — Confirmation page with full order summary after successful checkout
- **Order History** — View all past orders with status tracking
- **User Profile** — Update display name, avatar, phone number

### Admin Panel
- **Dashboard** — Revenue & order metrics (7-day), stats cards, recent orders table, sales chart (Recharts AreaChart)
- **Product Management** — Full CRUD: search, category filter, add/edit modal with validation, delete confirmation, featured toggle
- **Order Management** — View all orders, update order status (pending → processing → shipped → completed/cancelled)
- **User Management** — View all registered users and their roles

### Platform
- Dark mode by default with custom Nexus color palette
- Fully responsive (mobile, tablet, desktop)
- Persistent cart and auth state across page reloads
- Toast notifications for all user actions
- Route guards for protected and admin-only pages

---

## Tech Stack

| Category | Technology |
|---|---|
| **Frontend Framework** | React 19 |
| **Build Tool** | Vite 6 |
| **Styling** | Tailwind CSS v4 (CSS-first config) |
| **Routing** | React Router DOM v7 |
| **State Management** | Zustand v5 with `persist` middleware |
| **Backend / Database** | Supabase (PostgreSQL + Auth + Storage) |
| **Form Handling** | React Hook Form v7 + Zod v4 |
| **UI Primitives** | Radix UI (Dialog, Select, Checkbox, Slider, etc.) |
| **Icons** | Lucide React |
| **Charts** | Recharts (AreaChart) |
| **Notifications** | React Hot Toast |
| **Utilities** | clsx, tailwind-merge, class-variance-authority |

---

## Screenshots

> Screenshots shown below use the live dark theme with cyan/purple accents.

| Page | Description |
|---|---|
| 🏠 Home | Hero, featured products, categories |
| 🛍️ Shop | Product grid with filters & sorting |
| 📦 Product Detail | Full product info & add-to-cart |
| 🛒 Cart Drawer | Slide-in cart with live totals |
| 💳 Checkout | 3-step validated checkout flow |
| 📋 Order History | Past orders with status badges |
| 🔧 Admin Dashboard | Metrics, chart, recent orders |
| 📝 Admin Products | Product CRUD with modal forms |

---

## Project Structure

```
NexusGear/
├── public/
├── src/
│   ├── components/
│   │   ├── admin/
│   │   │   ├── AdminSidebar.jsx      # Admin navigation sidebar
│   │   │   └── StatCard.jsx          # Dashboard metric card
│   │   ├── cart/
│   │   │   └── CartDrawer.jsx        # Slide-in cart drawer
│   │   ├── layout/
│   │   │   ├── Navbar.jsx            # Global navigation bar
│   │   │   └── Footer.jsx            # Global footer
│   │   ├── product/
│   │   │   ├── ProductCard.jsx       # Product grid card
│   │   │   └── ProductGrid.jsx       # Responsive product grid wrapper
│   │   └── shared/
│   │       ├── Badge.jsx             # Status/label badge
│   │       ├── EmptyState.jsx        # Empty state placeholder
│   │       └── Loading.jsx           # Skeleton & full-page loaders
│   ├── hooks/
│   │   ├── useAuth.js                # Supabase auth listener + demo mode
│   │   ├── useProducts.js            # Product & category data fetching
│   │   └── useOrders.js              # Order creation & fetching
│   ├── lib/
│   │   ├── supabase.js               # Supabase client initialization
│   │   └── utils.js                  # Formatters, constants, mock data
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
│   │   └── admin/
│   │       ├── Dashboard.jsx
│   │       ├── Products.jsx
│   │       ├── Orders.jsx
│   │       └── Users.jsx
│   ├── router/
│   │   ├── AppRouter.jsx             # Route definitions & layout wrappers
│   │   ├── ProtectedRoute.jsx        # Auth guard (redirect to /login)
│   │   └── AdminRoute.jsx            # Admin guard (redirect to /)
│   ├── stores/
│   │   ├── authStore.js              # Auth state + profile (persisted)
│   │   ├── cartStore.js              # Cart items (persisted)
│   │   └── uiStore.js                # UI toggles (cart drawer, menu)
│   ├── App.jsx                       # Root component + auth initializer
│   ├── main.jsx                      # React DOM entry point
│   └── index.css                     # Tailwind v4 @theme + global styles
├── supabase_migration.sql            # Full DB schema + RLS + seed data
├── update_product_images.sql         # SQL to update product image URLs
├── .env.example                      # Environment variable template
├── vercel.json                       # Vercel SPA rewrite config
├── vite.config.js
├── package.json
└── README.md
```

---

## Database Schema

```sql
profiles          -- Extends Supabase auth.users
  id              UUID (FK → auth.users)
  full_name       TEXT
  role            TEXT ('admin' | 'user')
  avatar_url      TEXT
  phone           TEXT
  created_at      TIMESTAMPTZ

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
  user_id         UUID (FK → profiles)
  status          TEXT ('pending'|'processing'|'shipped'|'completed'|'cancelled')
  total_amount    DECIMAL(12,2)
  shipping_address JSONB
  payment_method  TEXT
  notes           TEXT
  created_at      TIMESTAMPTZ

order_items
  id              SERIAL
  order_id        UUID (FK → orders)
  product_id      INTEGER (FK → products)
  quantity        INTEGER
  price_at_purchase DECIMAL(12,2)
```

All tables are protected with **Row Level Security (RLS)** policies:
- Users can only read/write their own `profiles` and `orders`
- `products` and `categories` are publicly readable
- Admin operations are handled via Supabase service role

---

## Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher
- A **Supabase** account (free tier is sufficient) — or use demo mode without any backend

### Installation

```bash
# Clone the repository
git clone https://github.com/romiaprilian7406/NexusGear.git
cd NexusGear

# Install dependencies
npm install

# Copy environment variable template
cp .env.example .env
```

### Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** in your Supabase dashboard
3. Paste and run the contents of `supabase_migration.sql` — this will:
   - Create all tables (`profiles`, `categories`, `products`, `orders`, `order_items`)
   - Enable Row Level Security with appropriate policies
   - Seed 7 categories and 23 products
4. *(Optional)* Run `update_product_images.sql` to apply brand-specific image URLs to all seeded products
5. In Supabase → **Authentication → Providers**, ensure **Email** is enabled
6. Copy your **Project URL** and **anon public key** from **Settings → API**

### Environment Variables

Edit `.env` with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_public_key_here
```

Then start the development server:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Usage

### Demo Mode

If you don't have a Supabase project set up, the app automatically falls back to **demo mode**:
- 23 mock products are served from local data
- Authentication uses a demo fallback (any email/password works)
- Cart and auth state persist via `localStorage`

> Demo mode is activated when the Supabase URL contains "placeholder" or is not configured.

### Admin Access

To access the admin panel (`/admin/dashboard`):

**With Supabase (production):**
1. Register a new account
2. In Supabase → Table Editor → `profiles`, set your user's `role` to `'admin'`
3. Log in again to refresh the session

**In Demo Mode:**
- Log in with any email containing the word `admin` (e.g., `admin@nexusgear.com`)
- Any password will work
- You will automatically receive admin privileges

Admin routes are protected by `AdminRoute.jsx` which checks `profile.role === 'admin'`.

---

## Deployment

### Vercel

This project is configured for zero-config deployment on Vercel via `vercel.json`.

#### Option 1: Vercel Dashboard (Recommended)

1. Push your code to GitHub (already done)
2. Go to [vercel.com](https://vercel.com) and click **Add New Project**
3. Import your `NexusGear` repository
4. In **Environment Variables**, add:
   ```
   VITE_SUPABASE_URL      = https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY = your_anon_key
   ```
5. Click **Deploy** — Vercel auto-detects Vite and sets the correct build command

#### Option 2: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from project root
vercel

# Follow the prompts, then add env vars:
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY

# Deploy to production
vercel --prod
```

Build settings (auto-detected by Vercel):
| Setting | Value |
|---|---|
| Framework | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

The `vercel.json` rewrite rule ensures React Router's client-side navigation works correctly on all routes.

---

## Architecture

### State Management

Three Zustand stores handle all client-side state:

```
authStore (persisted → localStorage key: "nexusgear-auth")
  ├── user          Supabase User object
  ├── profile       Profile row from DB (includes role)
  ├── isAdmin       Computed from profile.role
  ├── setUser()
  ├── setProfile()
  ├── fetchProfile()
  └── logout()

cartStore (persisted → localStorage key: "nexusgear-cart")
  ├── items[]       Array of { product, quantity }
  ├── itemCount     Computed total quantity
  ├── total         Computed total price
  ├── addItem()     Merges duplicates, respects stock limit
  ├── removeItem()
  ├── updateQuantity()
  └── clearCart()

uiStore (in-memory, not persisted)
  ├── cartOpen      Controls CartDrawer visibility
  └── mobileMenuOpen
```

### Authentication Flow

```
App mounts
  └── AuthInitializer
        ├── useAuthStore.persist.rehydrate()   ← force-load from localStorage
        └── useAuth()
              └── supabase.auth.onAuthStateChange()
                    ├── SIGNED_IN  → fetchProfile(userId)
                    └── SIGNED_OUT → setUser(null), setProfile(null)

Route access
  └── ProtectedRoute / AdminRoute
        ├── reads Zustand store (post-hydration)
        ├── reads localStorage directly (during hydration gap)
        └── shows <PageLoading /> while hydrating
```

### Routing

| Route | Access | Component |
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

---

## Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

Please make sure your code follows the existing code style and that the build passes before submitting a PR.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

<div align="center">

Built with passion by [romiaprilian7406](https://github.com/romiaprilian7406)

⭐ If you found this project helpful, please give it a star!

</div>
]]>