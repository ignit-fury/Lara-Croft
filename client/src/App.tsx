import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/layout/Layout';
import AdminLayout from './components/admin/AdminLayout';
import AdminRoute from './components/auth/AdminRoute';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import CategoryPage from './pages/CategoryPage';
import CollectionPage from './pages/Collection';
import SalePage from './pages/Sale';
import About from './pages/About';
import Checkout from './pages/Checkout';
import CheckoutSuccess from './pages/CheckoutSuccess';
import Account from './pages/Account';
import Dashboard from './pages/admin/Dashboard';
import AdminOrders from './pages/admin/Orders';
import AdminProducts from './pages/admin/Products';
import AdminUsers from './pages/admin/Users';
import AdminLogin from './pages/admin/AdminLogin';
import CustomerAuth from './pages/CustomerAuth';
import Health from './pages/Health';
import { useAuth } from './hooks/useAuth';
import { useCartStore } from './stores/useCartStore';
import { useUserStore } from './stores/useUserStore';
import { useEffect } from 'react';

function App() {
  const { loading } = useAuth();
  const { user } = useUserStore();
  const { fetchCart } = useCartStore();

  useEffect(() => {
    if (user?.id) fetchCart();
  }, [user?.id, fetchCart]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-brand-muted" style={{ background: '#ffffff' }}>Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/health" element={<Health />} />
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/collection" element={<CollectionPage />} />
          <Route path="/sale" element={<SalePage />} />
          <Route path="/about" element={<About />} />
          <Route path="/product/:slug" element={<ProductDetail />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/checkout/success" element={<CheckoutSuccess />} />
            <Route path="/account" element={<Account />} />
          </Route>
        </Route>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/login" element={<CustomerAuth />} />
        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/users" element={<AdminUsers />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
