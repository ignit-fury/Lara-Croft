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
      <div className="relative aspect-square overflow-hidden mb-0" style={{ background: '#efefef' }}>
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-[1.06] transition-transform duration-500"
        />
        {/* Sale badge */}
        {discount > 0 && (
          <span className="absolute top-3 left-3 bg-brand-accent text-brand-cream py-1 px-3 text-[10px] font-bold uppercase tracking-[1px] z-10">
            Sale<span className="opacity-70 ml-0.5">{discount}% OFF</span>
          </span>
        )}
        {/* Quick View */}
        <button className="absolute bottom-3 left-1/2 -translate-x-1/2 translate-y-2 bg-white/8 backdrop-blur-md text-white border border-white/18 py-2 px-5 text-[11px] font-semibold uppercase tracking-[1px] opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 whitespace-nowrap">
          Quick View
        </button>
      </div>
      <div className="p-3.5 border border-t-0 border-brand-border bg-brand-card group-hover:bg-brand-card2 transition-colors">
        <div className="text-[10px] uppercase tracking-[1.5px] text-brand-accent font-semibold mb-0.5">{product.brand}</div>
        <h3 className="text-[14px] font-semibold text-brand-text mb-1.5 leading-tight">{product.name}</h3>
        {product.sizes?.length > 0 && (
          <div className="flex gap-1.5 mb-2 flex-wrap">
            {product.sizes.slice(0, 4).map((size) => (
              <span key={size} className="bg-brand-bg2 text-brand-muted py-0.5 px-2 text-[10px] font-semibold rounded-sm border border-brand-border">
                {size}
              </span>
            ))}
            {product.sizes.length > 4 && (
              <span className="text-brand-accent py-0.5 px-2 text-[10px] font-semibold">+{product.sizes.length - 4}</span>
            )}
          </div>
        )}
        <div className="flex items-baseline gap-2">
          <span className="text-[17px] font-extrabold">{formatPrice(product.price)}</span>
          {product.originalPrice > product.price && (
            <span className="text-[13px] text-brand-muted line-through">{formatPrice(product.originalPrice)}</span>
          )}
        </div>
        <div className={`flex items-center gap-1.5 text-[10px] font-semibold mt-1.5 ${product.stock > 0 ? 'text-brand-cream' : 'text-brand-muted'}`}>
          <span className={`w-[5px] h-[5px] rounded-full ${product.stock > 0 ? 'bg-brand-cream' : 'bg-brand-muted'}`} />
          {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
        </div>
      </div>
    </Link>
  );
}
