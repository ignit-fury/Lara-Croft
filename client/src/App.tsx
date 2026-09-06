import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import CategoryPage from './pages/CategoryPage';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import CheckoutSuccess from './pages/CheckoutSuccess';
import Account from './pages/Account';
import Dashboard from './pages/admin/Dashboard';
import AdminOrders from './pages/admin/Orders';
import AdminProducts from './pages/admin/Products';
import AdminUsers from './pages/admin/Users';
import { useAuth } from './hooks/useAuth';
import { useCartStore } from './stores/useCartStore';
import { useUserStore } from './stores/useUserStore';
import { useEffect } from 'react';

function App() {
  const { loading } = useAuth();
  const { user } = useUserStore();
  const { fetchCart } = useCartStore();

  useEffect(() => {
    if (user) fetchCart();
  }, [user, fetchCart]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/product/:slug" element={<ProductDetail />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/checkout/success" element={<CheckoutSuccess />} />
          <Route path="/account" element={<Account />} />
        </Route>
        <Route path="/admin" element={<Dashboard />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/products" element={<AdminProducts />} />
        <Route path="/admin/users" element={<AdminUsers />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
