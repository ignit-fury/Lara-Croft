import { Link, useNavigate } from 'react-router-dom';
import { useUserStore } from '../../stores/useUserStore';
import { useCartStore } from '../../stores/useCartStore';
import { useAuth } from '../../hooks/useAuth';
import { useState } from 'react';
import CartDrawer from '../../pages/Cart';

export default function Header() {
  const { user } = useUserStore();
  const { items } = useCartStore();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      {/* Announcement Bar */}
      <div className="text-brand-cream text-center py-2 px-4 text-[13px] font-medium tracking-wide"
        style={{ background: 'linear-gradient(90deg, #6f4423 0%, #8a5a30 50%, #6f4423 100%)', backgroundSize: '200% 100%', animation: 'shimmer 4s ease-in-out infinite' }}>
        Free Shipping on Orders Over ₹1,000 &nbsp;·&nbsp; Use Code <strong>LARA25</strong> for 25% Off
      </div>
      <style>{`@keyframes shimmer { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }`}</style>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-brand-border" style={{ background: 'rgba(255,255,255,.92)', backdropFilter: 'blur(14px)' }}>
        <div className="max-w-[1400px] mx-auto px-6 py-3.5 flex items-center justify-between gap-6">
          <Link to="/" className="text-[22px] font-black tracking-[3px] uppercase text-brand-text no-nowrap">
            LARA<span className="text-brand-accent">CROFT</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-brand-muted text-[13px] font-medium uppercase tracking-[1px] hover:text-brand-text transition-colors">Shop</Link>
            <Link to="/collection" className="text-brand-muted text-[13px] font-medium uppercase tracking-[1px] hover:text-brand-text transition-colors">Collection</Link>
            <Link to="/sale" className="text-brand-muted text-[13px] font-medium uppercase tracking-[1px] hover:text-brand-text transition-colors">Sale</Link>
            <Link to="/about" className="text-brand-muted text-[13px] font-medium uppercase tracking-[1px] hover:text-brand-text transition-colors">About</Link>
          </nav>

          <div className="flex items-center gap-4">
            <button onClick={() => setCartOpen(true)} className="relative text-brand-muted hover:text-brand-text transition-colors text-lg">
              🛒
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-brand-accent text-brand-cream text-[10px] font-bold w-[18px] h-[18px] rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>

            {user ? (
              <div className="hidden md:flex items-center gap-3">
                <Link to="/account" className="text-brand-muted text-sm hover:text-brand-text transition-colors">
                  👤 {user.name}
                </Link>
                {(user.role === 'admin' || user.role === 'manager' || user.role === 'super_admin') && (
                  <Link to="/admin" className="text-brand-accent text-sm font-semibold hover:text-brand-accent2 transition-colors">Admin</Link>
                )}
                <button onClick={signOut} className="text-brand-muted text-sm hover:text-brand-text transition-colors">Sign Out</button>
              </div>
            ) : (
              <button onClick={() => navigate('/login')} className="hidden md:block bg-brand-accent text-brand-cream px-5 py-2 text-[13px] font-bold uppercase tracking-[1px] hover:bg-brand-accent2 transition-colors">
                Sign In
              </button>
            )}

            <button onClick={() => setMobileOpen(true)} className="md:hidden text-brand-text text-2xl p-1">☰</button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[99] flex flex-col items-center justify-center gap-8" style={{ background: 'rgba(255,255,255,.97)' }}>
          <button onClick={() => setMobileOpen(false)} className="absolute top-5 right-5 text-brand-text text-2xl p-1">✕</button>
          <Link to="/" onClick={() => setMobileOpen(false)} className="text-brand-text text-[28px] font-bold uppercase tracking-[2px] hover:text-brand-accent transition-colors">Shop</Link>
          <Link to="/collection" onClick={() => setMobileOpen(false)} className="text-brand-text text-[28px] font-bold uppercase tracking-[2px] hover:text-brand-accent transition-colors">Collection</Link>
          <Link to="/sale" onClick={() => setMobileOpen(false)} className="text-brand-text text-[28px] font-bold uppercase tracking-[2px] hover:text-brand-accent transition-colors">Sale</Link>
          <Link to="/about" onClick={() => setMobileOpen(false)} className="text-brand-text text-[28px] font-bold uppercase tracking-[2px] hover:text-brand-accent transition-colors">About</Link>
          {user ? (
            <>
              <Link to="/account" onClick={() => setMobileOpen(false)} className="text-brand-text text-[28px] font-bold uppercase tracking-[2px]">Account</Link>
              <button onClick={() => { signOut(); setMobileOpen(false); }} className="text-brand-text text-[28px] font-bold uppercase tracking-[2px]">Sign Out</button>
            </>
          ) : (
            <button onClick={() => { navigate('/login'); setMobileOpen(false); }} className="bg-brand-accent text-brand-cream px-8 py-4 text-sm font-bold uppercase tracking-[2px]">Sign In</button>
          )}
        </div>
      )}

      {/* Cart Drawer */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
