import { useEffect, useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import type { Category, Product } from '@/types';
import ProductCard from '@/components/ProductCard';
import Breadcrumbs from '@/components/Breadcrumbs';
import { SlidersHorizontal, X, Search, ChevronDown } from 'lucide-react';

type SortOption = 'popularity' | 'price-low' | 'price-high' | 'rating' | 'newest';

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const query = searchParams.get('q') ?? '';
  const categorySlug = searchParams.get('category') ?? '';
  const sort = (searchParams.get('sort') as SortOption) ?? 'popularity';
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const eggless = searchParams.get('eggless') === 'true';

  useEffect(() => {
    async function loadCategories() {
      const { data } = await supabase.from('categories').select('*').eq('is_active', true).order('sort_order');
      setCategories(data as Category[] ?? []);
    }
    loadCategories();
  }, []);

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      let q = supabase
        .from('products')
        .select('*, category:categories(*)')
        .eq('is_active', true);

      if (query) {
        q = q.or(`name.ilike.%${query}%,description.ilike.%${query}%`);
      }
      if (categorySlug) {
        const cat = categories.find((c) => c.slug === categorySlug);
        if (cat) q = q.eq('category_id', cat.id);
      }

      const { data } = await q;
      setProducts(data as Product[] ?? []);
      setLoading(false);
    }
    loadProducts();
  }, [query, categorySlug, categories]);

  const filteredAndSorted = useMemo(() => {
    let result = [...products];

    if (minPrice) result = result.filter((p) => p.base_price >= Number(minPrice));
    if (maxPrice) result = result.filter((p) => p.base_price <= Number(maxPrice));
    if (eggless) {
      // Products in cakes category support eggless; we show all since customization is on detail page
      result = result.filter((p) => p.category?.slug === 'cakes');
    }

    switch (sort) {
      case 'price-low':
        result.sort((a, b) => a.base_price - b.base_price);
        break;
      case 'price-high':
        result.sort((a, b) => b.base_price - a.base_price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        result.sort((a, b) => (b.id > a.id ? 1 : -1));
        break;
      default:
        result.sort((a, b) => b.review_count - a.review_count);
    }
    return result;
  }, [products, minPrice, maxPrice, eggless, sort]);

  function updateParam(key: string, value: string | null) {
    const newParams = new URLSearchParams(searchParams);
    if (value === null || value === '') {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    setSearchParams(newParams);
  }

  const activeCategory = categories.find((c) => c.slug === categorySlug);
  const hasActiveFilters = !!(minPrice || maxPrice || eggless || query || categorySlug);

  return (
    <div className="animate-fade-in">
      {/* Page header */}
      <div className="bg-cream-100/50 border-b border-cream-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Breadcrumbs
            items={[
              { label: 'Home', to: '/' },
              { label: activeCategory ? activeCategory.name : 'All Products' },
            ]}
          />
          <h1 className="font-display text-3xl font-bold text-neutral-900 mt-3">
            {activeCategory ? activeCategory.name : query ? `Results for "${query}"` : 'All Products'}
          </h1>
          <p className="text-neutral-500 mt-1">
            {activeCategory?.description ?? 'Browse our complete range of freshly baked treats'}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Filters sidebar (desktop) */}
          <aside className="hidden lg:block w-64 shrink-0">
            <FilterPanel
              categories={categories}
              categorySlug={categorySlug}
              minPrice={minPrice}
              maxPrice={maxPrice}
              eggless={eggless}
              updateParam={updateParam}
            />
          </aside>
          {/* Products */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowFilters(true)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-full border border-neutral-300 text-sm font-medium hover:bg-cream-50 transition-colors"
                >
                  <SlidersHorizontal className="w-4 h-4" /> Filters
                </button>
                <span className="text-sm text-neutral-500">
                  {loading ? 'Loading...' : `${filteredAndSorted.length} product${filteredAndSorted.length !== 1 ? 's' : ''}`}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm text-neutral-500 hidden sm:inline">Sort by:</label>
                <div className="relative">
                  <select
                    value={sort}
                    onChange={(e) => updateParam('sort', e.target.value)}
                    className="appearance-none pl-4 pr-10 py-2 rounded-full border border-neutral-300 bg-white text-sm font-medium focus:outline-none focus:border-brand-500 cursor-pointer"
                  >
                    <option value="popularity">Popularity</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Rating</option>
                    <option value="newest">Newest</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Active filters */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {query && (
                  <span className="badge bg-brand-50 text-brand-700 gap-1.5 pr-1">
                    Search: {query}
                    <button onClick={() => updateParam('q', null)} className="hover:text-brand-900">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {categorySlug && (
                  <span className="badge bg-brand-50 text-brand-700 gap-1.5 pr-1">
                    {activeCategory?.name}
                    <button onClick={() => updateParam('category', null)} className="hover:text-brand-900">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {minPrice && (
                  <span className="badge bg-brand-50 text-brand-700 gap-1.5 pr-1">
                    Min: &#8377;{minPrice}
                    <button onClick={() => updateParam('minPrice', null)} className="hover:text-brand-900">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {maxPrice && (
                  <span className="badge bg-brand-50 text-brand-700 gap-1.5 pr-1">
                    Max: &#8377;{maxPrice}
                    <button onClick={() => updateParam('maxPrice', null)} className="hover:text-brand-900">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {eggless && (
                  <span className="badge bg-brand-50 text-brand-700 gap-1.5 pr-1">
                    Eggless
                    <button onClick={() => updateParam('eggless', null)} className="hover:text-brand-900">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                <button
                  onClick={() => setSearchParams(new URLSearchParams())}
                  className="text-xs text-brand-600 font-semibold hover:underline ml-1"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Grid */}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="card p-4 animate-pulse">
                    <div className="aspect-square rounded-xl bg-cream-200 mb-3" />
                    <div className="h-4 bg-cream-200 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-cream-200 rounded w-1/2 mb-3" />
                    <div className="h-8 bg-cream-200 rounded" />
                  </div>
                ))}
              </div>
            ) : filteredAndSorted.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {filteredAndSorted.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="w-20 h-20 mx-auto rounded-full bg-cream-100 flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-cream-400" />
                </div>
                <h3 className="font-display text-xl font-semibold text-neutral-900 mb-2">No products found</h3>
                <p className="text-neutral-500 mb-6">Try adjusting your filters or search terms</p>
                <Link to="/catalog" className="btn-primary">
                  Browse All Products
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {showFilters && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowFilters(false)} />
          <div className="relative w-80 max-w-[85vw] bg-white h-full overflow-y-auto animate-slide-down">
            <div className="flex items-center justify-between p-4 border-b border-neutral-100 sticky top-0 bg-white z-10">
              <h3 className="font-display text-lg font-bold">Filters</h3>
              <button onClick={() => setShowFilters(false)} className="p-2 rounded-full hover:bg-cream-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <FilterPanel
                categories={categories}
                categorySlug={categorySlug}
                minPrice={minPrice}
                maxPrice={maxPrice}
                eggless={eggless}
                updateParam={updateParam}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterPanel({
  categories,
  categorySlug,
  minPrice,
  maxPrice,
  eggless,
  updateParam,
}: {
  categories: Category[];
  categorySlug: string;
  minPrice: string | null;
  maxPrice: string | null;
  eggless: boolean;
  updateParam: (key: string, value: string | null) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-sm text-neutral-900 mb-3">Categories</h3>
        <ul className="space-y-2">
          <li>
            <button
              onClick={() => updateParam('category', null)}
              className={`text-sm transition-colors ${!categorySlug ? 'text-brand-600 font-semibold' : 'text-neutral-600 hover:text-brand-600'}`}
            >
              All Products
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat.id}>
              <button
                onClick={() => updateParam('category', cat.slug)}
                className={`text-sm transition-colors ${categorySlug === cat.slug ? 'text-brand-600 font-semibold' : 'text-neutral-600 hover:text-brand-600'}`}
              >
                {cat.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="font-semibold text-sm text-neutral-900 mb-3">Price Range</h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-neutral-500">Min Price</label>
            <input
              type="number"
              value={minPrice ?? ''}
              onChange={(e) => updateParam('minPrice', e.target.value || null)}
              placeholder="0"
              className="input-field text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-neutral-500">Max Price</label>
            <input
              type="number"
              value={maxPrice ?? ''}
              onChange={(e) => updateParam('maxPrice', e.target.value || null)}
              placeholder="2000"
              className="input-field text-sm"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-sm text-neutral-900 mb-3">Preferences</h3>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={eggless}
            onChange={(e) => updateParam('eggless', e.target.checked ? 'true' : null)}
            className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
          />
          <span className="text-sm text-neutral-600">Eggless available</span>
        </label>
      </div>
    </div>
  );
}
