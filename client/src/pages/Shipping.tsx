import { Link } from 'react-router-dom';

const sections = [
  {
    title: 'Rates',
    body: [
      'Shipping is free on all orders of ₹5,000 or more; otherwise a flat ₹499 shipping fee applies.',
      'All prices are in INR and include 18% GST. The shipping fee (where applicable) is shown at checkout before you pay.',
    ],
  },
  {
    title: 'Dispatch & Timelines',
    body: [
      'Orders are typically dispatched within 1–2 business days.',
      'Metro deliveries usually arrive in 3–5 business days after dispatch; the rest of India in 5–8 business days.',
      'Timelines may extend during sales, public holidays, or severe weather.',
    ],
  },
  {
    title: 'Tracking',
    body: [
      'Once your order ships, tracking details appear in your order history on the Account page (/account).',
      'For a delayed parcel, reach us through the Contact page (/contact) with your order number.',
    ],
  },
  {
    title: 'Address Changes',
    body: [
      'If your order has not yet been dispatched, we can usually update the shipping address.',
      'Contact us as soon as possible through the in-site Contact page (/contact) with your order number and the corrected address.',
    ],
  },
];

export default function Shipping() {
  return (
    <div className="max-w-[1400px] mx-auto px-6 py-14">
      {/* Hero */}
      <div className="text-center mb-14">
        <div className="text-[12px] font-bold uppercase tracking-[3px] text-brand-accent mb-2">Delivery Info</div>
        <h1 className="text-[clamp(28px,5vw,48px)] font-black uppercase tracking-wide mb-4">
          Shipping <span className="text-brand-accent">Info</span>
        </h1>
        <p className="text-brand-muted text-[15px] max-w-[600px] mx-auto leading-relaxed">
          Free shipping on orders of ₹5,000 or more — otherwise a flat ₹499 fee.
          Dispatched in 1–2 business days, all prices include 18% GST.
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
        <h2 className="text-[22px] font-extrabold uppercase tracking-wide mb-3">Questions About Your Order?</h2>
        <p className="text-brand-muted text-[14px] mb-6">Track it from your Account page or reach us through the Contact page.</p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link to="/account" className="inline-block bg-brand-accent text-brand-cream py-3.5 px-9 text-[13px] font-bold uppercase tracking-[2px] hover:bg-brand-accent2 transition-all hover:shadow-[0_8px_24px_rgba(111,68,35,.30)]">
            Track Order
          </Link>
          <Link to="/contact" className="inline-block border border-brand-border py-3.5 px-9 text-[13px] font-bold uppercase tracking-[2px] hover:border-brand-text transition-all">
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}
