-- Create a function to send order status notification
CREATE OR REPLACE FUNCTION public.notify_order_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  customer_email TEXT;
  customer_name TEXT;
  supabase_url TEXT;
  service_role_key TEXT;
BEGIN
  -- Only proceed if status actually changed
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  -- Get customer email from auth.users
  SELECT email INTO customer_email
  FROM auth.users
  WHERE id = NEW.user_id;

  -- Get customer name from profiles
  SELECT full_name INTO customer_name
  FROM public.profiles
  WHERE user_id = NEW.user_id;

  -- Get Supabase URL and service role key from vault or env
  supabase_url := 'https://spmnuwaeesqszsxklyxn.supabase.co';

  -- Call the edge function using pg_net
  PERFORM net.http_post(
    url := supabase_url || '/functions/v1/send-order-notification',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('supabase.service_role_key', true)
    ),
    body := jsonb_build_object(
      'orderId', NEW.id,
      'customerEmail', customer_email,
      'customerName', COALESCE(customer_name, 'Valued Customer'),
      'newStatus', NEW.status,
      'totalAmount', NEW.total_amount
    )
  );

  RETURN NEW;
END;
$$;

-- Create trigger for order status changes
DROP TRIGGER IF EXISTS on_order_status_change ON public.orders;
CREATE TRIGGER on_order_status_change
  AFTER UPDATE OF status ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_order_status_change();