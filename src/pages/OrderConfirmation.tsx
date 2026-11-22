import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import type { Order } from '@/types';
import { formatPrice } from '@/lib/utils';
import { CheckCircle2, Package, MapPin, Calendar, Clock, ArrowRight, Home } from 'lucide-react';

export default function OrderConfirmation() {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      const { data } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('order_number', orderNumber)
        .maybeSingle();
      setOrder(data as Order | null);
      setLoading(false);
    }
    if (orderNumber) loadOrder();
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-cream-200 border-t-brand-600 rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-bold mb-4">Order not found</h1>
        <Link to="/" className="btn-primary">Go Home</Link>
      </div>
    );
  }

  const addr = order.address_snapshot as {
    recipient_name: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  };

  return (
    <div className="animate-fade-in max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-8">
        <div className="w-20 h-20 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-4">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="font-display text-3xl font-bold text-neutral-900">Order Confirmed!</h1>
        <p className="text-neutral-500 mt-2">Thank you for your order. We're getting your treats ready!</p>
        <p className="text-sm text-neutral-400 mt-1">
          Order Number: <span className="font-mono font-semibold text-neutral-700">{order.order_number}</span>
        </p>
      </div>

      <div className="card p-6 mb-6">
        <h2 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
          <Package className="w-5 h-5 text-brand-600" /> Order Items
        </h2>
        <div className="space-y-3">
          {order.order_items?.map((item) => (
            <div key={item.id} className="flex gap-3">
              <div className="w-14 h-14 rounded-lg overflow-hidden bg-cream-100 shrink-0">
                {item.product_image && <img src={item.product_image} alt="" className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-neutral-900">{item.product_name}</p>
                <p className="text-xs text-neutral-500">Qty: {item.quantity} &times; {formatPrice(item.unit_price)}</p>
              </div>
              <span className="text-sm font-semibold text-neutral-900">{formatPrice(item.line_total)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-cream-200 space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-neutral-600">Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
          {order.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatPrice(order.discount)}</span></div>}
          <div className="flex justify-between"><span className="text-neutral-600">Delivery</span><span>{order.delivery_charge === 0 ? 'FREE' : formatPrice(order.delivery_charge)}</span></div>
          <div className="flex justify-between pt-2 border-t border-cream-200"><span className="font-bold">Total</span><span className="font-bold text-brand-600">{formatPrice(order.total)}</span></div>
        </div>
      </div>

      <div className="card p-6 mb-6">
        <h2 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-brand-600" /> Delivery Details
        </h2>
        <div className="space-y-2 text-sm">
          <p className="font-medium text-neutral-900">{addr?.recipient_name}</p>
          <p className="text-neutral-600">{addr?.line1}{addr?.line2 ? `, ${addr.line2}` : ''}</p>
          <p className="text-neutral-600">{addr?.city}, {addr?.state} - {addr?.pincode}</p>
          <p className="text-neutral-600">Phone: {addr?.phone}</p>
          <div className="flex items-center gap-4 pt-2 border-t border-cream-200 mt-3">
            <div className="flex items-center gap-2 text-neutral-600">
              <Calendar className="w-4 h-4 text-brand-600" />
              <span>{order.delivery_date ? new Date(order.delivery_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-600">
              <Clock className="w-4 h-4 text-brand-600" />
              <span>{order.delivery_slot ?? 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Link to={`/order-tracking/${order.order_number}`} className="flex-1 btn-primary">
          Track Order <ArrowRight className="w-4 h-4" />
        </Link>
        <Link to="/" className="flex-1 btn-secondary">
          <Home className="w-4 h-4" /> Back Home
        </Link>
      </div>
    </div>
  );
}
