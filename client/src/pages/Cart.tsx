import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../stores/useCartStore';
import { useUserStore } from '../stores/useUserStore';

function formatPrice(paise: number): string {
  return `₹${(paise / 100).toLocaleString('en-IN')}`;
}

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, fetchCart, updateItem, removeItem, total } = useCartStore();
  const { user } = useUserStore();

  useEffect(() => {
    if (user && open) fetchCart();
  }, [user, open, fetchCart]);

  const handleCheckout = () => {
    onClose();
  };

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/60 z-[190]" onClick={onClose} />}

      <div className={`fixed top-0 right-0 bottom-0 w-[400px] max-w-full z-[195] flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ background: '#fafafa', borderLeft: '1px solid #e0e0e0', transitionTimingFunction: 'cubic-bezier(.4,0,.2,1)' }}>
        <div className="px-6 py-5 border-b border-brand-border flex items-center justify-between">
          <h3 className="text-base font-bold uppercase tracking-wide">Shopping Cart ({items.length})</h3>
          <button onClick={onClose} className="text-brand-muted text-2xl hover:text-brand-text transition-colors">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="text-center py-12 text-brand-muted">
              <div className="text-5xl mb-4 opacity-40">🛒</div>
              <p className="text-sm">Your cart is empty.</p>
              <p className="text-xs mt-1.5 opacity-70">Time to gear up for an adventure.</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={`${item.product.id}-${item.size}`} className="grid grid-cols-[80px_1fr_auto] gap-3.5 items-center py-3.5 border-b border-brand-border">
                <img src={item.product.images[0]} alt={item.product.name} className="w-20 h-20 object-cover rounded" style={{ background: '#efefef' }} />
                <div>
                  <div className="text-[10px] uppercase tracking-[1px] text-brand-accent font-semibold">{item.product.brand}</div>
                  <div className="text-[13px] font-semibold mt-0.5">{item.product.name}</div>
                  <div className="text-[11px] text-brand-muted">Size: {item.size}</div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="text-[15px] font-bold">{formatPrice(item.product.price * item.quantity)}</div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateItem(item.product.id, item.size, Math.max(1, item.quantity - 1))} className="w-7 h-7 bg-brand-card border border-brand-border text-brand-text text-sm rounded flex items-center justify-center hover:border-brand-accent hover:text-brand-accent transition-colors">−</button>
                    <span className="text-[13px] font-semibold min-w-[20px] text-center">{item.quantity}</span>
                    <button onClick={() => updateItem(item.product.id, item.size, item.quantity + 1)} className="w-7 h-7 bg-brand-card border border-brand-border text-brand-text text-sm rounded flex items-center justify-center hover:border-brand-accent hover:text-brand-accent transition-colors">+</button>
                  </div>
                  <button onClick={() => removeItem(item.product.id, item.size)} className="text-brand-muted text-lg hover:text-brand-accent transition-colors p-1">🗑</button>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="px-6 py-5 border-t border-brand-border">
            <div className="flex justify-between items-baseline mb-3.5">
              <span className="text-[11px] uppercase tracking-[1.5px] text-brand-muted font-semibold">Total</span>
              <span className="text-xl font-extrabold">{formatPrice(total())}</span>
            </div>
            <Link to="/checkout" onClick={onClose} className="block w-full bg-brand-accent text-brand-cream border-none py-3.5 text-[12px] font-bold uppercase tracking-[2px] hover:bg-brand-accent2 transition-colors text-center">
              Proceed to Checkout
            </Link>
            <button onClick={() => { useCartStore.getState().clearCart(); onClose(); }} className="w-full bg-transparent border border-brand-border text-brand-muted py-2.5 mt-2.5 text-[11px] font-semibold uppercase tracking-wide rounded hover:border-brand-accent hover:text-brand-accent transition-all">
              Clear Cart
            </button>
          </div>
        )}
      </div>
    </>
  );
}
