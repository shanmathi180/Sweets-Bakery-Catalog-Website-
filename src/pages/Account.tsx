import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import type { Address } from '@/types';
import Breadcrumbs from '@/components/Breadcrumbs';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Package,
  Heart,
  Plus,
  Trash2,
  Check,
  Edit3,
} from 'lucide-react';

export default function Account() {
  const { user, profile, refreshProfile } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  useEffect(() => {
    setFullName(profile?.full_name ?? '');
    setPhone(profile?.phone ?? '');
  }, [profile]);

  useEffect(() => {
    async function loadAddresses() {
      if (!user) return;
      const { data } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });
      setAddresses(data as Address[] ?? []);
    }
    loadAddresses();
  }, [user]);

  async function handleSaveProfile() {
    if (!user) return;
    setSaving(true);
    await supabase.from('profiles').upsert({
      id: user.id,
      full_name: fullName,
      phone,
    });
    await refreshProfile();
    setSaving(false);
    setEditing(false);
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);
  }

  async function deleteAddress(id: string) {
    if (!user) return;
    await supabase.from('addresses').delete().eq('id', id);
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  }

  async function setDefault(id: string) {
    if (!user) return;
    await supabase.from('addresses').update({ is_default: false }).eq('user_id', user.id);
    await supabase.from('addresses').update({ is_default: true }).eq('id', id);
    const { data } = await supabase.from('addresses').select('*').eq('user_id', user.id).order('is_default', { ascending: false });
    setAddresses(data as Address[] ?? []);
  }

  return (
    <div className="animate-fade-in max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'My Account' }]} />
      <h1 className="font-display text-3xl font-bold text-neutral-900 mt-3 mb-8">My Account</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile info */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-400 to-accent-400 flex items-center justify-center text-white text-2xl font-bold">
              {profile?.full_name?.charAt(0).toUpperCase() ?? 'U'}
            </div>
            <div>
              <p className="font-display text-lg font-bold text-neutral-900">{profile?.full_name ?? 'User'}</p>
              <p className="text-sm text-neutral-500">{user?.email}</p>
            </div>
          </div>

          {savedMsg && (
            <div className="mb-4 p-3 rounded-xl bg-green-50 border border-green-200 text-sm text-green-700 flex items-center gap-2">
              <Check className="w-4 h-4" /> Profile updated successfully
            </div>
          )}

          {editing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">Full Name</label>
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="input-field text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">Phone</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field text-sm" />
              </div>
              <div className="flex gap-2">
                <button onClick={handleSaveProfile} disabled={saving} className="btn-primary text-sm py-2.5">
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button onClick={() => setEditing(false)} className="btn-secondary text-sm py-2.5">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <User className="w-4 h-4 text-neutral-400" />
                <span className="text-neutral-600">{profile?.full_name ?? 'Not set'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-neutral-400" />
                <span className="text-neutral-600">{user?.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-neutral-400" />
                <span className="text-neutral-600">{profile?.phone ?? 'Not set'}</span>
              </div>
              <button onClick={() => setEditing(true)} className="btn-secondary text-sm py-2.5 mt-2 w-full">
                <Edit3 className="w-4 h-4" /> Edit Profile
              </button>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-cream-200 space-y-2">
            <Link to="/orders" className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-cream-50 transition-colors text-sm text-neutral-700">
              <Package className="w-4 h-4 text-brand-600" /> Order History
            </Link>
            <Link to="/wishlist" className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-cream-50 transition-colors text-sm text-neutral-700">
              <Heart className="w-4 h-4 text-brand-600" /> My Wishlist
            </Link>
          </div>
        </div>

        {/* Addresses */}
        <div className="lg:col-span-2">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-bold flex items-center gap-2">
                <MapPin className="w-5 h-5 text-brand-600" /> Saved Addresses
              </h2>
              <Link to="/checkout" className="text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1">
                <Plus className="w-4 h-4" /> Add New
              </Link>
            </div>

            {addresses.length === 0 ? (
              <p className="text-sm text-neutral-500 text-center py-8">
                No saved addresses yet. Add one during checkout.
              </p>
            ) : (
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <div key={addr.id} className="p-4 rounded-xl border border-neutral-200 flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm text-neutral-900">{addr.recipient_name}</span>
                        <span className="badge bg-cream-100 text-neutral-600">{addr.label}</span>
                        {addr.is_default && <span className="badge bg-green-100 text-green-700">Default</span>}
                      </div>
                      <p className="text-sm text-neutral-600">
                        {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}, {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                      <p className="text-sm text-neutral-500 mt-0.5">Phone: {addr.phone}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {!addr.is_default && (
                        <button
                          onClick={() => setDefault(addr.id)}
                          className="p-2 rounded-lg text-neutral-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                          aria-label="Set as default"
                          title="Set as default"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteAddress(addr.id)}
                        className="p-2 rounded-lg text-neutral-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                        aria-label="Delete address"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
