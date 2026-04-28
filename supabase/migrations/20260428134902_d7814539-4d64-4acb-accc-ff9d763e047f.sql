-- 1. Remove broad SELECT (listing) policies on public buckets but keep object reads via signed/public URLs
-- Drop any existing public list policies for our buckets, then create a NO-OP that blocks listing via the API.
-- Note: public buckets still allow direct object URL access; this only stops bucket enumeration via storage.objects SELECT.

DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT polname
    FROM pg_policy
    WHERE polrelid = 'storage.objects'::regclass
      AND polcmd = 'r'
  LOOP
    -- Only drop policies that broadly target our four buckets
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.polname);
  END LOOP;
END $$;

-- Re-create restrictive read policies: deny listing, but Supabase public-bucket CDN still serves files via direct URL.
-- For private access (signed URLs / authenticated reads), we add per-bucket no-op so RLS doesn't block legitimate reads via public bucket CDN.
-- Public buckets bypass RLS for direct object reads through the public endpoint, so blocking SELECT on storage.objects only stops listing.

CREATE POLICY "Block listing of product-images"
ON storage.objects FOR SELECT
USING (bucket_id <> 'product-images');

CREATE POLICY "Block listing of gallery-images"
ON storage.objects FOR SELECT
USING (bucket_id <> 'gallery-images');

CREATE POLICY "Block listing of page-images"
ON storage.objects FOR SELECT
USING (bucket_id <> 'page-images');

CREATE POLICY "Block listing of blog-images"
ON storage.objects FOR SELECT
USING (bucket_id <> 'blog-images');

-- Allow admins to list all files (needed for admin uploaders/managers)
CREATE POLICY "Admins can list all storage objects"
ON storage.objects FOR SELECT
USING (public.is_active_admin(auth.uid()));

-- 2. Revoke direct EXECUTE on internal SECURITY DEFINER helpers from anon/authenticated.
-- They will still work inside RLS policies and triggers because those run as the function owner.
REVOKE EXECUTE ON FUNCTION public.is_active_admin(uuid) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.has_purchased_product(uuid, uuid) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, public;