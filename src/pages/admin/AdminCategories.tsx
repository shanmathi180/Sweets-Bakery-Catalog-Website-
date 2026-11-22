import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Category } from '@/types';
import { Plus, Edit3, Trash2, X, Save, Loader2, FolderTree } from 'lucide-react';

type EditFormData = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  sort_order: string;
  is_active: boolean;
};

const emptyForm: EditFormData = {
  name: '',
  slug: '',
  description: '',
  image_url: '',
  sort_order: '0',
  is_active: true,
};

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<EditFormData | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadCategories = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('categories').select('*').order('sort_order');
    setCategories(data as Category[] ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  function slugify(text: string): string {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }

  function openAdd() {
    setEditing({ ...emptyForm });
    setShowForm(true);
    setError('');
  }

  function openEdit(cat: Category) {
    setEditing({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description ?? '',
      image_url: cat.image_url ?? '',
      sort_order: String(cat.sort_order),
      is_active: cat.is_active,
    });
    setShowForm(true);
    setError('');
  }

  async function handleSave() {
    if (!editing || !editing.name) {
      setError('Name is required');
      return;
    }
    setSaving(true);
    setError('');
    const payload = {
      name: editing.name,
      slug: editing.slug || slugify(editing.name),
      description: editing.description || null,
      image_url: editing.image_url || null,
      sort_order: Number(editing.sort_order) || 0,
      is_active: editing.is_active,
    };
    const { error } = editing.id
      ? await supabase.from('categories').update(payload).eq('id', editing.id)
      : await supabase.from('categories').insert(payload);
    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    setShowForm(false);
    setEditing(null);
    loadCategories();
  }

  async function handleDelete(cat: Category) {
    if (!confirm(`Delete category "${cat.name}"? Products in this category will be uncategorized.`)) return;
    const { error } = await supabase.from('categories').delete().eq('id', cat.id);
    if (error) {
      alert(error.message);
      return;
    }
    loadCategories();
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-neutral-900">Categories</h1>
          <p className="text-sm text-neutral-500 mt-1">{categories.length} categories</p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center">
          <Loader2 className="w-6 h-6 text-neutral-400 animate-spin mx-auto" />
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center">
          <FolderTree className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
          <p className="text-sm text-neutral-500">No categories yet.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div key={cat.id} className="bg-white rounded-2xl shadow-sm ring-1 ring-neutral-900/5 overflow-hidden">
              <div className="aspect-video bg-neutral-100">
                {cat.image_url && <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-neutral-900">{cat.name}</h3>
                    <p className="text-xs text-neutral-500 mt-0.5">/{cat.slug}</p>
                  </div>
                  <span className={`badge ${cat.is_active ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-500'}`}>
                    {cat.is_active ? 'Active' : 'Hidden'}
                  </span>
                </div>
                <p className="text-sm text-neutral-500 mt-2 line-clamp-2">{cat.description ?? 'No description'}</p>
                <div className="flex items-center gap-1 mt-3">
                  <button onClick={() => openEdit(cat)} className="p-2 rounded-lg text-neutral-400 hover:text-brand-600 hover:bg-brand-50 transition-colors">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(cat)} className="p-2 rounded-lg text-neutral-400 hover:text-brand-600 hover:bg-brand-50 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showForm && editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowForm(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full">
            <div className="flex items-center justify-between p-6 border-b border-neutral-100">
              <h2 className="font-display text-lg font-bold text-neutral-900">
                {editing.id ? 'Edit Category' : 'Add Category'}
              </h2>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-neutral-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {error && <div className="p-3 rounded-xl bg-brand-50 border border-brand-200 text-sm text-brand-700">{error}</div>}
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">Name</label>
                <input type="text" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value, slug: editing.id ? editing.slug : slugify(e.target.value) })} className="input-field text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">Slug</label>
                <input type="text" value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} className="input-field text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">Description</label>
                <textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="input-field text-sm min-h-[60px]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">Image URL</label>
                <input type="text" value={editing.image_url} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} className="input-field text-sm" placeholder="https://..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1">Sort Order</label>
                  <input type="number" value={editing.sort_order} onChange={(e) => setEditing({ ...editing, sort_order: e.target.value })} className="input-field text-sm" />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={editing.is_active} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} className="rounded text-brand-600" />
                    Active
                  </label>
                </div>
              </div>
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
