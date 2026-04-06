
-- Fix CRITICAL: Replace has_role with is_active_admin in ALL admin RLS policies
-- This prevents blocked admins from retaining admin privileges

-- PRODUCTS table
DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
CREATE POLICY "Admins can insert products" ON public.products FOR INSERT TO authenticated WITH CHECK (is_active_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can update products" ON public.products;
CREATE POLICY "Admins can update products" ON public.products FOR UPDATE TO authenticated USING (is_active_admin(auth.uid())) WITH CHECK (is_active_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can delete products" ON public.products;
CREATE POLICY "Admins can delete products" ON public.products FOR DELETE TO authenticated USING (is_active_admin(auth.uid()));

-- ORDERS table
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
CREATE POLICY "Admins can view all orders" ON public.orders FOR SELECT USING (is_active_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
CREATE POLICY "Admins can update orders" ON public.orders FOR UPDATE USING (is_active_admin(auth.uid()));

-- ORDER_ITEMS table
DROP POLICY IF EXISTS "Admins can view all order items" ON public.order_items;
CREATE POLICY "Admins can view all order items" ON public.order_items FOR SELECT USING (is_active_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can update order items" ON public.order_items;
CREATE POLICY "Admins can update order items" ON public.order_items FOR UPDATE USING (is_active_admin(auth.uid())) WITH CHECK (is_active_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can delete order items" ON public.order_items;
CREATE POLICY "Admins can delete order items" ON public.order_items FOR DELETE USING (is_active_admin(auth.uid()));

-- PROFILES table
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (is_active_admin(auth.uid()));

-- REVIEWS table
DROP POLICY IF EXISTS "Admins can delete any review" ON public.reviews;
CREATE POLICY "Admins can delete any review" ON public.reviews FOR DELETE USING (is_active_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can update any review" ON public.reviews;
CREATE POLICY "Admins can update any review" ON public.reviews FOR UPDATE USING (is_active_admin(auth.uid())) WITH CHECK (is_active_admin(auth.uid()));

-- Fix OTP tables: Replace permissive false with restrictive policies
DROP POLICY IF EXISTS "Block all public access to otp_rate_limits" ON public.otp_rate_limits;
CREATE POLICY "Block all access to otp_rate_limits" ON public.otp_rate_limits AS RESTRICTIVE FOR ALL USING (false);

DROP POLICY IF EXISTS "Block all public access to password_reset_otps" ON public.password_reset_otps;
CREATE POLICY "Block all access to password_reset_otps" ON public.password_reset_otps AS RESTRICTIVE FOR ALL USING (false);
