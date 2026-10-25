-- 1. blog_comments: remove broad authenticated read; all reads go through blog_comments_public view
DROP POLICY IF EXISTS "Authenticated can view comments" ON public.blog_comments;

-- 2. reviews: remove broad authenticated read; reads go through reviews_public view
DROP POLICY IF EXISTS "Authenticated can view reviews" ON public.reviews;

-- 3. security_settings: admin-only reads + public view exposing only maintenance fields
DROP POLICY IF EXISTS "Anyone can read security settings" ON public.security_settings;
CREATE POLICY "Admins can read security settings"
  ON public.security_settings FOR SELECT TO authenticated
  USING (is_active_admin(auth.uid()));

CREATE OR REPLACE VIEW public.security_settings_public AS
  SELECT maintenance_mode, maintenance_message FROM public.security_settings;
GRANT SELECT ON public.security_settings_public TO anon, authenticated;

-- 4. login_attempts: remove public insert (logging moves to a rate-limited edge function)
DROP POLICY IF EXISTS "Anyone can insert login attempts" ON public.login_attempts;

-- 5. team_members: admin-only table reads + public view for site pages
DROP POLICY IF EXISTS "Anyone can view team members" ON public.team_members;
CREATE POLICY "Admins can view team members"
  ON public.team_members FOR SELECT TO authenticated
  USING (is_active_admin(auth.uid()));

CREATE OR REPLACE VIEW public.team_members_public AS
  SELECT id, name, role, title, bio, image_url, section, branch_name, display_order
  FROM public.team_members;
GRANT SELECT ON public.team_members_public TO anon, authenticated;

-- make sure the existing privacy views remain readable
GRANT SELECT ON public.blog_comments_public TO anon, authenticated;
GRANT SELECT ON public.reviews_public TO anon, authenticated;
