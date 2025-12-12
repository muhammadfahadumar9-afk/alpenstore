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
const MAX_REQUESTS_PER_DAY = 10;

interface SendOTPRequest {
  phone: string;
}

interface RateLimitRecord {
  phone: string;
  hourly_count: number;
  daily_count: number;
  first_hourly_request: string;
  first_daily_request: string;
}

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// In-memory rate limit store (will reset on function restart)
// For production, this should use a database table or Redis
const rateLimits = new Map<string, RateLimitRecord>();

function checkRateLimit(phone: string): { allowed: boolean; message?: string } {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  let record = rateLimits.get(phone);

  if (!record) {
    // First request from this phone
    record = {
      phone,
      hourly_count: 0,
      daily_count: 0,
      first_hourly_request: now.toISOString(),
      first_daily_request: now.toISOString(),
    };
  }

  // Reset hourly count if the first hourly request was more than an hour ago
  if (new Date(record.first_hourly_request) < oneHourAgo) {
    record.hourly_count = 0;
    record.first_hourly_request = now.toISOString();
  }

  // Reset daily count if the first daily request was more than a day ago
  if (new Date(record.first_daily_request) < oneDayAgo) {
    record.daily_count = 0;
    record.first_daily_request = now.toISOString();
  }

  // Check limits
  if (record.hourly_count >= MAX_REQUESTS_PER_HOUR) {
    const resetTime = new Date(new Date(record.first_hourly_request).getTime() + 60 * 60 * 1000);
    const minutesLeft = Math.ceil((resetTime.getTime() - now.getTime()) / (60 * 1000));
    console.log(`Rate limit exceeded (hourly) for phone: ${phone}. Count: ${record.hourly_count}`);
    return {
      allowed: false,
      message: `Too many OTP requests. Please try again in ${minutesLeft} minutes.`,
    };
  }

  if (record.daily_count >= MAX_REQUESTS_PER_DAY) {
    const resetTime = new Date(new Date(record.first_daily_request).getTime() + 24 * 60 * 60 * 1000);
    const hoursLeft = Math.ceil((resetTime.getTime() - now.getTime()) / (60 * 60 * 1000));
    console.log(`Rate limit exceeded (daily) for phone: ${phone}. Count: ${record.daily_count}`);
    return {
      allowed: false,
      message: `Too many OTP requests. Please try again in ${hoursLeft} hours.`,
    };
  }

  // Increment counts
  record.hourly_count++;
  record.daily_count++;
  rateLimits.set(phone, record);

  console.log(`OTP request allowed for phone: ${phone}. Hourly: ${record.hourly_count}/${MAX_REQUESTS_PER_HOUR}, Daily: ${record.daily_count}/${MAX_REQUESTS_PER_DAY}`);

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

    // Check rate limit BEFORE any other operations
    const rateLimitCheck = checkRateLimit(normalizedPhone);
    if (!rateLimitCheck.allowed) {
      console.log(`Rate limit blocked request for: ${normalizedPhone}`);
      return new Response(
        JSON.stringify({ error: rateLimitCheck.message }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

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
