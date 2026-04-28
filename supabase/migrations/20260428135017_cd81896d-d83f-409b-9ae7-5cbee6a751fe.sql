-- Allow authenticated users to read user_id again (needed by app to show "delete own" controls).
-- Anonymous visitors still cannot read user_id.
GRANT SELECT (user_id) ON public.blog_comments TO authenticated;
GRANT SELECT (user_id) ON public.reviews TO authenticated;