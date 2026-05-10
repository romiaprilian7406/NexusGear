-- ============================================================
-- NexusGear - Supabase Database Migration
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Users profile (extend Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  full_name TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(12,2) NOT NULL,
  stock INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  image_url TEXT,
  category_id INTEGER REFERENCES categories(id),
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','processing','shipped','completed','cancelled')),
  total_amount DECIMAL(12,2) NOT NULL,
  shipping_address JSONB NOT NULL,
  payment_method TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order Items
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  product_id INTEGER REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price_at_purchase DECIMAL(12,2) NOT NULL
);

-- ============================================================
-- Row Level Security
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admin full access profiles" ON profiles USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Users read own orders" ON orders FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users insert own orders" ON orders FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admin full access orders" ON orders USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Products are public" ON products FOR SELECT USING (true);
CREATE POLICY "Categories are public" ON categories FOR SELECT USING (true);

-- ============================================================
-- Seed Data: Categories
-- ============================================================
INSERT INTO categories (name, slug, icon) VALUES
  ('Keyboard', 'keyboard', '⌨️'),
  ('Mouse', 'mouse', '🖱️'),
  ('Headset', 'headset', '🎧'),
  ('Monitor', 'monitor', '🖥️'),
  ('Mousepad', 'mousepad', '🟦'),
  ('Controller', 'controller', '🎮'),
  ('Gaming Chair', 'gaming-chair', '🪑')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- Seed Data: Products (21+ produk)
-- ============================================================
INSERT INTO products (name, description, price, stock, rating, image_url, category_id, is_featured) VALUES
-- Keyboards (cat 1)
('Razer BlackWidow V4', 'Mechanical gaming keyboard dengan Razer Green switches, RGB Chroma backlighting, dedicated media keys, dan wrist rest ergonomis. Dilengkapi fitur anti-ghosting untuk gaming kompetitif.', 1850000, 25, 4.8, 'https://placehold.co/400x400/111118/00D4FF?text=BlackWidow+V4', 1, true),
('Logitech G Pro X', 'Keyboard gaming tenkeyless profesional dengan GX Blue switches yang bisa diganti, LIGHTSYNC RGB, dan desain ultra-portabel untuk esports.', 1450000, 18, 4.7, 'https://placehold.co/400x400/111118/7C3AED?text=G+Pro+X', 1, false),
('Corsair K70 RGB MK.2', 'Keyboard full-size dengan Cherry MX Red switches, per-key RGB backlighting, aircraft-grade brushed aluminum frame, dan dedicated media controls.', 1650000, 12, 4.6, 'https://placehold.co/400x400/111118/00D4FF?text=K70+RGB', 1, true),
('SteelSeries Apex Pro', 'Keyboard gaming dengan OmniPoint switches yang dapat disesuaikan actuation-nya dari 0.4mm hingga 3.6mm. Dilengkapi OLED smart display dan multi-color RGB.', 2100000, 8, 4.9, 'https://placehold.co/400x400/111118/7C3AED?text=Apex+Pro', 1, true),

-- Mice (cat 2)
('Razer DeathAdder V3', 'Mouse gaming ergonomis dengan Focus Pro 30K optical sensor, optical mouse switches gen-3, lightweight design 59g, dan Speedflex cable.', 750000, 35, 4.8, 'https://placehold.co/400x400/111118/00D4FF?text=DeathAdder+V3', 2, true),
('Logitech G502 X Plus', 'Mouse gaming wireless dengan LIGHTFORCE hybrid switches, HERO 25K sensor, LIGHTSPEED wireless technology, dan bobot yang dapat disesuaikan.', 1250000, 22, 4.7, 'https://placehold.co/400x400/111118/7C3AED?text=G502+X', 2, false),
('SteelSeries Rival 600', 'Mouse gaming dual sensor dengan TrueMove3+ optical sensor, 6 adjustable side weights, split-trigger optical buttons, dan split-weight system.', 950000, 15, 4.5, 'https://placehold.co/400x400/111118/00D4FF?text=Rival+600', 2, false),
('ASUS ROG Keris Wireless', 'Mouse gaming wireless ultra-ringan 79g dengan ROG SpeedNova wireless technology, ROG Micro Switches, dan Push-fit Switch Socket II yang mudah diganti.', 1100000, 10, 4.6, 'https://placehold.co/400x400/111118/7C3AED?text=ROG+Keris', 2, true),

-- Headsets (cat 3)
('HyperX Cloud Alpha', 'Headset gaming dengan dual chamber driver yang memisahkan bass dari mid dan high frequencies, memory foam ear cushions, dan detachable noise-cancelling microphone.', 1200000, 20, 4.8, 'https://placehold.co/400x400/111118/00D4FF?text=Cloud+Alpha', 3, true),
('Razer BlackShark V2', 'Headset esports dengan TriForce Titanium 50mm drivers, HyperClear Cardioid Mic, THX Spatial Audio, dan ultra-soft memory foam ear cushions.', 1100000, 18, 4.7, 'https://placehold.co/400x400/111118/7C3AED?text=BlackShark+V2', 3, false),
('Corsair HS80 RGB Wireless', 'Headset gaming wireless premium dengan Dolby Atmos audio, 50mm neodymium drivers, flip-to-mute microphone, dan hingga 20 jam battery life.', 1350000, 14, 4.6, 'https://placehold.co/400x400/111118/00D4FF?text=HS80+RGB', 3, false),

-- Monitors (cat 4)
('ASUS ROG Swift 27" 144Hz', 'Monitor gaming 27 inci IPS 1440p dengan refresh rate 144Hz, 1ms response time, NVIDIA G-Sync Compatible, HDR400, dan Aura Sync RGB lighting.', 4500000, 8, 4.8, 'https://placehold.co/400x400/111118/7C3AED?text=ROG+Swift', 4, true),
('MSI Optix MAG274QRF', 'Monitor gaming Rapid IPS 27 inci QHD 165Hz dengan 1ms response time, AMD FreeSync Premium, HDR400, dan Night Vision mode untuk area gelap.', 5200000, 5, 4.7, 'https://placehold.co/400x400/111118/00D4FF?text=MAG274QRF', 4, false),
('LG UltraGear 27GP850', 'Monitor gaming Nano IPS 27 inci QHD 165Hz (OC 180Hz) dengan 1ms GtG, NVIDIA G-Sync Compatible, AMD FreeSync Premium, dan HDR10 support.', 4800000, 6, 4.9, 'https://placehold.co/400x400/111118/7C3AED?text=UltraGear+27', 4, true),

-- Mousepads (cat 5)
('SteelSeries QcK XXL', 'Mousepad gaming extra-large (900x400mm) dengan micro-woven cloth surface yang dioptimalkan untuk semua tipe sensor, non-slip rubber base, dan jahitan tepi yang kokoh.', 380000, 40, 4.7, 'https://placehold.co/400x400/111118/00D4FF?text=QcK+XXL', 5, false),
('Razer Goliathus Extended', 'Mousepad gaming extended (920x294mm) dengan textured micro-weave cloth, non-slip rubber base, dan optimized untuk speed dan control gaming.', 420000, 30, 4.6, 'https://placehold.co/400x400/111118/7C3AED?text=Goliathus+Ext', 5, false),
('Corsair MM350 Pro XL', 'Mousepad gaming premium cloth XL (930x400mm) dengan tri-layer construction, non-slip rubber base thick 4mm, dan water-resistant coating.', 350000, 35, 4.5, 'https://placehold.co/400x400/111118/00D4FF?text=MM350+Pro', 5, false),

-- Controllers (cat 6)
('DualSense PS5 Controller', 'Controller PS5 dengan haptic feedback generasi berikutnya, adaptive triggers, built-in microphone, motion sensor, dan touchpad kapasitif. Kompatibel dengan PC via USB.', 900000, 20, 4.9, 'https://placehold.co/400x400/111118/7C3AED?text=DualSense', 6, true),
('Xbox Wireless Controller', 'Controller Xbox Series X|S dengan textured grip, share button, USB-C charging, kompatibel dengan Xbox Series X|S, Xbox One, PC Windows 10/11, dan Android/iOS.', 850000, 25, 4.8, 'https://placehold.co/400x400/111118/00D4FF?text=Xbox+Controller', 6, false),
('8BitDo Pro 2 Controller', 'Controller gaming premium multi-platform dengan Ultimate Software support, programmable buttons, 40 jam battery life, dan kompatibel dengan Switch, PC, dan Android.', 750000, 18, 4.7, 'https://placehold.co/400x400/111118/7C3AED?text=8BitDo+Pro+2', 6, false),

-- Gaming Chairs (cat 7)
('Secretlab TITAN Evo 2022', 'Gaming chair premium dengan NEO Hybrid Leatherette, 4-way L-ADAPT lumbar support, magnetic memory foam head pillow, multi-tilt mechanism, dan armrests 4D.', 8500000, 5, 4.9, 'https://placehold.co/400x400/111118/00D4FF?text=TITAN+Evo', 7, true),
('DXRacer Formula Series', 'Gaming chair dengan high-density foam padding, adjustable lumbar dan headrest pillows, reclining backrest 135°, 3D armrests, dan aluminum base dengan caster wheels.', 4200000, 8, 4.5, 'https://placehold.co/400x400/111118/7C3AED?text=DXRacer+Formula', 7, false),
('ASUS ROG Chariot Core', 'Gaming chair dengan PU leather premium, built-in lumbar support, memory foam head pillow, 4D armrests, metal base dengan 60mm PU casters, dan reclining 90-165°.', 6800000, 4, 4.7, 'https://placehold.co/400x400/111118/00D4FF?text=ROG+Chariot', 7, true);

-- ============================================================
-- Storage Bucket for avatars & product images
-- ============================================================
-- Run these separately in Supabase Storage settings:
-- 1. Create bucket 'avatars' (public)
-- 2. Create bucket 'products' (public)
