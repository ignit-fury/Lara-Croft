import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../stores/useCartStore';
import { useUserStore } from '../stores/useUserStore';

function formatPrice(paise: number): string {
  return `₹${(paise / 100).toLocaleString('en-IN')}`;
}

export default function Cart() {
  const { items, fetchCart, updateItem, removeItem, total } = useCartStore();
  const { user } = useUserStore();

  useEffect(() => {
    if (user) fetchCart();
  }, [user, fetchCart]);

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">Your Cart</h1>
        <p className="text-gray-500 mb-6">Please sign in to view your cart.</p>
        <Link to="/" className="bg-brand-brown text-brand-cream px-6 py-3 text-sm font-semibold hover:bg-brand-brown-dark transition-colors">
          Go Home
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">Your Cart is Empty</h1>
        <Link to="/" className="bg-brand-brown text-brand-cream px-6 py-3 text-sm font-semibold hover:bg-brand-brown-dark transition-colors">
          Continue Shopping
        </Link>
      </div>
    );
  }

  const subtotal = total();
  const shipping = subtotal >= 500000 ? 0 : 49900;
  const tax = Math.round(subtotal * 0.18);
  const grandTotal = subtotal + shipping + tax;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-gray-800 mb-8">Your Cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={`${item.product._id}-${item.size}`} className="flex gap-4 p-4 border border-gray-200">
              <div className="w-24 h-32 bg-gray-100 flex-shrink-0">
                <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-800">{item.product.name}</h3>
                <p className="text-sm text-gray-500">Size: {item.size}</p>
                <p className="text-sm font-semibold text-brand-brown mt-1">{formatPrice(item.product.price)}</p>
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex items-center border border-gray-300">
                    <button onClick={() => updateItem(item.product._id, item.size, Math.max(1, item.quantity - 1))} className="px-2 py-1 text-sm">-</button>
                    <span className="px-3 py-1 text-sm">{item.quantity}</span>
                    <button onClick={() => updateItem(item.product._id, item.size, item.quantity + 1)} className="px-2 py-1 text-sm">+</button>
                  </div>
                  <button onClick={() => removeItem(item.product._id, item.size)} className="text-sm text-red-500 hover:underline">
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="p-6 bg-gray-50 border border-gray-200 h-fit">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatPrice(subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Tax (GST 18%)</span><span>{formatPrice(tax)}</span></div>
            <div className="border-t border-gray-300 pt-2 flex justify-between font-semibold text-gray-800">
              <span>Total</span><span className="text-brand-brown">{formatPrice(grandTotal)}</span>
            </div>
          </div>
          <Link to="/checkout" className="block w-full bg-brand-brown text-brand-cream text-center py-3 text-sm font-semibold hover:bg-brand-brown-dark transition-colors mt-6">
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
