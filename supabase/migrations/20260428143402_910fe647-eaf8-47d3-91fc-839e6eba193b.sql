-- Restore EXECUTE on admin check functions for authenticated users
-- These are SECURITY DEFINER functions that internally restrict to auth.uid(),
-- so it's safe to allow authenticated users to call them.
GRANT EXECUTE ON FUNCTION public.is_active_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;