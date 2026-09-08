import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import ProductGrid from '../components/product/ProductGrid';
import type { Product, Category } from '../types';

export default function Home() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/products/featured'),
      api.get('/products/categories'),
    ]).then(([featuredRes, categoriesRes]) => {
      setFeatured(featuredRes.data.data);
      setCategories(categoriesRes.data.data);
      setLoading(false);
    });
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative h-[540px] flex items-center justify-center overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 50%, #ffffff 100%)' }}>
        <div className="absolute inset-[-50%] opacity-50"
          style={{ background: 'radial-gradient(ellipse at center, rgba(111,68,35,.08) 0%, transparent 60%)' }} />
        <div className="text-center z-10 px-6 relative">
          <div className="inline-block bg-brand-accent text-brand-cream py-1.5 px-5 text-[11px] font-bold uppercase tracking-[2px] mb-5">
            New Season Drop
          </div>
          <h1 className="text-[clamp(32px,6vw,70px)] font-black leading-[1.05] uppercase tracking-[2px] mb-3.5">
            LARA <span className="text-brand-accent">CROFT</span>
          </h1>
          <p className="text-[15px] text-brand-muted max-w-[480px] mx-auto mb-7 tracking-wide">
            Authentic replicas, premium craftsmanship. The explorer's wardrobe — built for adventure, styled for legacy.
          </p>
          <Link to="/collection" className="inline-block bg-brand-accent text-brand-cream py-3.5 px-9 text-[13px] font-bold uppercase tracking-[2px] hover:bg-brand-accent2 transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(111,68,35,.30)]">
            Shop The Collection
          </Link>
        </div>
      </section>

      {/* Marquee */}
      <div className="overflow-hidden border-y border-brand-border py-3.5" style={{ background: '#f5f5f5' }}>
        <div className="flex gap-12 whitespace-nowrap" style={{ animation: 'marqueeScroll 30s linear infinite' }}>
          {['Trending Now', "Explorer's Linen Shirt", 'Tomb Raider Cargo Trousers', 'Relic Hunter Tee', 'Pasha Silk Shirt', 'Croft Classic Denim', 'Expedition Chinos', 'Nameless Adventurer Tee', 'Tiered Pocket Jeans'].map((item, i) => (
            <span key={i} className="text-[13px] font-semibold uppercase tracking-[2px] text-brand-muted inline-flex items-center gap-12">
              {item} <span className="text-brand-accent">●</span>
            </span>
          ))}
          {['Trending Now', "Explorer's Linen Shirt", 'Tomb Raider Cargo Trousers', 'Relic Hunter Tee', 'Pasha Silk Shirt', 'Croft Classic Denim', 'Expedition Chinos', 'Nameless Adventurer Tee', 'Tiered Pocket Jeans'].map((item, i) => (
            <span key={`dup-${i}`} className="text-[13px] font-semibold uppercase tracking-[2px] text-brand-muted inline-flex items-center gap-12">
              {item} <span className="text-brand-accent">●</span>
            </span>
          ))}
        </div>
        <style>{`@keyframes marqueeScroll { from{transform:translateX(0)} to{transform:translateX(-50%)} }`}</style>
      </div>

      {/* Categories */}
      <div className="max-w-[1400px] mx-auto px-6 pt-14 pb-5">
        <div className="text-[12px] font-bold uppercase tracking-[3px] text-brand-accent mb-1">Browse</div>
        <h2 className="text-[clamp(24px,4vw,40px)] font-extrabold uppercase tracking-wide">The Collection</h2>
      </div>
      <div className="max-w-[1400px] mx-auto px-6 pb-7 flex gap-2.5 flex-wrap">
        {categories.map((cat) => (
          <Link key={cat.id} to={`/category/${cat.slug}`}
            className="bg-brand-card border border-brand-border text-brand-muted py-2.5 px-6 text-[12px] font-semibold uppercase tracking-[1px] hover:bg-brand-accent hover:text-brand-cream hover:border-brand-accent transition-all">
            {cat.name}
          </Link>
        ))}
      </div>

      {/* Featured Products */}
      <div className="max-w-[1400px] mx-auto px-6 pb-16">
        {loading ? (
          <div className="text-center py-16 text-brand-muted">Loading...</div>
        ) : (
          <ProductGrid products={featured} />
        )}
      </div>

      {/* Promo Banner */}
      <section className="py-14 px-6 text-center border-y border-brand-border" style={{ background: 'linear-gradient(135deg, #f5f5f5, #ffffff)' }}>
        <h2 className="text-[clamp(22px,4vw,36px)] font-extrabold uppercase tracking-wide mb-2.5">
          Summer <span className="text-brand-accent">Adventure</span> Sale
        </h2>
        <p className="text-brand-muted text-[15px] mb-5 max-w-[380px] mx-auto">
          Up to 40% off on all Lara Croft expedition wear. Limited stock — once they're gone, they're gone.
        </p>
        <Link to="/sale" className="inline-block bg-brand-accent text-brand-cream py-3.5 px-9 text-[13px] font-bold uppercase tracking-[2px] hover:bg-brand-accent2 transition-all hover:shadow-[0_8px_24px_rgba(111,68,35,.30)]">
          Grab The Deal
        </Link>
      </section>

      {/* Featured Showcase */}
      {featured.length >= 3 && (
        <div className="max-w-[1400px] mx-auto px-6 py-14">
          <div className="text-[12px] font-bold uppercase tracking-[3px] text-brand-accent mb-1">Showcase</div>
          <h2 className="text-[clamp(24px,4vw,40px)] font-extrabold uppercase tracking-wide mb-8">Featured Piece</h2>
          <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-0 min-h-[420px]">
            {/* Main */}
            <div className="relative overflow-hidden bg-brand-card">
              <img src={featured[0].images[0]} alt={featured[0].name} className="w-full h-full object-cover hover:scale-[1.04] transition-transform duration-500" />
              <div className="absolute bottom-0 left-0 right-0 p-7" style={{ background: 'linear-gradient(transparent, rgba(0,0,0,.85))' }}>
                <div className="text-[10px] uppercase tracking-[1.5px] text-brand-accent font-semibold mb-1">Lara Croft Edition</div>
                <h3 className="text-xl font-bold uppercase tracking-wide mb-2">{featured[0].name}</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-[17px] font-extrabold">₹{(featured[0].price / 100).toLocaleString('en-IN')}</span>
                  <span className="text-[13px] text-brand-muted line-through">₹{(featured[0].originalPrice / 100).toLocaleString('en-IN')}</span>
                </div>
                <Link to={`/product/${featured[0].slug}`} className="inline-block bg-brand-accent text-brand-cream py-2.5 px-7 text-[11px] font-bold uppercase tracking-[1px] mt-3 hover:bg-brand-accent2 transition-colors">
                  Quick Shop
                </Link>
              </div>
            </div>
            {/* Side */}
            <div className="hidden md:flex flex-col border-l border-brand-border" style={{ background: '#f5f5f5' }}>
              {featured.slice(1, 3).map((p) => (
                <div key={p.id} className="flex-1 relative overflow-hidden min-h-[200px]">
                  <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover hover:scale-[1.04] transition-transform duration-500" />
                  <div className="absolute bottom-0 left-0 right-0 p-3.5" style={{ background: 'linear-gradient(transparent, rgba(0,0,0,.9))' }}>
                    <div className="text-[10px] uppercase tracking-[1.5px] text-brand-accent font-semibold">Lara Croft Edition</div>
                    <div className="text-[14px] font-semibold mt-0.5">{p.name}</div>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-[15px] font-extrabold">₹{(p.price / 100).toLocaleString('en-IN')}</span>
                      <span className="text-[12px] text-brand-muted line-through">₹{(p.originalPrice / 100).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Newsletter */}
      <section id="about" className="py-14 px-6 text-center border-t border-brand-border" style={{ background: '#f5f5f5' }}>
        <h2 className="text-[22px] font-extrabold uppercase tracking-wide mb-1.5">Join The Expedition</h2>
        <p className="text-brand-muted text-[13px] mb-5">Be the first to know about new drops, exclusive offers, and Lara Croft updates.</p>
        <form className="flex max-w-[420px] mx-auto border border-brand-border overflow-hidden" onSubmit={(e) => { e.preventDefault(); alert('Welcome to the team!'); }}>
          <input type="email" placeholder="Enter your email" required className="flex-1 py-3.5 px-4 bg-white border-none text-brand-text text-[14px] outline-none placeholder:text-brand-muted" />
          <button type="submit" className="bg-brand-accent text-brand-cream border-none py-3.5 px-6 text-[12px] font-bold uppercase tracking-[1.5px] hover:bg-brand-accent2 transition-colors">
            Subscribe
          </button>
        </form>
      </section>
    </div>
  );
}
