export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
};

export type ProductAddon = {
  id: string;
  product_id: string;
  name: string;
  price: number;
  is_active: boolean;
};

export type Product = {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  long_description: string | null;
  base_price: number;
  compare_at_price: number | null;
  weight_label: string;
  image_url: string | null;
  gallery: string[] | null;
  rating: number;
  review_count: number;
  is_featured: boolean;
  is_bestseller: boolean;
  is_active: boolean;
  stock: number;
  category?: Category | null;
  product_addons?: ProductAddon[];
};

export type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  is_admin: boolean;
};

export type Address = {
  id: string;
  user_id: string;
  label: string;
  recipient_name: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
};

export type CartCustomization = {
  weight?: string;
  flavour?: string;
  eggless?: boolean;
  message?: string;
  addon_ids?: string[];
  addon_names?: string[];
};

export type CartItem = {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  customization: CartCustomization;
  unit_price: number;
  created_at: string;
  product?: Product;
};

export type Coupon = {
  id: string;
  code: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  max_discount: number | null;
  usage_limit: number | null;
  used_count: number;
  valid_from: string;
  valid_until: string | null;
  is_active: boolean;
};

export type OrderStatus =
  | 'pending_payment'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export type Order = {
  id: string;
  user_id: string;
  order_number: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  subtotal: number;
  discount: number;
  delivery_charge: number;
  total: number;
  coupon_code: string | null;
  address_snapshot: Record<string, unknown>;
  recipient_snapshot: Record<string, unknown>;
  delivery_date: string | null;
  delivery_slot: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_image: string | null;
  quantity: number;
  customization: CartCustomization;
  unit_price: number;
  line_total: number;
};

export type WishlistItem = {
  id: string;
  user_id: string;
  product_id: string;
  product?: Product;
};
