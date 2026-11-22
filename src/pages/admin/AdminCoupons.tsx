import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Coupon } from '@/types';
import { formatPrice } from '@/lib/utils';
import { Plus, Edit3, Trash2, X, Save, Loader2, Ticket } from 'lucide-react';

type EditFormData = {
  id?: string;
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: string;
  min_order_amount: string;
  max_discount: string;
  usage_limit: string;
  valid_until: string;
  is_active: boolean;
};

const emptyForm: EditFormData = {
  code: '',
  description: '',
  discount_type: 'percentage',
  discount_value: '',
  min_order_amount: '0',
  max_discount: '',
  usage_limit: '',
  valid_until: '',
  is_active: true,
};

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<EditFormData | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadCoupons = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
    setCoupons(data as Coupon[] ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadCoupons();
  }, [loadCoupons]);

  function openAdd() {
    setEditing({ ...emptyForm });
    setShowForm(true);
    setError('');
  }

  function openEdit(coupon: Coupon) {
    setEditing({
      id: coupon.id,
      code: coupon.code,
      description: coupon.description ?? '',
      discount_type: coupon.discount_type,
      discount_value: String(coupon.discount_value),
      min_order_amount: String(coupon.min_order_amount),
      max_discount: coupon.max_discount ? String(coupon.max_discount) : '',
      usage_limit: coupon.usage_limit ? String(coupon.usage_limit) : '',
      valid_until: coupon.valid_until ? coupon.valid_until.split('T')[0] : '',
      is_active: coupon.is_active,
    });
    setShowForm(true);
    setError('');
  }

  async function handleSave() {
    if (!editing || !editing.code || !editing.discount_value) {
      setError('Code and discount value are required');
      return;
    }
    setSaving(true);
    setError('');
    const payload = {
      code: editing.code.toUpperCase(),
      description: editing.description || null,
      discount_type: editing.discount_type,
      discount_value: Number(editing.discount_value),
      min_order_amount: Number(editing.min_order_amount) || 0,
      max_discount: editing.max_discount ? Number(editing.max_discount) : null,
      usage_limit: editing.usage_limit ? Number(editing.usage_limit) : null,
      valid_until: editing.valid_until ? new Date(editing.valid_until).toISOString() : null,
      is_active: editing.is_active,
    };
    const { error } = editing.id
      ? await supabase.from('coupons').update(payload).eq('id', editing.id)
      : await supabase.from('coupons').insert(payload);
    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    setShowForm(false);
    setEditing(null);
    loadCoupons();
  }

  async function handleDelete(coupon: Coupon) {
    if (!confirm(`Delete coupon "${coupon.code}"?`)) return;
    const { error } = await supabase.from('coupons').delete().eq('id', coupon.id);
    if (error) {
      alert(error.message);
      return;
    }
    loadCoupons();
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-neutral-900">Coupons</h1>
          <p className="text-sm text-neutral-500 mt-1">{coupons.length} coupons</p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Coupon
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-neutral-900/5 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-6 h-6 text-neutral-400 animate-spin mx-auto" />
          </div>
        ) : coupons.length === 0 ? (
          <div className="p-12 text-center">
            <Ticket className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
            <p className="text-sm text-neutral-500">No coupons yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-700">Code</th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-700 hidden sm:table-cell">Description</th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-700">Discount</th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-700 hidden md:table-cell">Used</th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-700">Status</th>
                  <th className="text-right px-4 py-3 font-semibold text-neutral-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {coupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono font-bold text-brand-600">{coupon.code}</span>
                    </td>
                    <td className="px-4 py-3 text-neutral-600 hidden sm:table-cell line-clamp-1 max-w-xs">{coupon.description ?? '—'}</td>
                    <td className="px-4 py-3 font-semibold text-neutral-900">
                      {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : formatPrice(coupon.discount_value)}
                    </td>
                    <td className="px-4 py-3 text-neutral-600 hidden md:table-cell">
                      {coupon.used_count}{coupon.usage_limit ? ` / ${coupon.usage_limit}` : ''}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${coupon.is_active ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-500'}`}>
                        {coupon.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(coupon)} className="p-2 rounded-lg text-neutral-400 hover:text-brand-600 hover:bg-brand-50 transition-colors">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(coupon)} className="p-2 rounded-lg text-neutral-400 hover:text-brand-600 hover:bg-brand-50 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showForm && editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowForm(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full">
            <div className="flex items-center justify-between p-6 border-b border-neutral-100">
              <h2 className="font-display text-lg font-bold text-neutral-900">
                {editing.id ? 'Edit Coupon' : 'Add Coupon'}
              </h2>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-neutral-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {error && <div className="p-3 rounded-xl bg-brand-50 border border-brand-200 text-sm text-brand-700">{error}</div>}
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">Code</label>
                <input type="text" value={editing.code} onChange={(e) => setEditing({ ...editing, code: e.target.value.toUpperCase() })} className="input-field text-sm font-mono" placeholder="SAVE10" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">Description</label>
                <input type="text" value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="input-field text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1">Type</label>
                  <select value={editing.discount_type} onChange={(e) => setEditing({ ...editing, discount_type: e.target.value as 'percentage' | 'fixed' })} className="input-field text-sm">
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1">
                    {editing.discount_type === 'percentage' ? 'Discount (%)' : 'Discount (₹)'}
                  </label>
                  <input type="number" value={editing.discount_value} onChange={(e) => setEditing({ ...editing, discount_value: e.target.value })} className="input-field text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1">Min Order (₹)</label>
                  <input type="number" value={editing.min_order_amount} onChange={(e) => setEditing({ ...editing, min_order_amount: e.target.value })} className="input-field text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1">Max Discount (₹)</label>
                  <input type="number" value={editing.max_discount} onChange={(e) => setEditing({ ...editing, max_discount: e.target.value })} className="input-field text-sm" placeholder="Optional" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1">Usage Limit</label>
                  <input type="number" value={editing.usage_limit} onChange={(e) => setEditing({ ...editing, usage_limit: e.target.value })} className="input-field text-sm" placeholder="Optional" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1">Valid Until</label>
                  <input type="date" value={editing.valid_until} onChange={(e) => setEditing({ ...editing, valid_until: e.target.value })} className="input-field text-sm" />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={editing.is_active} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} className="rounded text-brand-600" />
                Active
              </label>
              <div className="flex gap-2 pt-2">
                <button onClick={handleSave} disabled={saving} className="btn-primary text-sm">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {editing.id ? 'Save' : 'Create'}
                </button>
                <button onClick={() => setShowForm(false)} className="btn-secondary text-sm">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
