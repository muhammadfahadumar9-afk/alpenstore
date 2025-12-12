-- Add explicit protection against anonymous reads on profiles table
CREATE POLICY "Require authentication for profiles access"
ON public.profiles
AS RESTRICTIVE
FOR SELECT
TO public
USING (auth.uid() IS NOT NULL);

-- Add explicit protection against anonymous reads on user_roles table  
CREATE POLICY "Require authentication for user_roles access"
ON public.user_roles
AS RESTRICTIVE
FOR SELECT
TO public
USING (auth.uid() IS NOT NULL);