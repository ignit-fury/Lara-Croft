import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCartStore } from '../stores/useCartStore';
import { useUserStore } from '../stores/useUserStore';
import toast from 'react-hot-toast';
import type { Product } from '../types';

function formatPrice(paise: number): string {
  return `₹${(paise / 100).toLocaleString('en-IN')}`;
}

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCartStore();
  const { user } = useUserStore();
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    api.get(`/products/${slug}`).then((res) => {
      setProduct(res.data.data);
      if (res.data.data.sizes?.length) setSelectedSize(res.data.data.sizes[0]);
      setLoading(false);
    });
  }, [slug]);

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Please sign in to add items to cart');
      navigate('/login');
      return;
    }
    if (!selectedSize && product?.sizes?.length) {
      toast.error('Please select a size');
      return;
    }
    if (adding) return;
    setAdding(true);
    try {
      await addItem(product!.id, selectedSize, quantity);
      toast.success('Added to cart');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };

  if (loading || !product) {
    return <div className="max-w-7xl mx-auto px-4 py-12 text-center text-brand-muted">Loading...</div>;
  }

  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Images */}
        <div className="space-y-3">
          <div className="aspect-[3/4] overflow-hidden" style={{ background: '#efefef' }}>
            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((img, i) => (
                <div key={i} className="aspect-square overflow-hidden" style={{ background: '#efefef' }}>
                  <img src={img} alt="" className="w-full h-full object-cover hover:opacity-80 transition-opacity" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-5">
          <div>
            <p className="text-[11px] uppercase tracking-[1.5px] text-brand-accent font-semibold mb-1">{product.brand}</p>
            <h1 className="text-[26px] font-extrabold text-brand-text uppercase tracking-wide leading-tight">{product.name}</h1>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-[26px] font-extrabold">{formatPrice(product.price)}</span>
            {product.originalPrice > product.price && (
              <>
                <span className="text-[16px] text-brand-muted line-through">{formatPrice(product.originalPrice)}</span>
                <span className="text-[13px] text-brand-accent font-semibold">{discount}% off</span>
              </>
            )}
          </div>

          <p className="text-brand-muted leading-relaxed text-[14px]">{product.description}</p>

          {/* Sizes */}
          {product.sizes?.length > 0 && (
            <div>
              <h3 className="text-[11px] font-bold uppercase tracking-[2px] text-brand-text mb-3">Size</h3>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 text-[13px] font-semibold border transition-all ${
                      selectedSize === size
                        ? 'border-brand-accent bg-brand-accent text-brand-cream'
                        : 'border-brand-border text-brand-muted hover:border-brand-accent hover:text-brand-accent'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-[2px] text-brand-text mb-3">Quantity</h3>
            <div className="flex items-center border border-brand-border w-fit">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2 text-brand-muted hover:text-brand-text hover:bg-brand-card transition-colors">−</button>
              <span className="px-4 py-2 text-[13px] font-semibold min-w-[40px] text-center text-brand-text">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="px-3 py-2 text-brand-muted hover:text-brand-text hover:bg-brand-card transition-colors">+</button>
            </div>
          </div>

          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            disabled={adding}
            className="w-full bg-brand-accent text-brand-cream py-3.5 text-[13px] font-bold uppercase tracking-[2px] hover:bg-brand-accent2 transition-all hover:shadow-[0_8px_24px_rgba(111,68,35,.30)] disabled:opacity-50"
          >
            {adding ? 'Adding...' : 'Add to Cart'}
          </button>

          {product.stock <= 5 && product.stock > 0 && (
            <p className="text-[13px] text-brand-accent font-semibold">Only {product.stock} left in stock</p>
          )}

          {product.stock === 0 && (
            <p className="text-[13px] text-brand-muted font-semibold">Out of stock</p>
          )}
        </div>
      </div>
    </div>
  );
}
