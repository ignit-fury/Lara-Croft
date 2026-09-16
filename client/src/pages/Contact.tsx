import toast from 'react-hot-toast';

export default function Contact() {
  const email = 'laracroft0710@outlook.com';

  const copyEmail = () => {
    navigator.clipboard.writeText(email);
    toast.success('Email copied to clipboard');
  };

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-14">
      {/* Hero */}
      <div className="text-center mb-14">
        <div className="text-[12px] font-bold uppercase tracking-[3px] text-brand-accent mb-2">Get In Touch</div>
        <h1 className="text-[clamp(28px,5vw,48px)] font-black uppercase tracking-wide mb-4">
          Contact Us
        </h1>
        <p className="text-brand-muted text-[15px] max-w-[600px] mx-auto leading-relaxed">
          Have a question about your order, need help with sizing, or just want to say hello? We'd love to hear from you.
        </p>
      </div>

      {/* Contact Card */}
      <div className="max-w-[560px] mx-auto border border-brand-border p-10 text-center mb-14" style={{ background: '#fafafa' }}>
        <div className="flex justify-center mb-5">
          <svg className="w-10 h-10 text-brand-accent" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
        </div>
        <h3 className="text-[14px] font-bold uppercase tracking-[1px] mb-2">Email us directly</h3>
        <p className="text-brand-muted text-[14px] mb-6">{email}</p>
        <div className="flex flex-col sm:flex-row justify-center gap-3 mb-6">
          <a
            href={`mailto:${email}`}
            className="inline-block bg-brand-accent text-brand-cream py-3.5 px-9 text-[13px] font-bold uppercase tracking-[2px] hover:bg-brand-accent2 transition-all hover:shadow-[0_8px_24px_rgba(111,68,35,.30)] text-center"
          >
            Email Us
          </a>
          <button
            onClick={copyEmail}
            className="inline-block border border-brand-accent text-brand-accent py-3.5 px-9 text-[13px] font-bold uppercase tracking-[2px] hover:bg-brand-accent hover:text-brand-cream transition-all text-center cursor-pointer"
          >
            Copy Address
          </button>
        </div>
        <p className="text-brand-muted text-[12px]">We typically respond within 24-48 hours.</p>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 max-w-[800px] mx-auto">
        <div className="border border-brand-border p-8 text-center" style={{ background: '#fafafa' }}>
          <h3 className="text-[14px] font-bold uppercase tracking-[1px] mb-3">Order Questions</h3>
          <p className="text-brand-muted text-[13px] leading-relaxed">
            Questions about your order, shipping, returns, or exchanges? Include your order number for faster support.
          </p>
        </div>
        <div className="border border-brand-border p-8 text-center" style={{ background: '#fafafa' }}>
          <h3 className="text-[14px] font-bold uppercase tracking-[1px] mb-3">Response Time</h3>
          <p className="text-brand-muted text-[13px] leading-relaxed">
            We aim to respond to all inquiries within 24-48 hours during business days. We appreciate your patience.
          </p>
        </div>
      </div>
    </div>
  );
}
