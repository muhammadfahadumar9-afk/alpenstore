import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { compare } from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

interface VerifyOTPRequest {
  phone: string;
  otp: string;
  newPassword: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone, otp, newPassword }: VerifyOTPRequest = await req.json();

    if (!phone || !otp || !newPassword) {
      return new Response(
        JSON.stringify({ error: "Phone, OTP, and new password are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return new Response(
        JSON.stringify({ error: "Password must be at least 8 characters with uppercase, lowercase, number, and symbol" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Normalize phone number
    const normalizedPhone = phone.replace(/\s+/g, "").replace(/^0/, "+234");

    // Create Supabase client with service role
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Verify OTP
    const { data: otpRecord, error: otpError } = await supabase
      .from("password_reset_otps")
      .select("*")
      .eq("phone", normalizedPhone)
      .eq("used", false)
      .single();

    if (otpError || !otpRecord) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired OTP" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if OTP expired
    if (new Date(otpRecord.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: "OTP has expired. Please request a new one." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check attempts
    if (otpRecord.attempts >= 3) {
      return new Response(
        JSON.stringify({ error: "Too many attempts. Please request a new OTP." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify OTP matches using bcrypt comparison
    const isValidOtp = await compare(otp, otpRecord.otp_hash);
    if (!isValidOtp) {
      // Increment attempts
      await supabase
        .from("password_reset_otps")
        .update({ attempts: otpRecord.attempts + 1 })
        .eq("id", otpRecord.id);

      return new Response(
        JSON.stringify({ error: "Invalid OTP code" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user_id from profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("phone", normalizedPhone)
      .single();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: "User not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update password using admin API
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      profile.user_id,
      { password: newPassword }
    );

    if (updateError) {
      console.error("Error updating password:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update password" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Mark OTP as used
    await supabase
      .from("password_reset_otps")
      .update({ used: true })
      .eq("id", otpRecord.id);

    console.log("Password reset successful for:", normalizedPhone);

    return new Response(
      JSON.stringify({ success: true, message: "Password updated successfully" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in verify-otp function:", error);
    const message = error instanceof Error ? error.message : "An unexpected error occurred";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
