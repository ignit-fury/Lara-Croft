import { Link } from 'react-router-dom';

export default function CheckoutSuccess() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16 text-center">
      <div className="max-w-md mx-auto">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">Order Placed Successfully!</h1>
        <p className="text-gray-500 mb-8">Thank you for your purchase. Your order has been confirmed.</p>
        <div className="flex gap-4 justify-center">
          <Link to="/" className="bg-brand-brown text-brand-cream px-6 py-3 text-sm font-semibold hover:bg-brand-brown-dark transition-colors">
            Continue Shopping
          </Link>
          <Link to="/account" className="border border-gray-300 text-gray-700 px-6 py-3 text-sm font-semibold hover:border-brand-brown transition-colors">
            View Orders
          </Link>
        </div>
      </div>
    </div>
  );
}
