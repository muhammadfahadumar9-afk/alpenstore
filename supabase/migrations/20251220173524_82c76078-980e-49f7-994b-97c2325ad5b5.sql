-- Allow users to delete items from their own pending orders
CREATE POLICY "Users can delete own pending order items"
ON public.order_items
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND orders.user_id = auth.uid()
    AND orders.status = 'pending'
  )
);