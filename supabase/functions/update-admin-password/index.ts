import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MAX_ATTEMPTS_PER_HOUR = 3;
const FUNCTION_NAME = 'update-admin-password';

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
        return false;
      }
      await supabase
        .from('admin_setup_rate_limits')
        .update({
          attempts: existing.attempts + 1,
          last_attempt: new Date().toISOString(),
        })
        .eq('id', existing.id);
    } else {
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

    const allowed = await checkRateLimit(supabase, ip);
    if (!allowed) {
      console.warn(`[update-admin-password] Rate limit exceeded for IP: ${ip}`);
      return new Response(
        JSON.stringify({ error: 'Too many attempts. Try again in an hour.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { email, newPassword, setupKey } = await req.json();

    const SETUP_KEY = Deno.env.get('ADMIN_SETUP_KEY');
    if (!SETUP_KEY || setupKey !== SETUP_KEY) {
      console.warn(`[update-admin-password] Invalid setup key from IP: ${ip}`);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find user by email
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) throw listError;

    const user = users.users.find((u) => u.email === email);

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      password: newPassword,
    });
    if (updateError) throw updateError;

    console.log(`[update-admin-password] Password updated for ${email} from IP: ${ip}`);

    return new Response(
      JSON.stringify({ message: 'Password updated successfully', success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error(`[update-admin-password] Error from IP ${ip}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
