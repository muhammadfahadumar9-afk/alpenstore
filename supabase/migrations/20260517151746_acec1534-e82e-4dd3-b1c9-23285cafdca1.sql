
-- AUDIT LOGS
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID,
  actor_email TEXT,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_actor ON public.audit_logs(actor_id);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs" ON public.audit_logs
  FOR SELECT USING (is_active_admin(auth.uid()));
CREATE POLICY "Admins can insert audit logs" ON public.audit_logs
  FOR INSERT WITH CHECK (is_active_admin(auth.uid()));

-- LOGIN ATTEMPTS
CREATE TABLE public.login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT,
  success BOOLEAN NOT NULL DEFAULT false,
  ip_address TEXT,
  user_agent TEXT,
  failure_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_login_attempts_created_at ON public.login_attempts(created_at DESC);
CREATE INDEX idx_login_attempts_email ON public.login_attempts(email);
CREATE INDEX idx_login_attempts_ip ON public.login_attempts(ip_address);
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view login attempts" ON public.login_attempts
  FOR SELECT USING (is_active_admin(auth.uid()));
CREATE POLICY "Anyone can insert login attempts" ON public.login_attempts
  FOR INSERT WITH CHECK (true);

-- IP RULES
CREATE TABLE public.ip_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL UNIQUE,
  rule_type TEXT NOT NULL CHECK (rule_type IN ('allow', 'block')),
  reason TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ip_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage ip rules - select" ON public.ip_rules
  FOR SELECT USING (is_active_admin(auth.uid()));
CREATE POLICY "Admins manage ip rules - insert" ON public.ip_rules
  FOR INSERT WITH CHECK (is_active_admin(auth.uid()));
CREATE POLICY "Admins manage ip rules - update" ON public.ip_rules
  FOR UPDATE USING (is_active_admin(auth.uid())) WITH CHECK (is_active_admin(auth.uid()));
CREATE POLICY "Admins manage ip rules - delete" ON public.ip_rules
  FOR DELETE USING (is_active_admin(auth.uid()));

-- SECURITY SETTINGS (single row)
CREATE TABLE public.security_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  maintenance_mode BOOLEAN NOT NULL DEFAULT false,
  maintenance_message TEXT DEFAULT 'We are currently performing scheduled maintenance. Please check back shortly.',
  session_timeout_minutes INTEGER NOT NULL DEFAULT 60,
  enforce_ip_allowlist BOOLEAN NOT NULL DEFAULT false,
  updated_by UUID,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.security_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read security settings" ON public.security_settings
  FOR SELECT USING (true);
CREATE POLICY "Admins can update security settings" ON public.security_settings
  FOR UPDATE USING (is_active_admin(auth.uid())) WITH CHECK (is_active_admin(auth.uid()));
CREATE POLICY "Admins can insert security settings" ON public.security_settings
  FOR INSERT WITH CHECK (is_active_admin(auth.uid()));

INSERT INTO public.security_settings (maintenance_mode) VALUES (false);

-- SOFT DELETE
ALTER TABLE public.products ADD COLUMN deleted_at TIMESTAMPTZ;
ALTER TABLE public.blog_posts ADD COLUMN deleted_at TIMESTAMPTZ;
CREATE INDEX idx_products_deleted_at ON public.products(deleted_at);
CREATE INDEX idx_blog_posts_deleted_at ON public.blog_posts(deleted_at);
