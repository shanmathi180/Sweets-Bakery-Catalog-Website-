import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import type { Address, Coupon } from '@/types';
import {
  formatPrice,
  generateOrderNumber,
  DELIVERY_CHARGE,
  FREE_DELIVERY_THRESHOLD,
  DELIVERY_SLOTS,
} from '@/lib/utils';
import {
  MapPin,
  Calendar,
  Clock,
  Check,
  ArrowRight,
  Plus,
  CreditCard,
  Truck,
  Loader2,
} from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const passedCoupon = (location.state as { couponCode?: string })?.couponCode ?? null;

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliverySlot, setDeliverySlot] = useState('');
  const [notes, setNotes] = useState('');
  const [couponCode, setCouponCode] = useState(passedCoupon ?? '');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');

  // New address form
  const [newAddr, setNewAddr] = useState({
    label: 'Home',
    recipient_name: profile?.full_name ?? '',
    phone: profile?.phone ?? '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
  });

  useEffect(() => {
    async function loadAddresses() {
      if (!user) return;
      const { data } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });
      const addrList = data as Address[] ?? [];
      setAddresses(addrList);
      const defaultAddr = addrList.find((a) => a.is_default) ?? addrList[0];
      if (defaultAddr) setSelectedAddressId(defaultAddr.id);
      else if (addrList.length === 0) setShowAddressForm(true);
    }
    loadAddresses();
  }, [user]);

  useEffect(() => {
    if (passedCoupon) {
      applyCouponFromCode(passedCoupon);
    }
  }, [passedCoupon]);

  const discount = appliedCoupon
    ? appliedCoupon.discount_type === 'percentage'
      ? Math.min((subtotal * appliedCoupon.discount_value) / 100, appliedCoupon.max_discount ?? Infinity)
      : appliedCoupon.discount_value
    : 0;
  const deliveryCharge = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE;
  const total = Math.max(0, subtotal - discount) + deliveryCharge;

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];
  const maxDate = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  async function applyCouponFromCode(code: string) {
    const { data } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .maybeSingle();
    if (data) {
      const coupon = data as Coupon;
      if ((!coupon.min_order_amount || subtotal >= coupon.min_order_amount) &&
          (!coupon.valid_until || new Date(coupon.valid_until) > new Date())) {
        setAppliedCoupon(coupon);
      }
    }
  }

  async function handleApplyCoupon() {
    if (!couponCode.trim()) return;
    await applyCouponFromCode(couponCode);
    if (!appliedCoupon) setError('Invalid or inapplicable coupon code');
  }

  async function saveAddress(): Promise<Address | null> {
    if (!user) return null;
    const { data, error } = await supabase
      .from('addresses')
      .insert({ ...newAddr, user_id: user.id })
      .select()
      .single();
    if (error) {
      setError(error.message);
      return null;
    }
    const addr = data as Address;
    setAddresses((prev) => [...prev, addr]);
    setSelectedAddressId(addr.id);
    setShowAddressForm(false);
    return addr;
  }

  async function handlePlaceOrder() {
    setError('');
    if (!user) {
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }
    if (items.length === 0) {
      setError('Your cart is empty');
      return;
    }
    let address = addresses.find((a) => a.id === selectedAddressId);
    if (!address) {
      if (showAddressForm) {
        address = await saveAddress();
        if (!address) return;
      } else {
        setError('Please select a delivery address');
        return;
      }
    }
    if (!deliveryDate) {
      setError('Please select a delivery date');
      return;
    }
    if (!deliverySlot) {
      setError('Please select a delivery time slot');
      return;
    }

    setPlacing(true);
    try {
      const orderNumber = generateOrderNumber();
      const addressSnapshot = {
        label: address.label,
        recipient_name: address.recipient_name,
        phone: address.phone,
        line1: address.line1,
        line2: address.line2,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
      };
      const recipientSnapshot = {
        name: address.recipient_name,
        phone: address.phone,
      };

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          order_number: orderNumber,
          status: 'confirmed',
          payment_status: 'paid',
          subtotal,
          discount,
          delivery_charge: deliveryCharge,
          total,
          coupon_code: appliedCoupon?.code ?? null,
          address_snapshot: addressSnapshot,
          recipient_snapshot: recipientSnapshot,
          delivery_date: deliveryDate,
          delivery_slot: deliverySlot,
          notes: notes || null,
        })
        .select()
        .single();

      if (orderError) throw new Error(orderError.message);

      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product?.name ?? 'Product',
        product_image: item.product?.image_url ?? null,
        quantity: item.quantity,
        customization: item.customization,
        unit_price: item.unit_price,
        line_total: item.unit_price * item.quantity,
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw new Error(itemsError.message);

      await clearCart();
      navigate(`/order-confirmation/${orderNumber}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-bold text-neutral-900 mb-4">Your cart is empty</h1>
        <Link to="/catalog" className="btn-primary">Browse Products</Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Cart', to: '/cart' }, { label: 'Checkout' }]} />
      <h1 className="font-display text-3xl font-bold text-neutral-900 mt-3 mb-8">Checkout</h1>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-brand-50 border border-brand-200 text-sm text-brand-700">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Delivery Address */}
          <section className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-bold flex items-center gap-2">
                <MapPin className="w-5 h-5 text-brand-600" /> Delivery Address
              </h2>
              {addresses.length > 0 && !showAddressForm && (
                <button
                  onClick={() => setShowAddressForm(true)}
                  className="text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add New
                </button>
              )}
            </div>

            {addresses.length > 0 && !showAddressForm && (
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <label
                    key={addr.id}
                    className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedAddressId === addr.id
                        ? 'border-brand-600 bg-brand-50'
                        : 'border-neutral-200 hover:border-brand-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      checked={selectedAddressId === addr.id}
                      onChange={() => setSelectedAddressId(addr.id)}
                      className="mt-1 text-brand-600"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-neutral-900">{addr.recipient_name}</span>
                        <span className="badge bg-cream-100 text-neutral-600">{addr.label}</span>
                        {addr.is_default && <span className="badge bg-green-100 text-green-700">Default</span>}
                      </div>
                      <p className="text-sm text-neutral-600 mt-1">
                        {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}, {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                      <p className="text-sm text-neutral-500 mt-0.5">Phone: {addr.phone}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}

            {showAddressForm && (
              <div className="space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1">Label</label>
                    <select
                      value={newAddr.label}
                      onChange={(e) => setNewAddr({ ...newAddr, label: e.target.value })}
                      className="input-field text-sm"
                    >
                      <option>Home</option>
                      <option>Work</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1">Recipient Name</label>
                    <input
                      type="text"
                      value={newAddr.recipient_name}
                      onChange={(e) => setNewAddr({ ...newAddr, recipient_name: e.target.value })}
                      className="input-field text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={newAddr.phone}
                      onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                      className="input-field text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1">Pincode</label>
                    <input
                      type="text"
                      value={newAddr.pincode}
                      onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                      className="input-field text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1">Address Line 1</label>
                  <input
                    type="text"
                    value={newAddr.line1}
                    onChange={(e) => setNewAddr({ ...newAddr, line1: e.target.value })}
                    placeholder="House no, building name"
                    className="input-field text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1">Address Line 2 (optional)</label>
                  <input
                    type="text"
                    value={newAddr.line2}
                    onChange={(e) => setNewAddr({ ...newAddr, line2: e.target.value })}
                    placeholder="Street, area"
                    className="input-field text-sm"
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1">City</label>
                    <input
                      type="text"
                      value={newAddr.city}
                      onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                      className="input-field text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1">State</label>
                    <input
                      type="text"
                      value={newAddr.state}
                      onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                      className="input-field text-sm"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => saveAddress()} className="btn-primary text-sm py-2.5">
                    Save Address
                  </button>
                  {addresses.length > 0 && (
                    <button onClick={() => setShowAddressForm(false)} className="btn-secondary text-sm py-2.5">
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* Delivery Date & Time */}
          <section className="card p-6">
            <h2 className="font-display text-xl font-bold flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-brand-600" /> Delivery Schedule
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">Delivery Date</label>
                <input
                  type="date"
                  min={minDate}
                  max={maxDate}
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="input-field"
                />
                <p className="text-xs text-neutral-400 mt-1">Choose a date within the next 14 days</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">Time Slot</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {DELIVERY_SLOTS.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => setDeliverySlot(slot)}
                      className={`px-3 py-2.5 rounded-xl text-xs font-medium border-2 transition-all flex items-center gap-1.5 ${
                        deliverySlot === slot
                          ? 'border-brand-600 bg-brand-50 text-brand-700'
                          : 'border-neutral-200 text-neutral-600 hover:border-brand-300'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Order Notes <span className="text-neutral-400 font-normal">(optional)</span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special instructions for delivery..."
                  className="input-field min-h-[80px]"
                  maxLength={200}
                />
              </div>
            </div>
          </section>

          {/* Payment Method (simulated) */}
          <section className="card p-6">
            <h2 className="font-display text-xl font-bold flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-brand-600" /> Payment Method
            </h2>
            <div className="p-4 rounded-xl border-2 border-brand-600 bg-brand-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-brand-600 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-neutral-900">Razorpay (Test Mode)</p>
                  <p className="text-xs text-neutral-500">Pay securely with card, UPI, or wallet</p>
                </div>
                <Check className="w-5 h-5 text-brand-600 ml-auto" />
              </div>
            </div>
            <p className="text-xs text-neutral-400 mt-2">
              Payment will be processed securely at the next step. This is a test environment — no real charges will be made.
            </p>
          </section>
        </div>

        {/* Summary */}
        <div className="lg:sticky lg:top-32 h-fit">
          <div className="card p-6">
            <h2 className="font-display text-xl font-bold text-neutral-900 mb-4">Order Summary</h2>

            <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-cream-100 shrink-0">
                    {item.product?.image_url && (
                      <img src={item.product.image_url} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900 line-clamp-1">{item.product?.name}</p>
                    <p className="text-xs text-neutral-500">Qty: {item.quantity} &times; {formatPrice(item.unit_price)}</p>
                  </div>
                  <span className="text-sm font-semibold text-neutral-900">
                    {formatPrice(item.unit_price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Coupon */}
            <div className="flex gap-2 mb-4 pt-4 border-t border-cream-200">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Coupon code"
                className="input-field text-sm"
                disabled={!!appliedCoupon}
              />
              {appliedCoupon ? (
                <button
                  onClick={() => { setAppliedCoupon(null); setCouponCode(''); }}
                  className="px-4 rounded-xl bg-neutral-200 text-neutral-700 text-sm font-semibold"
                >
                  Remove
                </button>
              ) : (
                <button
                  onClick={handleApplyCoupon}
                  className="px-4 py-2.5 rounded-xl bg-neutral-900 text-white text-sm font-semibold hover:bg-neutral-800"
                >
                  Apply
                </button>
              )}
            </div>

            <div className="space-y-2.5 py-4 border-t border-cream-200 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-600">Subtotal</span>
                <span className="font-semibold">{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-green-600">Discount</span>
                  <span className="font-semibold text-green-600">-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-neutral-600">Delivery</span>
                <span className="font-semibold">
                  {deliveryCharge === 0 ? <span className="text-green-600">FREE</span> : formatPrice(deliveryCharge)}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-cream-200">
              <span className="font-display text-lg font-bold">Total</span>
              <span className="font-display text-2xl font-bold text-brand-600">{formatPrice(total)}</span>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={placing}
              className="w-full btn-primary mt-4 text-base py-3.5"
            >
              {placing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Placing Order...
                </>
              ) : (
                <>Place Order <ArrowRight className="w-4 h-4" /></>
              )}
            </button>

            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-neutral-400">
              <Truck className="w-4 h-4" /> Free delivery on orders above {formatPrice(FREE_DELIVERY_THRESHOLD)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
