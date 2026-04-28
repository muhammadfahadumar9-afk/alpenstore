-- =========================================================
-- 1. Fix storage listing: replace buggy permissive policies with one restrictive lockdown
-- =========================================================
DROP POLICY IF EXISTS "Block listing of product-images" ON storage.objects;
DROP POLICY IF EXISTS "Block listing of gallery-images" ON storage.objects;
DROP POLICY IF EXISTS "Block listing of page-images" ON storage.objects;
DROP POLICY IF EXISTS "Block listing of blog-images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can list all storage objects" ON storage.objects;

-- Restrictive policy: only admins (or service role) may LIST files in our 4 public buckets via the API.
-- Direct file URLs still work because public buckets serve objects via the CDN, bypassing storage.objects RLS.
CREATE POLICY "Restrict listing of public buckets to admins"
ON storage.objects
AS RESTRICTIVE
FOR SELECT
TO anon, authenticated
USING (
  bucket_id NOT IN ('product-images', 'gallery-images', 'page-images', 'blog-images')
  OR public.is_active_admin(auth.uid())
);

-- =========================================================
-- 2. Hide user_id from public on blog_comments and reviews via column-level grants + a safe view
-- =========================================================

-- Revoke broad column access from anon/authenticated on the raw tables
REVOKE SELECT ON public.blog_comments FROM anon, authenticated;
REVOKE SELECT ON public.reviews FROM anon, authenticated;

-- Re-grant ONLY non-identifying columns to anon/authenticated.
GRANT SELECT (id, post_id, author_name, content, created_at) ON public.blog_comments TO anon, authenticated;
GRANT SELECT (id, product_id, rating, review_text, reviewer_name, created_at, updated_at) ON public.reviews TO anon, authenticated;

-- Logged-in users still need to see their OWN user_id (e.g., to know which comment/review is theirs).
-- We allow that through a SECURITY DEFINER helper used in the app, but for now the existing RLS SELECT policies
-- combined with column-level GRANTs above mean: public/auth users see content but NOT user_id.
-- Admins keep full access via existing admin policies + table-owner grants.

-- Grant full SELECT back to the postgres role (used by definer functions, triggers, and admin queries)
GRANT SELECT ON public.blog_comments TO postgres, service_role;
GRANT SELECT ON public.reviews TO postgres, service_role;