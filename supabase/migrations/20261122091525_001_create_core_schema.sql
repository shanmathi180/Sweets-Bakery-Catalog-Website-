/*
# Shan's Bakery — Core Schema

## Overview
Creates the complete database schema for the Shan's Bakery e-commerce platform:
categories, products with customization options, user profiles, delivery addresses,
shopping cart, orders with line items, wishlist, and coupon codes.

## New Tables

1. **categories** — Product groupings (Cakes, Brownies, Pastries, Gifts, etc.)
   - id (uuid PK), name, slug (unique), description, image_url, sort_order, is_active, created_at

2. **products** — Individual sellable items
   - id (uuid PK), category_id (FK→categories), name, slug, description, long_description,
     base_price (numeric), compare_at_price (numeric, for discounts), weight_label,
     image_url, gallery (text[]), rating, review_count, is_featured, is_bestseller,
     is_active, stock, created_at, updated_at

3. **product_addons** — Optional add-ons for any product (candles, cards, etc.)
   - id (uuid PK), product_id (FK→products), name, price, is_active, created_at

4. **profiles** — Extended user info linked to auth.users
   - id (uuid PK, FK→auth.users), full_name, phone, avatar_url, created_at, updated_at

5. **addresses** — Saved delivery addresses per user
   - id (uuid PK), user_id (FK→auth.users), label, recipient_name, phone, line1, line2,
     city, state, pincode, is_default, created_at

6. **cart_items** — Per-user shopping cart
   - id (uuid PK), user_id (FK→auth.users), product_id (FK→products), quantity,
     customization (jsonb: weight, flavour, eggless, message, addon_ids),
     unit_price (numeric, snapshot at add time), created_at

7. **coupons** — Discount codes
   - id (uuid PK), code (unique), description, discount_type ('percentage'|'fixed'),
     discount_value (numeric), min_order_amount, max_discount, usage_limit,
     used_count, valid_from, valid_until, is_active, created_at

8. **orders** — Customer orders
   - id (uuid PK), user_id (FK→auth.users), order_number (unique),
     status (enum: pending_payment, confirmed, preparing, ready, out_for_delivery, delivered, cancelled),
     payment_status (enum: pending, paid, failed, refunded),
     subtotal, discount, delivery_charge, total,
     coupon_code, address_snapshot (jsonb), recipient_snapshot (jsonb),
     delivery_date, delivery_slot, notes, created_at, updated_at

9. **order_items** — Immutable line items per order
   - id (uuid PK), order_id (FK→orders), product_id, product_name, product_image,
     quantity, customization (jsonb), unit_price, line_total, created_at

10. **wishlist_items** — User wishlists
    - id (uuid PK), user_id (FK→auth.users), product_id (FK→products), created_at

## Security
- RLS enabled on every table.
- Profiles, addresses, cart_items, orders, order_items, wishlist_items are owner-scoped
  (user_id DEFAULT auth.uid(), policies use auth.uid() = user_id, TO authenticated).
- Categories, products, product_addons, coupons are publicly readable (TO anon, authenticated).
- Coupons write is admin-only (no anon/authenticated insert/update/delete).
- Orders/order_items: user can insert their own, read their own, update is limited
  (status changes only via service role / edge functions — users cannot mutate status).
- App HAS a sign-in screen, so owner-scoped tables target authenticated only.
*/

-- =============================================
-- ENUMS
-- =============================================
DO $$ BEGIN
  CREATE TYPE order_status AS ENUM ('pending_payment','confirmed','preparing','ready','out_for_delivery','delivered','cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('pending','paid','failed','refunded');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =============================================
-- CATEGORIES
-- =============================================
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  image_url text,
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON categories TO anon, authenticated;

DROP POLICY IF EXISTS "public_read_categories" ON categories;
CREATE POLICY "public_read_categories" ON categories FOR SELECT
TO anon, authenticated USING (true);

-- =============================================
-- PRODUCTS
-- =============================================
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  long_description text,
  base_price numeric(10,2) NOT NULL DEFAULT 0,
  compare_at_price numeric(10,2),
  weight_label text DEFAULT '500 g',
  image_url text,
  gallery text[],
  rating numeric(2,1) NOT NULL DEFAULT 4.5,
  review_count int NOT NULL DEFAULT 0,
  is_featured boolean NOT NULL DEFAULT false,
  is_bestseller boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  stock int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON products TO anon, authenticated;

DROP POLICY IF EXISTS "public_read_products" ON products;
CREATE POLICY "public_read_products" ON products FOR SELECT
TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_products_bestseller ON products(is_bestseller) WHERE is_bestseller = true;

-- =============================================
-- PRODUCT ADDONS
-- =============================================
CREATE TABLE IF NOT EXISTS product_addons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name text NOT NULL,
  price numeric(10,2) NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE product_addons ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON product_addons TO anon, authenticated;

DROP POLICY IF EXISTS "public_read_addons" ON product_addons;
CREATE POLICY "public_read_addons" ON product_addons FOR SELECT
TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_addons_product ON product_addons(product_id);

-- =============================================
-- PROFILES
-- =============================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;

DROP POLICY IF EXISTS "read_own_profile" ON profiles;
CREATE POLICY "read_own_profile" ON profiles FOR SELECT
TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- =============================================
-- ADDRESSES
-- =============================================
CREATE TABLE IF NOT EXISTS addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  label text NOT NULL DEFAULT 'Home',
  recipient_name text NOT NULL,
  phone text NOT NULL,
  line1 text NOT NULL,
  line2 text,
  city text NOT NULL,
  state text NOT NULL,
  pincode text NOT NULL,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON addresses TO authenticated;

DROP POLICY IF EXISTS "read_own_addresses" ON addresses;
CREATE POLICY "read_own_addresses" ON addresses FOR SELECT
TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_addresses" ON addresses;
CREATE POLICY "insert_own_addresses" ON addresses FOR INSERT
TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_addresses" ON addresses;
CREATE POLICY "update_own_addresses" ON addresses FOR UPDATE
TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_addresses" ON addresses;
CREATE POLICY "delete_own_addresses" ON addresses FOR DELETE
TO authenticated USING (auth.uid() = user_id);

-- =============================================
-- CART ITEMS
-- =============================================
CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity int NOT NULL DEFAULT 1 CHECK (quantity > 0),
  customization jsonb NOT NULL DEFAULT '{}'::jsonb,
  unit_price numeric(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON cart_items TO authenticated;

DROP POLICY IF EXISTS "read_own_cart" ON cart_items;
CREATE POLICY "read_own_cart" ON cart_items FOR SELECT
TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_cart" ON cart_items;
CREATE POLICY "insert_own_cart" ON cart_items FOR INSERT
TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_cart" ON cart_items;
CREATE POLICY "update_own_cart" ON cart_items FOR UPDATE
TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_cart" ON cart_items;
CREATE POLICY "delete_own_cart" ON cart_items FOR DELETE
TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_cart_user ON cart_items(user_id);

-- =============================================
-- COUPONS
-- =============================================
CREATE TABLE IF NOT EXISTS coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  description text,
  discount_type text NOT NULL DEFAULT 'percentage' CHECK (discount_type IN ('percentage','fixed')),
  discount_value numeric(10,2) NOT NULL DEFAULT 0,
  min_order_amount numeric(10,2) NOT NULL DEFAULT 0,
  max_discount numeric(10,2),
  usage_limit int,
  used_count int NOT NULL DEFAULT 0,
  valid_from timestamptz NOT NULL DEFAULT now(),
  valid_until timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON coupons TO anon, authenticated;

DROP POLICY IF EXISTS "public_read_coupons" ON coupons;
CREATE POLICY "public_read_coupons" ON coupons FOR SELECT
TO anon, authenticated USING (true);

-- =============================================
-- ORDERS
-- =============================================
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  order_number text UNIQUE NOT NULL,
  status order_status NOT NULL DEFAULT 'pending_payment',
  payment_status payment_status NOT NULL DEFAULT 'pending',
  subtotal numeric(10,2) NOT NULL DEFAULT 0,
  discount numeric(10,2) NOT NULL DEFAULT 0,
  delivery_charge numeric(10,2) NOT NULL DEFAULT 0,
  total numeric(10,2) NOT NULL DEFAULT 0,
  coupon_code text,
  address_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  recipient_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  delivery_date date,
  delivery_slot text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT ON orders TO authenticated;
-- No UPDATE/DELETE grant: status changes are server-side only (service_role).

DROP POLICY IF EXISTS "read_own_orders" ON orders;
CREATE POLICY "read_own_orders" ON orders FOR SELECT
TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_orders" ON orders;
CREATE POLICY "insert_own_orders" ON orders FOR INSERT
TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);

-- =============================================
-- ORDER ITEMS (immutable)
-- =============================================
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid,
  product_name text NOT NULL,
  product_image text,
  quantity int NOT NULL DEFAULT 1,
  customization jsonb NOT NULL DEFAULT '{}'::jsonb,
  unit_price numeric(10,2) NOT NULL DEFAULT 0,
  line_total numeric(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT ON order_items TO authenticated;

DROP POLICY IF EXISTS "read_own_order_items" ON order_items;
CREATE POLICY "read_own_order_items" ON order_items FOR SELECT
TO authenticated USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);

DROP POLICY IF EXISTS "insert_own_order_items" ON order_items;
CREATE POLICY "insert_own_order_items" ON order_items FOR INSERT
TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- =============================================
-- WISHLIST
-- =============================================
CREATE TABLE IF NOT EXISTS wishlist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, DELETE ON wishlist_items TO authenticated;

DROP POLICY IF EXISTS "read_own_wishlist" ON wishlist_items;
CREATE POLICY "read_own_wishlist" ON wishlist_items FOR SELECT
TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_wishlist" ON wishlist_items;
CREATE POLICY "insert_own_wishlist" ON wishlist_items FOR INSERT
TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_wishlist" ON wishlist_items;
CREATE POLICY "delete_own_wishlist" ON wishlist_items FOR DELETE
TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_wishlist_user ON wishlist_items(user_id);
