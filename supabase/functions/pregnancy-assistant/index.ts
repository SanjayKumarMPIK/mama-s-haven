import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ─── Tone-specific persona (kept SHORT — tone is flavor, not verbosity) ───────

const TONE_PROMPTS: Record<string, string> = {
  doctor: `You are a calm, knowledgeable health advisor. Use clear, evidence-based language. You are not a replacement for a real doctor.`,
  mom: `You are a warm, experienced mother. Speak with empathy and reassurance. Use a supportive, conversational tone.`,
  coach: `You are an encouraging wellness coach. Be motivating and action-oriented. Give practical tips with positive energy.`,
};

// ─── Core Response Rules (MANDATORY for every response) ──────────────────────

const RESPONSE_RULES = `
RESPONSE FORMAT RULES — follow these strictly for EVERY response:

1. LENGTH: Keep responses to 2–4 short lines by default. Max 4 bullet points if listing.
2. STRUCTURE (always follow):
   - Line 1: Direct answer (1 sentence)
   - Lines 2-4: Key actionable suggestions (short bullets, max 4)
   - Optional last line: A single practical tip (only if truly helpful)
3. NO long paragraphs. NO storytelling. NO over-explanations. NO repeating obvious info.
4. Use markdown bullets (- ) for lists. Use **bold** for key terms only.
5. Use soft language: "You may try…", "This can help…", "Consider…"
6. Only give detailed/longer answers if the user explicitly asks with words like "explain", "why", "detailed plan", or "tell me more".
7. Responses must feel like a smart health companion texting helpful advice — not a lecture.

EXAMPLE of ideal response:
User: "What should I eat this week?"
Response:
Focus on light, nutritious meals this week.

- Include **iron-rich foods** (spinach, dates, jaggery)
- Eat small, frequent meals
- Stay hydrated with water and coconut water
- Add seasonal fruits for vitamins

💡 Tip: Pair iron foods with lemon/amla for better absorption.`;

// ─── Safety Rules ─────────────────────────────────────────────────────────────

const SAFETY_RULES = `
SAFETY RULES — follow without exception:
- NEVER provide a medical diagnosis or suggest specific medications/supplements.
- For serious symptoms (bleeding, severe pain, reduced fetal movement, high fever, vision changes), immediately advise contacting a healthcare provider.
- Frame all advice as suggestions, not prescriptions.
- Be honest when unsure: "I'm not sure — please ask your healthcare provider."
- End symptom-related advice with a brief disclaimer like "Please consult your doctor for personalized guidance."`;

// ─── Build System Prompt ──────────────────────────────────────────────────────

function buildSystemPrompt(tone: string, dueDate?: string, trimester?: number, profile?: Record<string, unknown>) {
  const persona = TONE_PROMPTS[tone] || TONE_PROMPTS.mom;

  let context = "";
  if (dueDate) context += `\nUser's due date: ${dueDate}.`;
  if (trimester) context += ` Trimester ${trimester}.`;
  if (profile?.age) context += ` Age: ${profile.age}.`;
  if (profile?.firstTime) context += ` First pregnancy.`;

  return `${persona}
${context}

You are part of SwasthyaSakhi, a trusted women's health companion app used across India.
${RESPONSE_RULES}
${SAFETY_RULES}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, tone = "mom", dueDate, trimester, profile, weekContext, language } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let systemPrompt = buildSystemPrompt(tone, dueDate, trimester, profile);
    if (typeof weekContext === "string" && weekContext.trim()) {
      systemPrompt += `\n\nUser context from SwasthyaSakhi app:\n${weekContext.trim()}`;
    }
    if (typeof language === "string" && language.trim()) {
      systemPrompt += `\n\nRespond in: ${language}. Keep the same short format regardless of language.`;
    }

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
