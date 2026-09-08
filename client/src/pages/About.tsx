import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="max-w-[1400px] mx-auto px-6 py-14">
      {/* Hero */}
      <div className="text-center mb-14">
        <div className="text-[12px] font-bold uppercase tracking-[3px] text-brand-accent mb-2">Our Story</div>
        <h1 className="text-[clamp(28px,5vw,48px)] font-black uppercase tracking-wide mb-4">
          Lara <span className="text-brand-accent">Croft</span>
        </h1>
        <p className="text-brand-muted text-[15px] max-w-[600px] mx-auto leading-relaxed">
          Born from the spirit of exploration. Every piece we craft is designed for those who refuse to settle — 
          the adventurers, the discoverers, the ones who carve their own path.
        </p>
      </div>

      {/* Values */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {[
          {
            title: 'Crafted for Adventure',
            desc: 'Premium fabrics tested on expeditions. Reinforced stitching, functional pockets, and cuts that move with you — not against you.',
          },
          {
            title: 'Heritage Meets Modern',
            desc: 'Classic expedition wear reimagined. The rugged elegance of vintage exploration fused with contemporary tailoring.',
          },
          {
            title: 'Built to Last',
            desc: 'We don\'t do fast fashion. Every garment is an investment — quality materials, timeless design, meticulous construction.',
          },
        ].map((item) => (
          <div key={item.title} className="border border-brand-border p-8 text-center" style={{ background: '#fafafa' }}>
            <h3 className="text-[14px] font-bold uppercase tracking-[1px] mb-3">{item.title}</h3>
            <p className="text-brand-muted text-[13px] leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Brand Story */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
        <div>
          <div className="text-[12px] font-bold uppercase tracking-[3px] text-brand-accent mb-2">The Vision</div>
          <h2 className="text-[28px] font-extrabold uppercase tracking-wide mb-4">Dress Like You've Been Somewhere</h2>
          <p className="text-brand-muted text-[14px] leading-relaxed mb-4">
            Lara Croft isn't just a brand — it's a mindset. Our collections are inspired by the golden age of exploration, 
            when clothing was built for purpose and style was earned through experience.
          </p>
          <p className="text-brand-muted text-[14px] leading-relaxed">
            From linen shirts that breathe in desert heat to cargo trousers built for jungle treks, 
            every piece carries the DNA of adventure. Wear it like you mean it.
          </p>
        </div>
        <div className="aspect-[4/3] bg-brand-card border border-brand-border overflow-hidden">
          <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f5f5f5, #ffffff)' }}>
            <div className="text-center">
              <div className="text-[48px] mb-2">🗺️</div>
              <div className="text-[14px] font-bold uppercase tracking-[2px]">Explore Awaits</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center border-t border-brand-border pt-12">
        <h2 className="text-[22px] font-extrabold uppercase tracking-wide mb-3">Ready to Begin?</h2>
        <p className="text-brand-muted text-[14px] mb-6">Join the expedition. Your wardrobe will thank you.</p>
        <Link to="/" className="inline-block bg-brand-accent text-brand-cream py-3.5 px-9 text-[13px] font-bold uppercase tracking-[2px] hover:bg-brand-accent2 transition-all hover:shadow-[0_8px_24px_rgba(111,68,35,.30)]">
          Shop Now
        </Link>
      </div>
    </div>
  );
}
