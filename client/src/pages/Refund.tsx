import { Link } from 'react-router-dom';

const sections = [
  {
    title: 'Return Window & Eligibility',
    body: [
      'You have 7 days from delivery to request a return or exchange.',
      'Items must be unused, unwashed, and undamaged, with all original tags attached.',
      'Non-returnable: used or washed items, items missing tags, or items damaged after delivery.',
    ],
  },
  {
    title: 'Refunds to Original Source',
    body: [
      'Approved refunds are issued to the original payment source via Razorpay in 5–7 business days.',
      'All prices are in INR and include 18% GST; refunded amounts reflect what you paid for the returned items.',
      'Refund timing after we issue it depends on your bank, card issuer, or UPI provider.',
    ],
  },
  {
    title: 'Shipping Fees',
    body: [
      'Shipping is free on orders of ₹5,000 or more; otherwise a flat ₹499 shipping fee applies.',
      'The shipping fee is non-refundable, except where the return is due to our error (wrong or defective item).',
    ],
  },
  {
    title: 'How to Start a Return',
    body: [
      'Start from the Returns & Exchanges page (/returns) and follow the steps there.',
      'For help with a return, reach us through the in-site Contact page (/contact) with your order number.',
      'Track your orders and history from the Account page (/account).',
    ],
  },
  {
    title: 'Cancelled Orders',
    body: [
      'Orders cancelled before dispatch are refunded in full to the original payment source in 5–7 business days.',
      'If an order has already shipped, it follows the standard 7-day return process after delivery.',
    ],
  },
];

export default function Refund() {
  return (
    <div className="max-w-[1400px] mx-auto px-6 py-14">
      {/* Hero */}
      <div className="text-center mb-14">
        <div className="text-[12px] font-bold uppercase tracking-[3px] text-brand-accent mb-2">Easy Returns</div>
        <h1 className="text-[clamp(28px,5vw,48px)] font-black uppercase tracking-wide mb-4">
          Refund <span className="text-brand-accent">Policy</span>
        </h1>
        <p className="text-brand-muted text-[15px] max-w-[600px] mx-auto leading-relaxed">
          7-day returns on unused items with tags. Approved refunds go back to
          your original payment source via Razorpay in 5–7 business days.
        </p>
      </div>

      {/* Sections */}
      <div className="max-w-[800px] mx-auto space-y-8 mb-16">
        {sections.map((section) => (
          <div key={section.title} className="border border-brand-border p-8" style={{ background: '#fafafa' }}>
            <h2 className="text-[14px] font-bold uppercase tracking-[1px] mb-4">{section.title}</h2>
            <ul className="space-y-2.5">
              {section.body.map((para, i) => (
                <li key={i} className="text-brand-muted text-[13px] leading-relaxed list-disc ml-5">
                  {para}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="text-center border-t border-brand-border pt-12">
        <h2 className="text-[22px] font-extrabold uppercase tracking-wide mb-3">Need to Start a Return?</h2>
        <p className="text-brand-muted text-[14px] mb-6">Visit the Returns page or reach us through the Contact page.</p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link to="/returns" className="inline-block bg-brand-accent text-brand-cream py-3.5 px-9 text-[13px] font-bold uppercase tracking-[2px] hover:bg-brand-accent2 transition-all hover:shadow-[0_8px_24px_rgba(111,68,35,.30)]">
            Start a Return
          </Link>
          <Link to="/contact" className="inline-block border border-brand-border py-3.5 px-9 text-[13px] font-bold uppercase tracking-[2px] hover:border-brand-text transition-all">
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}
