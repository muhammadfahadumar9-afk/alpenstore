-- Public privacy views are SELECT-only: block writes through auto-updatable views
REVOKE ALL ON public.blog_comments_public FROM anon, authenticated;
GRANT SELECT ON public.blog_comments_public TO anon, authenticated;

REVOKE ALL ON public.reviews_public FROM anon, authenticated;
GRANT SELECT ON public.reviews_public TO anon, authenticated;

REVOKE ALL ON public.team_members_public FROM anon, authenticated;
GRANT SELECT ON public.team_members_public TO anon, authenticated;

REVOKE ALL ON public.security_settings_public FROM anon, authenticated;
GRANT SELECT ON public.security_settings_public TO anon, authenticated;

-- login_attempts: no more public writes (edge function uses service role)
REVOKE ALL ON public.login_attempts FROM anon, authenticated;
GRANT SELECT ON public.login_attempts TO authenticated;
GRANT ALL ON public.login_attempts TO service_role;

-- rate-limit bookkeeping is service-role only
REVOKE ALL ON public.admin_setup_rate_limits FROM anon, authenticated;
GRANT ALL ON public.admin_setup_rate_limits TO service_role;
