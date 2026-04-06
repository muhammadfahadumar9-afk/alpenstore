
-- Fix user_roles: Add restrictive policy preventing self-insertion
-- The existing "Admins can insert roles" policy uses is_active_admin which is correct,
-- but we need a RESTRICTIVE policy to ensure no one bypasses it
CREATE POLICY "Restrict role self-assignment" ON public.user_roles AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK (is_active_admin(auth.uid()));

-- Fix storage policies: Replace has_role with is_active_admin for product-images
DROP POLICY IF EXISTS "Admins can upload product images" ON storage.objects;
CREATE POLICY "Admins can upload product images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'product-images' AND is_active_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can update product images" ON storage.objects;
CREATE POLICY "Admins can update product images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'product-images' AND is_active_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can delete product images" ON storage.objects;
CREATE POLICY "Admins can delete product images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'product-images' AND is_active_admin(auth.uid()));

-- Fix storage policies for gallery-images
DROP POLICY IF EXISTS "Admins can upload gallery images" ON storage.objects;
CREATE POLICY "Admins can upload gallery images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'gallery-images' AND is_active_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can update gallery images" ON storage.objects;
CREATE POLICY "Admins can update gallery images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'gallery-images' AND is_active_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can delete gallery images" ON storage.objects;
CREATE POLICY "Admins can delete gallery images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'gallery-images' AND is_active_admin(auth.uid()));
