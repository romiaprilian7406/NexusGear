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
import Footer from '../components/layout/Footer'
import CartDrawer from '../components/cart/CartDrawer'
import ErrorBoundary from '../components/shared/ErrorBoundary'

function Layout({ children, noFooter }) {
  return (
    <div className="min-h-screen bg-nexus-bg flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      {!noFooter && <Footer />}
      <CartDrawer />
    </div>
  )
}

function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-nexus-bg">
      <Navbar />
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
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/shop" element={<Layout><Shop /></Layout>} />
          <Route path="/product/:id" element={<Layout><ProductDetail /></Layout>} />
          <Route path="/cart" element={<Layout><Cart /></Layout>} />
          <Route path="/login" element={<Layout noFooter><Login /></Layout>} />
          <Route path="/register" element={<Layout noFooter><Register /></Layout>} />

          {/* Protected routes (auth required) */}
          <Route path="/checkout" element={
            <ProtectedRoute>
              <Layout noFooter><Checkout /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/receipt/:orderId" element={
            <ProtectedRoute>
              <Layout><Receipt /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Layout><Profile /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/orders" element={
            <ProtectedRoute>
              <Layout><OrderHistory /></Layout>
            </ProtectedRoute>
          } />

          {/* Admin routes */}
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

          {/* 404 Catch-all */}
          <Route path="*" element={<Layout noFooter><NotFound /></Layout>} />
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  )
}
