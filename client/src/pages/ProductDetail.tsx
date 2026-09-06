import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCartStore();
  const { user } = useUserStore();

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
      return;
    }
    if (!selectedSize && product?.sizes?.length) {
      toast.error('Please select a size');
      return;
    }
    try {
      await addItem(product!._id, selectedSize, quantity);
      toast.success('Added to cart');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to add to cart');
    }
  };

  if (loading || !product) {
    return <div className="max-w-7xl mx-auto px-4 py-12 text-center text-gray-500">Loading...</div>;
  }

  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Images */}
        <div className="space-y-4">
          <div className="aspect-[3/4] bg-gray-100">
            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((img, i) => (
                <div key={i} className="aspect-square bg-gray-100">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{product.brand}</p>
            <h1 className="text-2xl font-semibold text-gray-800">{product.name}</h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-brand-brown">{formatPrice(product.price)}</span>
            {product.originalPrice > product.price && (
              <>
                <span className="text-lg text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
                <span className="text-sm text-green-600 font-medium">{discount}% off</span>
              </>
            )}
          </div>

          <p className="text-gray-600 leading-relaxed">{product.description}</p>

          {/* Sizes */}
          {product.sizes?.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-800 mb-3">Size</h3>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 text-sm border ${
                      selectedSize === size
                        ? 'border-brand-brown bg-brand-brown text-brand-cream'
                        : 'border-gray-300 text-gray-600 hover:border-brand-brown'
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
            <h3 className="text-sm font-medium text-gray-800 mb-3">Quantity</h3>
            <div className="flex items-center border border-gray-300 w-fit">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2 text-gray-600 hover:bg-gray-100">-</button>
              <span className="px-4 py-2 text-sm">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="px-3 py-2 text-gray-600 hover:bg-gray-100">+</button>
            </div>
          </div>

          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            className="w-full bg-brand-brown text-brand-cream py-3 text-sm font-semibold hover:bg-brand-brown-dark transition-colors"
          >
            Add to Cart
          </button>

          {product.stock <= 5 && product.stock > 0 && (
            <p className="text-sm text-orange-600">Only {product.stock} left in stock</p>
          )}
        </div>
      </div>
    </div>
  );
}
