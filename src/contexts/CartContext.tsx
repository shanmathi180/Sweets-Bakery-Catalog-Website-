import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import type { CartItem, CartCustomization, Product } from '@/types';

type CartContextType = {
  items: CartItem[];
  loading: boolean;
  itemCount: number;
  subtotal: number;
  addItem: (product: Product, quantity: number, customization: CartCustomization, unitPrice: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('cart_items')
      .select('*, product:products(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error loading cart:', error);
    } else {
      setItems(data as CartItem[]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addItem = useCallback(
    async (product: Product, quantity: number, customization: CartCustomization, unitPrice: number) => {
      if (!user) throw new Error('Please sign in to add items to your cart');
      const { error } = await supabase.from('cart_items').insert({
        user_id: user.id,
        product_id: product.id,
        quantity,
        customization,
        unit_price: unitPrice,
      });
      if (error) throw new Error(error.message);
      await refreshCart();
    },
    [user, refreshCart],
  );

  const updateQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      if (quantity < 1) return;
      const { error } = await supabase.from('cart_items').update({ quantity }).eq('id', itemId);
      if (error) throw new Error(error.message);
      await refreshCart();
    },
    [refreshCart],
  );

  const removeItem = useCallback(
    async (itemId: string) => {
      const { error } = await supabase.from('cart_items').delete().eq('id', itemId);
      if (error) throw new Error(error.message);
      await refreshCart();
    },
    [refreshCart],
  );

  const clearCart = useCallback(async () => {
    if (!user) return;
    const { error } = await supabase.from('cart_items').delete().eq('user_id', user.id);
    if (error) throw new Error(error.message);
    setItems([]);
  }, [user]);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, loading, itemCount, subtotal, addItem, updateQuantity, removeItem, clearCart, refreshCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
