import { Link } from 'react-router-dom';
import {
  Cake,
  Heart,
  Award,
  Leaf,
  Truck,
  Users,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export default function About() {
  const values = [
    { icon: Heart, title: 'Baked with Love', desc: 'Every cake and pastry is crafted with care by our expert bakers.' },
    { icon: Leaf, title: 'Fresh Ingredients', desc: 'We use only the finest quality ingredients, sourced locally.' },
    { icon: Award, title: 'Award Winning', desc: 'Recognised as the best bakery in the city for 3 years running.' },
    { icon: Truck, title: 'Fast Delivery', desc: 'Same-day delivery available across the city. Fresh to your door.' },
  ];

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-brand-50 via-cream-50 to-accent-50 py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-20 w-72 h-72 rounded-full bg-brand-400 blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 badge bg-white/80 text-brand-700 px-4 py-1.5 mb-6">
            <Sparkles className="w-3.5 h-3.5" /> Our Story
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-neutral-900 leading-tight">
            Bringing Joy Through <span className="bg-gradient-to-r from-brand-600 to-accent-500 bg-clip-text text-transparent">Fresh Bakes</span>
          </h1>
          <p className="text-lg text-neutral-600 mt-6 leading-relaxed">
            Shan's Sweets & Bakery started as a small neighbourhood kitchen with a big dream — to make every celebration memorable with freshly baked, custom-made treats. Today, we serve thousands of happy customers across the city, and every cake still gets the same love and attention as our very first one.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((v, i) => (
            <div key={i} className="card p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-brand-50 flex items-center justify-center mb-4">
                <v.icon className="w-7 h-7 text-brand-600" />
              </div>
              <h3 className="font-display text-lg font-bold text-neutral-900 mb-2">{v.title}</h3>
              <p className="text-sm text-neutral-500">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Story image */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="rounded-3xl overflow-hidden shadow-xl aspect-[4/3]">
            <img
              src="https://images.unsplash.com/photo-1517433670267-08711f3a7bff?w=900&q=80"
              alt="Bakery interior"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="space-y-4">
            <h2 className="font-display text-3xl font-bold text-neutral-900">From Our Kitchen to Your Celebration</h2>
            <p className="text-neutral-600 leading-relaxed">
              Every morning at 4 AM, our bakers fire up the ovens to ensure your cakes, brownies, and pastries are baked fresh that day. We never use preservatives or artificial flavours — just butter, chocolate, fruit, and a lot of passion.
            </p>
            <p className="text-neutral-600 leading-relaxed">
              Whether it's a birthday, anniversary, wedding, or just a sweet craving, we're here to make it special. Custom cakes, gift hampers, and same-day delivery — we've got you covered.
            </p>
            <div className="flex items-center gap-6 pt-4">
              <div className="text-center">
                <p className="font-display text-3xl font-bold text-brand-600">10k+</p>
                <p className="text-sm text-neutral-500">Orders Delivered</p>
              </div>
              <div className="text-center">
                <p className="font-display text-3xl font-bold text-brand-600">4.8</p>
                <p className="text-sm text-neutral-500">Average Rating</p>
              </div>
              <div className="text-center">
                <p className="font-display text-3xl font-bold text-brand-600">50+</p>
                <p className="text-sm text-neutral-500">Unique Products</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-neutral-900 text-white py-16 mt-8">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <Cake className="w-12 h-12 mx-auto text-accent-400 mb-4" />
          <h2 className="font-display text-3xl font-bold mb-4">Ready to Treat Yourself?</h2>
          <p className="text-neutral-400 mb-8">Browse our full range of freshly baked goodies and place your order today.</p>
          <Link to="/catalog" className="inline-flex btn-accent text-base px-8 py-3.5">
            Shop Now <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
