import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { usePhase } from "@/hooks/usePhase";
import { useProfile } from "@/hooks/useProfile";
import { useFamilyPlanningProfile } from "@/hooks/useFamilyPlanningProfile";
import { computePersonalization } from "@/lib/familyPlanningPersonalizationEngine";
import type { FPIntent } from "@/hooks/useFamilyPlanningProfile";
import type { PersonalizationResult } from "@/lib/familyPlanningPersonalizationEngine";
import FamilyPlanningOnboarding from "@/components/onboarding/FamilyPlanningOnboarding";
import ContraceptionGuide from "@/components/guidance/ContraceptionGuide";
import ScrollReveal from "@/components/ScrollReveal";
import DynamicToolsPanel from "@/components/familyplanning/DynamicToolsPanel";
import {
  ArrowLeft, CalendarDays, Activity, Leaf, Stethoscope,
  AlertTriangle, CheckCircle2, Settings2, Heart, Shield,
  BarChart3, Baby, Clock, Sparkles
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function addDays(date: Date, days: number): Date {
  const r = new Date(date); r.setDate(r.getDate() + days); return r;
}
function formatDate(date: Date): string {
  return date.toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });
}

// ─── Daily Guidance Hero ──────────────────────────────────────────────────────

function DailyGuidanceCard({ p }: { p: PersonalizationResult }) {
  const g = p.dailyGuidance;
  const toneStyles = {
    positive: "from-emerald-50 to-green-50 border-emerald-200",
    caution: "from-amber-50 to-orange-50 border-amber-200",
    neutral: "from-slate-50 to-gray-50 border-slate-200",
    info: "from-blue-50 to-sky-50 border-blue-200",
  };
  const toneText = {
    positive: "text-emerald-800", caution: "text-amber-800",
    neutral: "text-slate-800", info: "text-blue-800",
  };
  return (
    <div className={`rounded-2xl border bg-gradient-to-br ${toneStyles[g.tone]} p-6 shadow-sm`}>
      <div className="flex items-start gap-4">
        <span className="text-4xl">{g.emoji}</span>
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Today's Guidance
          </p>
          <h3 className={`text-lg font-bold ${toneText[g.tone]} mb-1`}>{g.headline}</h3>
          <p className={`text-sm ${toneText[g.tone]} leading-relaxed opacity-80`}>{g.message}</p>
        </div>
      </div>
      {p.riskLevel !== "unknown" && p.dashboard.showRiskAssessment && (
        <div className="mt-4 flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${
            p.riskLevel === "high" ? "bg-red-500" : p.riskLevel === "moderate" ? "bg-amber-500" : "bg-green-500"
          }`} />
          <span className="text-xs font-medium text-muted-foreground">
            Risk level: <strong className="capitalize">{p.riskLevel}</strong>
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Intent Header ────────────────────────────────────────────────────────────

function IntentHeader({ p, onChangeIntent }: { p: PersonalizationResult; onChangeIntent: () => void }) {
  return (
    <div className="flex items-center justify-between flex-wrap gap-3">
      <div className="flex items-center gap-2">
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold rounded-full border px-3 py-1 ${p.dashboard.intentColor}`}>
          {p.dashboard.intentEmoji} {p.dashboard.intentLabel}
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] font-medium rounded-full bg-muted/60 px-2.5 py-0.5 text-muted-foreground">
          <Clock className="w-3 h-3" /> {new Date().toLocaleDateString("en-IN", { weekday: "long", month: "short", day: "numeric" })}
        </span>
      </div>
      <button onClick={onChangeIntent} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
        <Settings2 className="w-3.5 h-3.5" /> Change Plan
      </button>
    </div>
  );
}

// ─── Spacing Awareness Card ───────────────────────────────────────────────────

function SpacingCard({ p }: { p: PersonalizationResult }) {
  if (!p.spacing.show) return null;
  return (
    <div className="rounded-2xl border border-purple-200 bg-purple-50 p-6 flex items-start gap-4">
      <span className="text-3xl">{p.spacing.emoji}</span>
      <div>
        <h3 className="text-base font-bold text-purple-900 mb-1">{p.spacing.title}</h3>
        <p className="text-sm text-purple-800 leading-relaxed">{p.spacing.message}</p>
      </div>
    </div>
  );
}

// ─── Intent Change Modal ──────────────────────────────────────────────────────

function IntentChangeModal({ current, onSelect, onClose }: {
  current: FPIntent; onSelect: (i: FPIntent) => void; onClose: () => void;
}) {
  const opts: { val: FPIntent; emoji: string; label: string; desc: string }[] = [
    { val: "ttc", emoji: "💕", label: "Trying to Conceive", desc: "Fertility insights & best days" },
    { val: "avoid", emoji: "🛡️", label: "Avoiding Pregnancy", desc: "Risk guidance & contraception" },
    { val: "tracking", emoji: "📊", label: "Just Tracking", desc: "Neutral cycle tracking" },
  ];
  return (
    <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
      <div className="w-full max-w-sm mx-4 bg-white rounded-2xl shadow-2xl p-6 animate-scaleIn" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-slate-800 mb-4">Change Your Plan</h3>
        <div className="space-y-2">
          {opts.map(o => (
            <button key={o.val} onClick={() => onSelect(o.val)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                current === o.val ? "border-teal-400 bg-teal-50" : "border-slate-200 hover:border-teal-200"
              }`}>
              <div className="flex items-center gap-3">
                <span className="text-xl">{o.emoji}</span>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{o.label}</p>
                  <p className="text-xs text-slate-500">{o.desc}</p>
                </div>
                {current === o.val && <CheckCircle2 className="w-5 h-5 text-teal-500 ml-auto" />}
              </div>
            </button>
          ))}
        </div>
        <button onClick={onClose} className="w-full mt-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-500 hover:bg-slate-50 transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─── Fertility Cycle Calculator (simplified, intent-aware) ────────────────────

/** Backward-compatible named export for Tools.tsx */
export function FertilityCycleInsights() {
  return <FertilityCalculator intent="ttc" />;
}

function FertilityCalculator({ intent }: { intent: FPIntent }) {
  const [lastPeriod, setLastPeriod] = useState("");
  const [cycleLenStr, setCycleLenStr] = useState("");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const isConceive = intent === "ttc";

  const handleCalc = () => {
    setError(null); setResult(null);
    if (!lastPeriod) { setError("Please select your last period date."); return; }
    const cl = Number(cycleLenStr);
    if (!cycleLenStr || isNaN(cl) || cl < 1 || cl > 60) { setError("Please enter a valid cycle length (1–60 days)."); return; }
    const lmp = new Date(lastPeriod);
    if (isNaN(lmp.getTime())) { setError("Invalid date."); return; }
    const nextCycle = addDays(lmp, cl);
    const ov = addDays(nextCycle, -14);
    const fs = addDays(ov, -5);
    const fe = addDays(ov, 1);
    setResult({ ovulation: ov, fertileStart: fs, fertileEnd: fe, safeStart: addDays(fe, 1), safeEnd: addDays(nextCycle, -1), nextPeriod: nextCycle });
  };

  const styles = isConceive
    ? { bg: "bg-emerald-50 border-emerald-200", icon: "text-emerald-600", card: "bg-emerald-100 border-emerald-200", label: "text-emerald-600", val: "text-emerald-900", hl: "bg-emerald-200/70 border-emerald-300", hlLabel: "text-emerald-700", hlVal: "text-emerald-950", msg: "text-emerald-700", msgBg: "bg-emerald-100/60",
      title: "Your Cycle Predictions", message: "High chance of conception during this window — best days to try.",
      ovLabel: "Peak Fertility", fLabel: "Best Days to Try", fsLabel: "Fertile Start", feLabel: "Fertile End" }
    : { bg: "bg-amber-50 border-amber-200", icon: "text-amber-600", card: "bg-red-100 border-red-200", label: "text-red-600", val: "text-red-900", hl: "bg-red-200/70 border-red-300", hlLabel: "text-red-700", hlVal: "text-red-950", msg: "text-red-700", msgBg: "bg-red-100/60",
      title: "Your Risk Assessment", message: "High risk of pregnancy during these days — take precautions or use protection.",
      ovLabel: "Highest Risk", fLabel: "High-Risk Days", fsLabel: "Risk Starts", feLabel: "Risk Ends" };

  return (
    <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
      <div className="p-6 pb-0">
        <div className="flex items-center gap-3 mb-1">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isConceive ? "bg-emerald-100" : "bg-amber-100"}`}>
            <CalendarDays className={`w-5 h-5 ${isConceive ? "text-emerald-600" : "text-amber-600"}`} />
          </div>
          <div>
            <h2 className="text-lg font-bold">{isConceive ? "Fertility & Cycle Insights" : "Risk Assessment Calculator"}</h2>
            <p className="text-xs text-muted-foreground">Cycle-based predictions tailored to your goals</p>
          </div>
        </div>
      </div>
      <div className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">Last period date <span className="text-red-500">*</span></label>
          <input type="date" value={lastPeriod} max={new Date().toISOString().split("T")[0]}
            onChange={e => { setLastPeriod(e.target.value); setResult(null); }}
            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Average cycle length (days) <span className="text-red-500">*</span></label>
          <input type="number" min={1} max={60} placeholder="e.g. 28" value={cycleLenStr}
            onChange={e => { setCycleLenStr(e.target.value); setResult(null); }}
            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            <AlertTriangle className="w-4 h-4 shrink-0" />{error}
          </div>
        )}
        <button onClick={handleCalc}
          className={`w-full py-3 rounded-xl font-semibold shadow-sm hover:shadow-md transition-all active:scale-[0.97] ${isConceive ? "bg-emerald-600 text-white hover:bg-emerald-700" : "bg-amber-600 text-white hover:bg-amber-700"}`}>
          Get Predictions
        </button>
        {result && (
          <div className={`p-5 rounded-xl border ${styles.bg} space-y-4 animate-fadeIn`}>
            <div className="flex items-center gap-2">
              <CheckCircle2 className={`w-5 h-5 ${styles.icon}`} />
              <p className={`text-sm font-bold ${styles.hlVal}`}>{styles.title}</p>
            </div>
            <div className={`flex items-start gap-2 p-3 rounded-lg ${styles.msgBg}`}>
              <span className="text-sm mt-0.5">{isConceive ? "💡" : "⚠️"}</span>
              <p className={`text-sm font-medium ${styles.msg}`}>{styles.message}</p>
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              <div className={`text-center p-3.5 rounded-xl border ${styles.card}`}>
                <p className={`text-[10px] font-semibold uppercase tracking-wider mb-1.5 ${styles.label}`}>{styles.fsLabel}</p>
                <p className={`text-sm font-bold ${styles.val}`}>{formatDate(result.fertileStart)}</p>
              </div>
              <div className={`text-center p-3.5 rounded-xl border ${styles.hl}`}>
                <p className={`text-[10px] font-semibold uppercase tracking-wider mb-1.5 ${styles.hlLabel}`}>{styles.ovLabel}</p>
                <p className={`text-sm font-bold ${styles.hlVal}`}>{formatDate(result.ovulation)}</p>
              </div>
              <div className={`text-center p-3.5 rounded-xl border ${styles.card}`}>
                <p className={`text-[10px] font-semibold uppercase tracking-wider mb-1.5 ${styles.label}`}>{styles.feLabel}</p>
                <p className={`text-sm font-bold ${styles.val}`}>{formatDate(result.fertileEnd)}</p>
              </div>
            </div>
            {!isConceive && (
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="text-center p-3.5 rounded-xl border bg-green-100 border-green-200">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-green-600 mb-1.5">Lower-Risk Start</p>
                  <p className="text-sm font-bold text-green-900">{formatDate(result.safeStart)}</p>
                </div>
                <div className="text-center p-3.5 rounded-xl border bg-green-100 border-green-200">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-green-600 mb-1.5">Lower-Risk End</p>
                  <p className="text-sm font-bold text-green-900">{formatDate(result.safeEnd)}</p>
                </div>
              </div>
            )}
            <p className="text-[10px] text-muted-foreground text-center pt-1 border-t border-dashed border-current/10">
              ⚕️ Estimate based on a standard 14-day luteal phase. Results may vary. Consult a healthcare professional.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Lifestyle Tips ───────────────────────────────────────────────────────────

const LIFESTYLE_TIPS = [
  { emoji: "🧘‍♀️", title: "Manage Stress", desc: "Practice breathing exercises, yoga, or light meditation daily." },
  { emoji: "😴", title: "Sleep Schedule", desc: "7–9 hours of quality sleep supports hormonal regulation." },
  { emoji: "🥗", title: "Balanced Nutrition", desc: "Eat folate-rich foods, iron, calcium, and healthy fats." },
  { emoji: "🚶‍♀️", title: "Light Activity", desc: "30 minutes of walking or swimming most days." },
  { emoji: "💬", title: "Emotional Wellbeing", desc: "Talk openly with your partner or trusted friend." },
  { emoji: "🚭", title: "Avoid Harmful Substances", desc: "Avoid tobacco, alcohol, and excessive caffeine." },
];

function LifestyleGuidance() {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
          <Leaf className="w-5 h-5 text-teal-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold">Lifestyle & Emotional Guidance</h2>
          <p className="text-xs text-muted-foreground">Holistic preparation for family planning</p>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {LIFESTYLE_TIPS.map((tip, i) => (
          <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-muted/40 border border-border/50 hover:bg-muted/70 transition-colors">
            <span className="text-2xl shrink-0">{tip.emoji}</span>
            <div>
              <p className="text-sm font-semibold">{tip.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{tip.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Consultation Trigger ─────────────────────────────────────────────────────

function ConsultationTrigger() {
  return (
    <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6 flex items-start gap-4">
      <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
        <Stethoscope className="w-5 h-5 text-blue-600" />
      </div>
      <div>
        <h2 className="text-base font-bold text-blue-900 mb-1">👩‍⚕️ Professional Consultation</h2>
        <p className="text-sm text-blue-800 leading-relaxed">
          Consider consulting a healthcare professional for personalized advice about your family planning journey.
        </p>
        <a href="tel:104" className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold shadow hover:bg-blue-700 transition-all active:scale-[0.97]">
          📞 Call 104 for Guidance
        </a>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function FamilyPlanning() {
  const { setPhase } = usePhase();
  const { profile: userProfile } = useProfile();
  const { profile: fpProfile, isOnboarded, completeOnboarding, updateIntent } = useFamilyPlanningProfile();
  const [showIntentModal, setShowIntentModal] = useState(false);

  useEffect(() => { setPhase("family-planning"); }, [setPhase]);

  const personalization = useMemo<PersonalizationResult>(() => {
    return computePersonalization(
      fpProfile,
      userProfile.lastPeriodDate || "",
      userProfile.cycleLength || 28,
    );
  }, [fpProfile, userProfile.lastPeriodDate, userProfile.cycleLength]);

  // Gate: show onboarding if not completed
  if (!isOnboarded) {
    return (
      <FamilyPlanningOnboarding
        onComplete={(data) => completeOnboarding(data)}
      />
    );
  }

  const p = personalization;
  const d = p.dashboard;

  return (
    <div className="min-h-screen py-12 bg-background">
      <div className="container max-w-4xl">
        <ScrollReveal>
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 text-teal-700 text-xs font-semibold mb-3">
              🌿 Family Planning
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">
              Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500">Personalized</span> Plan
            </h1>
            <p className="mt-2 text-muted-foreground max-w-xl text-sm">
              {d.intentLabel} — tailored guidance based on your reproductive history and goals.
            </p>
          </div>
        </ScrollReveal>

        <div className="space-y-6 mt-6">
          {/* Spacing Awareness (mothers only) */}
          {p.spacing.show && (
            <ScrollReveal delay={60}>
              <SpacingCard p={p} />
            </ScrollReveal>
          )}

          {/* ═══ Dynamic Tools System ═══ */}
          <ScrollReveal delay={80}>
            <DynamicToolsPanel />
          </ScrollReveal>

          {/* Consultation */}
          <ScrollReveal delay={160}>
            <ConsultationTrigger />
          </ScrollReveal>

          {/* Disclaimer */}
          <ScrollReveal delay={200}>
            <div className="rounded-2xl border border-border bg-muted/30 p-4 flex items-center gap-3">
              <Shield className="w-5 h-5 text-muted-foreground shrink-0" />
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                All data is stored locally on your device. This guidance is for awareness only — always consult a healthcare professional for personalized medical advice.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}
