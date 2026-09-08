import { useState, useEffect } from 'react';
import api from '../services/api';
import ProductGrid from '../components/product/ProductGrid';
import type { Product } from '../types';

export default function SalePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/products?on_sale=true').then((res) => {
      setProducts(res.data.data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-10">
      <div className="mb-8">
        <div className="text-[12px] font-bold uppercase tracking-[3px] text-brand-accent mb-1">Limited Time</div>
        <h1 className="text-[28px] font-extrabold text-brand-text uppercase tracking-wide">On Sale</h1>
        <p className="text-brand-muted text-[14px] mt-2">Grab these before they're gone. All sale prices as marked.</p>
      </div>
      {loading ? (
        <div className="text-center text-brand-muted py-16 text-[14px]">Loading...</div>
      ) : products.length === 0 ? (
        <div className="text-center text-brand-muted py-16 text-[14px]">No sale items right now. Check back soon!</div>
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  );
}
