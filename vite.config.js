import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          // React core
          'react-vendor': ['react', 'react-dom'],
          // Routing
          'router': ['react-router-dom'],
          // UI & Icons
          'ui': ['lucide-react', 'clsx', 'tailwind-merge', 'class-variance-authority'],
          // Radix UI
          'radix': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-select',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-slider',
            '@radix-ui/react-avatar',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-label',
            '@radix-ui/react-separator',
            '@radix-ui/react-toast',
          ],
          // State management
          'state': ['zustand'],
          // Forms
          'forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
          // Charts
          'charts': ['recharts'],
          // Supabase
          'supabase': ['@supabase/supabase-js'],
          // Notifications
          'toast': ['react-hot-toast'],
        },
      },
    },
  },
})