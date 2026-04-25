/**
 * PrematureCareView.tsx
 *
 * Full premature baby care dashboard — replaces pregnancy content
 * when mode === "premature". Renders inside PregnancyDashboard.
 *
 * Includes maternal recovery analytics (score, status, priorities,
 * symptom summary, activities, timeline, checkups) powered by
 * real health-log data via recoveryScoreEngine.
 */

import { useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  usePregnancyProfile,
  getRiskLevel,
  getCorrectedAge,
  type DeliveryData,
} from "@/hooks/usePregnancyProfile";
import { useHealthLog } from "@/hooks/useHealthLog";
import { usePrematureBabyWeight, type WeightEntry } from "@/hooks/usePrematureBabyWeight";
import {
  FEEDING_GUIDANCE,
  TEMPERATURE_CARE,
  INFECTION_PREVENTION,
  WARNING_SIGNS,
  DAILY_CHECK_QUESTIONS,
  type DailyCheckQuestion,
} from "@/lib/prematureCareData";
import {
  calculateRecoveryScore,
  getRecoveryStatus,
  generateDailyPriorities,
  getHighConcernSymptoms,
  generateActivitySuggestions,
  getRecoveryTimeline,
  loadCheckups,
  saveCheckups,
  type RecoveryCheckup,
} from "@/lib/premature/recoveryScoreEngine";
import ScrollReveal from "@/components/ScrollReveal";
import SafetyDisclaimer from "@/components/SafetyDisclaimer";
import {
  Baby, Heart, Thermometer, ShieldCheck, AlertTriangle,
  Scale, ClipboardCheck, Phone, Sparkles, ChevronRight,
  Plus, TrendingUp, TrendingDown, Minus, Calendar,
  ArrowLeft, RotateCcw, Activity, Droplets, Moon,
  Zap, Brain, CheckCircle2, Circle, Flame,
} from "lucide-react";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(isoDate: string): string {
  if (!isoDate) return "";
  return new Date(isoDate + "T00:00:00").toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });
}

function riskBadge(risk: ReturnType<typeof getRiskLevel>) {
  if (risk === "high") return { label: "High Risk", cls: "bg-red-100 text-red-800 border-red-200" };
  if (risk === "moderate") return { label: "Moderate Risk", cls: "bg-amber-100 text-amber-800 border-amber-200" };
  if (risk === "low") return { label: "Low Risk", cls: "bg-green-100 text-green-800 border-green-200" };
  return null;
}

// ─── Daily Check State (in-memory per session) ──────────────────────────────

function useDailyCheck() {
  const [answers, setAnswers] = useState<Record<string, boolean | null>>({});
  const setAnswer = (id: string, value: boolean) => setAnswers((prev) => ({ ...prev, [id]: value }));
  const hasNegative = Object.values(answers).some((v) => v === false);
  const isComplete = DAILY_CHECK_QUESTIONS.every((q) => answers[q.id] !== undefined && answers[q.id] !== null);
  return { answers, setAnswer, hasNegative, isComplete };
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════════════════

export default function PrematureCareView() {
  const { profile, clearProfile } = usePregnancyProfile();
  const { maternityLogs } = useHealthLog();
  const delivery = profile.delivery;
  const risk = getRiskLevel(delivery.weeksAtBirth);
  const riskInfo = riskBadge(risk);
  const correctedAge = getCorrectedAge(delivery.birthDate, delivery.weeksAtBirth);
  const dailyCheck = useDailyCheck();
  const weightTracker = usePrematureBabyWeight();

  // ─── Recovery Analytics (memoized) ────────────────────────────────────────
  const recoveryBreakdown = useMemo(() => calculateRecoveryScore(maternityLogs), [maternityLogs]);
  const recoveryStatus = useMemo(() => getRecoveryStatus(recoveryBreakdown.overall), [recoveryBreakdown.overall]);
  const dailyPriorities = useMemo(() => generateDailyPriorities(recoveryBreakdown), [recoveryBreakdown]);
  const highConcernSymptoms = useMemo(() => getHighConcernSymptoms(maternityLogs), [maternityLogs]);
  const activitySuggestions = useMemo(() => generateActivitySuggestions(recoveryBreakdown), [recoveryBreakdown]);

  const weeksPostDelivery = useMemo(() => {
    if (!delivery.birthDate) return 0;
    const birth = new Date(delivery.birthDate + "T00:00:00");
    const now = new Date();
    return Math.max(0, Math.floor((now.getTime() - birth.getTime()) / (7 * 24 * 60 * 60 * 1000)));
  }, [delivery.birthDate]);

  const recoveryTimeline = useMemo(() => getRecoveryTimeline(weeksPostDelivery), [weeksPostDelivery]);

  const [checkups, setCheckups] = useState<RecoveryCheckup[]>(() => loadCheckups());
  const toggleCheckup = useCallback((id: string) => {
    setCheckups(prev => {
      const updated = prev.map(c => c.id === id ? { ...c, completed: !c.completed } : c);
      saveCheckups(updated);
      return updated;
    });
  }, []);

  // Radial gauge constants
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (recoveryBreakdown.overall / 100) * circumference;

  // Weight input state
  const [showWeightForm, setShowWeightForm] = useState(false);
  const [weightDate, setWeightDate] = useState(new Date().toISOString().slice(0, 10));
  const [weightValue, setWeightValue] = useState("");

  const handleAddWeight = () => {
    const w = parseInt(weightValue, 10);
    if (!w || w < 200 || w > 10000) return;
    weightTracker.addEntry({ date: weightDate, weight: w });
    setWeightValue("");
    setShowWeightForm(false);
  };

  return (
    <main className="min-h-screen bg-background">
      {/* ─── Hero Header ──────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 border-b border-border">
        <div className="container py-6">
          <ScrollReveal>
            <div className="flex items-center justify-between mb-4">
              <Link to="/" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" /> Home
              </Link>
              <button
                onClick={clearProfile}
                title="Clear pregnancy data"
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-red-500 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Clear Data
              </button>
            </div>

            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-xs font-semibold uppercase tracking-wider text-purple-600">
                    Premature Baby Care
                  </span>
                  {riskInfo && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${riskInfo.cls}`}>
                      {riskInfo.label}
                    </span>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold">
                  Baby born at {delivery.weeksAtBirth} weeks
                </h1>
                {profile.name && (
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {profile.name}'s baby • Born {formatDate(delivery.birthDate)}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-4">
                {delivery.birthWeight && (
                  <div className="text-right">
                    <p className="text-xl font-bold text-primary">{delivery.birthWeight}g</p>
                    <p className="text-[10px] text-muted-foreground font-medium">birth weight</p>
                  </div>
                )}
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-400 flex items-center justify-center shadow-lg text-2xl">
                  👶
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>



      {/* ─── Helpline strip ───────────────────────────────────────────── */}
      <div className="bg-red-600 text-white">
        <div className="container py-2 flex items-center justify-center gap-6 text-xs">
          <a href="tel:104" className="flex items-center gap-1.5 font-semibold hover:underline">
            <Phone className="w-3.5 h-3.5" /> 104 — Health Helpline
          </a>
          <a href="tel:108" className="flex items-center gap-1.5 font-semibold hover:underline">
            <Phone className="w-3.5 h-3.5" /> 108 — Ambulance
          </a>
        </div>
      </div>

      <div className="container py-6 space-y-6">

        {/* ═══════════════════════════════════════════════════════════════════
             MATERNAL RECOVERY ANALYTICS
           ═══════════════════════════════════════════════════════════════════ */}

        {/* ═══ Recovery Score Hero ══════════════════════════════════════════ */}
        <ScrollReveal>
          <div className="rounded-2xl border-2 border-violet-200 bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                <Activity className="w-4 h-4 text-violet-700" />
              </div>
              <div>
                <h2 className="font-bold text-sm">Maternal Recovery Score</h2>
                <p className="text-[10px] text-muted-foreground">Based on your recent 7-day health logs</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 py-4">
              {/* Radial Gauge */}
              <div className="relative shrink-0">
                <svg width="140" height="140" className="transform -rotate-90">
                  <circle cx="70" cy="70" r="54" stroke="currentColor" strokeWidth="10" fill="none" className="text-muted-foreground/15" />
                  <circle
                    cx="70" cy="70" r="54"
                    stroke="url(#recoveryGrad)"
                    strokeWidth="10"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-1000 ease-out"
                  />
                  <defs>
                    <linearGradient id="recoveryGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#d946ef" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-3xl font-bold text-foreground">{recoveryBreakdown.overall}</span>
                    <span className="text-sm text-muted-foreground font-medium">/100</span>
                  </div>
                </div>
              </div>

              {/* Breakdown Bars */}
              <div className="flex-1 w-full space-y-2">
                {[
                  { label: "Symptoms", value: recoveryBreakdown.symptom, color: "bg-rose-400" },
                  { label: "Hydration", value: recoveryBreakdown.hydration, color: "bg-sky-400" },
                  { label: "Sleep", value: recoveryBreakdown.sleep, color: "bg-indigo-400" },
                  { label: "Energy", value: recoveryBreakdown.energy, color: "bg-amber-400" },
                  { label: "Emotional", value: recoveryBreakdown.emotional, color: "bg-purple-400" },
                  { label: "Breastfeeding", value: recoveryBreakdown.breastfeeding, color: "bg-pink-400" },
                ].map(bar => (
                  <div key={bar.label} className="flex items-center gap-2">
                    <span className="text-[10px] font-medium text-muted-foreground w-20 text-right shrink-0">{bar.label}</span>
                    <div className="flex-1 h-2 rounded-full bg-muted/40 overflow-hidden">
                      <div className={`h-full rounded-full ${bar.color} transition-all duration-700 ease-out`} style={{ width: `${bar.value}%` }} />
                    </div>
                    <span className="text-[10px] font-bold text-foreground w-7 text-right">{bar.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* ═══ Recovery Status + Daily Priority (side by side) ══════════════ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Recovery Status */}
          <ScrollReveal delay={60}>
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm h-full">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-emerald-700" />
                </div>
                <h2 className="font-bold text-sm">Recovery Status</h2>
              </div>
              <div className={`rounded-xl p-4 border text-center ${
                recoveryStatus.level === "critical" ? "bg-red-50 border-red-200" :
                recoveryStatus.level === "slow" ? "bg-orange-50 border-orange-200" :
                recoveryStatus.level === "moderate" ? "bg-amber-50 border-amber-200" :
                recoveryStatus.level === "stable" ? "bg-green-50 border-green-200" :
                "bg-emerald-50 border-emerald-200"
              }`}>
                <span className="text-3xl block mb-2">{recoveryStatus.emoji}</span>
                <p className={`text-sm font-bold ${
                  recoveryStatus.level === "critical" ? "text-red-800" :
                  recoveryStatus.level === "slow" ? "text-orange-800" :
                  recoveryStatus.level === "moderate" ? "text-amber-800" :
                  recoveryStatus.level === "stable" ? "text-green-800" :
                  "text-emerald-800"
                }`}>{recoveryStatus.label}</p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Score: {recoveryBreakdown.overall} / 100
                </p>
              </div>
            </div>
          </ScrollReveal>

          {/* Daily Priorities */}
          <ScrollReveal delay={90}>
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm h-full">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <ClipboardCheck className="w-4 h-4 text-blue-700" />
                </div>
                <div>
                  <h2 className="font-bold text-sm">Today's Priorities</h2>
                  <p className="text-[10px] text-muted-foreground">Focus areas for today</p>
                </div>
              </div>
              <div className="space-y-2">
                {dailyPriorities.map(p => (
                  <div key={p.id} className="flex items-start gap-3 p-3 rounded-xl border border-border/60 bg-background">
                    <span className="text-lg shrink-0">{p.emoji}</span>
                    <div>
                      <p className="text-xs font-bold text-foreground">{p.label}</p>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">{p.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* ═══ Symptom Summary ══════════════════════════════════════════════ */}
        {highConcernSymptoms.length > 0 && (
          <ScrollReveal delay={120}>
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center">
                  <Activity className="w-4 h-4 text-rose-700" />
                </div>
                <div>
                  <h2 className="font-bold text-sm">Symptom Summary</h2>
                  <p className="text-[10px] text-muted-foreground">High-concern symptoms from recent logs</p>
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {highConcernSymptoms.map(s => (
                  <div key={s.id} className={`flex items-center gap-3 p-3 rounded-xl border ${
                    s.severity === "severe" ? "bg-red-50 border-red-200" :
                    s.severity === "moderate" ? "bg-amber-50 border-amber-200" :
                    "bg-background border-border/60"
                  }`}>
                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      s.severity === "severe" ? "bg-red-500" :
                      s.severity === "moderate" ? "bg-amber-500" :
                      "bg-green-500"
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">{s.label}</p>
                      <p className="text-[10px] text-muted-foreground">{s.dayCount} day(s) • {s.severity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        )}

        {/* ═══ Activity Suggestions ═════════════════════════════════════════ */}
        <ScrollReveal delay={150}>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center">
                <Flame className="w-4 h-4 text-teal-700" />
              </div>
              <div>
                <h2 className="font-bold text-sm">Suggested Activities</h2>
                <p className="text-[10px] text-muted-foreground">Personalized to your recovery state</p>
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {activitySuggestions.map(a => (
                <div key={a.id} className="flex items-start gap-3 p-3 rounded-xl border border-border/60 bg-background hover:bg-muted/30 transition-colors">
                  <span className="text-lg shrink-0 mt-0.5">{a.emoji}</span>
                  <div>
                    <p className="text-xs font-bold text-foreground">{a.label}</p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{a.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* ═══ Recovery Timeline ════════════════════════════════════════════ */}
        <ScrollReveal delay={180}>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-indigo-700" />
              </div>
              <div>
                <h2 className="font-bold text-sm">Recovery Timeline</h2>
                <p className="text-[10px] text-muted-foreground">Week {weeksPostDelivery} post-delivery</p>
              </div>
            </div>
            <div className="relative pl-6">
              {/* Vertical line */}
              <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-border" />
              <div className="space-y-3">
                {recoveryTimeline.map(milestone => (
                  <div key={milestone.weekNumber} className="relative flex items-start gap-3">
                    <div className={`absolute left-[-16px] w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 z-10 ${
                      milestone.status === "completed" ? "bg-green-500 border-green-500" :
                      milestone.status === "current" ? "bg-violet-500 border-violet-500 ring-4 ring-violet-100" :
                      "bg-background border-border"
                    }`}>
                      {milestone.status === "completed" && <CheckCircle2 className="w-3 h-3 text-white" />}
                      {milestone.status === "current" && <Circle className="w-2 h-2 text-white fill-white" />}
                    </div>
                    <div className={`ml-1 ${
                      milestone.status === "upcoming" ? "opacity-50" : ""
                    }`}>
                      <p className="text-xs font-bold text-foreground">
                        Week {milestone.weekNumber} — {milestone.label}
                      </p>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">{milestone.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* ═══ Recovery Checkups ════════════════════════════════════════════ */}
        <ScrollReveal delay={210}>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center">
                <ClipboardCheck className="w-4 h-4 text-pink-700" />
              </div>
              <div>
                <h2 className="font-bold text-sm">Recovery Checkups</h2>
                <p className="text-[10px] text-muted-foreground">
                  {checkups.filter(c => c.completed).length} / {checkups.length} completed
                </p>
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {checkups.map(c => (
                <button
                  key={c.id}
                  onClick={() => toggleCheckup(c.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all active:scale-[0.98] ${
                    c.completed
                      ? "bg-green-50 border-green-200 shadow-sm"
                      : "bg-background border-border/60 hover:bg-muted/30"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                    c.completed ? "bg-green-500 border-green-500" : "border-muted-foreground/40"
                  }`}>
                    {c.completed && <CheckCircle2 className="w-3 h-3 text-white" />}
                  </div>
                  <div>
                    <p className={`text-xs font-medium ${
                      c.completed ? "text-green-800 line-through" : "text-foreground"
                    }`}>
                      {c.emoji} {c.label}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* ═══════════════════════════════════════════════════════════════════
             BABY CARE SECTIONS (existing)
           ═══════════════════════════════════════════════════════════════════ */}

        {/* ═══ Section 1: Corrected Age ═══════════════════════════════════ */}
        {correctedAge && (
          <ScrollReveal>
            <div className="rounded-2xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-violet-50 p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-purple-700" />
                </div>
                <h2 className="font-bold text-sm">Corrected Age</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/80 rounded-xl p-4 border border-purple-100 text-center">
                  <p className="text-2xl font-bold text-foreground">
                    {correctedAge.actualWeeks} <span className="text-sm font-medium text-muted-foreground">weeks</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Actual Age</p>
                </div>
                <div className="bg-white/80 rounded-xl p-4 border border-purple-200 text-center">
                  <p className="text-2xl font-bold text-purple-700">
                    {correctedAge.correctedWeeks} <span className="text-sm font-medium text-purple-500">weeks</span>
                  </p>
                  <p className="text-xs text-purple-600 mt-1 font-medium">Corrected Age</p>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground mt-3 leading-relaxed">
                Your baby was born <strong>{correctedAge.weeksBornEarly} weeks early</strong>. Corrected age adjusts for prematurity and is used to track developmental milestones.
              </p>
            </div>
          </ScrollReveal>
        )}

        {/* ═══ Section 2: Warning Signs (Critical) ════════════════════════ */}
        <ScrollReveal delay={60}>
          <div className="rounded-2xl border-2 border-red-200 bg-red-50/50 p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-red-700" />
              </div>
              <div>
                <h2 className="font-bold text-sm text-red-800">Warning Signs — Seek Help Immediately</h2>
                <p className="text-[10px] text-red-600">If you notice any of these, contact your doctor or call 104</p>
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {WARNING_SIGNS.map((sign) => (
                <div
                  key={sign.title}
                  className={`flex items-start gap-3 rounded-xl p-3 border ${
                    sign.severity === "critical"
                      ? "bg-red-100/60 border-red-200"
                      : "bg-amber-50 border-amber-200"
                  }`}
                >
                  <span className="text-xl shrink-0 mt-0.5">{sign.emoji}</span>
                  <div>
                    <p className={`text-xs font-bold ${
                      sign.severity === "critical" ? "text-red-800" : "text-amber-800"
                    }`}>
                      {sign.title}
                    </p>
                    <p className="text-[11px] text-foreground/80 leading-relaxed mt-0.5">{sign.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* ═══ Section 3: Daily Check ═════════════════════════════════════ */}
        <ScrollReveal delay={120}>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <ClipboardCheck className="w-4 h-4 text-blue-700" />
              </div>
              <div>
                <h2 className="font-bold text-sm">Daily Baby Check</h2>
                <p className="text-[10px] text-muted-foreground">Quick check — answer honestly</p>
              </div>
            </div>

            <div className="space-y-3">
              {DAILY_CHECK_QUESTIONS.map((q) => {
                const answer = dailyCheck.answers[q.id];
                return (
                  <div key={q.id} className="rounded-xl border border-border/60 bg-background p-4">
                    <p className="text-sm font-medium mb-3">
                      <span className="mr-2">{q.emoji}</span>{q.question}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => dailyCheck.setAnswer(q.id, true)}
                        className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                          answer === true
                            ? "bg-green-500 text-white shadow-sm"
                            : "bg-muted text-muted-foreground hover:bg-green-50 hover:text-green-700"
                        }`}
                      >
                        ✓ {q.positiveLabel}
                      </button>
                      <button
                        onClick={() => dailyCheck.setAnswer(q.id, false)}
                        className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                          answer === false
                            ? "bg-red-500 text-white shadow-sm"
                            : "bg-muted text-muted-foreground hover:bg-red-50 hover:text-red-700"
                        }`}
                      >
                        ✗ {q.negativeLabel}
                      </button>
                    </div>
                    {answer === false && (
                      <div className="mt-2 p-2.5 rounded-lg bg-red-50 border border-red-200 animate-fadeIn">
                        <p className="text-[11px] text-red-700 flex items-start gap-1.5">
                          <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
                          {q.alertMessage}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {dailyCheck.hasNegative && dailyCheck.isComplete && (
              <div className="mt-4 p-3 rounded-xl bg-red-100 border-2 border-red-300 animate-fadeIn">
                <p className="text-sm font-bold text-red-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Monitor closely or consult your doctor today
                </p>
              </div>
            )}

            {dailyCheck.isComplete && !dailyCheck.hasNegative && (
              <div className="mt-4 p-3 rounded-xl bg-green-50 border border-green-200 animate-fadeIn">
                <p className="text-sm font-semibold text-green-700 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  All checks passed! Your baby seems to be doing well today 💚
                </p>
              </div>
            )}
          </div>
        </ScrollReveal>

        {/* ═══ Section 4: Feeding Guidance ═════════════════════════════════ */}
        <ScrollReveal delay={180}>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                <Heart className="w-4 h-4 text-amber-700" />
              </div>
              <h2 className="font-bold text-sm">Feeding Guidance</h2>
            </div>

            <div className="bg-amber-50 rounded-xl border border-amber-200 p-3 mb-4">
              <p className="text-sm font-semibold text-amber-800">⏰ {FEEDING_GUIDANCE.schedule}</p>
            </div>

            <div className="space-y-2 mb-4">
              {FEEDING_GUIDANCE.tips.map((tip, i) => (
                <div key={i} className="flex items-start gap-2 p-2">
                  <span className="text-base shrink-0">{tip.emoji}</span>
                  <p className="text-sm text-foreground/90 leading-relaxed">{tip.text}</p>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-red-200 bg-red-50/50 p-4">
              <p className="text-xs font-bold text-red-800 mb-2">⚠️ Signs of Poor Feeding</p>
              <ul className="space-y-1.5">
                {FEEDING_GUIDANCE.poorFeedingSigns.map((sign, i) => (
                  <li key={i} className="text-[11px] text-red-700 flex items-start gap-2">
                    <span className="text-red-400 mt-0.5">•</span>{sign}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </ScrollReveal>

        {/* ═══ Section 5: Weight Tracker ═══════════════════════════════════ */}
        <ScrollReveal delay={240}>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center">
                  <Scale className="w-4 h-4 text-teal-700" />
                </div>
                <div>
                  <h2 className="font-bold text-sm">Weight Tracker</h2>
                  <p className="text-[10px] text-muted-foreground">Track weekly weight gain</p>
                </div>
              </div>
              <button
                onClick={() => setShowWeightForm(!showWeightForm)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold shadow-sm hover:shadow-md transition-all active:scale-[0.97]"
              >
                <Plus className="w-3 h-3" /> Add
              </button>
            </div>

            {/* Weight input form */}
            {showWeightForm && (
              <div className="mb-4 p-4 rounded-xl border border-border bg-background space-y-3 animate-fadeIn">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Date</label>
                    <input
                      type="date"
                      value={weightDate}
                      onChange={(e) => setWeightDate(e.target.value)}
                      className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Weight (grams)</label>
                    <input
                      type="number"
                      value={weightValue}
                      onChange={(e) => setWeightValue(e.target.value)}
                      placeholder="e.g. 1800"
                      className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                </div>
                <button
                  onClick={handleAddWeight}
                  disabled={!weightValue || parseInt(weightValue) < 200}
                  className="w-full py-2 rounded-lg bg-teal-600 text-white text-xs font-semibold shadow-sm hover:shadow-md transition-all disabled:opacity-40"
                >
                  Save Weight Entry
                </button>
              </div>
            )}

            {/* Trend indicator */}
            {weightTracker.entries.length >= 2 && (
              <div className={`mb-4 p-3 rounded-xl border flex items-center gap-3 ${
                weightTracker.trend === "gaining"
                  ? "bg-green-50 border-green-200"
                  : weightTracker.trend === "slow"
                  ? "bg-amber-50 border-amber-200"
                  : "bg-red-50 border-red-200"
              }`}>
                {weightTracker.trend === "gaining" && <TrendingUp className="w-5 h-5 text-green-600" />}
                {weightTracker.trend === "slow" && <Minus className="w-5 h-5 text-amber-600" />}
                {weightTracker.trend === "losing" && <TrendingDown className="w-5 h-5 text-red-600" />}
                <p className={`text-xs font-semibold ${
                  weightTracker.trend === "gaining" ? "text-green-800"
                  : weightTracker.trend === "slow" ? "text-amber-800"
                  : "text-red-800"
                }`}>
                  {weightTracker.trend === "gaining" && "Good progress! Baby is gaining weight as expected."}
                  {weightTracker.trend === "slow" && "Baby weight gain is slower than expected. Monitor closely."}
                  {weightTracker.trend === "losing" && "Baby is not gaining weight. Please consult your doctor."}
                </p>
              </div>
            )}

            {/* Weight entries list */}
            {weightTracker.entries.length > 0 ? (
              <div className="space-y-1.5">
                {weightTracker.entries.slice().reverse().map((entry) => (
                  <div key={entry.date} className="flex items-center justify-between px-3 py-2 rounded-lg bg-background border border-border/60">
                    <div className="flex items-center gap-2">
                      <Scale className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{formatDate(entry.date)}</span>
                    </div>
                    <span className="text-sm font-bold">{entry.weight}g</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-4">
                No weight entries yet. Add your baby's weight to track progress.
              </p>
            )}
          </div>
        </ScrollReveal>

        {/* ═══ Section 6: Temperature Care ═════════════════════════════════ */}
        <ScrollReveal delay={300}>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                <Thermometer className="w-4 h-4 text-orange-700" />
              </div>
              <h2 className="font-bold text-sm">Temperature Care</h2>
            </div>
            <div className="space-y-2 mb-4">
              {TEMPERATURE_CARE.tips.map((tip, i) => (
                <div key={i} className="flex items-start gap-2 p-2">
                  <span className="text-base shrink-0">{tip.emoji}</span>
                  <p className="text-sm text-foreground/90 leading-relaxed">{tip.text}</p>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
              <p className="text-xs font-bold text-amber-800 mb-2">⚠️ Temperature Warning Signs</p>
              <ul className="space-y-1">
                {TEMPERATURE_CARE.warningSigns.map((sign, i) => (
                  <li key={i} className="text-[11px] text-amber-700 flex items-start gap-2">
                    <span className="text-amber-400 mt-0.5">•</span> {sign}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </ScrollReveal>

        {/* ═══ Section 7: Infection Prevention ═════════════════════════════ */}
        <ScrollReveal delay={360}>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
              </div>
              <h2 className="font-bold text-sm">Infection Prevention</h2>
            </div>
            <div className="space-y-2">
              {INFECTION_PREVENTION.tips.map((tip, i) => (
                <div key={i} className="flex items-start gap-2 rounded-xl border border-border/40 bg-background p-3">
                  <span className="text-base shrink-0">{tip.emoji}</span>
                  <p className="text-sm text-foreground/90 leading-relaxed">{tip.text}</p>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* ─── Medical Disclaimer ──────────────────────────────────────── */}
        <ScrollReveal delay={420}>
          <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4">
            <p className="text-xs text-blue-800 flex items-start gap-2">
              <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                <strong>Disclaimer:</strong> This guide provides general care tips for premature babies. It is NOT a substitute for medical advice. Always consult your doctor or NICU team for your baby's specific needs.
              </span>
            </p>
          </div>
        </ScrollReveal>
      </div>

      <SafetyDisclaimer />
    </main>
  );
}
