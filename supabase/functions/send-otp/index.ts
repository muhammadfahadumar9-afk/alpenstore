import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
const TWILIO_PHONE_NUMBER = Deno.env.get("TWILIO_PHONE_NUMBER");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

// Rate limiting constants
const MAX_REQUESTS_PER_HOUR = 3;

interface SendOTPRequest {
  phone: string;
}

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

interface RateLimitRecord {
  phone: string;
  hourly_count: number;
  first_hourly_request: string;
}

async function checkRateLimit(supabase: any, phone: string): Promise<{ allowed: boolean; message?: string }> {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  // Get or create rate limit record
  const { data: record, error: fetchError } = await supabase
    .from("otp_rate_limits")
    .select("phone, hourly_count, first_hourly_request")
    .eq("phone", phone)
    .maybeSingle() as { data: RateLimitRecord | null; error: any };

  if (fetchError) {
    console.error("Error fetching rate limit record:", fetchError);
    // Allow request on error to avoid blocking legitimate users
    return { allowed: true };
  }

  let hourlyCount = 0;
  let firstHourlyRequest = now.toISOString();

  if (record) {
    // Check if we need to reset the hourly window
    if (new Date(record.first_hourly_request) < oneHourAgo) {
      // Reset the window
      hourlyCount = 0;
      firstHourlyRequest = now.toISOString();
    } else {
      hourlyCount = record.hourly_count;
      firstHourlyRequest = record.first_hourly_request;
    }
  }

  // Check limit before incrementing
  if (hourlyCount >= MAX_REQUESTS_PER_HOUR) {
    const resetTime = new Date(new Date(firstHourlyRequest).getTime() + 60 * 60 * 1000);
    const minutesLeft = Math.ceil((resetTime.getTime() - now.getTime()) / (60 * 1000));
    console.log(`Rate limit exceeded for phone: ${phone}. Count: ${hourlyCount}/${MAX_REQUESTS_PER_HOUR}`);
    return {
      allowed: false,
      message: `Too many OTP requests. Please try again in ${minutesLeft} minutes.`,
    };
  }

  // Increment count and upsert
  const newCount = hourlyCount + 1;
  const { error: upsertError } = await supabase
    .from("otp_rate_limits")
    .upsert({
      phone,
      hourly_count: newCount,
      first_hourly_request: firstHourlyRequest,
      updated_at: now.toISOString(),
    }, {
      onConflict: "phone"
    });

  if (upsertError) {
    console.error("Error updating rate limit record:", upsertError);
  }

  console.log(`OTP request allowed for phone: ${phone}. Count: ${newCount}/${MAX_REQUESTS_PER_HOUR}`);
  return { allowed: true };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone }: SendOTPRequest = await req.json();

    if (!phone) {
      return new Response(
        JSON.stringify({ error: "Phone number is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Normalize phone number
    const normalizedPhone = phone.replace(/\s+/g, "").replace(/^0/, "+234");

    // Create Supabase client
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Check rate limit BEFORE any other operations
    const rateLimitCheck = await checkRateLimit(supabase, normalizedPhone);
    if (!rateLimitCheck.allowed) {
      console.log(`Rate limit blocked request for: ${normalizedPhone}`);
      return new Response(
        JSON.stringify({ error: rateLimitCheck.message }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user exists with this phone number
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("phone", normalizedPhone)
      .single();

    if (profileError || !profile) {
      // Return generic message for security (don't reveal if phone exists)
      console.log(`No profile found for phone: ${normalizedPhone} (security: returning generic message)`);
      return new Response(
        JSON.stringify({ success: true, message: "If this phone number is registered, you will receive an OTP" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in database
    const { error: upsertError } = await supabase
      .from("password_reset_otps")
      .upsert({
        phone: normalizedPhone,
        otp_hash: otp, // In production, hash this
        expires_at: expiresAt.toISOString(),
        attempts: 0,
        used: false,
      }, {
        onConflict: "phone"
      });

    if (upsertError) {
      console.error("Error storing OTP:", upsertError);
      return new Response(
        JSON.stringify({ error: "Failed to generate OTP" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send OTP via Twilio
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
    const twilioAuth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);

    const twilioResponse = await fetch(twilioUrl, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${twilioAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: normalizedPhone,
        From: TWILIO_PHONE_NUMBER!,
        Body: `Your ALPEN STORE password reset code is: ${otp}. This code expires in 10 minutes.`,
      }),
    });

    if (!twilioResponse.ok) {
      const twilioError = await twilioResponse.text();
      console.error("Twilio error:", twilioError);
      return new Response(
        JSON.stringify({ error: "Failed to send OTP" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`OTP sent successfully to: ${normalizedPhone}`);

    return new Response(
      JSON.stringify({ success: true, message: "OTP sent successfully" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in send-otp function:", error);
    const message = error instanceof Error ? error.message : "An unexpected error occurred";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
