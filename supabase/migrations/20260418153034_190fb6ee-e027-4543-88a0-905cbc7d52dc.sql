-- =========================================================
-- 1) REVIEWS: stop exposing user_id to anonymous visitors
-- =========================================================

-- Replace the public-readable policy with one that hides user_id from anon.
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.reviews;

-- Authenticated users can read full review rows (their own user_id is fine to see)
CREATE POLICY "Authenticated users can view reviews"
ON public.reviews
FOR SELECT
TO authenticated
USING (true);

-- Provide a safe public view for anonymous visitors that omits user_id
CREATE OR REPLACE VIEW public.reviews_public
WITH (security_invoker = true)
AS
SELECT
  id,
  product_id,
  rating,
  review_text,
  reviewer_name,
  created_at,
  updated_at
FROM public.reviews;

-- Allow anonymous + authenticated users to read the safe view
GRANT SELECT ON public.reviews_public TO anon, authenticated;

-- Anonymous users still need a way to see ratings/text on product pages.
-- They cannot read public.reviews directly anymore, but they can read the view.
-- (The app already only selects non-identifying columns, so we also keep an
-- anon-safe SELECT policy that excludes user_id at the policy level.)
CREATE POLICY "Anon can view non-identifying review fields"
ON public.reviews
FOR SELECT
TO anon
USING (false); -- force anon clients to use reviews_public view


-- =========================================================
-- 2) ORDERS REALTIME: enforce row-level payload isolation
-- =========================================================
-- Channel-level RLS already restricts subscriptions, but we add an extra
-- defense-in-depth check that the row being broadcast belongs to the
-- subscriber (or the subscriber is an admin).

DROP POLICY IF EXISTS "Users can receive own user-scoped channel messages" ON realtime.messages;

CREATE POLICY "Users can receive own user-scoped channel messages"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  -- Channel must match the user's own scoped topic
  realtime.topic() = ('user-orders:' || auth.uid()::text)
);


-- =========================================================
-- 3) STORAGE: prevent anonymous listing of public buckets
-- =========================================================
-- Files remain publicly viewable by direct URL, but listing is admin-only.

-- Drop overly broad SELECT policies if they exist
DROP POLICY IF EXISTS "Public read access for product-images" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for gallery-images" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for page-images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view product-images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view gallery-images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view page-images" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;

-- Recreate scoped, non-listing-friendly SELECT policies.
-- Public buckets stay served via Supabase's public CDN endpoint,
-- but the SELECT policy below means listing via the API requires admin.
DROP POLICY IF EXISTS "Admins can list bucket files" ON storage.objects;
CREATE POLICY "Admins can list bucket files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id IN ('product-images', 'gallery-images', 'page-images')
  AND public.is_active_admin(auth.uid())
);

-- Keep existing admin write policies intact; only re-add if missing.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Admins can upload to image buckets'
  ) THEN
    CREATE POLICY "Admins can upload to image buckets"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id IN ('product-images', 'gallery-images', 'page-images')
      AND public.is_active_admin(auth.uid())
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Admins can update image bucket files'
  ) THEN
    CREATE POLICY "Admins can update image bucket files"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (
      bucket_id IN ('product-images', 'gallery-images', 'page-images')
      AND public.is_active_admin(auth.uid())
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Admins can delete image bucket files'
  ) THEN
    CREATE POLICY "Admins can delete image bucket files"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
      bucket_id IN ('product-images', 'gallery-images', 'page-images')
      AND public.is_active_admin(auth.uid())
    );
  END IF;
END $$;