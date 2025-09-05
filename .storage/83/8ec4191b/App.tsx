import { Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from '@/contexts/AuthContext'
import { SocketProvider } from '@/contexts/SocketContext'
import Navbar from '@/components/layout/Navbar'
import HomePage from '@/pages/HomePage'
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import ProductsPage from '@/pages/products/ProductsPage'
import ProductDetailPage from '@/pages/products/ProductDetailPage'
import CartPage from '@/pages/cart/CartPage'
import OrdersPage from '@/pages/orders/OrdersPage'
import VendorDashboard from '@/pages/vendor/VendorDashboard'
import AdminDashboard from '@/pages/admin/AdminDashboard'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <div className="min-h-screen bg-background">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
              
              <Route path="/cart" element={
                <ProtectedRoute>
                  <CartPage />
                </ProtectedRoute>
              } />
              
              <Route path="/orders" element={
                <ProtectedRoute>
                  <OrdersPage />
                </ProtectedRoute>
              } />
              
              <Route path="/vendor/*" element={
                <ProtectedRoute requiredRole="VENDOR">
                  <VendorDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/admin/*" element={
                <ProtectedRoute requiredRole="ADMIN">
                  <AdminDashboard />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
          <Toaster />
        </div>
      </SocketProvider>
    </AuthProvider>
  )
}

export default App