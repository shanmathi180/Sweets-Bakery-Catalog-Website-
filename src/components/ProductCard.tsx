import { Link } from 'react-router-dom';
import type { Product } from '@/types';
import { formatPrice, discountPercent } from '@/lib/utils';
import { Heart, Star } from 'lucide-react';
import { useWishlist } from '@/contexts/WishlistContext';

type Props = {
  product: Product;
};

export default function ProductCard({ product }: Props) {
  const { has, toggle } = useWishlist();
  const discount = discountPercent(product.base_price, product.compare_at_price);
  const wished = has(product.id);

  return (
    <div className="group card overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      <Link to={`/product/${product.slug}`} className="block relative overflow-hidden">
        <div className="aspect-square overflow-hidden bg-cream-100">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-cream-400">
              <span className="text-4xl font-display">SB</span>
            </div>
          )}
        </div>
        {discount && (
          <span className="absolute top-3 left-3 badge bg-brand-600 text-white">
            {discount}% OFF
          </span>
        )}
        {product.is_bestseller && (
          <span className="absolute top-3 right-3 badge bg-accent-500 text-white">
            Bestseller
          </span>
        )}
      </Link>

      <button
        onClick={() => toggle(product)}
        className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur shadow-sm flex items-center justify-center transition-all hover:bg-white z-10"
        style={{ marginTop: product.is_bestseller ? '32px' : '0' }}
        aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <Heart
          className={`w-4 h-4 transition-all ${wished ? 'fill-brand-600 text-brand-600' : 'text-neutral-400'}`}
        />
      </button>

      <div className="p-4">
        <div className="flex items-center gap-1 mb-1">
          <Star className="w-3.5 h-3.5 fill-accent-500 text-accent-500" />
          <span className="text-xs font-semibold text-neutral-700">{product.rating}</span>
          <span className="text-xs text-neutral-400">({product.review_count})</span>
        </div>
        <Link to={`/product/${product.slug}`}>
          <h3 className="font-semibold text-sm text-neutral-900 leading-snug line-clamp-2 hover:text-brand-600 transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="text-xs text-neutral-500 mt-1">{product.weight_label}</p>
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-lg font-bold text-neutral-900">{formatPrice(product.base_price)}</span>
          {product.compare_at_price && product.compare_at_price > product.base_price && (
            <span className="text-sm text-neutral-400 line-through">{formatPrice(product.compare_at_price)}</span>
          )}
        </div>
        <Link
          to={`/product/${product.slug}`}
          className="mt-3 w-full btn-primary text-xs py-2"
        >
          View & Customize
        </Link>
      </div>
    </div>
  );
}
