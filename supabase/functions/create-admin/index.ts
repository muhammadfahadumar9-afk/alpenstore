import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MAX_ATTEMPTS_PER_HOUR = 3;
const FUNCTION_NAME = 'create-admin';

async function checkRateLimit(supabase: any, ip: string): Promise<boolean> {
  const oneHourAgo = new Date(Date.now() - 3600000).toISOString();

  const { data: existing } = await supabase
    .from('admin_setup_rate_limits')
    .select('*')
    .eq('ip_address', ip)
    .eq('function_name', FUNCTION_NAME)
    .maybeSingle();

  if (existing) {
    if (existing.first_attempt > oneHourAgo) {
      if (existing.attempts >= MAX_ATTEMPTS_PER_HOUR) {
        return false; // rate limited
      }
      await supabase
        .from('admin_setup_rate_limits')
        .update({
          attempts: existing.attempts + 1,
          last_attempt: new Date().toISOString(),
        })
        .eq('id', existing.id);
    } else {
      // Window expired, reset
      await supabase
        .from('admin_setup_rate_limits')
        .update({
          attempts: 1,
          first_attempt: new Date().toISOString(),
          last_attempt: new Date().toISOString(),
        })
        .eq('id', existing.id);
    }
  } else {
    await supabase.from('admin_setup_rate_limits').insert({
      ip_address: ip,
      function_name: FUNCTION_NAME,
    });
  }
  return true;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('cf-connecting-ip') ||
    'unknown';

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Rate limit check
    const allowed = await checkRateLimit(supabase, ip);
    if (!allowed) {
      console.warn(`[create-admin] Rate limit exceeded for IP: ${ip}`);
      return new Response(
        JSON.stringify({ error: 'Too many attempts. Try again in an hour.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { email, password, setupKey } = await req.json();

    const SETUP_KEY = Deno.env.get('ADMIN_SETUP_KEY');
    if (!SETUP_KEY || setupKey !== SETUP_KEY) {
      console.warn(`[create-admin] Invalid setup key from IP: ${ip}`);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if any admin already exists
    const { data: existingAdmins, error: checkError } = await supabase
      .from('user_roles')
      .select('id')
      .eq('role', 'admin')
      .limit(1);

    if (checkError) throw checkError;

    if (existingAdmins && existingAdmins.length > 0) {
      console.log('[create-admin] Admin already exists, skipping setup');
      return new Response(
        JSON.stringify({ message: 'Admin already exists', success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (authError) throw authError;

    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({ user_id: authData.user!.id, role: 'admin' });
    if (roleError) throw roleError;

    console.log(`[create-admin] Admin created from IP: ${ip}, userId: ${authData.user?.id}`);

    return new Response(
      JSON.stringify({
        message: 'Admin account created successfully',
        success: true,
        userId: authData.user!.id,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error(`[create-admin] Error from IP ${ip}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
