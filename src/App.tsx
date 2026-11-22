import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { WishlistProvider } from '@/contexts/WishlistContext';
import Home from '@/pages/Home';
import Catalog from '@/pages/Catalog';
import ProductDetail from '@/pages/ProductDetail';
import Cart from '@/pages/Cart';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import Checkout from '@/pages/Checkout';
import OrderConfirmation from '@/pages/OrderConfirmation';
import OrderTracking from '@/pages/OrderTracking';
import Orders from '@/pages/Orders';
import Account from '@/pages/Account';
import Wishlist from '@/pages/Wishlist';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import NotFound from '@/pages/NotFound';
import ProtectedRoute from '@/components/ProtectedRoute';
import CustomerLayout from '@/components/CustomerLayout';
import AdminRoute from '@/components/admin/AdminRoute';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminProducts from '@/pages/admin/AdminProducts';
import AdminCategories from '@/pages/admin/AdminCategories';
import AdminOrders from '@/pages/admin/AdminOrders';
import AdminCustomers from '@/pages/admin/AdminCustomers';
import AdminCoupons from '@/pages/admin/AdminCoupons';
import AdminReports from '@/pages/admin/AdminReports';

export default function App() {
  return (
    <AuthProvider>
      <WishlistProvider>
        <CartProvider>
          <BrowserRouter>
            <Routes>
              {/* Admin routes (separate layout, no customer header/footer) */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminLayout />
                  </AdminRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="customers" element={<AdminCustomers />} />
                <Route path="coupons" element={<AdminCoupons />} />
                <Route path="reports" element={<AdminReports />} />
              </Route>

              {/* Customer site routes (shared layout with header + footer) */}
              <Route element={<CustomerLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/catalog" element={<Catalog />} />
                <Route path="/product/:slug" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route
                  path="/checkout"
                  element={<ProtectedRoute><Checkout /></ProtectedRoute>}
                />
                <Route
                  path="/order-confirmation/:orderNumber"
                  element={<ProtectedRoute><OrderConfirmation /></ProtectedRoute>}
                />
                <Route
                  path="/order-tracking/:orderNumber"
                  element={<ProtectedRoute><OrderTracking /></ProtectedRoute>}
                />
                <Route
                  path="/orders"
                  element={<ProtectedRoute><Orders /></ProtectedRoute>}
                />
                <Route
                  path="/account"
                  element={<ProtectedRoute><Account /></ProtectedRoute>}
                />
                <Route
                  path="/wishlist"
                  element={<ProtectedRoute><Wishlist /></ProtectedRoute>}
                />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </WishlistProvider>
    </AuthProvider>
  );
}
