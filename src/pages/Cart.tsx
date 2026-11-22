import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import {
  formatPrice,
  DELIVERY_CHARGE,
  FREE_DELIVERY_THRESHOLD,
} from '@/lib/utils';
import type { Coupon } from '@/types';
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  Tag,
  X,
  Truck,
  Check,
} from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';

export default function Cart() {
  const { items, loading, updateQuantity, removeItem, subtotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const discount = appliedCoupon
    ? appliedCoupon.discount_type === 'percentage'
      ? Math.min(
          (subtotal * appliedCoupon.discount_value) / 100,
          appliedCoupon.max_discount ?? Infinity,
        )
      : appliedCoupon.discount_value
    : 0;

  const deliveryCharge = subtotal >= FREE_DELIVERY_THRESHOLD || subtotal === 0 ? 0 : DELIVERY_CHARGE;
  const total = Math.max(0, subtotal - discount) + deliveryCharge;

  async function applyCoupon() {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', couponCode.trim().toUpperCase())
      .eq('is_active', true)
      .maybeSingle();
    setCouponLoading(false);
    if (error || !data) {
      setCouponError('Invalid coupon code');
      setAppliedCoupon(null);
      return;
    }
    const coupon = data as Coupon;
    if (coupon.min_order_amount && subtotal < coupon.min_order_amount) {
      setCouponError(`Minimum order amount is ${formatPrice(coupon.min_order_amount)}`);
      setAppliedCoupon(null);
      return;
    }
    if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) {
      setCouponError('This coupon has expired');
      setAppliedCoupon(null);
      return;
    }
    setAppliedCoupon(coupon);
  }

  function removeCoupon() {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  }

  function handleCheckout() {
    if (!user) {
      navigate('/login', { state: { from: '/cart' } });
      return;
    }
    navigate('/checkout', {
      state: { couponCode: appliedCoupon?.code, discount },
    });
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="h-8 bg-cream-100 rounded w-1/4 animate-pulse mb-8" />
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-4 h-32 animate-pulse" />
            ))}
          </div>
          <div className="card p-6 h-64 animate-pulse" />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center animate-fade-in">
        <div className="w-24 h-24 mx-auto rounded-full bg-cream-100 flex items-center justify-center mb-6">
          <ShoppingBag className="w-10 h-10 text-cream-400" />
        </div>
        <h1 className="font-display text-3xl font-bold text-neutral-900 mb-3">Your Cart is Empty</h1>
        <p className="text-neutral-500 mb-8">Looks like you haven't added any treats yet. Let's fix that!</p>
        <Link to="/catalog" className="btn-primary text-base px-8 py-3.5">
          Start Shopping <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Cart' }]} />
      <h1 className="font-display text-3xl font-bold text-neutral-900 mt-3 mb-8">Shopping Cart</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="card p-4 flex gap-4">
              <Link to={`/product/${item.product?.slug}`} className="shrink-0">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-cream-100">
                  {item.product?.image_url && (
                    <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
                  )}
                </div>
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/product/${item.product?.slug}`}>
                  <h3 className="font-semibold text-sm sm:text-base text-neutral-900 hover:text-brand-600 transition-colors line-clamp-1">
                    {item.product?.name}
                  </h3>
                </Link>
                <div className="mt-1 space-y-0.5">
                  <p className="text-xs text-neutral-500">Weight: {item.customization.weight ?? item.product?.weight_label}</p>
                  {item.customization.flavour && (
                    <p className="text-xs text-neutral-500">Flavour: {item.customization.flavour}</p>
                  )}
                  {item.customization.eggless !== undefined && (
                    <p className="text-xs text-neutral-500">
                      Type: {item.customization.eggless ? 'Eggless' : 'With Egg'}
                    </p>
                  )}
                  {item.customization.message && (
                    <p className="text-xs text-neutral-500">Message: "{item.customization.message}"</p>
                  )}
                  {item.customization.addon_names && item.customization.addon_names.length > 0 && (
                    <p className="text-xs text-neutral-500">Add-ons: {item.customization.addon_names.join(', ')}</p>
                  )}
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-neutral-200 rounded-lg">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1.5 hover:bg-cream-100 rounded-l-lg transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center text-sm font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1.5 hover:bg-cream-100 rounded-r-lg transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-neutral-900">
                      {formatPrice(item.unit_price * item.quantity)}
                    </span>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 rounded-lg text-neutral-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:sticky lg:top-32 h-fit space-y-4">
          <div className="card p-6">
            <h2 className="font-display text-xl font-bold text-neutral-900 mb-4">Order Summary</h2>

            {/* Coupon */}
            <div className="mb-4">
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3 rounded-xl bg-green-50 border border-green-200">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <div>
                      <p className="text-sm font-semibold text-green-800">{appliedCoupon.code}</p>
                      <p className="text-xs text-green-600">{appliedCoupon.description}</p>
                    </div>
                  </div>
                  <button onClick={removeCoupon} className="p-1 hover:bg-green-100 rounded">
                    <X className="w-4 h-4 text-green-600" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Coupon code"
                      className="input-field pl-9 text-sm"
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), applyCoupon())}
                    />
                  </div>
                  <button
                    onClick={applyCoupon}
                    disabled={couponLoading || !couponCode.trim()}
                    className="px-4 py-2.5 rounded-xl bg-neutral-900 text-white text-sm font-semibold hover:bg-neutral-800 transition-colors disabled:opacity-50"
                  >
                    Apply
                  </button>
                </div>
              )}
              {couponError && <p className="text-xs text-brand-600 mt-1">{couponError}</p>}
              {!appliedCoupon && (
                <p className="text-xs text-neutral-400 mt-1">Try WELCOME10 for 10% off</p>
              )}
            </div>

            <div className="space-y-2.5 py-4 border-t border-cream-200">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Subtotal</span>
                <span className="font-semibold text-neutral-900">{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">Discount</span>
                  <span className="font-semibold text-green-600">-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Delivery</span>
                <span className="font-semibold text-neutral-900">
                  {deliveryCharge === 0 ? (
                    <span className="text-green-600">FREE</span>
                  ) : (
                    formatPrice(deliveryCharge)
                  )}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-cream-200">
              <span className="font-display text-lg font-bold text-neutral-900">Total</span>
              <span className="font-display text-2xl font-bold text-brand-600">{formatPrice(total)}</span>
            </div>

            {subtotal < FREE_DELIVERY_THRESHOLD && (
              <div className="mt-3 p-2.5 rounded-lg bg-accent-50 flex items-center gap-2 text-xs text-accent-800">
                <Truck className="w-4 h-4 shrink-0" />
                Add {formatPrice(FREE_DELIVERY_THRESHOLD - subtotal)} more for free delivery!
              </div>
            )}

            <button onClick={handleCheckout} className="w-full btn-primary mt-4 text-base py-3.5">
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </button>
            <Link to="/catalog" className="block text-center text-sm text-neutral-500 hover:text-brand-600 mt-3">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
