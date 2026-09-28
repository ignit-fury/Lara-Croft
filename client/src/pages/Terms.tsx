import { Link } from 'react-router-dom';

const sections = [
  {
    title: 'Products & Pricing',
    body: [
      'All products are sold by LARA CROFT in India and all prices are listed in INR (₹). Prices include 18% GST; your invoice and checkout total show the GST-inclusive amount.',
      'We work to keep product descriptions, images, and prices accurate, but occasional errors may occur. If a product is mispriced or misdescribed, we will inform you before dispatch and give you the option to confirm or cancel the order.',
    ],
  },
  {
    title: 'Orders & Acceptance',
    body: [
      'Placing an order is an offer to purchase. Your order is accepted only when we confirm it and, where applicable, payment is authorised — you will see the confirmation and can track order history on your Account page (/account).',
      'We may cancel or refuse an order for reasons including stock unavailability, pricing errors, suspected fraud, or delivery constraints. If we cancel after you have paid, we refund the full amount to the original payment source.',
    ],
  },
  {
    title: 'Payments',
    body: [
      'Payments are processed securely via Razorpay using cards, UPI, net-banking, and other methods Razorpay supports. Your full card numbers, UPI PINs, and net-banking credentials are handled directly by Razorpay and your bank — we never see or store them.',
      'Your order is dispatched after successful payment confirmation. If a payment fails or is reversed, we may hold or cancel the order.',
    ],
  },
  {
    title: 'Shipping',
    body: [
      'Shipping is free on orders of ₹5,000 or more; otherwise a flat ₹499 shipping fee applies. Delivery timelines shown at checkout are estimates and may vary by location.',
      'Risk of loss passes to you on delivery. Please inspect your order on arrival and report damaged or incorrect items promptly via the in-site Contact page (/contact).',
    ],
  },
  {
    title: 'Returns & Refunds',
    body: [
      'Returns are accepted within 7 days from delivery, provided items are unused with tags attached. Approved refunds go to the original payment source in 5–7 business days.',
    ],
  },
  {
    title: 'Intellectual Property',
    body: [
      'All content on this site — including the LARA CROFT name, logos, images, designs, and copy — is our property or used under licence and protected by applicable intellectual-property laws.',
      'You may browse and shop for personal, non-commercial use only. You may not copy, reproduce, distribute, or create derivative works from our content without prior written permission.',
    ],
  },
  {
    title: 'Liability',
    body: [
      'To the maximum extent permitted by law, our liability for any claim arising from your purchase or use of the site is limited to the amount you paid for the relevant order.',
      'Nothing in these terms limits liability that cannot be limited under applicable law, including liability for fraud or for goods that do not meet applicable quality guarantees.',
    ],
  },
  {
    title: 'Governing Law & Contact',
    body: [
      'These terms are governed by the laws of India. Any disputes are subject to the jurisdiction of the courts of India.',
      'For questions about these terms or your order, reach us through the in-site Contact page (/contact), or see your order history on the Account page (/account).',
    ],
  },
];

export default function Terms() {
  return (
    <div className="max-w-[1400px] mx-auto px-6 py-14">
      {/* Hero */}
      <div className="text-center mb-14">
        <div className="text-[12px] font-bold uppercase tracking-[3px] text-brand-accent mb-2">The Fine Print</div>
        <h1 className="text-[clamp(28px,5vw,48px)] font-black uppercase tracking-wide mb-4">
          Terms of <span className="text-brand-accent">Service</span>
        </h1>
        <p className="text-brand-muted text-[15px] max-w-[600px] mx-auto leading-relaxed">
          The terms that govern shopping with LARA CROFT in India. All prices
          are in INR and include 18% GST, and payments are processed securely
          via Razorpay.
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
            {section.title === 'Returns & Refunds' && (
              <Link to="/returns" className="inline-block mt-4 text-[13px] font-bold uppercase tracking-[1px] text-brand-accent hover:text-brand-accent2 transition-colors">
                Read the full Returns & Exchanges policy →
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="text-center border-t border-brand-border pt-12">
        <h2 className="text-[22px] font-extrabold uppercase tracking-wide mb-3">Questions About These Terms?</h2>
        <p className="text-brand-muted text-[14px] mb-6">Reach us through the Contact page — we typically respond within 24-48 hours.</p>
        <Link to="/contact" className="inline-block bg-brand-accent text-brand-cream py-3.5 px-9 text-[13px] font-bold uppercase tracking-[2px] hover:bg-brand-accent2 transition-all hover:shadow-[0_8px_24px_rgba(111,68,35,.30)]">
          Contact Us
        </Link>
      </div>
    </div>
  );
}
