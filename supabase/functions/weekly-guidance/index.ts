/**
 * Supabase Edge Function: weekly-guidance
 *
 * GET /functions/v1/weekly-guidance?dob=YYYY-MM-DD
 *   Body (optional JSON): { logs: { ... } }
 *
 * Can also receive logs via POST body for richer guidance.
 * When logs aren't provided, returns baseline guidance for the age group.
 */

// --- Inline engine (Deno-compatible, no npm imports) ---

type AgeGroup = "Early Puberty" | "Peak Puberty" | "Identity Phase" | "Maturity Phase" | "Adult";
type SymptomKey = "cramps" | "fatigue" | "moodSwings" | "headache" | "acne" | "breastTenderness" | "bloating";

function calculateAge(dobISO: string, now: Date = new Date()): number {
  const dob = new Date(dobISO);
  if (isNaN(dob.getTime())) return -1;
  let age = now.getFullYear() - dob.getFullYear();
  const md = now.getMonth() - dob.getMonth();
  if (md < 0 || (md === 0 && now.getDate() < dob.getDate())) age--;
  return age;
}

function classifyAgeGroup(age: number): AgeGroup {
  if (age >= 10 && age <= 12) return "Early Puberty";
  if (age >= 13 && age <= 14) return "Peak Puberty";
  if (age >= 15 && age <= 16) return "Identity Phase";
  if (age >= 17 && age <= 18) return "Maturity Phase";
  return "Adult";
}

const SYMPTOM_LABELS: Record<string, string> = {
  cramps: "Cramps", fatigue: "Fatigue", moodSwings: "Mood Swings",
  headache: "Headache", acne: "Acne", breastTenderness: "Breast Tenderness", bloating: "Bloating",
};

interface SymptomFreq { key: SymptomKey; label: string; count: number; }

function countPeriodSymptoms(logs: Record<string, any>, daysBack = 7, today = new Date()): SymptomFreq[] {
  const cutoff = new Date(today); cutoff.setDate(cutoff.getDate() - daysBack);
  const cutoffISO = cutoff.toISOString().slice(0, 10);
  const todayISO = today.toISOString().slice(0, 10);
  const counts: Record<string, number> = {};
  for (const [dateISO, entry] of Object.entries(logs)) {
    if (dateISO < cutoffISO || dateISO > todayISO) continue;
    if (!entry || (entry as any).phase !== "puberty") continue;
    const symptoms = (entry as any).symptoms;
    if (!symptoms) continue;
    for (const [k, v] of Object.entries(symptoms)) { if (v === true) counts[k] = (counts[k] || 0) + 1; }
  }
  return Object.entries(counts)
    .map(([k, c]) => ({ key: k as SymptomKey, label: SYMPTOM_LABELS[k] ?? k, count: c }))
    .sort((a, b) => b.count - a.count);
}

// Minimal guidance text generators (subset — full engine lives client-side)
function experienceText(ageGroup: AgeGroup, symptoms: string[]): string {
  if (!symptoms.length) return "No specific period symptoms were logged this week. Keep tracking — even quiet weeks tell your body's story.";
  return `Based on your ${ageGroup} profile and this week's symptoms (${symptoms.join(", ")}), your body is going through normal hormonal changes. Keep tracking for deeper personal insights.`;
}

function nutritionAdvice(symptoms: SymptomKey[]): string[] {
  const map: Record<string, string> = {
    cramps: "Focus on iron & magnesium — spinach, bananas, dark chocolate, pumpkin seeds.",
    fatigue: "Boost iron & protein — eggs, dates, legumes, leafy greens.",
    moodSwings: "Omega-3 from flaxseeds/walnuts + steady blood sugar with small, frequent meals.",
    headache: "Stay hydrated (8+ glasses) and include magnesium-rich almonds & bananas.",
    acne: "Zinc-rich foods (pumpkin seeds, chickpeas) and reduce refined sugar.",
    breastTenderness: "Reduce caffeine; flax and sunflower seeds may ease discomfort.",
    bloating: "Reduce salt, drink more water, and eat potassium-rich bananas & coconut water.",
  };
  if (!symptoms.length) return ["Maintain a balanced diet with whole grains, vegetables, and adequate protein.", "Stay hydrated."];
  return symptoms.slice(0, 3).map(s => map[s] ?? "Eat a variety of nutrient-rich foods.").filter(Boolean);
}

function emotionalAdvice(ageGroup: AgeGroup): string[] {
  const base: Record<AgeGroup, string[]> = {
    "Early Puberty": ["Everything you're feeling is normal.", "Talk to someone you trust if you feel overwhelmed."],
    "Peak Puberty": ["Avoid comparing your body to others.", "Mood swings don't define you."],
    "Identity Phase": ["Try journaling your cycle patterns.", "Give yourself permission to slow down."],
    "Maturity Phase": ["Use cycle awareness to set boundaries.", "5 minutes of breathing can shift your nervous system."],
    Adult: ["Honour your body's rhythms.", "Build micro-rituals of care into your period week."],
  };
  return base[ageGroup] ?? base["Adult"];
}

// --- Handler ---

Deno.serve(async (req: Request) => {
  // CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-User-Key",
    }});
  }

  const url = new URL(req.url);
  const dob = url.searchParams.get("dob") ?? "";
  let logs: Record<string, any> = {};

  if (req.method === "POST") {
    try { const body = await req.json(); logs = body.logs ?? {}; } catch { /* empty */ }
  }

  if (!dob) {
    return new Response(JSON.stringify({ error: "Missing ?dob parameter" }), {
      status: 400, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }

  const age = calculateAge(dob);
  const ageGroup = classifyAgeGroup(age);
  const freqs = countPeriodSymptoms(logs);
  const top = freqs.slice(0, 3);
  const topLabels = top.map(s => s.label);
  const topKeys = top.map(s => s.key);

  const result = {
    ageGroup,
    topSymptoms: topLabels,
    experience: experienceText(ageGroup, topLabels),
    nutrition: nutritionAdvice(topKeys),
    emotionalCare: emotionalAdvice(ageGroup),
  };

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  });
});
