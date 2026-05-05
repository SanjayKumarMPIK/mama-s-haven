import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import nodemailer from "npm:nodemailer@6.9.15";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function sha256(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function createOtpCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();
    const normalizedEmail = normalizeEmail(String(email || ""));
    if (!isValidEmail(normalizedEmail)) {
      return new Response(JSON.stringify({ error: "Invalid email" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const appEmail = Deno.env.get("APP_EMAIL") || "";
    const appPassword = Deno.env.get("APP_PASSWORD") || "";
    if (!supabaseUrl || !serviceRoleKey || !appEmail || !appPassword) {
      throw new Error("Missing required env vars for OTP send");
    }

    const admin = createClient(supabaseUrl, serviceRoleKey);
    const otp = createOtpCode();
    const otpHash = await sha256(`${normalizedEmail}:${otp}`);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    await admin.from("email_otps").insert({
      email: normalizedEmail,
      otp_hash: otpHash,
      expires_at: expiresAt,
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: appEmail,
        pass: appPassword,
      },
    });

    await transporter.sendMail({
      from: `Mama's Haven <${appEmail}>`,
      to: normalizedEmail,
      subject: "Your OTP for Mama's Haven",
      text: `Your OTP is ${otp}. It expires in 10 minutes.`,
      html: `<p>Your OTP is <strong>${otp}</strong>.</p><p>It expires in 10 minutes.</p>`,
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
