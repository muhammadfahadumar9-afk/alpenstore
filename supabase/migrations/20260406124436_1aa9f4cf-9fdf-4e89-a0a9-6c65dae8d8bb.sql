
-- Fix: Restrict "Admins can insert roles" to authenticated only
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
CREATE POLICY "Admins can insert roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (is_active_admin(auth.uid()));
