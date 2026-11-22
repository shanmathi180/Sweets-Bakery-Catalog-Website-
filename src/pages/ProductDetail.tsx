import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import type { Product, ProductAddon, CartCustomization } from '@/types';
import {
  WEIGHT_OPTIONS,
  FLAVOUR_OPTIONS,
  formatPrice,
  discountPercent,
} from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useAuth } from '@/contexts/AuthContext';
import Breadcrumbs from '@/components/Breadcrumbs';
import ProductCard from '@/components/ProductCard';
import {
  Star,
  Heart,
  ShoppingBag,
  Minus,
  Plus,
  Truck,
  ShieldCheck,
  Clock,
  Check,
  ChevronRight,
} from 'lucide-react';

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { has, toggle } = useWishlist();
  const { user } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [addons, setAddons] = useState<ProductAddon[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  // Customization state
  const [weight, setWeight] = useState(WEIGHT_OPTIONS[0].label);
  const [flavour, setFlavour] = useState(FLAVOUR_OPTIONS[0]);
  const [eggless, setEggless] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

  const isCake = product?.category?.slug === 'cakes';

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(*)')
        .eq('slug', slug)
        .maybeSingle();
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      if (!data) {
        setError('Product not found');
        setLoading(false);
        return;
      }
      const prod = data as Product;
      setProduct(prod);

      const { data: addonData } = await supabase
        .from('product_addons')
        .select('*')
        .eq('product_id', prod.id)
        .eq('is_active', true);
      setAddons(addonData as ProductAddon[] ?? []);

      // Load related products
      if (prod.category_id) {
        const { data: related } = await supabase
          .from('products')
          .select('*, category:categories(*)')
          .eq('category_id', prod.category_id)
          .neq('id', prod.id)
          .eq('is_active', true)
          .limit(4);
        setRelatedProducts(related as Product[] ?? []);
      }

      // Reset customization
      setWeight(WEIGHT_OPTIONS[0].label);
      setFlavour(FLAVOUR_OPTIONS[0]);
      setEggless(false);
      setMessage('');
      setSelectedAddons([]);
      setQuantity(1);
      setActiveImage(0);
      setLoading(false);
    }
    loadProduct();
  }, [slug]);

  const weightOption = WEIGHT_OPTIONS.find((w) => w.label === weight);
  const weightMultiplier = isCake ? (weightOption?.priceModifier ?? 0) : 0;
  const baseCalculated = product ? product.base_price + product.base_price * weightMultiplier : 0;
  const addonsTotal = selectedAddons.reduce((sum, id) => {
    const addon = addons.find((a) => a.id === id);
    return sum + (addon?.price ?? 0);
  }, 0);
  const unitPrice = baseCalculated + addonsTotal;
  const totalPrice = unitPrice * quantity;
  const discount = product ? discountPercent(product.base_price, product.compare_at_price) : null;
  const gallery = product?.gallery ?? (product?.image_url ? [product.image_url] : []);

  function toggleAddon(id: string) {
    setSelectedAddons((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id],
    );
  }

  async function handleAddToCart() {
    if (!product) return;
    if (!user) {
      navigate('/login', { state: { from: `/product/${product.slug}` } });
      return;
    }
    setAdding(true);
    try {
      const customization: CartCustomization = {
        weight: isCake ? weight : product.weight_label,
        flavour: isCake ? flavour : undefined,
        eggless: isCake ? eggless : undefined,
        message: message || undefined,
        addon_ids: selectedAddons.length > 0 ? selectedAddons : undefined,
        addon_names: selectedAddons.length > 0
          ? selectedAddons.map((id) => addons.find((a) => a.id === id)?.name).filter(Boolean) as string[]
          : undefined,
      };
      await addItem(product, quantity, customization, unitPrice);
      navigate('/cart');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add to cart');
    } finally {
      setAdding(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          <div className="aspect-square rounded-3xl bg-cream-100 animate-pulse" />
          <div className="space-y-4">
            <div className="h-8 bg-cream-100 rounded w-3/4 animate-pulse" />
            <div className="h-4 bg-cream-100 rounded w-1/2 animate-pulse" />
            <div className="h-6 bg-cream-100 rounded w-1/3 animate-pulse" />
            <div className="h-32 bg-cream-100 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-bold text-neutral-900 mb-4">
          {error ?? 'Product not found'}
        </h1>
        <Link to="/catalog" className="btn-primary">Browse Products</Link>
      </div>
    );
  }

  const wished = has(product.id);

  return (
    <div className="animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Breadcrumbs
          items={[
            { label: 'Home', to: '/' },
            { label: 'Catalog', to: '/catalog' },
            ...(product.category
              ? [{ label: product.category.name, to: `/catalog?category=${product.category.slug}` }]
              : []),
            { label: product.name },
          ]}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Gallery */}
          <div className="space-y-4">
            <div className="aspect-square rounded-3xl overflow-hidden bg-cream-100 shadow-sm">
              {gallery[activeImage] && (
                <img
                  src={gallery[activeImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            {gallery.length > 1 && (
              <div className="flex gap-3">
                {gallery.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      activeImage === i ? 'border-brand-600 ring-2 ring-brand-600/20' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details & customization */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {product.is_bestseller && (
                  <span className="badge bg-accent-500 text-white">Bestseller</span>
                )}
                {product.is_featured && (
                  <span className="badge bg-brand-100 text-brand-700">Featured</span>
                )}
              </div>
              <h1 className="font-display text-3xl font-bold text-neutral-900 leading-tight">
                {product.name}
              </h1>
              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-accent-500 text-accent-500" />
                  <span className="text-sm font-semibold text-neutral-700">{product.rating}</span>
                </div>
                <span className="text-sm text-neutral-400">({product.review_count} reviews)</span>
                <span className="text-neutral-300">|</span>
                <span className="text-sm text-neutral-500">{product.weight_label}</span>
              </div>
            </div>

            <p className="text-neutral-600 leading-relaxed">{product.description}</p>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-neutral-900">{formatPrice(unitPrice)}</span>
              {product.compare_at_price && product.compare_at_price > product.base_price && (
                <>
                  <span className="text-lg text-neutral-400 line-through">{formatPrice(product.compare_at_price * (1 + weightMultiplier))}</span>
                  {discount && <span className="badge bg-brand-100 text-brand-700">{discount}% OFF</span>}
                </>
              )}
            </div>

            {/* Customization */}
            {isCake && (
              <div className="space-y-5 pt-4 border-t border-cream-200">
                <h3 className="font-display text-lg font-bold text-neutral-900">Customize Your Cake</h3>

                {/* Weight */}
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">Weight</label>
                  <div className="flex flex-wrap gap-2">
                    {WEIGHT_OPTIONS.map((opt) => (
                      <button
                        key={opt.label}
                        onClick={() => setWeight(opt.label)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                          weight === opt.label
                            ? 'border-brand-600 bg-brand-50 text-brand-700'
                            : 'border-neutral-200 text-neutral-600 hover:border-brand-300'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Flavour */}
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">Flavour</label>
                  <div className="flex flex-wrap gap-2">
                    {FLAVOUR_OPTIONS.map((f) => (
                      <button
                        key={f}
                        onClick={() => setFlavour(f)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                          flavour === f
                            ? 'border-brand-600 bg-brand-50 text-brand-700'
                            : 'border-neutral-200 text-neutral-600 hover:border-brand-300'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Egg / Eggless */}
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">Type</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEggless(false)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                        !eggless
                          ? 'border-brand-600 bg-brand-50 text-brand-700'
                          : 'border-neutral-200 text-neutral-600 hover:border-brand-300'
                      }`}
                    >
                      With Egg
                    </button>
                    <button
                      onClick={() => setEggless(true)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                        eggless
                          ? 'border-brand-600 bg-brand-50 text-brand-700'
                          : 'border-neutral-200 text-neutral-600 hover:border-brand-300'
                      }`}
                    >
                      Eggless
                    </button>
                  </div>
                </div>

                {/* Message on cake */}
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Message on Cake <span className="text-neutral-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value.slice(0, 30))}
                    placeholder="e.g. Happy Birthday Riya!"
                    className="input-field"
                    maxLength={30}
                  />
                  <p className="text-xs text-neutral-400 mt-1">{message.length}/30 characters</p>
                </div>
              </div>
            )}

            {/* Add-ons */}
            {addons.length > 0 && (
              <div className="pt-4 border-t border-cream-200">
                <label className="block text-sm font-semibold text-neutral-700 mb-3">Add Extras</label>
                <div className="space-y-2">
                  {addons.map((addon) => (
                    <label
                      key={addon.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-neutral-200 hover:border-brand-300 cursor-pointer transition-all has-[:checked]:border-brand-600 has-[:checked]:bg-brand-50"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedAddons.includes(addon.id)}
                          onChange={() => toggleAddon(addon.id)}
                          className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
                        />
                        <span className="text-sm font-medium text-neutral-700">{addon.name}</span>
                      </div>
                      <span className="text-sm font-semibold text-neutral-900">+{formatPrice(addon.price)}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity & Add to Cart */}
            <div className="pt-4 border-t border-cream-200 space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-sm font-semibold text-neutral-700">Quantity</label>
                <div className="flex items-center border-2 border-neutral-200 rounded-xl">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-2 hover:bg-cream-100 rounded-l-lg transition-colors"
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    className="p-2 hover:bg-cream-100 rounded-r-lg transition-colors"
                    disabled={quantity >= product.stock}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={adding || product.stock === 0}
                  className="flex-1 btn-primary text-base py-3.5"
                >
                  <ShoppingBag className="w-5 h-5" />
                  {adding ? 'Adding...' : product.stock === 0 ? 'Out of Stock' : `Add to Cart — ${formatPrice(totalPrice)}`}
                </button>
                <button
                  onClick={() => {
                    if (!user) {
                      navigate('/login', { state: { from: `/product/${product.slug}` } });
                      return;
                    }
                    toggle(product);
                  }}
                  className="w-12 h-12 rounded-full border-2 border-neutral-200 flex items-center justify-center hover:border-brand-300 transition-colors"
                  aria-label="Toggle wishlist"
                >
                  <Heart className={`w-5 h-5 ${wished ? 'fill-brand-600 text-brand-600' : 'text-neutral-400'}`} />
                </button>
              </div>

              {error && <p className="text-sm text-brand-600">{error}</p>}
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-cream-200">
              {[
                { icon: Truck, label: 'Free delivery over \u20B9999' },
                { icon: Clock, label: 'Same-day available' },
                { icon: ShieldCheck, label: '100% fresh quality' },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center text-center gap-1.5">
                  <item.icon className="w-5 h-5 text-brand-600" />
                  <span className="text-xs text-neutral-600">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Long description */}
        {product.long_description && (
          <div className="mt-16 max-w-3xl">
            <h2 className="font-display text-2xl font-bold text-neutral-900 mb-4">Product Details</h2>
            <p className="text-neutral-600 leading-relaxed">{product.long_description}</p>
          </div>
        )}

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl font-bold text-neutral-900">You May Also Like</h2>
              <Link
                to={product.category ? `/catalog?category=${product.category.slug}` : '/catalog'}
                className="flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700"
              >
                View More <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((rp) => (
                <ProductCard key={rp.id} product={rp} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
