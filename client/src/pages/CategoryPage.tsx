import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import ProductGrid from '../components/product/ProductGrid';
import type { Product } from '../types';

export default function CategoryPage() {
  const { slug } = useParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    setLoading(true);
    api.get(`/products?category=${slug}&sort=${sortBy === 'newest' ? '' : sortBy}`).then((res) => {
      setProducts(res.data.data);
      setLoading(false);
    });
  }, [slug, sortBy]);

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-[28px] font-extrabold text-brand-text uppercase tracking-wide">{slug?.replace('-', ' ')}</h1>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border border-brand-border bg-brand-card text-brand-muted px-4 py-2.5 text-[13px] font-semibold focus:outline-none focus:border-brand-accent appearance-none cursor-pointer"
        >
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>
      {loading ? (
        <div className="text-center text-brand-muted py-16 text-[14px]">Loading...</div>
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  );
}
