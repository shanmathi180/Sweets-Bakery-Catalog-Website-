import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Profile, Order } from '@/types';
import { formatPrice } from '@/lib/utils';
import { Search, Loader2, Users, Mail, Phone } from 'lucide-react';

type CustomerWithStats = Profile & {
  order_count: number;
  total_spent: number;
};

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<CustomerWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadCustomers() {
      const [profilesRes, ordersRes] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('orders').select('user_id, total'),
      ]);
      const profiles = profilesRes.data as Profile[] ?? [];
      const orders = ordersRes.data as Pick<Order, 'user_id' | 'total'>[] ?? [];
      const stats = profiles.map((p) => {
        const userOrders = orders.filter((o) => o.user_id === p.id);
        return {
          ...p,
          order_count: userOrders.length,
          total_spent: userOrders.reduce((sum, o) => sum + Number(o.total), 0),
        };
      });
      setCustomers(stats);
      setLoading(false);
    }
    loadCustomers();
  }, []);

  const filtered = customers.filter((c) =>
    (c.full_name ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (c.phone ?? '').includes(search),
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-neutral-900">Customers</h1>
        <p className="text-sm text-neutral-500 mt-1">{customers.length} registered customers</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or phone..."
          className="input-field pl-10"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-neutral-900/5 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-6 h-6 text-neutral-400 animate-spin mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
            <p className="text-sm text-neutral-500">No customers found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-700">Name</th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-700 hidden sm:table-cell">Contact</th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-700">Orders</th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-700">Total Spent</th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-700">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-accent-400 flex items-center justify-center text-white text-sm font-bold">
                          {c.full_name?.charAt(0).toUpperCase() ?? '?'}
                        </div>
                        <span className="font-medium text-neutral-900">{c.full_name ?? 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <div className="space-y-0.5">
                        {c.phone && <p className="flex items-center gap-1.5 text-xs text-neutral-600"><Phone className="w-3 h-3" />{c.phone}</p>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-neutral-600">{c.order_count}</td>
                    <td className="px-4 py-3 font-semibold text-neutral-900">{formatPrice(c.total_spent)}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${c.is_admin ? 'bg-purple-100 text-purple-700' : 'bg-neutral-100 text-neutral-600'}`}>
                        {c.is_admin ? 'Admin' : 'Customer'}
                      </span>
                    </td>
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
