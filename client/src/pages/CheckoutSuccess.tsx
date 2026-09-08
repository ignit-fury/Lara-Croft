import { Link } from 'react-router-dom';

export default function CheckoutSuccess() {
  return (
    <div className="max-w-[1400px] mx-auto px-6 py-16 text-center">
      <div className="max-w-md mx-auto">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: '#6f4423' }}>
          <svg className="w-8 h-8 text-brand-cream" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-[26px] font-extrabold text-brand-text uppercase tracking-wide mb-3">Order Placed Successfully!</h1>
        <p className="text-brand-muted text-[14px] mb-8">Thank you for your purchase. Your order has been confirmed.</p>
        <div className="flex gap-4 justify-center">
          <Link to="/" className="bg-brand-accent text-brand-cream px-7 py-3.5 text-[13px] font-bold uppercase tracking-[2px] hover:bg-brand-accent2 transition-colors">
            Continue Shopping
          </Link>
          <Link to="/account" className="border border-brand-border text-brand-muted px-7 py-3.5 text-[13px] font-bold uppercase tracking-[2px] hover:border-brand-accent hover:text-brand-accent transition-colors">
            View Orders
          </Link>
        </div>
      </div>
    </div>
  );
}
