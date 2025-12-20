-- Fix profiles table: Remove overly permissive policy
DROP POLICY IF EXISTS "Require authentication for profiles" ON public.profiles;

-- Fix orders table: Remove overly permissive policy  
DROP POLICY IF EXISTS "Require authentication for orders" ON public.orders;

-- Fix user_roles table: Remove overly permissive policy
DROP POLICY IF EXISTS "Require authentication for user_roles" ON public.user_roles;