/*
# Add admin role support

## Overview
Adds an `is_admin` column to the profiles table so admin users can be identified.
Creates RLS policies that allow admin users to perform CRUD operations on
categories, products, product_addons, and coupons (which are currently read-only
for anon/authenticated users).

## Changes
1. **profiles** — add `is_admin boolean NOT NULL DEFAULT false`
2. **categories** — add INSERT/UPDATE/DELETE policies for admin users
3. **products** — add INSERT/UPDATE/DELETE policies for admin users
4. **product_addons** — add INSERT/UPDATE/DELETE policies for admin users
5. **coupons** — add INSERT/UPDATE/DELETE policies for admin users
6. **orders** — add UPDATE policy for admin users (to change order status)
7. **profiles** — admin can read all profiles for customer management

## Security
- Admin checks use: `EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)`
- The `is_admin` column is only writable via service_role (no user-facing UPDATE grant on it).
- Profiles UPDATE grant stays on `authenticated` but the column-level restriction prevents
  users from setting their own `is_admin` flag because we only grant UPDATE on (full_name, phone, avatar_url).
*/

-- Add is_admin to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false;

-- Restrict profile UPDATE to safe columns only (users cannot set is_admin)
REVOKE UPDATE ON profiles FROM authenticated;
GRANT UPDATE (full_name, phone, avatar_url) ON profiles TO authenticated;

-- Helper function for admin check (reusable in policies)
CREATE OR REPLACE FUNCTION is_admin() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true);
$$;
REVOKE EXECUTE ON FUNCTION is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;

-- =============================================
-- ADMIN POLICIES — Categories
-- =============================================
DROP POLICY IF EXISTS "admin_insert_categories" ON categories;
CREATE POLICY "admin_insert_categories" ON categories FOR INSERT
TO authenticated WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_update_categories" ON categories;
CREATE POLICY "admin_update_categories" ON categories FOR UPDATE
TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_delete_categories" ON categories;
CREATE POLICY "admin_delete_categories" ON categories FOR DELETE
TO authenticated USING (is_admin());

GRANT INSERT, UPDATE, DELETE ON categories TO authenticated;

-- =============================================
-- ADMIN POLICIES — Products
-- =============================================
DROP POLICY IF EXISTS "admin_insert_products" ON products;
CREATE POLICY "admin_insert_products" ON products FOR INSERT
TO authenticated WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_update_products" ON products;
CREATE POLICY "admin_update_products" ON products FOR UPDATE
TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_delete_products" ON products;
CREATE POLICY "admin_delete_products" ON products FOR DELETE
TO authenticated USING (is_admin());

GRANT INSERT, UPDATE, DELETE ON products TO authenticated;

-- =============================================
-- ADMIN POLICIES — Product Addons
-- =============================================
DROP POLICY IF EXISTS "admin_insert_addons" ON product_addons;
CREATE POLICY "admin_insert_addons" ON product_addons FOR INSERT
TO authenticated WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_update_addons" ON product_addons;
CREATE POLICY "admin_update_addons" ON product_addons FOR UPDATE
TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_delete_addons" ON product_addons;
CREATE POLICY "admin_delete_addons" ON product_addons FOR DELETE
TO authenticated USING (is_admin());

GRANT INSERT, UPDATE, DELETE ON product_addons TO authenticated;

-- =============================================
-- ADMIN POLICIES — Coupons
-- =============================================
DROP POLICY IF EXISTS "admin_insert_coupons" ON coupons;
CREATE POLICY "admin_insert_coupons" ON coupons FOR INSERT
TO authenticated WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_update_coupons" ON coupons;
CREATE POLICY "admin_update_coupons" ON coupons FOR UPDATE
TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_delete_coupons" ON coupons;
CREATE POLICY "admin_delete_coupons" ON coupons FOR DELETE
TO authenticated USING (is_admin());

GRANT INSERT, UPDATE, DELETE ON coupons TO authenticated;

-- =============================================
-- ADMIN POLICIES — Orders (status updates)
-- =============================================
DROP POLICY IF EXISTS "admin_update_orders" ON orders;
CREATE POLICY "admin_update_orders" ON orders FOR UPDATE
TO authenticated USING (is_admin()) WITH CHECK (is_admin());

GRANT UPDATE ON orders TO authenticated;

-- =============================================
-- ADMIN POLICIES — Profiles (admin can read all profiles for customer mgmt)
-- =============================================
DROP POLICY IF EXISTS "admin_read_all_profiles" ON profiles;
CREATE POLICY "admin_read_all_profiles" ON profiles FOR SELECT
TO authenticated USING (is_admin());
