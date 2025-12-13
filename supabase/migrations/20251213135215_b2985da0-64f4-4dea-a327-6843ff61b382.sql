-- Add admin update policy for reviews (moderation capability)
CREATE POLICY "Admins can update any review" 
ON public.reviews 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add admin policies for order_items management
CREATE POLICY "Admins can update order items" 
ON public.order_items 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete order items" 
ON public.order_items 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));