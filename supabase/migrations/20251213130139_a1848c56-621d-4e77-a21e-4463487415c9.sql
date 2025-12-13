-- Add restrictive policies to block anonymous access to orders and profiles tables
-- These ensure only authenticated users can access these tables at all
-- The restrictive policy works as an AND condition with other policies

-- Block anonymous access to orders table
CREATE POLICY "Require authentication for orders"
ON public.orders
AS RESTRICTIVE
FOR ALL
TO public
USING (auth.uid() IS NOT NULL);

-- Block anonymous access to profiles table
CREATE POLICY "Require authentication for profiles"
ON public.profiles
AS RESTRICTIVE
FOR ALL
TO public
USING (auth.uid() IS NOT NULL);