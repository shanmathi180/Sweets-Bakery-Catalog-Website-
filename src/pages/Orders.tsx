import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { Order, OrderStatus } from '@/types';
import { formatPrice } from '@/lib/utils';
import { Package, ArrowRight, ChevronRight } from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: 'Pending Payment',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  ready: 'Ready',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending_payment: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-accent-100 text-accent-800',
  ready: 'bg-purple-100 text-purple-800',
  out_for_delivery: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-brand-100 text-brand-800',
};

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      if (!user) return;
      const { data } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setOrders(data as Order[] ?? []);
      setLoading(false);
    }
    loadOrders();
  }, [user]);

  return (
    <div className="animate-fade-in max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Order History' }]} />
      <h1 className="font-display text-3xl font-bold text-neutral-900 mt-3 mb-8">Order History</h1>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-6 h-32 animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 mx-auto rounded-full bg-cream-100 flex items-center justify-center mb-4">
            <Package className="w-8 h-8 text-cream-400" />
          </div>
          <h2 className="font-display text-xl font-bold text-neutral-900 mb-2">No orders yet</h2>
          <p className="text-neutral-500 mb-6">Your order history will appear here once you place an order.</p>
          <Link to="/catalog" className="btn-primary">
            Start Shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="card p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm font-semibold text-neutral-900">{order.order_number}</span>
                    <span className={`badge ${STATUS_COLORS[order.status]}`}>{STATUS_LABELS[order.status]}</span>
                  </div>
                  <p className="text-xs text-neutral-500">
                    Placed on {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <span className="font-display text-xl font-bold text-brand-600">{formatPrice(order.total)}</span>
              </div>

              <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
                {order.order_items?.slice(0, 4).map((item) => (
                  <div key={item.id} className="flex items-center gap-2 shrink-0">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-cream-100">
                      {item.product_image && <img src={item.product_image} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <div className="text-xs">
                      <p className="font-medium text-neutral-900 line-clamp-1 max-w-[120px]">{item.product_name}</p>
                      <p className="text-neutral-500">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
                {order.order_items && order.order_items.length > 4 && (
                  <p className="text-xs text-neutral-500 self-center">+{order.order_items.length - 4} more</p>
                )}
              </div>

              <Link
                to={`/order-tracking/${order.order_number}`}
                className="text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
              >
                Track Order <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
