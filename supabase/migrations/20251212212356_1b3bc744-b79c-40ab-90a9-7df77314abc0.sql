-- Add explicit protection against anonymous reads on orders table
CREATE POLICY "Require authentication for orders access"
ON public.orders
AS RESTRICTIVE
FOR SELECT
TO public
USING (auth.uid() IS NOT NULL);