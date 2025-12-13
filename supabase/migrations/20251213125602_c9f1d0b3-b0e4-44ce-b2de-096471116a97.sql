-- Add RLS policies to otp_rate_limits and password_reset_otps tables
-- These tables should only be accessed by edge functions using service role, not by regular users

-- Block all public access to otp_rate_limits (only service role can access)
CREATE POLICY "Block all public access to otp_rate_limits"
ON public.otp_rate_limits
FOR ALL
USING (false);

-- Block all public access to password_reset_otps (only service role can access)
CREATE POLICY "Block all public access to password_reset_otps"
ON public.password_reset_otps
FOR ALL
USING (false);