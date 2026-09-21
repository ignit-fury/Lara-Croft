import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCartStore } from '../stores/useCartStore';
import { useUserStore } from '../stores/useUserStore';
import { useCurrencyStore } from '../stores/useCurrencyStore';
import toast from 'react-hot-toast';
import { Minus, Plus } from 'lucide-react';
import type { Product } from '../types';
import ProductCard from '../components/product/ProductCard';
import SizeGuide from '../components/product/SizeGuide';
import StarRating from '../components/product/StarRating';
import ReviewForm from '../components/product/ReviewForm';
import { formatPrice } from '../utils/formatPrice';

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState<Product[]>([]);
  const { addItem } = useCartStore();
  const { user } = useUserStore();
  const { currency } = useCurrencyStore();
  const [adding, setAdding] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  const fetchReviews = async () => {
    if (!slug) return;
    try {
      const res = await api.get(`/products/${slug}/reviews`);
      const { reviews: r, averageRating, totalCount } = res.data.data;
      setReviews(r);
      setAvgRating(averageRating);
      setReviewCount(totalCount);
      if (user) {
        setHasReviewed(r.some((rev: any) => rev.userId === user.id));
      }
    } catch {
      // reviews table might not exist
    }
  };

  useEffect(() => {
    api.get(`/products/${slug}`).then((res) => {
      setProduct(res.data.data);
      if (res.data.data.sizes?.length) setSelectedSize(res.data.data.sizes[0]);
      setLoading(false);
    });
    api.get(`/products/${slug}/related`).then((res) => {
      setRelated(res.data.data);
    });
    api.get(`/products/${slug}/reviews`).then((res) => {
      const { reviews: r, averageRating, totalCount } = res.data.data;
      setReviews(r);
      setAvgRating(averageRating);
      setReviewCount(totalCount);
      if (user) {
        setHasReviewed(r.some((rev: any) => rev.userId === user.id));
      }
    }).catch(() => {});
  }, [slug, user]);

  useEffect(() => {
    if (user && product) {
      api.get('/orders')
        .then((res) => {
          const orders = res.data.data || [];
          const purchased = orders.some((o: any) =>
            o.items?.some((item: any) => item.productId === product.id)
          );
          setHasPurchased(purchased);
        })
        .catch(() => {});
    }
  }, [user, product]);

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

  const maxQty = product.stock > 0 ? product.stock : 1;

  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  return (
    <>
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
            {currency !== 'INR' && (
              <span className="text-[12px] text-brand-muted ml-2">({formatPrice(product.price, 'INR')})</span>
            )}
          </div>

          <p className="text-brand-muted leading-relaxed text-[14px]">{product.description}</p>

          {/* Sizes */}
          {product.sizes?.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-[11px] font-bold uppercase tracking-[2px] text-brand-text">Size</h3>
                <button
                  onClick={() => setShowSizeGuide(true)}
                  className="text-[11px] font-semibold uppercase tracking-[1px] text-brand-accent underline hover:text-brand-accent2"
                >
                  Size Guide
                </button>
              </div>
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
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2 text-brand-muted hover:text-brand-text hover:bg-brand-card transition-colors"><Minus size={16} /></button>
              <span className="px-4 py-2 text-[13px] font-semibold min-w-[40px] text-center text-brand-text">{quantity}</span>
              <button onClick={() => setQuantity(Math.min(maxQty, quantity + 1))} className="px-3 py-2 text-brand-muted hover:text-brand-text hover:bg-brand-card transition-colors"><Plus size={16} /></button>
            </div>
          </div>

          {/* Add to Cart */}
          {(() => {
            const isOutOfStock = product.stock === 0 || (selectedSize && product.stockBySize && product.stockBySize[selectedSize] === 0);
            return (
              <button
                onClick={handleAddToCart}
                disabled={adding || isOutOfStock}
                className="w-full bg-brand-accent text-brand-cream py-3.5 text-[13px] font-bold uppercase tracking-[2px] hover:bg-brand-accent2 transition-all hover:shadow-[0_8px_24px_rgba(111,68,35,.30)] disabled:opacity-50"
              >
                {adding ? 'Adding...' : isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
              </button>
            );
          })()}

          {selectedSize && product.stockBySize && product.stockBySize[selectedSize] !== undefined ? (
            product.stockBySize[selectedSize] <= 5 && product.stockBySize[selectedSize] > 0 ? (
              <p className="text-[13px] text-brand-accent font-semibold">Only {product.stockBySize[selectedSize]} left in stock</p>
            ) : product.stockBySize[selectedSize] === 0 ? (
              <p className="text-[13px] text-brand-muted font-semibold">Out of stock for {selectedSize}</p>
            ) : null
          ) : (
            product.stock <= 5 && product.stock > 0 ? (
              <p className="text-[13px] text-brand-accent font-semibold">Only {product.stock} left in stock</p>
            ) : product.stock === 0 ? (
              <p className="text-[13px] text-brand-muted font-semibold">Out of stock</p>
            ) : null
          )}
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="text-[11px] font-bold uppercase tracking-[2px] text-brand-text mb-6">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </div>
      )}

      {/* Reviews Section */}
      <div className="mt-16">
        <h2 className="text-[11px] font-bold uppercase tracking-[2px] text-brand-text mb-6">Customer Reviews</h2>

        {reviewCount > 0 ? (
          <div className="flex items-center gap-3 mb-6">
            <StarRating rating={avgRating} size={20} />
            <span className="text-[14px] font-semibold text-brand-text">{avgRating}</span>
            <span className="text-[13px] text-brand-muted">({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})</span>
          </div>
        ) : (
          <p className="text-[14px] text-brand-muted mb-6">No reviews yet. Be the first to review!</p>
        )}

        {reviews.length > 0 && (
          <div className="space-y-6 mb-8">
            {reviews.map((review) => (
              <div key={review.id} className="border border-brand-border p-4">
                <div className="flex items-center gap-3 mb-2">
                  <StarRating rating={review.rating} size={16} />
                  <span className="text-[13px] font-semibold text-brand-text">{review.title}</span>
                </div>
                <p className="text-[14px] text-brand-muted mb-2">{review.comment}</p>
                <div className="flex items-center gap-2 text-[12px] text-brand-muted">
                  <span>{review.userName}</span>
                  <span>&middot;</span>
                  <span>{new Date(review.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {user && hasPurchased && !hasReviewed && (
          <div className="border border-brand-border p-6">
            <h3 className="text-[11px] font-bold uppercase tracking-[2px] text-brand-text mb-4">Write a Review</h3>
            <ReviewForm onReviewSubmitted={fetchReviews} />
          </div>
        )}
      </div>
    </div>

      {showSizeGuide && (
        <SizeGuide
          categorySlug={typeof product.category === 'string' ? product.category : product.category.slug}
          onClose={() => setShowSizeGuide(false)}
        />
      )}
    </>
  );
}
