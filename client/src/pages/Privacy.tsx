import { Link } from 'react-router-dom';

const sections = [
  {
    title: 'Data We Collect',
    body: [
      'Account data: name, email address, phone number, and password credentials you provide when you register or sign in. Order history on your Account page (/account) is linked to your account.',
      'Order data: shipping address, items ordered, order value in INR (prices include 18% GST), and delivery status needed to fulfil and support your purchase.',
      'Payment data: payments are processed securely via Razorpay. We receive payment confirmation and limited transaction metadata (such as payment ID, amount, and status). We never see or store your full card numbers, UPI PINs, or net-banking credentials — those are handled directly by Razorpay and your bank.',
      'Support data: messages and order references you share with us through the in-site Contact page (/contact).',
    ],
  },
  {
    title: 'Cookies & Similar Technologies',
    body: [
      'We use strictly necessary cookies and local storage to keep you signed in, remember your cart and wishlist, and keep the site secure.',
      'We may use basic preference and analytics storage (for example, remembering filters or measuring page performance). You can clear or block storage in your browser settings; some features such as checkout may not work without it.',
    ],
  },
  {
    title: 'How We Use Your Data',
    body: [
      'To process, ship, and support your orders — including free shipping on orders of ₹5,000 or more (otherwise a flat ₹499 shipping fee applies).',
      'To operate your account, show order history, prevent fraud, and comply with legal and tax obligations (including GST invoicing).',
      'To respond to support requests sent via the Contact page (/contact). We do not use your data for third-party advertising.',
    ],
  },
  {
    title: 'Sharing & Disclosure',
    body: [
      'Razorpay (payment processing), shipping and logistics partners (delivery), and infrastructure providers (hosting, analytics) — each receives only the data needed to perform its function.',
      'We disclose data when required by Indian law, court order, or to protect our rights, customers, and the public against fraud or abuse.',
      'We never sell your personal data.',
    ],
  },
  {
    title: 'Data Retention',
    body: [
      'We retain account and order records for as long as your account is active and as required for tax, accounting, and legal compliance under Indian law.',
      'When data is no longer needed, we delete or anonymise it. You may request deletion of your account data via the Contact page, subject to lawful retention obligations.',
    ],
  },
  {
    title: 'Your Rights',
    body: [
      'You may access, correct, or update your account details at any time from the Account page (/account).',
      'You may request a copy, correction, or deletion of your personal data, or withdraw consent for non-essential processing, by reaching us via the Contact page (/contact). We respond in line with applicable Indian data-protection law, including the DPDP Act, 2023.',
      'Returned items are governed by our returns window: 7 days from delivery, unused with tags, with refunds to the original payment source in 5–7 business days.',
    ],
  },
  {
    title: 'Grievance & Contact',
    body: [
      'For any privacy question, complaint, or grievance redressal request, please reach us through the in-site Contact page (/contact) or from your Account page (/account) for order history. Include your registered email and order number (if any) so we can respond promptly.',
    ],
  },
];

export default function Privacy() {
  return (
    <div className="max-w-[1400px] mx-auto px-6 py-14">
      {/* Hero */}
      <div className="text-center mb-14">
        <div className="text-[12px] font-bold uppercase tracking-[3px] text-brand-accent mb-2">Your Privacy</div>
        <h1 className="text-[clamp(28px,5vw,48px)] font-black uppercase tracking-wide mb-4">
          Privacy <span className="text-brand-accent">Policy</span>
        </h1>
        <p className="text-brand-muted text-[15px] max-w-[600px] mx-auto leading-relaxed">
          How LARA CROFT collects, uses, and protects your personal data when you shop
          our India store. Payments are processed securely via Razorpay, and all
          prices include 18% GST.
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
        <h2 className="text-[22px] font-extrabold uppercase tracking-wide mb-3">Questions About Your Data?</h2>
        <p className="text-brand-muted text-[14px] mb-6">Reach us through the Contact page — we typically respond within 24-48 hours.</p>
        <Link to="/contact" className="inline-block bg-brand-accent text-brand-cream py-3.5 px-9 text-[13px] font-bold uppercase tracking-[2px] hover:bg-brand-accent2 transition-all hover:shadow-[0_8px_24px_rgba(111,68,35,.30)]">
          Contact Us
        </Link>
      </div>
    </div>
  );
}
