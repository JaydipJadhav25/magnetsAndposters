import { Routes, Route } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'

import Layout      from './components/layout/Layout'
import AdminLayout from './components/layout/AdminLayout'

import HomePage     from './pages/HomePage'
import ShopPage     from './pages/ShopPage'
import ProductPage  from './pages/ProductPage'
import CartPage     from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import SuccessPage  from './pages/SuccessPage'

import { LoginPage }     from './pages/LoginPage'
import { RegisterPage }  from './pages/LoginPage'
import { OrdersPage }    from './pages/LoginPage'
import { BulkOrderPage } from './pages/LoginPage'
import { AboutPage }     from './pages/LoginPage'
import { ContactPage }   from './pages/LoginPage'
import { NotFoundPage }  from './pages/LoginPage'

import AdminLogin     from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProducts  from './pages/admin/AdminProducts'
import AdminOrders    from './pages/admin/AdminOrders'
import ProtectedRoute from './components/common/ProtectedRoute'

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Routes>
          {/* Public store */}
          <Route element={<Layout />}>
            <Route index         element={<HomePage />} />
            <Route path="shop"   element={<ShopPage />} />
            <Route path="shop/:category" element={<ShopPage />} />
            <Route path="products/:slug" element={<ProductPage />} />
            <Route path="cart"   element={<CartPage />} />
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="order-success/:id" element={<SuccessPage />} />
            <Route path="login"       element={<LoginPage />} />
            <Route path="register"    element={<RegisterPage />} />
            <Route path="orders"      element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
            <Route path="bulk-orders" element={<BulkOrderPage />} />
            <Route path="about"       element={<AboutPage />} />
            <Route path="contact"     element={<ContactPage />} />
            <Route path="*"           element={<NotFoundPage />} />
          </Route>

          {/* Admin */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
            <Route index               element={<AdminDashboard />} />
            <Route path="products"     element={<AdminProducts />} />
            <Route path="orders"       element={<AdminOrders />} />
          </Route>
        </Routes>
      </CartProvider>
    </AuthProvider>
  )
}
