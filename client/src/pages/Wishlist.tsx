import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWishlistStore } from '../stores/useWishlistStore';
import { useUserStore } from '../stores/useUserStore';
import ProductGrid from '../components/product/ProductGrid';

export default function Wishlist() {
  const { user } = useUserStore();
  const { items, loading, fetchWishlist } = useWishlistStore();

  useEffect(() => {
    if (user?.id) fetchWishlist();
  }, [user?.id, fetchWishlist]);

  if (!user) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 py-16 text-center">
        <h1 className="text-[28px] font-extrabold text-brand-text uppercase tracking-wide mb-4">My Wishlist</h1>
        <p className="text-brand-muted text-[14px] mb-6">Sign in to view your saved items.</p>
        <Link to="/login" className="bg-brand-accent text-brand-cream px-6 py-3 text-[13px] font-bold uppercase tracking-[1px] hover:bg-brand-accent2 transition-colors">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-10">
      <div className="mb-8">
        <div className="text-[12px] font-bold uppercase tracking-[3px] text-brand-accent mb-1">Saved</div>
        <h1 className="text-[28px] font-extrabold text-brand-text uppercase tracking-wide">My Wishlist</h1>
      </div>
      {loading ? (
        <div className="text-center text-brand-muted py-16 text-[14px]">Loading...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-brand-muted text-[14px] mb-4">Your wishlist is empty.</p>
          <Link to="/collection" className="bg-brand-accent text-brand-cream px-6 py-3 text-[13px] font-bold uppercase tracking-[1px] hover:bg-brand-accent2 transition-colors">
            Browse Collection
          </Link>
        </div>
      ) : (
        <ProductGrid products={items} />
      )}
    </div>
  );
}
