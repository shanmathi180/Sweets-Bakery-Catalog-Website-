import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import type { Order, OrderStatus } from '@/types';
import { formatPrice } from '@/lib/utils';
import {
  CheckCircle2,
  Package,
  ChefHat,
  ShoppingBag,
  Truck,
  Home,
  Clock,
  XCircle,
  ArrowRight,
} from 'lucide-react';

const STATUS_STEPS: { status: OrderStatus; label: string; icon: typeof Package }[] = [
  { status: 'confirmed', label: 'Order Confirmed', icon: CheckCircle2 },
  { status: 'preparing', label: 'Preparing', icon: ChefHat },
  { status: 'ready', label: 'Ready for Delivery', icon: ShoppingBag },
  { status: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
  { status: 'delivered', label: 'Delivered', icon: Home },
];

export default function OrderTracking() {
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
        <Link to="/orders" className="btn-primary">View All Orders</Link>
      </div>
    );
  }

  const isCancelled = order.status === 'cancelled';
  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.status === order.status);
  const addr = order.address_snapshot as { recipient_name: string; line1: string; city: string; state: string; pincode: string; phone: string };

  return (
    <div className="animate-fade-in max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-neutral-900">Track Your Order</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Order <span className="font-mono font-semibold text-neutral-700">{order.order_number}</span>
        </p>
      </div>

      {isCancelled ? (
        <div className="card p-8 text-center mb-6">
          <XCircle className="w-16 h-16 text-brand-600 mx-auto mb-4" />
          <h2 className="font-display text-xl font-bold text-neutral-900">Order Cancelled</h2>
          <p className="text-neutral-500 mt-2">This order has been cancelled. Please contact us for assistance.</p>
        </div>
      ) : (
        <div className="card p-6 mb-6">
          <div className="space-y-0">
            {STATUS_STEPS.map((step, index) => {
              const isCompleted = index < currentStepIndex;
              const isCurrent = index === currentStepIndex;
              const isLast = index === STATUS_STEPS.length - 1;
              return (
                <div key={step.status} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        isCompleted
                          ? 'bg-green-500 text-white'
                          : isCurrent
                            ? 'bg-brand-600 text-white ring-4 ring-brand-100'
                            : 'bg-neutral-100 text-neutral-400'
                      }`}
                    >
                      <step.icon className="w-5 h-5" />
                    </div>
                    {!isLast && (
                      <div className={`w-0.5 h-12 ${isCompleted ? 'bg-green-500' : 'bg-neutral-200'}`} />
                    )}
                  </div>
                  <div className="pt-2 pb-8">
                    <p
                      className={`font-semibold text-sm ${
                        isCompleted || isCurrent ? 'text-neutral-900' : 'text-neutral-400'
                      }`}
                    >
                      {step.label}
                    </p>
                    {isCurrent && (
                      <p className="text-xs text-brand-600 mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> In progress
                      </p>
                    )}
                    {isCompleted && (
                      <p className="text-xs text-green-600 mt-0.5">Completed</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Order details */}
      <div className="card p-6 mb-6">
        <h2 className="font-display text-lg font-bold mb-4">Order Details</h2>
        <div className="space-y-3">
          {order.order_items?.map((item) => (
            <div key={item.id} className="flex gap-3">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-cream-100 shrink-0">
                {item.product_image && <img src={item.product_image} alt="" className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-neutral-900">{item.product_name}</p>
                <p className="text-xs text-neutral-500">Qty: {item.quantity}</p>
              </div>
              <span className="text-sm font-semibold">{formatPrice(item.line_total)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-cream-200 flex justify-between">
          <span className="font-bold">Total</span>
          <span className="font-bold text-brand-600">{formatPrice(order.total)}</span>
        </div>
      </div>

      <div className="card p-6 mb-6">
        <h2 className="font-display text-lg font-bold mb-3">Delivery Address</h2>
        <p className="text-sm font-medium text-neutral-900">{addr?.recipient_name}</p>
        <p className="text-sm text-neutral-600">{addr?.line1}, {addr?.city}, {addr?.state} - {addr?.pincode}</p>
        <p className="text-sm text-neutral-600 mt-1">Phone: {addr?.phone}</p>
        {order.delivery_date && (
          <div className="flex items-center gap-2 mt-3 text-sm text-neutral-600">
            <Clock className="w-4 h-4 text-brand-600" />
            {new Date(order.delivery_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} &middot; {order.delivery_slot}
          </div>
        )}
      </div>

      <Link to="/orders" className="btn-secondary">
        <Package className="w-4 h-4" /> View All Orders <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
