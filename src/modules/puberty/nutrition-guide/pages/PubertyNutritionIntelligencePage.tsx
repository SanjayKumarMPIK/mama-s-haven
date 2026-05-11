import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { usePhase } from "@/hooks/usePhase";
import { useProfile } from "@/hooks/useProfile";
import { useHealthLog } from "@/hooks/useHealthLog";
import { useDeficiencyInsights } from "@/hooks/useDeficiencyInsights";
import { usePubertyNutritionIntelligence } from "../hooks/usePubertyNutritionIntelligence";
import { generatePubertyDiet, type PubertyDietInput, type PubertyDietPlan } from "../services/pubertyDietGenerator";
import { getPubertySpecificDiet } from "@/lib/pubertyDietLogic";
import SafetyDisclaimer from "@/components/SafetyDisclaimer";
import ScrollReveal from "@/components/ScrollReveal";
import NutrientCard from "@/components/nutrition/NutrientCard";
import FoodRecommendationCard from "@/components/nutrition/FoodRecommendationCard";
import DeficiencySummaryInline from "@/components/nutrition/DeficiencySummaryInline";
import SafetyWarningBanner from "@/components/nutrition/SafetyWarningBanner";
import { Apple, Calendar, ArrowRight, ArrowLeft, Utensils, Lightbulb, Activity, Clock, Check, Moon, Flame, Leaf, Shield, Sparkles, Sun } from "lucide-react";

// ─── Phase accent map ─────────────────────────────────────────────────────
const phaseAccent: Record<string, {
  gradient: string; bg: string; text: string; border: string;
  cardBg: string; badge: string;
}> = {
  puberty: {
    gradient: "from-pink-500 to-rose-400", bg: "bg-pink-50", text: "text-pink-700",
    border: "border-pink-200/60", cardBg: "bg-gradient-to-br from-pink-50 to-rose-50",
    badge: "bg-pink-100 text-pink-700",
  }
};

function SectionHeader({ title, emoji }: { title: string; emoji: string }) {
  return (
    <div className="flex items-center gap-2 mb-3 mt-1">
      <span className="text-base">{emoji}</span>
      <h2 className="text-base font-bold tracking-tight">{title}</h2>
    </div>
  );
}

// ─── Puberty-specific Deficiency Insights ─────────────────────────────

const NUTRIENT_ICONS: Record<string, React.ReactNode> = {
  Iron: <Flame className="h-5 w-5 text-[#ea527b]" />,
  "Vitamin D": <Sun className="h-5 w-5 text-[#df9a2c]" />,
  Magnesium: <Leaf className="h-5 w-5 text-[#4fb069]" />,
  Calcium: <Shield className="h-5 w-5 text-[#639ac5]" />,
  Protein: <Sparkles className="h-5 w-5 text-[#8d73c7]" />,
  Folate: <Leaf className="h-5 w-5 text-[#4fb069]" />,
  "Vitamin B12": <Sparkles className="h-5 w-5 text-[#8d73c7]" />,
  "Omega-3 (DHA)": <Sparkles className="h-5 w-5 text-[#8d73c7]" />,
  Fiber: <Leaf className="h-5 w-5 text-[#4fb069]" />,
  Zinc: <Sparkles className="h-5 w-5 text-[#8d73c7]" />,
  Potassium: <Leaf className="h-5 w-5 text-[#4fb069]" />,
  "Vitamin C": <Sparkles className="h-5 w-5 text-[#8d73c7]" />,
  "Vitamin B6": <Sparkles className="h-5 w-5 text-[#8d73c7]" />,
  "Vitamin A": <Sparkles className="h-5 w-5 text-[#8d73c7]" />,
  "Vitamin E": <Sparkles className="h-5 w-5 text-[#8d73c7]" />,
};

const NUTRIENT_BAR: Record<string, string> = {
  Iron: "bg-gradient-to-r from-[#f25b83] to-[#f896b0]",
  "Vitamin D": "bg-gradient-to-r from-[#eeb34e] to-[#f5d498]",
  Magnesium: "bg-gradient-to-r from-[#56ba72] to-[#9dd7af]",
  Calcium: "bg-gradient-to-r from-[#5a9bc4] to-[#9bc4e8]",
  Protein: "bg-gradient-to-r from-[#8b73c7] to-[#b8a3e8]",
  Folate: "bg-gradient-to-r from-[#56ba72] to-[#9dd7af]",
  "Vitamin B12": "bg-gradient-to-r from-[#8b73c7] to-[#b8a3e8]",
  "Omega-3 (DHA)": "bg-gradient-to-r from-[#8b73c7] to-[#b8a3e8]",
  Fiber: "bg-gradient-to-r from-[#56ba72] to-[#9dd7af]",
  Zinc: "bg-gradient-to-r from-[#8b73c7] to-[#b8a3e8]",
  Potassium: "bg-gradient-to-r from-[#56ba72] to-[#9dd7af]",
  "Vitamin C": "bg-gradient-to-r from-[#8b73c7] to-[#b8a3e8]",
  "Vitamin B6": "bg-gradient-to-r from-[#8b73c7] to-[#b8a3e8]",
  "Vitamin A": "bg-gradient-to-r from-[#8b73c7] to-[#b8a3e8]",
  "Vitamin E": "bg-gradient-to-r from-[#8b73c7] to-[#b8a3e8]",
};

function PubertyDeficiencyInsights({
  detectedSymptoms,
  nutrientNeeds,
  deficiencyScore,
  deficiencySeverity,
  priorityNutrient,
  riskCounts,
  medicalConditions,
  accent,
}: {
  detectedSymptoms: { id: string; label: string; emoji: string; count: number }[];
  nutrientNeeds: { nutrientId: string; label: string; emoji: string; score: number; reasons: string[]; symptomSources: string[]; foods: { name: string }[] }[];
  deficiencyScore: number;
  deficiencySeverity: string;
  priorityNutrient: string | null;
  riskCounts: { high: number; moderate: number; low: number; good: number };
  medicalConditions: string[];
  accent: { gradient: string; bg: string; text: string; border: string; cardBg: string; badge: string };
}) {
  const severityColor: Record<string, string> = {
    Good: "text-green-600", Mild: "text-yellow-600", Moderate: "text-orange-600", High: "text-red-600", Critical: "text-red-600",
  };
  const severityTone: Record<string, string> = {
    Low: "text-green-600", Moderate: "text-orange-600", High: "text-red-600", Critical: "text-red-600",
  };
  const severityBar: Record<string, string> = {
    Good: "bg-gradient-to-r from-green-400 to-green-300",
    Mild: "bg-gradient-to-r from-yellow-400 to-yellow-300",
    Moderate: "bg-gradient-to-r from-orange-400 to-orange-300",
    High: "bg-gradient-to-r from-red-400 to-red-300",
    Critical: "bg-gradient-to-r from-red-500 to-red-400",
  };

  const likelyDeficiencies = nutrientNeeds.filter(n => n.score >= 0.4).length;

  const topNutrients = [...nutrientNeeds].sort((a, b) => b.score - a.score).slice(0, 5);

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Score + Overview */}
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[24px] border border-[#eee7f3] bg-white p-4">
          <div className="grid gap-4 sm:grid-cols-[180px_1fr]">
            <div className="rounded-2xl border border-[#f0e7f5] bg-[#fffafd] p-4 text-center">
              <p className="text-xs font-semibold text-muted-foreground">Your Nutrition Risk Score</p>
              <div className="mx-auto mt-4 grid h-24 w-24 place-content-center rounded-full border-[8px] border-[#f4d9e9] bg-white">
                <p className="text-4xl font-bold leading-none text-foreground">{deficiencyScore}</p>
                <p className="text-[11px] text-muted-foreground">/100</p>
              </div>
              <p className={`mt-2 text-sm font-semibold ${severityColor[deficiencySeverity]}`}>{deficiencySeverity} Risk</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-xl border border-[#f2ebf6] bg-[#fefcff] p-3">
                <p className="text-sm text-foreground">Likely Deficiencies</p>
                <p className="text-sm font-semibold">{likelyDeficiencies}</p>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-[#f2ebf6] bg-[#fefcff] p-3">
                <p className="text-sm text-foreground">Priority Nutrient</p>
                <p className={`text-sm font-semibold ${severityColor[deficiencySeverity]}`}>{priorityNutrient || "N/A"}</p>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-[#f2ebf6] bg-[#fefcff] p-3">
                <p className="text-sm text-foreground">Energy Impact</p>
                <p className="text-sm font-semibold text-[#ba8a35]">
                  {deficiencyScore >= 50 ? "High" : deficiencyScore >= 30 ? "Moderate" : "Low"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-[#eee7f3] bg-white p-4">
          <h2 className="text-base font-semibold">Deficiency Risk Overview</h2>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-[#eee7f4] bg-white p-3 shadow-[0_4px_18px_rgba(184,164,198,0.1)]">
              <p className="text-xs font-semibold text-red-600">High Risk</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{riskCounts.high}</p>
            </div>
            <div className="rounded-2xl border border-[#eee7f4] bg-white p-3 shadow-[0_4px_18px_rgba(184,164,198,0.1)]">
              <p className="text-xs font-semibold text-orange-600">Moderate Risk</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{riskCounts.moderate}</p>
            </div>
            <div className="rounded-2xl border border-[#eee7f4] bg-white p-3 shadow-[0_4px_18px_rgba(184,164,198,0.1)]">
              <p className="text-xs font-semibold text-green-600">Mild Risk</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{riskCounts.low}</p>
            </div>
            <div className="rounded-2xl border border-[#eee7f4] bg-white p-3 shadow-[0_4px_18px_rgba(184,164,198,0.1)]">
              <p className="text-xs font-semibold text-blue-600">Good</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{riskCounts.good}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Symptom-Based Detection */}
      <section className="grid gap-4 lg:grid-cols-[1fr_1.35fr]">
        <div className="space-y-4 rounded-[24px] border border-[#eee7f3] bg-white p-4">
          <div>
            <h2 className="text-base font-semibold">Symptom-Based Detection</h2>
            <p className="text-xs text-muted-foreground">Symptoms detected from your health logs</p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {detectedSymptoms.length > 0 ? (
              detectedSymptoms.map((s) => (
                <span key={s.id} className="rounded-xl border border-[#eee8f4] bg-white px-3 py-1 text-xs font-medium text-[#6f6583]">
                  {s.emoji} {s.label}
                </span>
              ))
            ) : (
              <p className="col-span-full text-xs text-muted-foreground">No symptoms detected</p>
            )}
          </div>
          <div className="rounded-2xl border border-[#f0e8f5] bg-[#fffafe] p-3">
            <p className="text-sm font-semibold">Possible Deficiencies</p>
            <p className="text-xs text-muted-foreground">Based on your symptoms</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {topNutrients.slice(0, 3).map((n) => (
                <span key={n.nutrientId} className="rounded-lg bg-[#ffeef4] px-2.5 py-1 text-xs font-medium text-[#c85888]">
                  {n.emoji} {n.label}
                </span>
              ))}
            </div>
          </div>
          {medicalConditions.length > 0 && (
            <div className="rounded-2xl border border-[#f0e8f5] bg-[#fffafe] p-3">
              <p className="text-sm font-semibold">Medical Conditions Impact</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {medicalConditions.map((c) => (
                  <span key={c} className="rounded-lg bg-[#eef4ff] px-2.5 py-1 text-xs font-medium text-[#5868c8]">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Top Deficiency Insights */}
        <div className="space-y-3 rounded-[24px] border border-[#eee7f3] bg-white p-4">
          <h2 className="text-base font-semibold">Top Deficiency Insights</h2>
          {topNutrients.length > 0 ? topNutrients.map((n) => {
            const scorePercent = Math.min(100, Math.round(n.score * 100));
            const riskLevel = n.score >= 0.7 ? "High" : n.score >= 0.4 ? "Moderate" : n.score >= 0.15 ? "Low" : "Good";
            return (
              <div key={n.nutrientId} className="rounded-2xl border border-[#eee7f4] bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff4f8]">
                      {NUTRIENT_ICONS[n.label] || <Sparkles className="h-5 w-5 text-[#8d73c7]" />}
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-foreground">{n.label}</h3>
                      <p className="text-xs text-muted-foreground">Probability</p>
                    </div>
                  </div>
                  <p className={`text-xs font-semibold ${severityTone[riskLevel]}`}>{riskLevel} Risk</p>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-2 flex-1 rounded-full bg-[#f2edf6]">
                    <div className={`h-2 rounded-full ${NUTRIENT_BAR[n.label] || "bg-gradient-to-r from-[#8b73c7] to-[#b8a3e8]"}`} style={{ width: `${scorePercent}%` }} />
                  </div>
                  <span className="text-xs font-semibold text-foreground">{scorePercent}%</span>
                </div>
                {n.symptomSources.length > 0 && (
                  <p className="mt-2 text-xs text-foreground/90">
                    <strong>Sources:</strong> {n.symptomSources.join(", ")}
                  </p>
                )}
                {n.reasons.length > 0 && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    <strong>Why:</strong> {n.reasons.slice(0, 2).join(". ")}
                  </p>
                )}
                {n.foods.length > 0 && (
                  <div className="mt-3 rounded-xl bg-[#fff4f8] p-3">
                    <p className="text-xs font-semibold text-[#9c5f84] mb-2">Recommended Foods:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {n.foods.slice(0, 4).map((f, idx) => (
                        <span key={idx} className="rounded-lg bg-white px-2 py-1 text-[11px] font-medium text-[#7d6fbc] border border-[#f0e7f5]">
                          {f.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          }) : (
            <p className="text-xs text-muted-foreground py-4 text-center">No deficiency insights available</p>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-[#efe6f3] bg-white px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <Moon className="h-4 w-4 text-[#8f7bbc]" />
            Insights are based on your logged symptoms and medical conditions — not a substitute for medical advice.
          </p>
        </div>
      </section>
    </div>
  );
}

// ─── Puberty-specific Checklist ────────────────────────────────────────

function PubertyChecklistSection({
  checklistItems,
  accent,
}: {
  checklistItems: { title: string; reason: string; nutrient: string }[];
  accent: { gradient: string; bg: string; text: string; border: string; cardBg: string; badge: string };
}) {
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  const toggle = (idx: number) => setChecked(prev => ({ ...prev, [idx]: !prev[idx] }));

  const completedCount = Object.values(checked).filter(Boolean).length;

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${accent.gradient} flex items-center justify-center shadow-md`}>
            <Check className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold">Puberty Nutrition Checklist</h2>
            <p className="text-[11px] text-muted-foreground">
              Personalized based on your symptoms, conditions, and today's status
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-muted-foreground">
            {completedCount} / {checklistItems.length} completed
          </p>
          <div className="h-2 flex-1 max-w-[120px] rounded-full bg-[#f2edf6] ml-3">
            <div
              className={`h-2 rounded-full bg-gradient-to-r ${accent.gradient}`}
              style={{ width: `${checklistItems.length > 0 ? (completedCount / checklistItems.length) * 100 : 0}%` }}
            />
          </div>
        </div>

        {checklistItems.length === 0 ? (
          <div className="text-center py-10 bg-card rounded-xl border border-dashed">
            <p className="text-muted-foreground text-sm">No checklist items for today. Log symptoms to get personalized recommendations.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {checklistItems.map((item, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${checked[idx] ? "bg-muted/30 border-muted" : "bg-card border-border hover:bg-muted/10"
                  }`}
                onClick={() => toggle(idx)}
              >
                <div className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${checked[idx]
                    ? `bg-gradient-to-br ${accent.gradient} border-transparent`
                    : "border-muted-foreground/30"
                  }`}>
                  {checked[idx] && <Check className="w-3 h-3 text-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${checked[idx] ? "line-through text-muted-foreground" : "text-foreground"}`}>
                    {item.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.reason}</p>
                </div>
                <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${accent.badge}`}>
                  {item.nutrient}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function PubertyNutritionIntelligencePage() {
  const { simpleMode } = useLanguage();
  const { phaseName, phaseEmoji } = usePhase();
  const { result } = usePubertyNutritionIntelligence();
  const deficiencyInsights = useDeficiencyInsights();
  const accent = phaseAccent.puberty;
  const [activeTab, setActiveTab] = useState<'tips' | 'insights' | 'checklist'>('tips');

  const { profile } = useProfile();
  const { logs } = useHealthLog();

  const todayISO = new Date().toISOString().slice(0, 10);
  const detailedNutrientNeeds = useMemo(() => {
    return result.nutrientNeeds;
  }, [result.nutrientNeeds]);

  const dietContext = useMemo(
    () => getPubertySpecificDiet(profile, logs, todayISO),
    [profile, logs, todayISO],
  );

  const dietInput: PubertyDietInput = useMemo(() => {
    const rawDiet = profile?.dietType ?? "mixed";
    const dietPreference = rawDiet === "veg" ? "vegetarian" : "mixed";
    return {
      region: (profile?.region as "north" | "south" | "east" | "west") || "north",
      dietPreference,
      deficiencies: [],
      weight: profile?.weight || 45,
    };
  }, [profile]);

  const dietPlan = useMemo<PubertyDietPlan>(() => {
    return generatePubertyDiet(dietInput);
  }, [dietInput]);

  return (
    <main className={`min-h-screen bg-background ${simpleMode ? "simple-mode" : ""}`}>
      {/* ─── Header ─────────────────────────────────────────────── */}
      <div className="border-b border-border bg-card/60 backdrop-blur-sm">
        <div className="container py-6">
          <ScrollReveal>
            <div className="flex items-center gap-3">
              <Link to="/puberty/nutrition-guide" className="flex h-11 w-11 items-center justify-center rounded-xl border border-border/50 bg-card hover:bg-muted/50 transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${accent.gradient} flex items-center justify-center shadow-lg shadow-primary/10`}>
                <Apple className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Nutrition Intelligence</h1>
                <p className="text-sm text-muted-foreground">
                  {phaseEmoji} Personalized for <strong>{phaseName}</strong> • Symptom-driven insights
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>

      <div className="container py-6 space-y-6">
        {/* ─── Safety Warnings ────────────────────────────────── */}
        {result.safetyWarnings.length > 0 && (
          <ScrollReveal>
            <SafetyWarningBanner warnings={result.safetyWarnings} />
          </ScrollReveal>
        )}

        {/* ─── No Data State ──────────────────────────────────── */}
        {!result.hasData ? (
          <ScrollReveal>
            <div className="flex flex-col items-center justify-center text-center py-20 rounded-2xl border-2 border-dashed border-border/60 bg-muted/10">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${accent.gradient} flex items-center justify-center mb-5 shadow-lg opacity-40`}>
                <Apple className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Health Data Yet</h3>
              <p className="text-sm text-muted-foreground max-w-xs leading-relaxed mb-5">
                Log your symptoms in the Calendar to get personalized nutrition guidance
                tailored to what your body needs today.
              </p>
              <Link
                to="/calendar"
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r ${accent.gradient} text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all active:scale-[0.97]`}
              >
                <Calendar className="w-4 h-4" />
                Go to Calendar
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </ScrollReveal>
        ) : (
          <>
            {/* ─── Global Nutrition Risk Summary (Always Visible) ── */}
            <ScrollReveal>
              <DeficiencySummaryInline
                deficiencyScore={result.deficiencyScore}
                deficiencySeverity={result.deficiencySeverity}
                priorityNutrient={result.priorityNutrient}
                riskCounts={result.riskCounts}
                accentGradient={accent.gradient}
              />
            </ScrollReveal>

            {/* ─── Segmented Tab Bar ────────────────────────────── */}
            <ScrollReveal delay={50}>
              <div className="flex bg-muted/40 p-1.5 rounded-[20px] mb-8 mt-6">
                <button
                  onClick={() => setActiveTab('tips')}
                  className={`flex-1 flex justify-center items-center gap-2 py-3.5 px-4 rounded-[16px] text-sm font-semibold transition-all duration-300 ${activeTab === 'tips'
                      ? `bg-white shadow-sm ${accent.text} border-b-2 border-current`
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 border-b-2 border-transparent'
                    }`}
                >
                  <Lightbulb className="w-[18px] h-[18px]" />
                  Nutrition Tips
                </button>
                <button
                  onClick={() => setActiveTab('insights')}
                  className={`flex-1 flex justify-center items-center gap-2 py-3.5 px-4 rounded-[16px] text-sm font-semibold transition-all duration-300 ${activeTab === 'insights'
                      ? `bg-white shadow-sm ${accent.text} border-b-2 border-current`
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 border-b-2 border-transparent'
                    }`}
                >
                  <Activity className="w-[18px] h-[18px]" />
                  Deficiency Insights
                </button>
                <button
                  onClick={() => setActiveTab('checklist')}
                  className={`flex-1 flex justify-center items-center gap-2 py-3.5 px-4 rounded-[16px] text-sm font-semibold transition-all duration-300 ${activeTab === 'checklist'
                      ? `bg-white shadow-sm ${accent.text} border-b-2 border-current`
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 border-b-2 border-transparent'
                    }`}
                >
                  <Clock className="w-[18px] h-[18px]" />
                  Checklist
                </button>
              </div>
            </ScrollReveal>

            {/* ─── Tab Content Area ─────────────────────────────── */}
            <div className="min-h-[400px]">
              {activeTab === 'tips' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                  {dietPlan.nutritionalHighlights.length > 0 && (
                    <div className={`rounded-2xl border-2 ${accent.border} ${accent.cardBg} p-6`}>
                      <div className="flex items-center gap-2 mb-4">
                        <Utensils className={`w-5 h-5 ${accent.text}`} />
                        <h2 className="text-base font-bold">Nutritional Highlights</h2>
                      </div>
                      <ul className="space-y-2 text-sm text-foreground/85">
                        {dietPlan.nutritionalHighlights.map((highlight, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-primary mt-0.5">•</span>
                            <span>{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {detailedNutrientNeeds.filter(n => n.isPriority).length > 0 && (
                    <div>
                      <SectionHeader title="Symptom Priority Nutrients" emoji="⚡" />
                      <div className="grid gap-3 sm:grid-cols-2">
                        {detailedNutrientNeeds.filter(n => n.isPriority).map((nutrient) => (
                          <NutrientCard key={nutrient.nutrientId} nutrient={nutrient} accentGradient={accent.gradient} />
                        ))}
                      </div>
                    </div>
                  )}

                  {detailedNutrientNeeds.filter(n => !n.isPriority).length > 0 && (
                    <div>
                      <SectionHeader title="Other Nutrient Needs" emoji="🧪" />
                      <div className="grid gap-3 sm:grid-cols-2">
                        {detailedNutrientNeeds.filter(n => !n.isPriority).map((nutrient) => (
                          <NutrientCard key={nutrient.nutrientId} nutrient={nutrient} accentGradient={accent.gradient} />
                        ))}
                      </div>
                    </div>
                  )}

                  {result.foodRecommendations.length > 0 && (
                    <div>
                      <SectionHeader title="Recommended Foods" emoji="🥗" />
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {result.foodRecommendations.slice(0, 8).map((food) => (
                          <FoodRecommendationCard key={food.name} food={food} />
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              )}

              {activeTab === 'insights' && (
                <PubertyDeficiencyInsights
                  detectedSymptoms={result.detectedSymptoms}
                  nutrientNeeds={result.nutrientNeeds}
                  deficiencyScore={result.deficiencyScore}
                  deficiencySeverity={result.deficiencySeverity}
                  priorityNutrient={result.priorityNutrient}
                  riskCounts={result.riskCounts}
                  medicalConditions={profile?.medicalConditions ?? []}
                  accent={accent}
                />
              )}

              {activeTab === 'checklist' && (
                <PubertyChecklistSection
                  checklistItems={dietContext.checklistItems}
                  accent={accent}
                />
              )}
            </div>
          </>
        )}
      </div>

      <SafetyDisclaimer />
    </main>
  );
}
