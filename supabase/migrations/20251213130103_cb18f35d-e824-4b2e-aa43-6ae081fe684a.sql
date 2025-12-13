-- Add restrictive policy to block anonymous access to user_roles table
-- This ensures only authenticated users can access the table at all
-- The restrictive policy works as an AND condition with other policies

CREATE POLICY "Require authentication for user_roles"
ON public.user_roles
AS RESTRICTIVE
FOR ALL
TO public
USING (auth.uid() IS NOT NULL);