import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface FaqItem {
  q: string;
  a: React.ReactNode;
}

const faqs: FaqItem[] = [
  {
    q: 'How do LARA CROFT sizes fit?',
    a: 'Our fits are true to size with a tailored expedition cut — shaped through the shoulder and seat, with room to move. If you are between sizes, we recommend sizing up for shirts and T-shirts, and taking your usual waist size for trousers and jeans.',
  },
  {
    q: 'What waist sizes do you offer?',
    a: 'Trousers and jeans are available in waist sizes 28–42 (in inches). See the Size Guide section below for the full waist-to-size mapping, or open any jeans product page for the detailed modal guide.',
  },
  {
    q: 'How much does shipping cost?',
    a: 'Shipping is free on all orders of ₹5,000 or more. Orders below ₹5,000 carry a flat ₹499 shipping fee. All prices are in INR and include 18% GST.',
  },
  {
    q: 'How long does delivery take?',
    a: 'Orders are typically dispatched within 1–2 business days. Metro deliveries usually arrive in 3–5 business days after dispatch; the rest of India in 5–8 business days. Timelines may extend during sales, holidays, or severe weather.',
  },
  {
    q: 'Which payment methods do you accept?',
    a: 'All payments are processed securely via Razorpay. We accept UPI, major credit and debit cards, net-banking, and supported wallets. We never see or store your full card numbers or UPI PINs — those are handled directly by Razorpay and your bank.',
  },
  {
    q: 'How can I track my order?',
    a: (
      <>
        Once your order ships, tracking details appear in your order history on the{' '}
        <Link to="/account" className="underline">Account page</Link>. For help with a delayed
        parcel, reach us through the <Link to="/contact" className="underline">Contact page</Link> with
        your order number.
      </>
    ),
  },
  {
    q: 'What is your return and exchange policy?',
    a: (
      <>
        You have 7 days from delivery to request a return or exchange. Items must be unused,
        unwashed, and undamaged, with all original tags attached. Size exchanges are subject to
        stock availability. Start a request on the <Link to="/returns" className="underline">Returns
        &amp; Exchanges page</Link>.
      </>
    ),
  },
  {
    q: 'When will I receive my refund?',
    a: (
      <>
        Approved refunds go back to your original payment source via Razorpay in 5–7 business days.
        Timing after we issue the refund depends on your bank or UPI provider. See the{' '}
        <Link to="/refund-policy" className="underline">Refund Policy</Link> for full details.
      </>
    ),
  },
  {
    q: 'Can I change my shipping address after ordering?',
    a: (
      <>
        If your order has not yet been dispatched, we can usually update the address. Contact us as
        soon as possible through the <Link to="/contact" className="underline">Contact page</Link> with
        your order number and the corrected address.
      </>
    ),
  },
  {
    q: 'How do I cancel my order?',
    a: 'Orders cancelled before dispatch are refunded in full to the original payment source in 5–7 business days. If the order has already shipped, it follows the standard 7-day return process after delivery.',
  },
  {
    q: 'How do I contact support?',
    a: (
      <>
        Use the in-site <Link to="/contact" className="underline">Contact page</Link> for all support
        requests, and the <Link to="/account" className="underline">Account page</Link> for order
        history. Include your registered email and order number so we can respond within 24–48 hours.
      </>
    ),
  },
];

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const el = document.querySelector(location.hash);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo(0, 0);
    }
  }, [location.hash, location.pathname]);

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-14">
      {/* Hero */}
      <div className="text-center mb-14">
        <div className="text-[12px] font-bold uppercase tracking-[3px] text-brand-accent mb-2">Help Center</div>
        <h1 className="text-[clamp(28px,5vw,48px)] font-black uppercase tracking-wide mb-4">
          Frequently Asked <span className="text-brand-accent">Questions</span>
        </h1>
        <p className="text-brand-muted text-[15px] max-w-[600px] mx-auto leading-relaxed">
          Sizing, shipping, payments, returns, and orders — answered. Still stuck? Reach us through
          the Contact page.
        </p>
      </div>

      {/* Accordion */}
      <div className="max-w-[800px] mx-auto mb-16">
        {faqs.map((item, i) => {
          const isOpen = open === i;
          return (
            <div key={item.q} className="border border-brand-border border-b-0 last:border-b" style={{ background: '#fafafa' }}>
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                aria-controls={`faq-panel-${i}`}
                id={`faq-button-${i}`}
                className="w-full flex items-center justify-between gap-4 text-left px-6 py-4 cursor-pointer"
              >
                <span className="text-[14px] font-bold uppercase tracking-[1px]">{item.q}</span>
                <span aria-hidden="true" className="text-brand-accent text-[18px] font-bold shrink-0">
                  {isOpen ? '−' : '+'}
                </span>
              </button>
              {isOpen && (
                <div id={`faq-panel-${i}`} role="region" aria-labelledby={`faq-button-${i}`} className="px-6 pb-5">
                  <p className="text-brand-muted text-[13px] leading-relaxed">{item.a}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Size guide */}
      <div id="size-guide" className="max-w-[800px] mx-auto border border-brand-border p-8 mb-16 scroll-mt-24" style={{ background: '#fafafa' }}>
        <h2 className="text-[14px] font-bold uppercase tracking-[1px] mb-4">Size Guide — Waist 28–42</h2>
        <p className="text-brand-muted text-[13px] leading-relaxed mb-4">
          Trousers and jeans run in waist sizes 28 to 42 inches, true to size. Measure around your
          natural waistline and match it directly to the labelled size (28 = 28&Prime;, 30 = 30&Prime;,
          and so on up to 42). Between sizes? Size up for a relaxed expedition fit, or down for a
          sharper tailored fit.
        </p>
        <p className="text-brand-muted text-[13px] leading-relaxed">
          For the full per-product measurements (chest, inseam, thigh), open any jeans product page
          and use the modal guide there — start with the{' '}
          <Link to="/category/jeans" className="underline">Jeans collection</Link>.
        </p>
      </div>

      {/* CTA */}
      <div className="text-center border-t border-brand-border pt-12">
        <h2 className="text-[22px] font-extrabold uppercase tracking-wide mb-3">Still Need Help?</h2>
        <p className="text-brand-muted text-[14px] mb-6">Reach us through the Contact page — we typically respond within 24-48 hours.</p>
        <Link to="/contact" className="inline-block bg-brand-accent text-brand-cream py-3.5 px-9 text-[13px] font-bold uppercase tracking-[2px] hover:bg-brand-accent2 transition-all hover:shadow-[0_8px_24px_rgba(111,68,35,.30)]">
          Contact Us
        </Link>
      </div>
    </div>
  );
}
