import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Order, OrderStatus } from '@/types';
import { formatPrice } from '@/lib/utils';
import { Search, Loader2, ShoppingCart, X, Eye } from 'lucide-react';

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: 'pending_payment', label: 'Pending Payment' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'ready', label: 'Ready' },
  { value: 'out_for_delivery', label: 'Out for Delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending_payment: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-accent-100 text-accent-800',
  ready: 'bg-purple-100 text-purple-800',
  out_for_delivery: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-brand-100 text-brand-800',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const [updating, setUpdating] = useState(false);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    let q = supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false });
    if (statusFilter) q = q.eq('status', statusFilter);
    const { data } = await q;
    setOrders(data as Order[] ?? []);
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const filtered = orders.filter((o) =>
    o.order_number.toLowerCase().includes(search.toLowerCase()),
  );

  async function updateStatus(orderId: string, status: OrderStatus) {
    setUpdating(true);
    const { error } = await supabase.from('orders').update({ status, updated_at: new Date().toISOString() }).eq('id', orderId);
    setUpdating(false);
    if (error) {
      alert(error.message);
      return;
    }
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
    if (viewOrder?.id === orderId) setViewOrder({ ...viewOrder, status });
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-neutral-900">Orders</h1>
        <p className="text-sm text-neutral-500 mt-1">{orders.length} orders</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order number..."
            className="input-field pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field max-w-[200px]"
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-neutral-900/5 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-6 h-6 text-neutral-400 animate-spin mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingCart className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
            <p className="text-sm text-neutral-500">No orders found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-700">Order #</th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-700 hidden sm:table-cell">Date</th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-700">Total</th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-700">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-700">Update</th>
                  <th className="text-right px-4 py-3 font-semibold text-neutral-700">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3 font-mono font-semibold text-neutral-900">{order.order_number}</td>
                    <td className="px-4 py-3 text-neutral-600 hidden sm:table-cell">
                      {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </td>
                    <td className="px-4 py-3 font-semibold text-neutral-900">{formatPrice(order.total)}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${STATUS_COLORS[order.status]}`}>{order.status.replace(/_/g, ' ')}</span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={order.status}
                        onChange={(e) => updateStatus(order.id, e.target.value as OrderStatus)}
                        disabled={updating}
                        className="text-xs border border-neutral-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-brand-500"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setViewOrder(order)}
                        className="p-2 rounded-lg text-neutral-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order detail modal */}
      {viewOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setViewOrder(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-neutral-100 sticky top-0 bg-white">
              <div>
                <h2 className="font-display text-lg font-bold text-neutral-900">{viewOrder.order_number}</h2>
                <p className="text-xs text-neutral-500">{new Date(viewOrder.created_at).toLocaleString('en-IN')}</p>
              </div>
              <button onClick={() => setViewOrder(null)} className="p-2 rounded-lg hover:bg-neutral-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h3 className="font-semibold text-sm text-neutral-900 mb-2">Items</h3>
                <div className="space-y-2">
                  {viewOrder.order_items?.map((item) => (
                    <div key={item.id} className="flex gap-3 items-center">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-neutral-100 shrink-0">
                        {item.product_image && <img src={item.product_image} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-neutral-900">{item.product_name}</p>
                        <p className="text-xs text-neutral-500">Qty: {item.quantity} &times; {formatPrice(item.unit_price)}</p>
                      </div>
                      <span className="text-sm font-semibold">{formatPrice(item.line_total)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-t border-neutral-100 pt-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-neutral-600">Subtotal</span><span>{formatPrice(viewOrder.subtotal)}</span></div>
                {viewOrder.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatPrice(viewOrder.discount)}</span></div>}
                <div className="flex justify-between"><span className="text-neutral-600">Delivery</span><span>{viewOrder.delivery_charge === 0 ? 'FREE' : formatPrice(viewOrder.delivery_charge)}</span></div>
                <div className="flex justify-between pt-2 border-t border-neutral-100"><span className="font-bold">Total</span><span className="font-bold text-brand-600">{formatPrice(viewOrder.total)}</span></div>
              </div>
              {viewOrder.delivery_date && (
                <div className="border-t border-neutral-100 pt-4">
                  <h3 className="font-semibold text-sm text-neutral-900 mb-2">Delivery</h3>
                  <p className="text-sm text-neutral-600">
                    {new Date(viewOrder.delivery_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                  <p className="text-sm text-neutral-600">{viewOrder.delivery_slot}</p>
                  <p className="text-xs text-neutral-500 mt-2">{JSON.stringify(viewOrder.address_snapshot)}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
