-- Keep direct function calls blocked; RLS policies can still use these helpers internally.
REVOKE EXECUTE ON FUNCTION public.is_active_admin(uuid) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, authenticated, public;

-- Ensure the app can perform the RLS-filtered self role lookup needed after login.
GRANT SELECT ON public.user_roles TO authenticated;