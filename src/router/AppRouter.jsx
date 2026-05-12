import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import AdminRoute from './AdminRoute'

import Home from '../pages/Home'
import Shop from '../pages/Shop'
import ProductDetail from '../pages/ProductDetail'
import Cart from '../pages/Cart'
import Checkout from '../pages/Checkout'
import Receipt from '../pages/Receipt'
import Login from '../pages/Login'
import Register from '../pages/Register'
import Profile from '../pages/Profile'
import OrderHistory from '../pages/OrderHistory'
import NotFound from '../pages/NotFound'

import AdminDashboard from '../pages/admin/Dashboard'
import AdminProducts from '../pages/admin/Products'
import AdminOrders from '../pages/admin/Orders'
import AdminUsers from '../pages/admin/Users'

import Navbar from '../components/layout/Navbar'
import AdminNavbar from '../components/layout/AdminNavbar'
import Footer from '../components/layout/Footer'
import CartDrawer from '../components/cart/CartDrawer'
import ErrorBoundary from '../components/shared/ErrorBoundary'

// Layout untuk user biasa — ada Navbar, Footer, CartDrawer
function PublicLayout({ children, noFooter }) {
  return (
    <div className="min-h-screen bg-nexus-bg flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      {!noFooter && <Footer />}
      <CartDrawer />
    </div>
  )
}

// Layout untuk admin — Navbar khusus admin, tanpa Footer & CartDrawer
function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-nexus-bg">
      <AdminNavbar />
      {children}
    </div>
  )
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
          <Route path="/shop" element={<PublicLayout><Shop /></PublicLayout>} />
          <Route path="/product/:id" element={<PublicLayout><ProductDetail /></PublicLayout>} />
          <Route path="/cart" element={<PublicLayout><Cart /></PublicLayout>} />
          <Route path="/login" element={<PublicLayout noFooter><Login /></PublicLayout>} />
          <Route path="/register" element={<PublicLayout noFooter><Register /></PublicLayout>} />

          {/* Protected routes */}
          <Route path="/checkout" element={
            <ProtectedRoute>
              <PublicLayout noFooter><Checkout /></PublicLayout>
            </ProtectedRoute>
          } />
          <Route path="/receipt/:orderId" element={
            <ProtectedRoute>
              <PublicLayout><Receipt /></PublicLayout>
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <PublicLayout><Profile /></PublicLayout>
            </ProtectedRoute>
          } />
          <Route path="/orders" element={
            <ProtectedRoute>
              <PublicLayout><OrderHistory /></PublicLayout>
            </ProtectedRoute>
          } />

          {/* Admin routes — pakai AdminLayout */}
          <Route path="/admin/dashboard" element={
            <AdminRoute><AdminLayout><AdminDashboard /></AdminLayout></AdminRoute>
          } />
          <Route path="/admin/products" element={
            <AdminRoute><AdminLayout><AdminProducts /></AdminLayout></AdminRoute>
          } />
          <Route path="/admin/orders" element={
            <AdminRoute><AdminLayout><AdminOrders /></AdminLayout></AdminRoute>
          } />
          <Route path="/admin/users" element={
            <AdminRoute><AdminLayout><AdminUsers /></AdminLayout></AdminRoute>
          } />

          {/* 404 */}
          <Route path="*" element={<PublicLayout noFooter><NotFound /></PublicLayout>} />
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  )
}