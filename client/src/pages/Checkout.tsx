import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCartStore } from '../stores/useCartStore';
import { useUserStore } from '../stores/useUserStore';
import toast from 'react-hot-toast';

function formatPrice(paise: number): string {
  return `₹${(paise / 100).toLocaleString('en-IN')}`;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const { items, total, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState({
    label: 'Home',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'IN',
    phone: '',
  });

  const loadRazorpay = () => {
    return new Promise<boolean>((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckout = async () => {
    if (!address.line1 || !address.city || !address.state || !address.postalCode || !address.phone) {
      toast.error('Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      const res: any = await api.post('/orders/create-checkout-session', { shippingAddress: address });
      const { orderId, amount } = res.data;

      const loaded = await loadRazorpay();
      if (!loaded) {
        toast.error('Failed to load Razorpay');
        setLoading(false);
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: amount,
        currency: 'INR',
        name: 'Prima Facie',
        order_id: orderId,
        handler: async (response: any) => {
          try {
            await api.post('/orders/confirm', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            await clearCart();
            navigate('/checkout/success');
          } catch (err: any) {
            toast.error(err.message || 'Payment verification failed');
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: address.phone,
        },
        theme: {
          color: '#6f4423',
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err: any) {
      toast.error(err.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  const subtotal = total();
  const shipping = subtotal >= 500000 ? 0 : 49900;
  const tax = Math.round(subtotal * 0.18);
  const grandTotal = subtotal + shipping + tax;

  if (!user) {
    navigate('/');
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-gray-800 mb-8">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Address Form */}
        <div className="lg:col-span-2">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Shipping Address</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="Label (e.g. Home)" value={address.label} onChange={(e) => setAddress({ ...address, label: e.target.value })} className="col-span-2 border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-brand-brown rounded-none" />
              <input type="text" placeholder="Address Line 1 *" value={address.line1} onChange={(e) => setAddress({ ...address, line1: e.target.value })} className="col-span-2 border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-brand-brown rounded-none" />
              <input type="text" placeholder="Address Line 2" value={address.line2} onChange={(e) => setAddress({ ...address, line2: e.target.value })} className="col-span-2 border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-brand-brown rounded-none" />
              <input type="text" placeholder="City *" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} className="border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-brand-brown rounded-none" />
              <input type="text" placeholder="State *" value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} className="border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-brand-brown rounded-none" />
              <input type="text" placeholder="PIN Code *" value={address.postalCode} onChange={(e) => setAddress({ ...address, postalCode: e.target.value })} className="border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-brand-brown rounded-none" />
              <input type="tel" placeholder="Phone *" value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} className="border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-brand-brown rounded-none" />
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="p-6 bg-gray-50 border border-gray-200 h-fit">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h2>
          <div className="space-y-3 mb-4">
            {items.map((item) => (
              <div key={`${item.product._id}-${item.size}`} className="flex justify-between text-sm">
                <span className="text-gray-600">{item.product.name} x{item.quantity}</span>
                <span>{formatPrice(item.product.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-300 pt-3 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatPrice(subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Tax (GST 18%)</span><span>{formatPrice(tax)}</span></div>
            <div className="border-t border-gray-300 pt-2 flex justify-between font-semibold text-gray-800">
              <span>Total</span><span className="text-brand-brown">{formatPrice(grandTotal)}</span>
            </div>
          </div>
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full bg-brand-brown text-brand-cream py-3 text-sm font-semibold hover:bg-brand-brown-dark transition-colors mt-6 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Pay with Razorpay'}
          </button>
        </div>
      </div>
    </div>
  );
}
