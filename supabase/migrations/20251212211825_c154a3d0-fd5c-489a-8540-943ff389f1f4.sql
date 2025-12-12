-- Enable Row Level Security on otp_rate_limits table
-- This table is only accessed by edge functions using service role key (which bypasses RLS)
-- No user-facing policies needed - we just want to block all public access
ALTER TABLE public.otp_rate_limits ENABLE ROW LEVEL SECURITY;

-- Also enable RLS on password_reset_otps table which contains similar sensitive data
ALTER TABLE public.password_reset_otps ENABLE ROW LEVEL SECURITY;