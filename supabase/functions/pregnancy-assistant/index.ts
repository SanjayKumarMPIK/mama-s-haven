import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const TONE_PROMPTS: Record<string, string> = {
  doctor: `You are a calm, knowledgeable pregnancy advisor speaking in a professional medical tone. Use clear, evidence-based language. Always clarify you are not a replacement for a real doctor. Structure advice clearly with headings when appropriate.`,
  mom: `You are a warm, experienced mother who has been through pregnancy herself. Speak with empathy, reassurance, and gentle humor. Share relatable wisdom. Use a conversational, supportive tone like a close friend.`,
  coach: `You are an encouraging wellness coach specializing in maternal health. Be motivating and action-oriented. Give practical tips for nutrition, movement, and mental wellness. Keep energy positive and empowering.`,
};

function buildSystemPrompt(tone: string, dueDate?: string, trimester?: number, profile?: Record<string, unknown>) {
  const base = TONE_PROMPTS[tone] || TONE_PROMPTS.mom;

  let context = "";
  if (dueDate) context += `\nThe user's due date is ${dueDate}.`;
  if (trimester) context += ` They are in trimester ${trimester}.`;
  if (profile?.age) context += ` They are ${profile.age} years old.`;
  if (profile?.firstTime) context += ` This is their first pregnancy.`;

  return `${base}
${context}

CRITICAL SAFETY RULES — follow these without exception:
- NEVER provide a medical diagnosis or suggest specific medications.
- For any serious symptom (bleeding, severe pain, reduced fetal movement, high fever, vision changes, severe headache), immediately advise the user to contact their healthcare provider or go to the nearest emergency room.
- Always end advice about symptoms with: "Please consult your doctor or midwife for personalized guidance."
- You may offer general wellness tips (hydration, rest, nutrition, gentle exercise) but frame them as suggestions, not prescriptions.
- Be honest when you don't know something. Say "I'm not sure — please ask your healthcare provider."

You are part of MomBloom, a supportive maternity guidance platform. Keep responses concise but thorough. Use markdown formatting for readability. When relevant, include daily tips for nutrition, hydration, sleep, and activity.`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, tone = "mom", dueDate, trimester, profile } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = buildSystemPrompt(tone, dueDate, trimester, profile);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Too many requests. Please wait a moment and try again." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI usage limit reached. Please try again later." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("pregnancy-assistant error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
