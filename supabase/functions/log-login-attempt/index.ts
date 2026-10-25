import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MAX_PER_HOUR = 30;
const FN_NAME = "log-login-attempt";

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Client IP from the gateway proxy (first entry of the chain).
    const ip =
      (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() ||
      "unknown";

    // Rate limit per IP: max MAX_PER_HOUR calls per rolling hour.
    const { data: row } = await admin
      .from("admin_setup_rate_limits")
      .select("*")
      .eq("ip_address", ip)
      .eq("function_name", FN_NAME)
      .maybeSingle();

    const nowIso = new Date().toISOString();
    if (row) {
      const first = new Date(row.first_attempt).getTime();
      const withinHour = Date.now() - first < 3_600_000;
      if (withinHour && row.attempts >= MAX_PER_HOUR) {
        return json({ error: "Too many requests" }, 429);
      }
      await admin
        .from("admin_setup_rate_limits")
        .update({
          attempts: withinHour ? row.attempts + 1 : 1,
          first_attempt: withinHour ? row.first_attempt : nowIso,
          last_attempt: nowIso,
        })
        .eq("ip_address", ip)
        .eq("function_name", FN_NAME);
    } else {
      await admin.from("admin_setup_rate_limits").insert({
        ip_address: ip,
        function_name: FN_NAME,
        attempts: 1,
        first_attempt: nowIso,
        last_attempt: nowIso,
      });
    }

    const body = await req.json().catch(() => null);
    const email =
      typeof body?.email === "string"
        ? body.email.toLowerCase().trim().slice(0, 200)
        : null;
    const success = typeof body?.success === "boolean" ? body.success : null;
    if (!email || success === null) {
      return json({ error: "Invalid payload" }, 400);
    }
    const failure_reason =
      typeof body?.failure_reason === "string"
        ? body.failure_reason.slice(0, 200)
        : null;
    const user_agent =
      typeof body?.user_agent === "string" ? body.user_agent.slice(0, 500) : null;

    const { error } = await admin.from("login_attempts").insert({
      email,
      success,
      failure_reason,
      ip_address: ip,
      user_agent,
    });
    if (error) throw error;

    return json({ success: true }, 200);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return json({ error: message }, 500);
  }
});
