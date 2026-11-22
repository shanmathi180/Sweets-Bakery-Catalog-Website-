import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import type { Category, Product } from '@/types';
import ProductCard from '@/components/ProductCard';
import { formatPrice } from '@/lib/utils';
import {
  ArrowRight,
  Truck,
  Cake,
  Gift,
  Clock,
  ShieldCheck,
  Star,
  Sparkles,
} from 'lucide-react';

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [bestsellerProducts, setBestsellerProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [catRes, featRes, bestRes] = await Promise.all([
        supabase.from('categories').select('*').eq('is_active', true).order('sort_order'),
        supabase
          .from('products')
          .select('*, category:categories(*)')
          .eq('is_active', true)
          .eq('is_featured', true)
          .order('rating', { ascending: false })
          .limit(8),
        supabase
          .from('products')
          .select('*, category:categories(*)')
          .eq('is_active', true)
          .eq('is_bestseller', true)
          .order('review_count', { ascending: false })
          .limit(4),
      ]);
      setCategories(catRes.data as Category[] ?? []);
      setFeaturedProducts(featRes.data as Product[] ?? []);
      setBestsellerProducts(bestRes.data as Product[] ?? []);
      setLoading(false);
    }
    loadData();
  }, []);

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-cream-50 to-accent-50">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-brand-400 blur-3xl" />
          <div className="absolute bottom-10 right-20 w-96 h-96 rounded-full bg-accent-400 blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 badge bg-white/80 text-brand-700 px-4 py-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Freshly baked every morning
              </div>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 leading-tight">
                Cakes & Sweets <br />
                <span className="bg-gradient-to-r from-brand-600 to-accent-500 bg-clip-text text-transparent">
                  Baked with Love
                </span>
              </h1>
              <p className="text-lg text-neutral-600 max-w-md leading-relaxed">
                Custom celebration cakes, fudgy brownies, and handcrafted pastries — delivered fresh to your door. Perfect for every occasion.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/catalog" className="btn-primary text-base px-8 py-3.5">
                  Order Now <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/catalog?category=gift-hampers" className="btn-secondary text-base px-8 py-3.5">
                  <Gift className="w-4 h-4" /> Gift Hampers
                </Link>
              </div>
              <div className="flex items-center gap-6 pt-4">
                <div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-4 h-4 fill-accent-500 text-accent-500" />
                    ))}
                  </div>
                  <p className="text-sm text-neutral-500 mt-1">4.8/5 from 2,000+ reviews</p>
                </div>
                <div className="h-10 w-px bg-neutral-300" />
                <div>
                  <p className="text-2xl font-bold text-neutral-900">10k+</p>
                  <p className="text-sm text-neutral-500">Happy customers</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/3]">
                <img
                  src="https://i.pinimg.com/736x/4f/db/d3/4fdbd31ebe1a0ea5bb7a9732a41d5d19.jpg"
                  alt="Beautiful chocolate cake"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3 hidden sm:flex">
                <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center">
                  <Cake className="w-6 h-6 text-brand-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-neutral-900">100% Fresh</p>
                  <p className="text-xs text-neutral-500">Baked daily</p>
                </div>
              </div>
              <div className="absolute -top-6 -right-6 bg-white rounded-2xl shadow-xl p-4 hidden sm:block">
                <p className="text-xs text-neutral-500">Starting from</p>
                <p className="text-xl font-bold text-brand-600">{formatPrice(249)}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="bg-white border-y border-cream-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Truck, title: 'Free Delivery', desc: 'On orders above &#8377;999' },
              { icon: Clock, title: 'Same-Day Delivery', desc: 'Order before 2 PM' },
              { icon: ShieldCheck, title: '100% Quality', desc: 'Fresh ingredients' },
              { icon: Gift, title: 'Custom Cakes', desc: 'Personalize your order' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                  <item.icon className="w-5 h-5 text-brand-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-900">{item.title}</p>
                  <p className="text-xs text-neutral-500" dangerouslySetInnerHTML={{ __html: item.desc }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-neutral-900">Shop by Category</h2>
          <p className="text-neutral-500 mt-2">Explore our full range of freshly baked treats</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-2xl bg-cream-100 animate-pulse" />
              ))
            : categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/catalog?category=${cat.slug}`}
                  className="group relative aspect-square rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all"
                >
                  {cat.image_url && (
                    <img
                      src={cat.image_url}
                      alt={cat.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 text-center">
                    <h3 className="text-white font-display font-semibold text-sm sm:text-base">{cat.name}</h3>
                  </div>
                </Link>
              ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-cream-100/50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-neutral-900">Featured Treats</h2>
              <p className="text-neutral-500 mt-2">Handpicked favourites our customers love</p>
            </div>
            <Link to="/catalog" className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="card p-4 animate-pulse">
                    <div className="aspect-square rounded-xl bg-cream-200 mb-3" />
                    <div className="h-4 bg-cream-200 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-cream-200 rounded w-1/2 mb-3" />
                    <div className="h-8 bg-cream-200 rounded" />
                  </div>
                ))
              : featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
          </div>
        </div>
      </section>

      {/* Offer Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-brand-600 to-accent-500 text-white">
          <div className="absolute inset-0 opacity-20">
            <img
              src="https://images.unsplash.com/photo-1551024601-bec78aea704b?w=1200&q=80"
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          <div className="relative px-8 py-12 sm:px-16 sm:py-16 max-w-2xl">
            <div className="badge bg-white/20 text-white mb-4">
              <Sparkles className="w-3.5 h-3.5 mr-1" /> Limited Time Offer
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-3">
              Get 10% Off Your First Order
            </h2>
            <p className="text-white/90 text-lg mb-6">
              Use code <span className="font-bold bg-white/20 px-3 py-0.5 rounded-lg">WELCOME10</span> at checkout to save on your first sweet treat.
            </p>
            <Link to="/catalog" className="inline-flex items-center gap-2 bg-white text-brand-600 font-semibold px-6 py-3 rounded-full hover:bg-cream-50 transition-colors">
              Shop Now <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Bestsellers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-neutral-900">Our Bestsellers</h2>
          <p className="text-neutral-500 mt-2">The most-loved treats from our bakery</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {bestsellerProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Testimonial / CTA */}
      <section className="bg-neutral-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="flex justify-center gap-1 mb-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className="w-5 h-5 fill-accent-500 text-accent-500" />
            ))}
          </div>
          <blockquote className="font-display text-2xl sm:text-3xl font-medium leading-relaxed mb-6">
            "The chocolate truffle cake was absolutely divine — moist, rich, and beautifully decorated. It made our anniversary so special!"
          </blockquote>
          <p className="text-neutral-400">Priya &amp; Rohan, Mumbai</p>
          <Link to="/catalog" className="mt-8 inline-flex btn-accent text-base px-8 py-3.5">
            Start Your Order <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
