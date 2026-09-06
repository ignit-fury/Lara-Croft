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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-gray-800 capitalize">{slug?.replace('-', ' ')}</h1>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-brand-brown rounded-none"
        >
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>
      {loading ? (
        <div className="text-center text-gray-500 py-12">Loading...</div>
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  );
}
