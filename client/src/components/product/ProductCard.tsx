import { Link } from 'react-router-dom';
import type { Product } from '../../types';

interface ProductCardProps {
  product: Product;
}

function formatPrice(paise: number): string {
  return `₹${(paise / 100).toLocaleString('en-IN')}`;
}

export default function ProductCard({ product }: ProductCardProps) {
  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  return (
    <Link to={`/product/${product.slug}`} className="group block">
      <div className="aspect-[3/4] bg-gray-100 overflow-hidden mb-3">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="space-y-1">
        <p className="text-xs text-gray-400 uppercase tracking-wider">{product.brand}</p>
        <h3 className="text-sm font-medium text-gray-800 group-hover:text-brand-brown transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-brand-brown">{formatPrice(product.price)}</span>
          {product.originalPrice > product.price && (
            <>
              <span className="text-xs text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
              <span className="text-xs text-green-600 font-medium">{discount}% off</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
