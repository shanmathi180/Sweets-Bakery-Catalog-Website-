import { Link } from 'react-router-dom';
import { useWishlist } from '@/contexts/WishlistContext';
import ProductCard from '@/components/ProductCard';
import { Heart, ArrowRight } from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';

export default function Wishlist() {
  const { items, loading } = useWishlist();

  return (
    <div className="animate-fade-in max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Wishlist' }]} />
      <h1 className="font-display text-3xl font-bold text-neutral-900 mt-3 mb-8">My Wishlist</h1>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="aspect-square rounded-xl bg-cream-200 mb-3" />
              <div className="h-4 bg-cream-200 rounded w-3/4 mb-2" />
              <div className="h-8 bg-cream-200 rounded" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 mx-auto rounded-full bg-cream-100 flex items-center justify-center mb-4">
            <Heart className="w-8 h-8 text-cream-400" />
          </div>
          <h2 className="font-display text-xl font-bold text-neutral-900 mb-2">Your wishlist is empty</h2>
          <p className="text-neutral-500 mb-6">Save your favourite treats for later by tapping the heart icon.</p>
          <Link to="/catalog" className="btn-primary">
            Browse Products <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {items.map((item) => item.product && (
            <ProductCard key={item.id} product={item.product} />
          ))}
        </div>
      )}
    </div>
  );
}
