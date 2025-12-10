-- Drop all existing policies on user_roles
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;

-- Create PERMISSIVE policies explicitly
-- Users can view their own roles
CREATE POLICY "Users can view own roles" 
ON public.user_roles 
AS PERMISSIVE
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

-- Admins can view all roles
CREATE POLICY "Admins can view all roles" 
ON public.user_roles 
AS PERMISSIVE
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can insert roles
CREATE POLICY "Admins can insert roles" 
ON public.user_roles 
AS PERMISSIVE
FOR INSERT 
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update roles
CREATE POLICY "Admins can update roles" 
ON public.user_roles 
AS PERMISSIVE
FOR UPDATE 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete roles
CREATE POLICY "Admins can delete roles" 
ON public.user_roles 
AS PERMISSIVE
FOR DELETE 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));