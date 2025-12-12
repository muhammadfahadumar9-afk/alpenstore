-- Create table for OTP rate limiting
CREATE TABLE public.otp_rate_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT NOT NULL UNIQUE,
  hourly_count INTEGER NOT NULL DEFAULT 0,
  first_hourly_request TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX idx_otp_rate_limits_phone ON public.otp_rate_limits(phone);

-- Enable RLS (allow access only through service role)
ALTER TABLE public.otp_rate_limits ENABLE ROW LEVEL SECURITY;

-- No public policies - only service role can access this table