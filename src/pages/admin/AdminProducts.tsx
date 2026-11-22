import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Product, Category } from '@/types';
import { formatPrice } from '@/lib/utils';
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  X,
  Save,
  Loader2,
  Package,
} from 'lucide-react';

type EditFormData = {
  id?: string;
  name: string;
  slug: string;
  category_id: string;
  description: string;
  long_description: string;
  base_price: string;
  compare_at_price: string;
  weight_label: string;
  image_url: string;
  is_featured: boolean;
  is_bestseller: boolean;
  is_active: boolean;
  stock: string;
};

const emptyForm: EditFormData = {
  name: '',
  slug: '',
  category_id: '',
  description: '',
  long_description: '',
  base_price: '',
  compare_at_price: '',
  weight_label: '500 g',
  image_url: '',
  is_featured: false,
  is_bestseller: false,
  is_active: true,
  stock: '0',
};

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<EditFormData | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadProducts = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('products')
      .select('*, category:categories(*)')
      .order('created_at', { ascending: false });
    setProducts(data as Product[] ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadProducts();
    supabase.from('categories').select('*').order('sort_order').then(({ data }) => {
      setCategories(data as Category[] ?? []);
    });
  }, [loadProducts]);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  function slugify(text: string): string {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }

  function openAdd() {
    setEditing({ ...emptyForm, category_id: categories[0]?.id ?? '' });
    setShowForm(true);
    setError('');
  }

  function openEdit(product: Product) {
    setEditing({
      id: product.id,
      name: product.name,
      slug: product.slug,
      category_id: product.category_id ?? '',
      description: product.description ?? '',
      long_description: product.long_description ?? '',
      base_price: String(product.base_price),
      compare_at_price: product.compare_at_price ? String(product.compare_at_price) : '',
      weight_label: product.weight_label,
      image_url: product.image_url ?? '',
      is_featured: product.is_featured,
      is_bestseller: product.is_bestseller,
      is_active: product.is_active,
      stock: String(product.stock),
    });
    setShowForm(true);
    setError('');
  }

  async function handleSave() {
    if (!editing) return;
    if (!editing.name || !editing.base_price) {
      setError('Name and price are required');
      return;
    }
    setSaving(true);
    setError('');
    const payload = {
      name: editing.name,
      slug: editing.slug || slugify(editing.name),
      category_id: editing.category_id || null,
      description: editing.description || null,
      long_description: editing.long_description || null,
      base_price: Number(editing.base_price),
      compare_at_price: editing.compare_at_price ? Number(editing.compare_at_price) : null,
      weight_label: editing.weight_label,
      image_url: editing.image_url || null,
      gallery: editing.image_url ? [editing.image_url] : null,
      is_featured: editing.is_featured,
      is_bestseller: editing.is_bestseller,
      is_active: editing.is_active,
      stock: Number(editing.stock),
    };
    const { error } = editing.id
      ? await supabase.from('products').update(payload).eq('id', editing.id)
      : await supabase.from('products').insert(payload);
    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    setShowForm(false);
    setEditing(null);
    loadProducts();
  }

  async function handleDelete(product: Product) {
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    const { error } = await supabase.from('products').delete().eq('id', product.id);
    if (error) {
      alert(error.message);
      return;
    }
    loadProducts();
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-neutral-900">Products</h1>
          <p className="text-sm text-neutral-500 mt-1">{products.length} products in catalog</p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="input-field pl-10"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-neutral-900/5 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-6 h-6 text-neutral-400 animate-spin mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
            <p className="text-sm text-neutral-500">No products found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-700">Product</th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-700 hidden sm:table-cell">Category</th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-700">Price</th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-700 hidden md:table-cell">Stock</th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-700">Status</th>
                  <th className="text-right px-4 py-3 font-semibold text-neutral-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filtered.map((product) => (
                  <tr key={product.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-neutral-100 shrink-0">
                          {product.image_url && <img src={product.image_url} alt="" className="w-full h-full object-cover" />}
                        </div>
                        <span className="font-medium text-neutral-900 line-clamp-1">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-neutral-600 hidden sm:table-cell">{product.category?.name ?? '—'}</td>
                    <td className="px-4 py-3 font-semibold text-neutral-900">{formatPrice(product.base_price)}</td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={product.stock < 10 ? 'text-brand-600 font-semibold' : 'text-neutral-600'}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${product.is_active ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-500'}`}>
                        {product.is_active ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(product)}
                          className="p-2 rounded-lg text-neutral-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product)}
                          className="p-2 rounded-lg text-neutral-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                        >
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

      {/* Edit/Add modal */}
      {showForm && editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowForm(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-neutral-100 sticky top-0 bg-white z-10">
              <h2 className="font-display text-lg font-bold text-neutral-900">
                {editing.id ? 'Edit Product' : 'Add Product'}
              </h2>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-neutral-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-brand-50 border border-brand-200 text-sm text-brand-700">{error}</div>
              )}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1">Name</label>
                  <input
                    type="text"
                    value={editing.name}
                    onChange={(e) => setEditing({ ...editing, name: e.target.value, slug: editing.id ? editing.slug : slugify(e.target.value) })}
                    className="input-field text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1">Slug</label>
                  <input
                    type="text"
                    value={editing.slug}
                    onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                    className="input-field text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1">Category</label>
                  <select
                    value={editing.category_id}
                    onChange={(e) => setEditing({ ...editing, category_id: e.target.value })}
                    className="input-field text-sm"
                  >
                    <option value="">Uncategorized</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1">Weight Label</label>
                  <input
                    type="text"
                    value={editing.weight_label}
                    onChange={(e) => setEditing({ ...editing, weight_label: e.target.value })}
                    className="input-field text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1">Base Price (₹)</label>
                  <input
                    type="number"
                    value={editing.base_price}
                    onChange={(e) => setEditing({ ...editing, base_price: e.target.value })}
                    className="input-field text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1">Compare-at Price (₹)</label>
                  <input
                    type="number"
                    value={editing.compare_at_price}
                    onChange={(e) => setEditing({ ...editing, compare_at_price: e.target.value })}
                    className="input-field text-sm"
                    placeholder="For showing discount"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1">Stock</label>
                  <input
                    type="number"
                    value={editing.stock}
                    onChange={(e) => setEditing({ ...editing, stock: e.target.value })}
                    className="input-field text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1">Image URL</label>
                  <input
                    type="text"
                    value={editing.image_url}
                    onChange={(e) => setEditing({ ...editing, image_url: e.target.value })}
                    className="input-field text-sm"
                    placeholder="https://..."
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">Short Description</label>
                <input
                  type="text"
                  value={editing.description}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  className="input-field text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">Long Description</label>
                <textarea
                  value={editing.long_description}
                  onChange={(e) => setEditing({ ...editing, long_description: e.target.value })}
                  className="input-field text-sm min-h-[80px]"
                />
              </div>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={editing.is_active} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} className="rounded text-brand-600" />
                  Active
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={editing.is_featured} onChange={(e) => setEditing({ ...editing, is_featured: e.target.checked })} className="rounded text-brand-600" />
                  Featured
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={editing.is_bestseller} onChange={(e) => setEditing({ ...editing, is_bestseller: e.target.checked })} className="rounded text-brand-600" />
                  Bestseller
                </label>
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={handleSave} disabled={saving} className="btn-primary text-sm">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {editing.id ? 'Save Changes' : 'Create Product'}
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
