import { supabase } from "@/integrations/supabase/client";

/**
 * Best-effort client IP discovery for audit logging.
 * Falls back to "unknown" if the lookup fails or is blocked.
 */
let cachedIp: string | null = null;
export async function getClientIp(): Promise<string> {
  if (cachedIp) return cachedIp;
  try {
    const res = await fetch("https://api.ipify.org?format=json", {
      cache: "no-store",
    });
    const json = await res.json();
    cachedIp = json.ip || "unknown";
    return cachedIp!;
  } catch {
    cachedIp = "unknown";
    return cachedIp;
  }
}

export async function logLoginAttempt(params: {
  email: string;
  success: boolean;
  failureReason?: string;
}) {
  try {
    const ip = await getClientIp();
    await supabase.from("login_attempts").insert({
      email: params.email.toLowerCase().trim(),
      success: params.success,
      failure_reason: params.failureReason ?? null,
      ip_address: ip,
      user_agent: navigator.userAgent.slice(0, 500),
    });
  } catch (err) {
    // Logging should never break login flow
    console.warn("logLoginAttempt failed", err);
  }
}

export async function logAuditEvent(params: {
  action: string;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const ip = await getClientIp();
    await supabase.from("audit_logs").insert([{
      actor_id: user.id,
      actor_email: user.email ?? null,
      action: params.action,
      target_type: params.targetType ?? null,
      target_id: params.targetId ?? null,
      metadata: params.metadata ?? {},
      ip_address: ip,
      user_agent: navigator.userAgent.slice(0, 500),
    }]);
  } catch (err) {
    console.warn("logAuditEvent failed", err);
  }
}