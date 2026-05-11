-- ============================================================
-- NexusGear - Supabase Database Migration (FINAL)
-- Run this in your Supabase SQL Editor
-- ============================================================

-- ============================================================
-- 1. TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL DEFAULT '',
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT
);

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(12,2) NOT NULL CHECK (price >= 0),
  stock INTEGER DEFAULT 0 CHECK (stock >= 0),
  rating DECIMAL(3,2) DEFAULT 4.5 CHECK (rating >= 0 AND rating <= 5),
  image_url TEXT,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','processing','shipped','completed','cancelled')),
  total_amount DECIMAL(12,2) NOT NULL CHECK (total_amount >= 0),
  shipping_address JSONB NOT NULL,
  payment_method TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price_at_purchase DECIMAL(12,2) NOT NULL CHECK (price_at_purchase >= 0)
);

-- ============================================================
-- 2. AUTO-UPDATE TRIGGER (updated_at)
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS products_updated_at ON products;
CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 3. AUTO-CREATE PROFILE TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'user'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 4. ROW LEVEL SECURITY
-- ============================================================

-- Profiles: DISABLE RLS (solusi untuk infinite recursion di policies)
-- Data profiles tidak sensitif (tidak ada password, kartu kredit, dll)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Products: public read, admin write
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Products public read" ON products;
CREATE POLICY "Products public read" ON products
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage products" ON products;
CREATE POLICY "Admin manage products" ON products
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Categories: public read, admin write
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Categories public read" ON categories;
CREATE POLICY "Categories public read" ON categories
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage categories" ON categories;
CREATE POLICY "Admin manage categories" ON categories
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Orders: user own + admin all
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own orders" ON orders;
CREATE POLICY "Users read own orders" ON orders
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Users insert own orders" ON orders;
CREATE POLICY "Users insert own orders" ON orders
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Admin update orders" ON orders;
CREATE POLICY "Admin update orders" ON orders
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Order Items: follow orders access
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Order items read" ON order_items;
CREATE POLICY "Order items read" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND (
        orders.user_id = auth.uid()
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
      )
    )
  );

DROP POLICY IF EXISTS "Order items insert" ON order_items;
CREATE POLICY "Order items insert" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- ============================================================
-- 5. STORAGE SETUP (run separately if needed)
-- ============================================================
-- Buat bucket 'avatars' (public) di Supabase Storage dashboard, lalu:

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152, -- 2MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 2097152;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'products',
  'products',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880;

-- Storage Policies: avatars bucket
DROP POLICY IF EXISTS "Public read avatars" ON storage.objects;
CREATE POLICY "Public read avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Auth users upload avatar" ON storage.objects;
CREATE POLICY "Auth users upload avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid() IS NOT NULL
  );

DROP POLICY IF EXISTS "Auth users update avatar" ON storage.objects;
CREATE POLICY "Auth users update avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars'
    AND auth.uid() IS NOT NULL
  );

DROP POLICY IF EXISTS "Auth users delete avatar" ON storage.objects;
CREATE POLICY "Auth users delete avatar" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars'
    AND auth.uid() IS NOT NULL
  );

-- Storage Policies: products bucket
DROP POLICY IF EXISTS "Public read products" ON storage.objects;
CREATE POLICY "Public read products" ON storage.objects
  FOR SELECT USING (bucket_id = 'products');

DROP POLICY IF EXISTS "Admin upload products" ON storage.objects;
CREATE POLICY "Admin upload products" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'products'
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Admin update products" ON storage.objects;
CREATE POLICY "Admin update products" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'products'
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- 6. SEED DATA: Categories
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
-- 7. SEED DATA: Products
-- ============================================================

INSERT INTO products (name, description, price, stock, rating, image_url, category_id, is_featured) VALUES
-- Keyboards
('Razer BlackWidow V4', 'Mechanical gaming keyboard dengan Razer Green switches, RGB Chroma backlighting, dedicated media keys, dan wrist rest ergonomis. Anti-ghosting untuk gaming kompetitif.', 1850000, 25, 4.8, 'https://placehold.co/400x400/0D1B11/44D62C?text=BlackWidow+V4&font=raleway', 1, true),
('Logitech G Pro X', 'Keyboard gaming tenkeyless profesional dengan GX Blue switches yang bisa diganti, LIGHTSYNC RGB, dan desain ultra-portabel untuk esports.', 1450000, 18, 4.7, 'https://placehold.co/400x400/0A1A2E/0082CB?text=G+Pro+X&font=raleway', 1, false),
('Corsair K70 RGB MK.2', 'Keyboard full-size dengan Cherry MX Red switches, per-key RGB backlighting, aircraft-grade brushed aluminum frame, dan dedicated media controls.', 1650000, 12, 4.6, 'https://placehold.co/400x400/120F0A/FFB300?text=K70+RGB&font=raleway', 1, true),
('SteelSeries Apex Pro', 'Keyboard gaming dengan OmniPoint switches yang dapat disesuaikan actuation-nya 0.4-3.6mm. Dilengkapi OLED smart display dan multi-color RGB.', 2100000, 8, 4.9, 'https://placehold.co/400x400/0A0A12/E65C28?text=Apex+Pro&font=raleway', 1, true),
-- Mice
('Razer DeathAdder V3', 'Mouse gaming ergonomis dengan Focus Pro 30K optical sensor, optical mouse switches gen-3, lightweight design 59g, dan Speedflex cable.', 750000, 35, 4.8, 'https://placehold.co/400x400/0D1B11/44D62C?text=DeathAdder+V3&font=raleway', 2, true),
('Logitech G502 X Plus', 'Mouse gaming wireless dengan LIGHTFORCE hybrid switches, HERO 25K sensor, LIGHTSPEED wireless technology, dan bobot yang dapat disesuaikan.', 1250000, 22, 4.7, 'https://placehold.co/400x400/0A1A2E/0082CB?text=G502+X&font=raleway', 2, false),
('SteelSeries Rival 600', 'Mouse gaming dual sensor dengan TrueMove3+ optical sensor, 6 adjustable side weights, split-trigger optical buttons, dan split-weight system.', 950000, 15, 4.5, 'https://placehold.co/400x400/0A0A12/E65C28?text=Rival+600&font=raleway', 2, false),
('ASUS ROG Keris Wireless', 'Mouse gaming wireless ultra-ringan 79g dengan ROG SpeedNova wireless technology, ROG Micro Switches, dan Push-fit Switch Socket II.', 1100000, 10, 4.6, 'https://placehold.co/400x400/1A0000/E20000?text=ROG+Keris&font=raleway', 2, true),
-- Headsets
('HyperX Cloud Alpha', 'Headset gaming dengan dual chamber driver, memory foam ear cushions, dan detachable noise-cancelling microphone.', 1200000, 20, 4.8, 'https://placehold.co/400x400/1A0000/FF2020?text=Cloud+Alpha&font=raleway', 3, true),
('Razer BlackShark V2', 'Headset esports dengan TriForce Titanium 50mm drivers, HyperClear Cardioid Mic, THX Spatial Audio, dan ultra-soft memory foam ear cushions.', 1100000, 18, 4.7, 'https://placehold.co/400x400/0D1B11/44D62C?text=BlackShark+V2&font=raleway', 3, false),
('Corsair HS80 RGB Wireless', 'Headset gaming wireless premium dengan Dolby Atmos audio, 50mm neodymium drivers, flip-to-mute microphone, dan 20 jam battery life.', 1350000, 14, 4.6, 'https://placehold.co/400x400/120F0A/FFB300?text=HS80+RGB&font=raleway', 3, false),
-- Monitors
('ASUS ROG Swift 27" 144Hz', 'Monitor gaming 27 inci IPS 1440p, 144Hz, 1ms response time, NVIDIA G-Sync Compatible, HDR400, dan Aura Sync RGB.', 4500000, 8, 4.8, 'https://placehold.co/400x400/1A0000/E20000?text=ROG+Swift&font=raleway', 4, true),
('MSI Optix MAG274QRF', 'Monitor gaming Rapid IPS 27 inci QHD 165Hz, 1ms response time, AMD FreeSync Premium, HDR400, Night Vision mode.', 5200000, 5, 4.7, 'https://placehold.co/400x400/100005/CC0000?text=MAG274QRF&font=raleway', 4, false),
('LG UltraGear 27GP850', 'Monitor gaming Nano IPS 27 inci QHD 165Hz (OC 180Hz), 1ms GtG, G-Sync Compatible, FreeSync Premium, HDR10.', 4800000, 6, 4.9, 'https://placehold.co/400x400/0A0A14/C50063?text=UltraGear&font=raleway', 4, true),
-- Mousepads
('SteelSeries QcK XXL', 'Mousepad gaming extra-large 900x400mm, micro-woven cloth surface, non-slip rubber base, jahitan tepi kokoh.', 380000, 40, 4.7, 'https://placehold.co/400x400/0A0A12/E65C28?text=QcK+XXL&font=raleway', 5, false),
('Razer Goliathus Extended', 'Mousepad gaming extended 920x294mm, textured micro-weave cloth, non-slip rubber base, optimized untuk speed dan control.', 420000, 30, 4.6, 'https://placehold.co/400x400/0D1B11/44D62C?text=Goliathus&font=raleway', 5, false),
('Corsair MM350 Pro XL', 'Mousepad gaming premium cloth XL 930x400mm, tri-layer construction, non-slip rubber 4mm, water-resistant coating.', 350000, 35, 4.5, 'https://placehold.co/400x400/120F0A/FFB300?text=MM350+Pro&font=raleway', 5, false),
-- Controllers
('DualSense PS5 Controller', 'Controller PS5 dengan haptic feedback, adaptive triggers, built-in microphone, motion sensor, dan touchpad kapasitif.', 900000, 20, 4.9, 'https://placehold.co/400x400/00439C/FFFFFF?text=DualSense&font=raleway', 6, true),
('Xbox Wireless Controller', 'Controller Xbox Series X|S dengan textured grip, USB-C charging, kompatibel Xbox, PC, dan mobile.', 850000, 25, 4.8, 'https://placehold.co/400x400/107C10/FFFFFF?text=Xbox&font=raleway', 6, false),
('8BitDo Pro 2 Controller', 'Controller gaming multi-platform, programmable buttons, 40 jam battery, kompatibel Switch, PC, dan Android.', 750000, 18, 4.7, 'https://placehold.co/400x400/1A0A22/E8529A?text=8BitDo&font=raleway', 6, false),
-- Gaming Chairs
('Secretlab TITAN Evo 2022', 'Gaming chair premium NEO Hybrid Leatherette, 4-way L-ADAPT lumbar support, magnetic head pillow, multi-tilt mechanism, 4D armrests.', 8500000, 5, 4.9, 'https://placehold.co/400x400/0A0A0A/C4A35A?text=TITAN+Evo&font=raleway', 7, true),
('DXRacer Formula Series', 'Gaming chair dengan high-density foam, adjustable lumbar & headrest, reclining 135°, 3D armrests, aluminum base.', 4200000, 8, 4.5, 'https://placehold.co/400x400/10000A/E30613?text=DXRacer&font=raleway', 7, false),
('ASUS ROG Chariot Core', 'Gaming chair PU leather premium, built-in lumbar support, memory foam head pillow, 4D armrests, metal base, reclining 90-165°.', 6800000, 4, 4.7, 'https://placehold.co/400x400/1A0000/E20000?text=ROG+Chariot&font=raleway', 7, true);

-- ============================================================
-- 8. FIX: Insert profiles yang belum ada untuk user existing
-- ============================================================

INSERT INTO profiles (id, full_name, role)
SELECT
  u.id,
  COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)),
  'user'
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;
