-- 1. Remove anon SELECT on base tables; provide privacy-safe public views instead.
DROP POLICY IF EXISTS "Anon can view comments (no user_id via grants)" ON public.blog_comments;
DROP POLICY IF EXISTS "Anon can view reviews (no user_id via grants)" ON public.reviews;
REVOKE SELECT ON public.blog_comments FROM anon;
REVOKE SELECT ON public.reviews FROM anon;

-- Public, privacy-safe views (no user_id)
CREATE OR REPLACE VIEW public.blog_comments_public
WITH (security_invoker = true) AS
SELECT id, post_id, author_name, content, created_at
FROM public.blog_comments;

GRANT SELECT ON public.blog_comments_public TO anon, authenticated;

-- reviews_public already exists (used by ProductReviews); make sure anon can read it.
GRANT SELECT ON public.reviews_public TO anon, authenticated;

-- 2. Remove redundant permissive admin INSERT policy on user_roles (the restrictive one already enforces admin-only)
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;

-- Re-create as a single, clear permissive admin-only policy (restrictive policy still gates it)
CREATE POLICY "Only admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.is_active_admin(auth.uid()));