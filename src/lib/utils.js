import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date) {
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date) {
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function generateOrderId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = 'NXG-'
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export function truncate(str, n) {
  return str?.length > n ? str.substr(0, n - 1) + '…' : str
}

export const SHIPPING_COST = 15000
export const FREE_SHIPPING_THRESHOLD = 500000

export function calculateShipping(subtotal) {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST
}

export const STATUS_LABELS = {
  pending: 'Menunggu Pembayaran',
  processing: 'Diproses',
  shipped: 'Dikirim',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
}

export const STATUS_COLORS = {
  pending: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  processing: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  shipped: 'text-nexus-cyan bg-nexus-cyan/10 border-nexus-cyan/30',
  completed: 'text-green-400 bg-green-400/10 border-green-400/30',
  cancelled: 'text-red-400 bg-red-400/10 border-red-400/30',
}

// Mock data for development (used when Supabase isn't configured)
export const MOCK_CATEGORIES = [
  { id: 1, name: 'Keyboard', slug: 'keyboard', icon: '⌨️' },
  { id: 2, name: 'Mouse', slug: 'mouse', icon: '🖱️' },
  { id: 3, name: 'Headset', slug: 'headset', icon: '🎧' },
  { id: 4, name: 'Monitor', slug: 'monitor', icon: '🖥️' },
  { id: 5, name: 'Mousepad', slug: 'mousepad', icon: '🟦' },
  { id: 6, name: 'Controller', slug: 'controller', icon: '🎮' },
  { id: 7, name: 'Gaming Chair', slug: 'gaming-chair', icon: '🪑' },
]

// Brand color palette: bg/text
// Razer:      0D1B11 / 44D62C  (dark green bg, Razer green)
// Logitech:   0A1A2E / 0082CB  (dark navy, Logitech blue)
// Corsair:    120F0A / FFB300  (dark bg, Corsair gold)
// SteelSeries:0A0A12 / E65C28  (dark bg, SS orange)
// HyperX:     1A0000 / FF2020  (dark bg, HyperX red)
// ASUS ROG:   1A0000 / E20000  (dark bg, ROG red)
// MSI:        100005 / CC0000  (dark bg, MSI red)
// LG:         0A0A14 / C50063  (dark bg, LG magenta)
// PlayStation: 00439C / FFFFFF (PS blue bg, white)
// Xbox:       107C10 / FFFFFF  (Xbox green bg, white)
// 8BitDo:     1A0A22 / E8529A  (purple bg, 8BitDo pink)
// Secretlab:  0A0A0A / C4A35A  (pure black, gold)
// DXRacer:    10000A / E30613  (dark bg, DXRacer red)

export const MOCK_PRODUCTS = [
  // Keyboards
  { id: 1, name: 'Razer BlackWidow V4', description: 'Mechanical gaming keyboard dengan Razer Green switches, RGB Chroma backlighting, dedicated media keys, dan wrist rest ergonomis. Dilengkapi fitur anti-ghosting untuk gaming kompetitif.', price: 1850000, stock: 25, rating: 4.8, image_url: 'https://placehold.co/400x400/0D1B11/44D62C?text=BlackWidow+V4&font=raleway', category_id: 1, is_featured: true, created_at: new Date().toISOString() },
  { id: 2, name: 'Logitech G Pro X', description: 'Keyboard gaming tenkeyless profesional dengan GX Blue switches yang bisa diganti, LIGHTSYNC RGB, dan desain ultra-portabel untuk esports.', price: 1450000, stock: 18, rating: 4.7, image_url: 'https://placehold.co/400x400/0A1A2E/0082CB?text=G+Pro+X&font=raleway', category_id: 1, is_featured: false, created_at: new Date().toISOString() },
  { id: 3, name: 'Corsair K70 RGB MK.2', description: 'Keyboard full-size dengan Cherry MX Red switches, per-key RGB backlighting, aircraft-grade brushed aluminum frame, dan dedicated media controls.', price: 1650000, stock: 12, rating: 4.6, image_url: 'https://placehold.co/400x400/120F0A/FFB300?text=K70+RGB+MK.2&font=raleway', category_id: 1, is_featured: true, created_at: new Date().toISOString() },
  { id: 4, name: 'SteelSeries Apex Pro', description: 'Keyboard gaming dengan OmniPoint switches yang dapat disesuaikan actuation-nya dari 0.4mm hingga 3.6mm. Dilengkapi OLED smart display dan multi-color RGB.', price: 2100000, stock: 8, rating: 4.9, image_url: 'https://placehold.co/400x400/0A0A12/E65C28?text=Apex+Pro&font=raleway', category_id: 1, is_featured: true, created_at: new Date().toISOString() },

  // Mice
  { id: 5, name: 'Razer DeathAdder V3', description: 'Mouse gaming ergonomis dengan Focus Pro 30K optical sensor, optical mouse switches gen-3, lightweight design 59g, dan Speedflex cable.', price: 750000, stock: 35, rating: 4.8, image_url: 'https://placehold.co/400x400/0D1B11/44D62C?text=DeathAdder+V3&font=raleway', category_id: 2, is_featured: true, created_at: new Date().toISOString() },
  { id: 6, name: 'Logitech G502 X Plus', description: 'Mouse gaming wireless dengan LIGHTFORCE hybrid switches, HERO 25K sensor, LIGHTSPEED wireless technology, dan bobot yang dapat disesuaikan.', price: 1250000, stock: 22, rating: 4.7, image_url: 'https://placehold.co/400x400/0A1A2E/0082CB?text=G502+X+Plus&font=raleway', category_id: 2, is_featured: false, created_at: new Date().toISOString() },
  { id: 7, name: 'SteelSeries Rival 600', description: 'Mouse gaming dual sensor dengan TrueMove3+ optical sensor, 6 adjustable side weights, split-trigger optical buttons, dan split-weight system.', price: 950000, stock: 15, rating: 4.5, image_url: 'https://placehold.co/400x400/0A0A12/E65C28?text=Rival+600&font=raleway', category_id: 2, is_featured: false, created_at: new Date().toISOString() },
  { id: 8, name: 'ASUS ROG Keris Wireless', description: 'Mouse gaming wireless ultra-ringan 79g dengan ROG SpeedNova wireless technology, ROG Micro Switches, dan Push-fit Switch Socket II yang mudah diganti.', price: 1100000, stock: 10, rating: 4.6, image_url: 'https://placehold.co/400x400/1A0000/E20000?text=ROG+Keris&font=raleway', category_id: 2, is_featured: true, created_at: new Date().toISOString() },

  // Headsets
  { id: 9, name: 'HyperX Cloud Alpha', description: 'Headset gaming dengan dual chamber driver yang memisahkan bass dari mid dan high frequencies, memory foam ear cushions, dan detachable noise-cancelling microphone.', price: 1200000, stock: 20, rating: 4.8, image_url: 'https://placehold.co/400x400/1A0000/FF2020?text=Cloud+Alpha&font=raleway', category_id: 3, is_featured: true, created_at: new Date().toISOString() },
  { id: 10, name: 'Razer BlackShark V2', description: 'Headset esports dengan TriForce Titanium 50mm drivers, HyperClear Cardioid Mic, THX Spatial Audio, dan ultra-soft memory foam ear cushions.', price: 1100000, stock: 18, rating: 4.7, image_url: 'https://placehold.co/400x400/0D1B11/44D62C?text=BlackShark+V2&font=raleway', category_id: 3, is_featured: false, created_at: new Date().toISOString() },
  { id: 11, name: 'Corsair HS80 RGB Wireless', description: 'Headset gaming wireless premium dengan Dolby Atmos audio, 50mm neodymium drivers, flip-to-mute microphone, dan hingga 20 jam battery life.', price: 1350000, stock: 14, rating: 4.6, image_url: 'https://placehold.co/400x400/120F0A/FFB300?text=HS80+Wireless&font=raleway', category_id: 3, is_featured: false, created_at: new Date().toISOString() },

  // Monitors
  { id: 12, name: 'ASUS ROG Swift 27" 144Hz', description: 'Monitor gaming 27 inci IPS 1440p dengan refresh rate 144Hz, 1ms response time, NVIDIA G-Sync Compatible, HDR400, dan Aura Sync RGB lighting.', price: 4500000, stock: 8, rating: 4.8, image_url: 'https://placehold.co/400x400/1A0000/E20000?text=ROG+Swift+27&font=raleway', category_id: 4, is_featured: true, created_at: new Date().toISOString() },
  { id: 13, name: 'MSI Optix MAG274QRF', description: 'Monitor gaming Rapid IPS 27 inci QHD 165Hz dengan 1ms response time, AMD FreeSync Premium, HDR400, dan Night Vision mode untuk area gelap.', price: 5200000, stock: 5, rating: 4.7, image_url: 'https://placehold.co/400x400/100005/CC0000?text=MAG274QRF&font=raleway', category_id: 4, is_featured: false, created_at: new Date().toISOString() },
  { id: 14, name: 'LG UltraGear 27GP850', description: 'Monitor gaming Nano IPS 27 inci QHD 165Hz (OC 180Hz) dengan 1ms GtG, NVIDIA G-Sync Compatible, AMD FreeSync Premium, dan HDR10 support.', price: 4800000, stock: 6, rating: 4.9, image_url: 'https://placehold.co/400x400/0A0A14/C50063?text=UltraGear+27GP850&font=raleway', category_id: 4, is_featured: true, created_at: new Date().toISOString() },

  // Mousepads
  { id: 15, name: 'SteelSeries QcK XXL', description: 'Mousepad gaming extra-large (900x400mm) dengan micro-woven cloth surface yang dioptimalkan untuk semua tipe sensor, non-slip rubber base, dan jahitan tepi yang kokoh.', price: 380000, stock: 40, rating: 4.7, image_url: 'https://placehold.co/400x400/0A0A12/E65C28?text=QcK+XXL&font=raleway', category_id: 5, is_featured: false, created_at: new Date().toISOString() },
  { id: 16, name: 'Razer Goliathus Extended', description: 'Mousepad gaming extended (920x294mm) dengan textured micro-weave cloth, non-slip rubber base, dan optimized untuk speed dan control gaming.', price: 420000, stock: 30, rating: 4.6, image_url: 'https://placehold.co/400x400/0D1B11/44D62C?text=Goliathus+Extended&font=raleway', category_id: 5, is_featured: false, created_at: new Date().toISOString() },
  { id: 17, name: 'Corsair MM350 Pro XL', description: 'Mousepad gaming premium cloth XL (930x400mm) dengan tri-layer construction, non-slip rubber base thick 4mm, dan water-resistant coating.', price: 350000, stock: 35, rating: 4.5, image_url: 'https://placehold.co/400x400/120F0A/FFB300?text=MM350+Pro+XL&font=raleway', category_id: 5, is_featured: false, created_at: new Date().toISOString() },

  // Controllers
  { id: 18, name: 'DualSense PS5 Controller', description: 'Controller PS5 dengan haptic feedback generasi berikutnya, adaptive triggers, built-in microphone, motion sensor, dan touchpad kapasitif. Kompatibel dengan PC via USB.', price: 900000, stock: 20, rating: 4.9, image_url: 'https://placehold.co/400x400/00439C/FFFFFF?text=DualSense+PS5&font=raleway', category_id: 6, is_featured: true, created_at: new Date().toISOString() },
  { id: 19, name: 'Xbox Wireless Controller', description: 'Controller Xbox Series X|S dengan textured grip, share button, USB-C charging, kompatibel dengan Xbox Series X|S, Xbox One, PC Windows 10/11, dan Android/iOS.', price: 850000, stock: 25, rating: 4.8, image_url: 'https://placehold.co/400x400/107C10/FFFFFF?text=Xbox+Wireless&font=raleway', category_id: 6, is_featured: false, created_at: new Date().toISOString() },
  { id: 20, name: '8BitDo Pro 2 Controller', description: 'Controller gaming premium multi-platform dengan Ultimate Software support, programmable buttons, 40 jam battery life, dan kompatibel dengan Switch, PC, dan Android.', price: 750000, stock: 18, rating: 4.7, image_url: 'https://placehold.co/400x400/1A0A22/E8529A?text=8BitDo+Pro+2&font=raleway', category_id: 6, is_featured: false, created_at: new Date().toISOString() },

  // Gaming Chairs
  { id: 21, name: 'Secretlab TITAN Evo 2022', description: 'Gaming chair premium dengan NEO Hybrid Leatherette, 4-way L-ADAPT lumbar support, magnetic memory foam head pillow, multi-tilt mechanism, dan armrests 4D.', price: 8500000, stock: 5, rating: 4.9, image_url: 'https://placehold.co/400x400/0A0A0A/C4A35A?text=TITAN+Evo+2022&font=raleway', category_id: 7, is_featured: true, created_at: new Date().toISOString() },
  { id: 22, name: 'DXRacer Formula Series', description: 'Gaming chair dengan high-density foam padding, adjustable lumbar dan headrest pillows, reclining backrest 135°, 3D armrests, dan aluminum base dengan caster wheels.', price: 4200000, stock: 8, rating: 4.5, image_url: 'https://placehold.co/400x400/10000A/E30613?text=DXRacer+Formula&font=raleway', category_id: 7, is_featured: false, created_at: new Date().toISOString() },
  { id: 23, name: 'ASUS ROG Chariot Core', description: 'Gaming chair dengan PU leather premium, built-in lumbar support, memory foam head pillow, 4D armrests, metal base dengan 60mm PU casters, dan reclining 90-165°.', price: 6800000, stock: 4, rating: 4.7, image_url: 'https://placehold.co/400x400/1A0000/E20000?text=ROG+Chariot+Core&font=raleway', category_id: 7, is_featured: true, created_at: new Date().toISOString() },
]
