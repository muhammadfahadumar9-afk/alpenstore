CREATE TABLE IF NOT EXISTS public.admin_setup_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address text NOT NULL,
  function_name text NOT NULL,
  attempts integer NOT NULL DEFAULT 1,
  first_attempt timestamptz NOT NULL DEFAULT now(),
  last_attempt timestamptz NOT NULL DEFAULT now(),
  UNIQUE (ip_address, function_name)
);

ALTER TABLE public.admin_setup_rate_limits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Block all client access to admin_setup_rate_limits" ON public.admin_setup_rate_limits;
CREATE POLICY "Block all client access to admin_setup_rate_limits"
ON public.admin_setup_rate_limits
FOR ALL
USING (false)
WITH CHECK (false);

CREATE INDEX IF NOT EXISTS idx_admin_setup_rate_limits_lookup
ON public.admin_setup_rate_limits (ip_address, function_name);