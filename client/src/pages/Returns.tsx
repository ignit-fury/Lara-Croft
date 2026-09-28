import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

const policyPoints = [
  {
    title: '7-Day Window',
    desc: 'You have 7 days from delivery to request a return or exchange. Items must be unused, unwashed, and undamaged, with all original tags attached.',
  },
  {
    title: 'Exchanges Subject to Stock',
    desc: 'Size exchanges are subject to stock availability. If your size is unavailable, we will issue a refund instead.',
  },
  {
    title: 'Refunds to Original Source',
    desc: 'Approved refunds go back to your original payment source via Razorpay in 5–7 business days. See the Refund Policy (/refund-policy) for full details.',
  },
];

const reasons = [
  'Wrong size',
  'Defective or damaged item',
  'Wrong item delivered',
  'Changed my mind',
  'Other',
];

const inputClass =
  'w-full border border-brand-border px-4 py-3 text-[13px] text-brand-text placeholder:text-brand-muted/60 focus:outline-none focus:border-brand-accent bg-white';

export default function Returns() {
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [type, setType] = useState('Return');
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [reference, setReference] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!orderId.trim()) next.orderId = 'Order ID is required.';
    if (!email.trim()) next.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = 'Enter a valid email address.';
    if (!reason) next.reason = 'Please select a reason.';
    if (!details.trim()) next.details = 'Please describe the issue.';
    setErrors(next);
    if (Object.keys(next).length > 0) {
      toast.error('Please fix the highlighted fields.');
      return;
    }
    try {
      const res = await api.post('/returns', {
        order_id: orderId.trim(),
        email: email.trim(),
        type,
        reason,
        details: details.trim(),
      });
      const ref = `RET-${(res.data.data.id as string).slice(-8).toUpperCase()}`;
      setReference(ref);
      toast.success(`Request received — ${ref}`);
    } catch {
      toast.error('Could not submit request. Please try again or contact us.');
    }
  };

  const resetForm = () => {
    setOrderId('');
    setEmail('');
    setType('Return');
    setReason('');
    setDetails('');
    setErrors({});
    setReference(null);
  };

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-14">
      {/* Hero */}
      <div className="text-center mb-14">
        <div className="text-[12px] font-bold uppercase tracking-[3px] text-brand-accent mb-2">Easy Returns</div>
        <h1 className="text-[clamp(28px,5vw,48px)] font-black uppercase tracking-wide mb-4">
          Returns <span className="text-brand-accent">& Exchanges</span>
        </h1>
        <p className="text-brand-muted text-[15px] max-w-[600px] mx-auto leading-relaxed">
          7-day returns on unused items with tags. Size exchanges subject to
          stock — refunds go back to your original payment source in 5–7 business days.
        </p>
      </div>

      {/* Policy summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {policyPoints.map((item) => (
          <div key={item.title} className="border border-brand-border p-8 text-center" style={{ background: '#fafafa' }}>
            <h3 className="text-[14px] font-bold uppercase tracking-[1px] mb-3">{item.title}</h3>
            <p className="text-brand-muted text-[13px] leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Request form */}
      <div className="max-w-[640px] mx-auto border border-brand-border p-8 md:p-10 mb-16" style={{ background: '#fafafa' }}>
        {reference ? (
          <div className="text-center" data-testid="returns-success">
            <h2 className="text-[18px] font-extrabold uppercase tracking-wide mb-3">Request Received</h2>
            <p className="text-brand-muted text-[14px] leading-relaxed mb-2">
              Your reference number is <span className="font-bold text-brand-text">{reference}</span>.
            </p>
            <p className="text-brand-muted text-[13px] leading-relaxed mb-6">
              Keep this number for your records — we&apos;ll reply within 48 hours.
              For anything urgent, reach us through the <Link to="/contact" className="underline">Contact page</Link> or
              check your order history on the <Link to="/account" className="underline">Account page</Link>.
            </p>
            <button
              onClick={resetForm}
              className="inline-block border border-brand-accent text-brand-accent py-3 px-8 text-[13px] font-bold uppercase tracking-[2px] hover:bg-brand-accent hover:text-brand-cream transition-all cursor-pointer"
            >
              New Request
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-[18px] font-extrabold uppercase tracking-wide mb-2 text-center">Start a Request</h2>
            <p className="text-brand-muted text-[13px] mb-8 text-center">
              Fill in the details below and we&apos;ll get back to you within 48 hours.
            </p>
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <div>
                <label htmlFor="returns-order" className="block text-[12px] font-bold uppercase tracking-[1px] mb-2">
                  Order ID
                </label>
                <input
                  id="returns-order"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="e.g. ORD-123456"
                  className={inputClass}
                />
                {errors.orderId && <p className="text-red-600 text-[12px] mt-1">{errors.orderId}</p>}
              </div>
              <div>
                <label htmlFor="returns-email" className="block text-[12px] font-bold uppercase tracking-[1px] mb-2">
                  Email
                </label>
                <input
                  id="returns-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={inputClass}
                />
                {errors.email && <p className="text-red-600 text-[12px] mt-1">{errors.email}</p>}
              </div>
              <div>
                <span className="block text-[12px] font-bold uppercase tracking-[1px] mb-2">Request Type</span>
                <div className="flex gap-6">
                  {['Return', 'Exchange'].map((opt) => (
                    <label key={opt} className="flex items-center gap-2 text-[13px] cursor-pointer">
                      <input
                        type="radio"
                        name="returns-type"
                        value={opt}
                        checked={type === opt}
                        onChange={(e) => setType(e.target.value)}
                        className="accent-[#6f4423]"
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="returns-reason" className="block text-[12px] font-bold uppercase tracking-[1px] mb-2">
                  Reason
                </label>
                <select
                  id="returns-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Select a reason</option>
                  {reasons.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                {errors.reason && <p className="text-red-600 text-[12px] mt-1">{errors.reason}</p>}
              </div>
              <div>
                <label htmlFor="returns-details" className="block text-[12px] font-bold uppercase tracking-[1px] mb-2">
                  Details
                </label>
                <textarea
                  id="returns-details"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Describe the issue, including size / defect details…"
                  rows={4}
                  className={`${inputClass} resize-y`}
                />
                {errors.details && <p className="text-red-600 text-[12px] mt-1">{errors.details}</p>}
              </div>
              <button
                type="submit"
                className="w-full bg-brand-accent text-brand-cream py-3.5 px-9 text-[13px] font-bold uppercase tracking-[2px] hover:bg-brand-accent2 transition-all hover:shadow-[0_8px_24px_rgba(111,68,35,.30)] cursor-pointer"
              >
                Submit Request
              </button>
            </form>
          </>
        )}
      </div>

      {/* CTA */}
      <div className="text-center border-t border-brand-border pt-12">
        <h2 className="text-[22px] font-extrabold uppercase tracking-wide mb-3">Questions About Refunds?</h2>
        <p className="text-brand-muted text-[14px] mb-6">Read the full refund policy or reach us through the Contact page.</p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link to="/refund-policy" className="inline-block bg-brand-accent text-brand-cream py-3.5 px-9 text-[13px] font-bold uppercase tracking-[2px] hover:bg-brand-accent2 transition-all hover:shadow-[0_8px_24px_rgba(111,68,35,.30)]">
            Refund Policy
          </Link>
          <Link to="/contact" className="inline-block border border-brand-border py-3.5 px-9 text-[13px] font-bold uppercase tracking-[2px] hover:border-brand-text transition-all">
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}
