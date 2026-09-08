import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-brand-border pt-14 pb-7 px-6" style={{ background: '#ffffff' }}>
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr] gap-9 mb-9">
        {/* Brand */}
        <div>
          <Link to="/" className="text-[22px] font-black tracking-[3px] uppercase text-brand-text inline-block mb-4">
            LARA<span className="text-brand-accent">CROFT</span>
          </Link>
          <p className="text-brand-muted text-[13px] max-w-[280px] leading-relaxed">
            Premium replica apparel inspired by the world's greatest explorer. Every stitch tells a story of adventure.
          </p>
          <div className="flex gap-2.5 mt-5">
            {['📷', '👍', '🐦', '▶'].map((icon, i) => (
              <a key={i} href="#" className="w-[38px] h-[38px] bg-brand-card border border-brand-border flex items-center justify-center text-brand-muted text-[15px] rounded hover:bg-brand-accent hover:text-brand-cream hover:border-brand-accent transition-all">
                {icon}
              </a>
            ))}
          </div>
        </div>

        {/* Shop */}
        <div>
          <h4 className="text-[11px] font-bold uppercase tracking-[2px] text-brand-text mb-4">Shop</h4>
          <ul className="space-y-2.5">
            {[
              { label: 'Shirts', to: '/category/shirts' },
              { label: 'T-Shirts', to: '/category/t-shirts' },
              { label: 'Trousers', to: '/category/trousers' },
              { label: 'Jeans', to: '/category/jeans' },
              { label: 'New Arrivals', to: '/collection' },
              { label: 'Sale', to: '/sale' },
            ].map((item) => (
              <li key={item.label}><Link to={item.to} className="text-brand-muted text-[13px] hover:text-brand-text transition-colors">{item.label}</Link></li>
            ))}
          </ul>
        </div>

        {/* Help */}
        <div>
          <h4 className="text-[11px] font-bold uppercase tracking-[2px] text-brand-text mb-4">Help</h4>
          <ul className="space-y-2.5">
            {['Shipping Info', 'Returns & Exchanges', 'Size Guide', 'FAQ', 'Contact Us'].map((item) => (
              <li key={item}><a href="#" className="text-brand-muted text-[13px] hover:text-brand-text transition-colors">{item}</a></li>
            ))}
          </ul>
        </div>

        {/* Company */}
        <div>
          <h4 className="text-[11px] font-bold uppercase tracking-[2px] text-brand-text mb-4">Company</h4>
          <ul className="space-y-2.5">
            {[
              { label: 'About Lara Croft', to: '/about' },
              { label: 'Careers', href: '#' },
              { label: 'Privacy Policy', href: '#' },
              { label: 'Terms of Service', href: '#' },
              { label: 'Refund Policy', href: '#' },
            ].map((item) => (
              <li key={item.label}>
                {item.to ? (
                  <Link to={item.to} className="text-brand-muted text-[13px] hover:text-brand-text transition-colors">{item.label}</Link>
                ) : (
                  <a href={item.href} className="text-brand-muted text-[13px] hover:text-brand-text transition-colors">{item.label}</a>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto pt-5 border-t border-brand-border flex flex-col md:flex-row justify-between items-center gap-3.5">
        <p className="text-brand-muted text-[12px]">© 2026 Lara Croft. All rights reserved.</p>
        <div className="flex gap-5">
          <a href="#" className="text-brand-muted text-[12px] hover:text-brand-text transition-colors">Privacy</a>
          <a href="#" className="text-brand-muted text-[12px] hover:text-brand-text transition-colors">Terms</a>
          <a href="#" className="text-brand-muted text-[12px] hover:text-brand-text transition-colors">Sitemap</a>
        </div>
      </div>
    </footer>
  );
}
