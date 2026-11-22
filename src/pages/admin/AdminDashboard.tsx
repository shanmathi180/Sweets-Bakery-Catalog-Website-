import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/lib/utils';
import type { Order } from '@/types';
import {
  TrendingUp,
  ShoppingCart,
  Package,
  Users,
  ArrowRight,
  Clock,
} from 'lucide-react';

type Stats = {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  recentOrders: Order[];
  pendingOrders: number;
  lowStockProducts: { id: string; name: string; stock: number }[];
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      const [ordersRes, productsRes, profilesRes, lowStockRes] = await Promise.all([
        supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(10),
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('products').select('id, name, stock').lt('stock', 10).order('stock').limit(5),
      ]);

      const orders = ordersRes.data as Order[] ?? [];
      const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
      const pendingOrders = orders.filter((o) =>
        ['confirmed', 'preparing', 'ready', 'out_for_delivery'].includes(o.status),
      ).length;

      setStats({
        totalRevenue,
        totalOrders: orders.length,
        totalProducts: productsRes.count ?? 0,
        totalCustomers: profilesRes.count ?? 0,
        recentOrders: orders,
        pendingOrders,
        lowStockProducts: lowStockRes.data as { id: string; name: string; stock: number }[] ?? [],
      });
      setLoading(false);
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-neutral-200 rounded w-1/4 animate-pulse" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 h-32 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Revenue',
      value: formatPrice(stats?.totalRevenue ?? 0),
      icon: TrendingUp,
      color: 'bg-green-50 text-green-600',
    },
    {
      label: 'Total Orders',
      value: (stats?.totalOrders ?? 0).toString(),
      icon: ShoppingCart,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Products',
      value: (stats?.totalProducts ?? 0).toString(),
      icon: Package,
      color: 'bg-accent-50 text-accent-600',
    },
    {
      label: 'Customers',
      value: (stats?.totalCustomers ?? 0).toString(),
      icon: Users,
      color: 'bg-purple-50 text-purple-600',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-neutral-900">Dashboard</h1>
        <p className="text-sm text-neutral-500 mt-1">Overview of your bakery's performance</p>
      </div>

      {/* Stat cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-neutral-900/5">
            <div className={`w-11 h-11 rounded-xl ${card.color} flex items-center justify-center mb-4`}>
              <card.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-neutral-900">{card.value}</p>
            <p className="text-sm text-neutral-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm ring-1 ring-neutral-900/5 overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-neutral-100">
            <h2 className="font-display text-lg font-bold text-neutral-900">Recent Orders</h2>
            <Link to="/admin/orders" className="text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {stats?.recentOrders.length === 0 ? (
            <p className="p-6 text-sm text-neutral-500 text-center">No orders yet.</p>
          ) : (
            <div className="divide-y divide-neutral-100">
              {stats?.recentOrders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 hover:bg-neutral-50 transition-colors">
                  <div>
                    <p className="text-sm font-semibold text-neutral-900 font-mono">{order.order_number}</p>
                    <p className="text-xs text-neutral-500">
                      {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`badge ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                      order.status === 'cancelled' ? 'bg-brand-100 text-brand-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {order.status.replace(/_/g, ' ')}
                    </span>
                    <span className="text-sm font-bold text-neutral-900">{formatPrice(order.total)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low stock alert */}
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-neutral-900/5 overflow-hidden">
          <div className="p-6 border-b border-neutral-100">
            <h2 className="font-display text-lg font-bold text-neutral-900">Low Stock Alert</h2>
          </div>
          {stats?.lowStockProducts.length === 0 ? (
            <p className="p-6 text-sm text-neutral-500 text-center">All products well stocked.</p>
          ) : (
            <div className="divide-y divide-neutral-100">
              {stats?.lowStockProducts.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-4">
                  <span className="text-sm text-neutral-700">{p.name}</span>
                  <span className={`badge ${p.stock === 0 ? 'bg-brand-100 text-brand-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {p.stock} left
                  </span>
                </div>
              ))}
            </div>
          )}
          <div className="p-4 border-t border-neutral-100">
            <div className="flex items-center gap-2 text-sm text-neutral-500">
              <Clock className="w-4 h-4 text-accent-500" />
              {stats?.pendingOrders ?? 0} orders pending
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
