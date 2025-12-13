-- Fix security vulnerabilities in orders and profiles tables
-- The "Require authentication" policies are too permissive - they allow any authenticated user to read all rows

-- Drop the overly permissive authentication policies
DROP POLICY IF EXISTS "Require authentication for orders access" ON public.orders;
DROP POLICY IF EXISTS "Require authentication for profiles access" ON public.profiles;
DROP POLICY IF EXISTS "Require authentication for user_roles access" ON public.user_roles;

-- The existing policies are correct:
-- - Users can view/modify their own data (auth.uid() = user_id)
-- - Admins can view all data (has_role check)
-- No additional changes needed as the user-specific and admin policies provide proper access control