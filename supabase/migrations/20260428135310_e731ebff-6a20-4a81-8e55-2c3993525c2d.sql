DROP POLICY IF EXISTS "Block all client access to admin_setup_rate_limits" ON public.admin_setup_rate_limits;
CREATE POLICY "Block all client access to admin_setup_rate_limits"
ON public.admin_setup_rate_limits
AS RESTRICTIVE
FOR ALL
TO public
USING (false)
WITH CHECK (false);