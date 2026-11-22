import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import type { WishlistItem, Product } from '@/types';

type WishlistContextType = {
  items: WishlistItem[];
  loading: boolean;
  productIds: Set<string>;
  toggle: (product: Product) => Promise<void>;
  has: (productId: string) => boolean;
  refresh: () => Promise<void>;
};

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('wishlist_items')
      .select('*, product:products(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error loading wishlist:', error);
    } else {
      setItems(data as WishlistItem[]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const toggle = useCallback(
    async (product: Product) => {
      if (!user) throw new Error('Please sign in to use your wishlist');
      const existing = items.find((i) => i.product_id === product.id);
      if (existing) {
        const { error } = await supabase.from('wishlist_items').delete().eq('id', existing.id);
        if (error) throw new Error(error.message);
      } else {
        const { error } = await supabase.from('wishlist_items').insert({
          user_id: user.id,
          product_id: product.id,
        });
        if (error) throw new Error(error.message);
      }
      await refresh();
    },
    [user, items, refresh],
  );

  const productIds = new Set(items.map((i) => i.product_id));
  const has = useCallback((productId: string) => productIds.has(productId), [productIds]);

  return (
    <WishlistContext.Provider value={{ items, loading, productIds, toggle, has, refresh }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
