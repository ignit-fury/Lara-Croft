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
      <section className="bg-brand-brown text-brand-cream">
        <div className="max-w-7xl mx-auto px-4 py-20 md:py-28">
          <div className="max-w-2xl">
            <p className="text-sm tracking-[0.3em] uppercase mb-4 opacity-80">Prima Facie</p>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              LARA CROFT
            </h1>
            <p className="text-lg mb-8 opacity-90">
              Luxury fashion curated for the modern Indian woman. From timeless traditionals to contemporary elegance.
            </p>
            <div className="flex gap-4">
              <Link
                to="/category/lehengas"
                className="bg-brand-cream text-brand-brown px-6 py-3 text-sm font-semibold hover:bg-white transition-colors"
              >
                Shop Lehengas
              </Link>
              <Link
                to="/category/sarees"
                className="border border-brand-cream text-brand-cream px-6 py-3 text-sm font-semibold hover:bg-brand-cream hover:text-brand-brown transition-colors"
              >
                Shop Sarees
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-xl font-semibold text-gray-800 mb-8">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              to={`/category/${cat.slug}`}
              className="group text-center p-4 border border-gray-200 hover:border-brand-brown transition-colors"
            >
              <div className="aspect-square bg-gray-100 mb-3 overflow-hidden">
                {cat.image ? (
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl">
                    {cat.name[0]}
                  </div>
                )}
              </div>
              <p className="text-sm font-medium text-gray-700 group-hover:text-brand-brown transition-colors">{cat.name}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-semibold text-gray-800">Featured</h2>
          <Link to="/category/lehengas" className="text-sm text-brand-brown hover:underline">
            View All
          </Link>
        </div>
        {loading ? (
          <div className="text-center text-gray-500 py-12">Loading...</div>
        ) : (
          <ProductGrid products={featured} />
        )}
      </section>

      {/* Banner */}
      <section className="bg-brand-cream">
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-semibold text-brand-brown mb-4">Free Shipping on Orders Above ₹5,000</h2>
          <p className="text-gray-600 mb-6">Express delivery available across India</p>
          <Link to="/category/jewellery" className="inline-block bg-brand-brown text-brand-cream px-6 py-3 text-sm font-semibold hover:bg-brand-brown-dark transition-colors">
            Shop Jewellery
          </Link>
        </div>
      </section>
    </div>
  );
}
