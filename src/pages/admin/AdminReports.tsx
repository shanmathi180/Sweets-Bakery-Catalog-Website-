import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Order, Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { TrendingUp, ShoppingCart, DollarSign, BarChart3, Loader2 } from 'lucide-react';

export default function AdminReports() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [topProducts, setTopProducts] = useState<{ name: string; count: number; revenue: number }[]>([]);
  const [statusBreakdown, setStatusBreakdown] = useState<Record<string, number>>({});

  useEffect(() => {
    async function loadData() {
      const { data: orderData } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false });
      const allOrders = orderData as Order[] ?? [];
      setOrders(allOrders);

      // Top products from order items
      const productMap: Record<string, { name: string; count: number; revenue: number }> = {};
      allOrders.forEach((order) => {
        order.order_items?.forEach((item) => {
          if (!productMap[item.product_name]) {
            productMap[item.product_name] = { name: item.product_name, count: 0, revenue: 0 };
          }
          productMap[item.product_name].count += item.quantity;
          productMap[item.product_name].revenue += Number(item.line_total);
        });
      });
      setTopProducts(Object.values(productMap).sort((a, b) => b.revenue - a.revenue).slice(0, 5));

      // Status breakdown
      const statusMap: Record<string, number> = {};
      allOrders.forEach((o) => {
        statusMap[o.status] = (statusMap[o.status] ?? 0) + 1;
      });
      setStatusBreakdown(statusMap);
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="p-12 text-center">
        <Loader2 className="w-6 h-6 text-neutral-400 animate-spin mx-auto" />
      </div>
    );
  }

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
  const deliveredOrders = orders.filter((o) => o.status === 'delivered').length;
  const maxRevenue = topProducts[0]?.revenue ?? 1;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-neutral-900">Reports & Statistics</h1>
        <p className="text-sm text-neutral-500 mt-1">Performance insights for your bakery</p>
      </div>

      {/* Summary stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: formatPrice(totalRevenue), icon: DollarSign, color: 'bg-green-50 text-green-600' },
          { label: 'Total Orders', value: orders.length.toString(), icon: ShoppingCart, color: 'bg-blue-50 text-blue-600' },
          { label: 'Avg Order Value', value: formatPrice(avgOrderValue), icon: TrendingUp, color: 'bg-accent-50 text-accent-600' },
          { label: 'Delivered', value: deliveredOrders.toString(), icon: BarChart3, color: 'bg-purple-50 text-purple-600' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-neutral-900/5">
            <div className={`w-11 h-11 rounded-xl ${s.color} flex items-center justify-center mb-4`}>
              <s.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-neutral-900">{s.value}</p>
            <p className="text-sm text-neutral-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top products */}
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-neutral-900/5 p-6">
          <h2 className="font-display text-lg font-bold text-neutral-900 mb-4">Top Products by Revenue</h2>
          {topProducts.length === 0 ? (
            <p className="text-sm text-neutral-500 text-center py-8">No sales data yet.</p>
          ) : (
            <div className="space-y-4">
              {topProducts.map((p, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-neutral-700">{p.name}</span>
                    <span className="text-sm font-semibold text-neutral-900">{formatPrice(p.revenue)}</span>
                  </div>
                  <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-brand-500 to-accent-500 rounded-full transition-all"
                      style={{ width: `${(p.revenue / maxRevenue) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">{p.count} sold</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order status breakdown */}
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-neutral-900/5 p-6">
          <h2 className="font-display text-lg font-bold text-neutral-900 mb-4">Order Status Breakdown</h2>
          {Object.keys(statusBreakdown).length === 0 ? (
            <p className="text-sm text-neutral-500 text-center py-8">No orders yet.</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(statusBreakdown).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <span className="text-sm text-neutral-700 capitalize">{status.replace(/_/g, ' ')}</span>
                  <span className="badge bg-neutral-100 text-neutral-700">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent revenue table */}
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-neutral-900/5 overflow-hidden">
        <div className="p-6 border-b border-neutral-100">
          <h2 className="font-display text-lg font-bold text-neutral-900">Recent Orders Revenue</h2>
        </div>
        {orders.length === 0 ? (
          <p className="p-6 text-sm text-neutral-500 text-center">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-700">Order</th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-700">Date</th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-700">Items</th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-700">Status</th>
                  <th className="text-right px-4 py-3 font-semibold text-neutral-700">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {orders.slice(0, 10).map((o) => (
                  <tr key={o.id}>
                    <td className="px-4 py-3 font-mono text-xs">{o.order_number}</td>
                    <td className="px-4 py-3 text-neutral-600">{new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                    <td className="px-4 py-3 text-neutral-600">{o.order_items?.length ?? 0}</td>
                    <td className="px-4 py-3 text-neutral-600 capitalize">{o.status.replace(/_/g, ' ')}</td>
                    <td className="px-4 py-3 font-semibold text-right">{formatPrice(o.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
