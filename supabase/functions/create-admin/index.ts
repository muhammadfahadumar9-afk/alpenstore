import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, password, setupKey } = await req.json();
    
    // Security: Only allow setup with correct key (no default fallback for security)
    const SETUP_KEY = Deno.env.get('ADMIN_SETUP_KEY');
    if (!SETUP_KEY || setupKey !== SETUP_KEY) {
      console.error('Invalid setup key provided');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Check if any admin already exists
    const { data: existingAdmins, error: checkError } = await supabase
      .from('user_roles')
      .select('id')
      .eq('role', 'admin')
      .limit(1);

    if (checkError) {
      console.error('Error checking existing admins:', checkError);
      throw checkError;
    }

    if (existingAdmins && existingAdmins.length > 0) {
      console.log('Admin already exists, skipping setup');
      return new Response(
        JSON.stringify({ message: 'Admin already exists', success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create the admin user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (authError) {
      console.error('Error creating admin user:', authError);
      throw authError;
    }

    console.log('Admin user created:', authData.user?.id);

    // Assign admin role
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: authData.user!.id,
        role: 'admin'
      });

    if (roleError) {
      console.error('Error assigning admin role:', roleError);
      throw roleError;
    }

    console.log('Admin role assigned successfully');

    return new Response(
      JSON.stringify({ 
        message: 'Admin account created successfully',
        success: true,
        userId: authData.user!.id
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Setup error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
