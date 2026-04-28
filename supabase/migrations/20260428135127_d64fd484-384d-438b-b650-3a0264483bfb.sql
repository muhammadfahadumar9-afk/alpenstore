-- 1. Tighten OTP rate-limit table: restrictive policy now also blocks inserts
DROP POLICY IF EXISTS "Block all access to otp_rate_limits" ON public.otp_rate_limits;
CREATE POLICY "Block all client access to otp_rate_limits"
ON public.otp_rate_limits
AS RESTRICTIVE
FOR ALL
TO public
USING (false)
WITH CHECK (false);

-- 2. Replace the broad public SELECT on blog_comments with role-split policies
DROP POLICY IF EXISTS "Anyone can view comments" ON public.blog_comments;

CREATE POLICY "Anon can view comments (no user_id via grants)"
ON public.blog_comments
FOR SELECT
TO anon
USING (true);

CREATE POLICY "Authenticated can view comments"
ON public.blog_comments
FOR SELECT
TO authenticated
USING (true);

-- 3. Same for reviews
DROP POLICY IF EXISTS "Anon can view non-identifying review fields" ON public.reviews;
DROP POLICY IF EXISTS "Authenticated users can view reviews" ON public.reviews;

CREATE POLICY "Anon can view reviews (no user_id via grants)"
ON public.reviews
FOR SELECT
TO anon
USING (true);

CREATE POLICY "Authenticated can view reviews"
ON public.reviews
FOR SELECT
TO authenticated
USING (true);