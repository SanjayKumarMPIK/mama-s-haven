import React, { useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import SafetyDisclaimer from "@/components/SafetyDisclaimer";
import ScrollReveal from "@/components/ScrollReveal";
import { useProfile } from "@/hooks/useProfile";
import { usePhase } from "@/hooks/usePhase";
import { useHealthLog, calcFertileWindow, calcAverageCycleLength } from "@/hooks/useHealthLog";
import {
  computeWellnessScore,
  generatePriorityActions,
  computeBodySignals,
  generateSmartPredictions,
  getCompletedActions,
  toggleActionComplete,
} from "@/lib/wellnessCommandEngine";
import type { BodySignal } from "@/lib/wellnessCommandEngine";
import {
  AlertTriangle,
  Heart,
  Sparkles,
  CheckCircle2,
  CalendarDays,
  ShieldAlert,
  ShieldCheck,
  Baby,
  Droplets,
  Zap,
  Moon,
  Sun,
  TrendingUp,
  Clock,
  Flower2,
  Lightbulb,
  ChevronDown,
  Activity,
  Ban,
  TrendingDown,
  Minus,
  Calendar,
  MapPin,
  Apple,
  CheckCircle2 as Check,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type GoalMode = "conceive" | "avoid";

interface CyclePhaseInfo {
  name: string;
  days: string;
  emoji: string;
  isCurrent: boolean;
  gradient: string;
  lightBg: string;
  textColor: string;
  border: string;
  conceiveNote: string;
  avoidNote: string;
  conceiveAction: string;
  avoidAction: string;
}

// ─── Constants & Data ──────────────────────────────────────────────────────────

const GOAL_KEY = "ss-menstrual-guide-goal";

function readGoal(): GoalMode {
  try {
    const v = localStorage.getItem(GOAL_KEY);
    if (v === "conceive" || v === "avoid") return v;
  } catch {}
  return "conceive";
}

function writeGoal(g: GoalMode) {
  try { localStorage.setItem(GOAL_KEY, g); } catch {}
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function fmtDateLong(d: Date): string {
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Determine which cycle phase the user is in, given their last period date and cycle length.
 */
function getCyclePhase(lastPeriod: string, cycleLen: number) {
  if (!lastPeriod) return null;
  const start = new Date(lastPeriod + "T12:00:00");
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  const diffDays = daysBetween(start, today);
  const dayInCycle = (diffDays % cycleLen) + 1;

  // NHM Standard: 28-day model relative windows
  // Menstrual: 1-5, Follicular: 6-12, Ovulation: 13-15, Luteal: 16-28
  let phase: "menstrual" | "follicular" | "ovulation" | "luteal" = "menstrual";
  if (dayInCycle >= 16) phase = "luteal";
  else if (dayInCycle >= 13) phase = "ovulation";
  else if (dayInCycle >= 6) phase = "follicular";

  // Fertility/Risk level
  let fertilityLevel: "low" | "building" | "peak" = "low";
  let riskLevel: "low" | "medium" | "high" = "low";

  if (dayInCycle >= 11 && dayInCycle <= 16) {
    fertilityLevel = dayInCycle >= 13 && dayInCycle <= 15 ? "peak" : "building";
    riskLevel = dayInCycle >= 13 && dayInCycle <= 15 ? "high" : "medium";
  }

  // Key Dates
  const ovulationDate = addDays(start, 13); // Approx day 14
  const nextPeriod = addDays(start, cycleLen);
  const fertileWindowStart = addDays(start, 9);  // Day 10
  const fertileWindowEnd = addDays(start, 16);    // Day 17

  return {
    dayInCycle,
    cycleLen,
    phase,
    fertilityLevel,
    riskLevel,
    ovulationDate,
    nextPeriod,
    fertileWindowStart,
    fertileWindowEnd,
  };
}

function buildPhaseCards(cycleLen: number): CyclePhaseInfo[] {
  return [
    {
      name: "Menstrual Phase",
      days: "Days 1–5",
      emoji: "🩸",
      isCurrent: false,
      gradient: "from-pink-100 to-rose-100",
      lightBg: "bg-rose-50/50",
      textColor: "text-rose-700",
      border: "border-rose-200/60",
      conceiveNote: "Cycle reset. Focus on iron-rich foods and rest.",
      avoidNote: "Lowest risk of pregnancy, but not zero.",
      conceiveAction: "Track period start accurately.",
      avoidAction: "Safe but remain cautious if cycle is irregular.",
    },
    {
      name: "Follicular Phase",
      days: "Days 6–12",
      emoji: "🌱",
      isCurrent: false,
      gradient: "from-emerald-50 to-teal-100",
      lightBg: "bg-emerald-50/50",
      textColor: "text-emerald-700",
      border: "border-emerald-200/60",
      conceiveNote: "Energy rising. Body is preparing for ovulation.",
      avoidNote: "Risk is building as you approach fertile window.",
      conceiveAction: "Start tracking mood and energy signals.",
      avoidAction: "Begin taking precautions as risk increases.",
    },
    {
      name: "Ovulation Phase",
      days: "Days 13–15",
      emoji: "🌟",
      isCurrent: false,
      gradient: "from-yellow-50 to-amber-100",
      lightBg: "bg-amber-50/50",
      textColor: "text-amber-700",
      border: "border-amber-200/60",
      conceiveNote: "Peak fertility window. Most likely to conceive.",
      avoidNote: "Highest pregnancy risk. Maximum precaution needed.",
      conceiveAction: "Optimal time for conception attempts.",
      avoidAction: "Avoid intercourse or use dual protection.",
    },
    {
      name: "Luteal Phase",
      days: "Days 16–28",
      emoji: "🍂",
      isCurrent: false,
      gradient: "from-purple-50 to-indigo-100",
      lightBg: "bg-indigo-50/50",
      textColor: "text-indigo-700",
      border: "border-indigo-200/60",
      conceiveNote: "Wait and observe. Implantation may occur.",
      avoidNote: "Risk gradually decreasing after ovulation.",
      conceiveAction: "Maintain healthy habits and reduce stress.",
      avoidAction: "Lower risk but keep using protection.",
    },
  ];
}

// (Static Do's & Don'ts removed — replaced by dynamic Action Center)

// ─── Sub-components ──────────────────────────────────────────────────────────

function GoalToggle({ goal, onChange }: { goal: GoalMode; onChange: (g: GoalMode) => void }) {
  return (
    <div className="flex p-1.5 bg-slate-100/80 backdrop-blur-md rounded-2xl border border-slate-200/60 shadow-inner max-w-md mx-auto">
      <button
        onClick={() => onChange("conceive")}
        className={`flex-1 flex items-center justify-center gap-2.5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
          goal === "conceive"
            ? "bg-white text-emerald-700 shadow-md ring-1 ring-emerald-100 translate-y-[-1px]"
            : "text-slate-500 hover:text-slate-700 hover:bg-white/40"
        }`}
      >
        <Sparkles className={`w-4 h-4 ${goal === "conceive" ? "text-emerald-500" : "text-slate-400"}`} />
        Trying to Conceive
      </button>
      <button
        onClick={() => onChange("avoid")}
        className={`flex-1 flex items-center justify-center gap-2.5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
          goal === "avoid"
            ? "bg-white text-amber-700 shadow-md ring-1 ring-amber-100 translate-y-[-1px]"
            : "text-slate-500 hover:text-slate-700 hover:bg-white/40"
        }`}
      >
        <Ban className={`w-4 h-4 ${goal === "avoid" ? "text-amber-500" : "text-slate-400"}`} />
        Avoid Pregnancy
      </button>
    </div>
  );
}

function PhaseCard({ phase, goal, isCurrent }: { phase: CyclePhaseInfo; goal: GoalMode; isCurrent: boolean }) {
  const [expanded, setExpanded] = useState(isCurrent);
  const isConceive = goal === "conceive";
  const note = isConceive ? phase.conceiveNote : phase.avoidNote;
  const action = isConceive ? phase.conceiveAction : phase.avoidAction;

  return (
    <div className={`group rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
      isCurrent
        ? "border-primary/20 shadow-lg shadow-primary/5"
        : "border-border/40 hover:border-primary/10 hover:shadow-md"
    } bg-white`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 p-5 text-left transition-colors hover:bg-slate-50/50"
      >
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm bg-gradient-to-br ${phase.gradient}`}>
          {phase.emoji}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="text-base font-bold text-slate-900">{phase.name}</h3>
            {isCurrent && (
              <span className="px-2 py-0.5 rounded-full bg-primary text-white text-[9px] font-black uppercase tracking-widest shadow-sm">
                Active
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{phase.days}</p>
        </div>
        <div className={`transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}>
          <ChevronDown className="w-5 h-5 text-slate-400" />
        </div>
      </button>

      <div className={`grid transition-all duration-300 ease-in-out ${expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
        <div className="overflow-hidden">
          <div className="p-5 pt-0 border-t border-slate-50 flex flex-col gap-4">
            <p className="text-sm text-slate-600 leading-relaxed font-medium bg-slate-50/50 p-4 rounded-xl border border-slate-100">
              {note}
            </p>
            <div
              className={`rounded-xl p-4 border ${
                goal === "conceive"
                  ? "bg-emerald-50/60 border-emerald-100"
                  : "bg-amber-50/60 border-amber-100"
              }`}
            >
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                {goal === "conceive" ? "💡 Guidance" : "⚡ Action"}
              </p>
              <p className={`text-sm font-semibold ${goal === "conceive" ? "text-emerald-800" : "text-amber-800"}`}>
                {action}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// Main Component
// ═════════════════════════════════════════════════════════════════════════════

export default function MenstrualGuide() {
  const [goal, setGoal] = useState<GoalMode>(() => readGoal());
  const { profile } = useProfile();
  const { logs } = useHealthLog();
  const { phase } = usePhase();

  // Family-planning-only content (goal toggle, fertility stats, daily guidance, do's/don'ts, smart tips)
  // should only be shown when the user is in the family-planning phase.
  const isFamilyPlanning = phase === "family-planning";

  const handleGoalChange = (g: GoalMode) => {
    setGoal(g);
    writeGoal(g);
  };

  const isConceive = goal === "conceive";

  // Derive cycle data from profile and logs
  const cycleLen = profile.cycleLength ?? 28;
  const lastPeriodDate = useMemo(() => {
    const todayISO = new Date().toISOString().slice(0, 10);
    const starts = Object.entries(logs)
      .filter(([date, e]) => {
        if (date > todayISO) return false;
        if ((e as any)._periodAutoMarked) return false;
        if ((e as any)._irregular) return false;
        const groupId = (e as any)._periodGroupId;
        if (groupId && typeof groupId === "string" && groupId !== `cycle_${date}`) return false;
        if (e.phase === "puberty" && (e as any).periodStarted === true) return true;
        if (e.phase === "family-planning" && (e as any).periodStarted === true) return true;
        return false;
      })
      .map(([d]) => d)
      .sort()
      .reverse();
    if (starts.length > 0) return starts[0];
    return profile.lastPeriodDate || "";
  }, [logs, profile.lastPeriodDate]);

  // Cycle calculations
  const cycleInfo = useMemo(() => getCyclePhase(lastPeriodDate, cycleLen), [lastPeriodDate, cycleLen]);

  const avgCycle = useMemo(() => calcAverageCycleLength(logs), [logs]);

  const fertileWindow = useMemo(() => {
    if (!lastPeriodDate) return null;
    return calcFertileWindow(lastPeriodDate, cycleLen);
  }, [lastPeriodDate, cycleLen]);

  const hasData = !!cycleInfo;

  // Build phase cards with current marker
  const phaseCards = useMemo(() => {
    const cards = buildPhaseCards(cycleLen);
    if (cycleInfo) {
      const phaseMap: Record<string, number> = { menstrual: 0, follicular: 1, ovulation: 2, luteal: 3 };
      const idx = phaseMap[cycleInfo.phase];
      if (idx !== undefined) cards[idx].isCurrent = true;
    }
    return cards;
  }, [cycleLen, cycleInfo]);

  // ── Engine computations ──────────────────────────────────────────────────
  const wellnessScore = useMemo(() => computeWellnessScore(logs, phase), [logs, phase]);
  const priorityActions = useMemo(() => generatePriorityActions(logs, phase, profile?.weight ?? null), [logs, phase, profile]);
  const bodySignals = useMemo(() => computeBodySignals(logs, phase), [logs, phase]);
  const predictions = useMemo(() => generateSmartPredictions(logs, phase), [logs, phase]);

  // Cycle-aware extra actions
  const cycleActions = useMemo(() => {
    if (!isFamilyPlanning || !cycleInfo) return [];
    const extras: { id: string; icon: string; text: string; detail: string; impact: "high" | "medium" }[] = [];
    if (goal === "avoid" && cycleInfo.riskLevel === "high") {
      extras.push({ id: "protect-high", icon: "🛡️", text: "Use protection — high-risk window", detail: "You're in or near your fertile window. Use reliable contraception.", impact: "high" });
    }
    if (goal === "conceive" && cycleInfo.fertilityLevel === "peak") {
      extras.push({ id: "conceive-peak", icon: "🌟", text: "Optimal time for conception", detail: "Peak fertility — every other day maximizes chances.", impact: "high" });
    }
    if (cycleInfo.phase === "menstrual") {
      extras.push({ id: "period-care", icon: "💧", text: "Stay warm and hydrated", detail: "Prioritize iron-rich meals and rest during your period.", impact: "medium" });
    }
    return extras;
  }, [isFamilyPlanning, cycleInfo, goal]);

  const allActions = useMemo(() => [...cycleActions, ...priorityActions].slice(0, 3), [cycleActions, priorityActions]);

  // Action completion
  const [completionStore, setCompletionStore] = useState(() => getCompletedActions());
  const handleToggle = useCallback((id: string) => { setCompletionStore(toggleActionComplete(id)); }, []);

  // Signal helpers
  const trendIcon = (t: string) => {
    if (t === "up") return <TrendingUp className="w-3.5 h-3.5" />;
    if (t === "down") return <TrendingDown className="w-3.5 h-3.5" />;
    return <Minus className="w-3.5 h-3.5" />;
  };
  const signalColor = (s: string) => {
    if (s === "good") return { bg: "bg-emerald-50", text: "text-emerald-600", label: "Optimal" };
    if (s === "moderate") return { bg: "bg-amber-50", text: "text-amber-600", label: "Fair" };
    return { bg: "bg-rose-50", text: "text-rose-600", label: "Needs Care" };
  };
  const predBarColor = (p: number) => p >= 60 ? "bg-rose-500" : p >= 35 ? "bg-amber-400" : "bg-emerald-400";

  return (
    <main className="min-h-screen bg-[#fafafa]">
      {/* ═══ 1. TODAY STATUS ═══════════════════════════════════════════════ */}
      <div className="bg-white border-b border-border/50">
        <div className="container py-6">
          <ScrollReveal>
            {/* Goal Toggle (Family Planning only) */}
            {isFamilyPlanning && (
              <div className="mb-5">
                <GoalToggle goal={goal} onChange={handleGoalChange} />
              </div>
            )}

            {hasData ? (
              <div className={`rounded-2xl p-5 border-2 transition-all ${
                isFamilyPlanning
                  ? isConceive
                    ? "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200"
                    : cycleInfo!.riskLevel === "high"
                    ? "bg-gradient-to-br from-red-50 to-orange-50 border-red-200"
                    : cycleInfo!.riskLevel === "medium"
                    ? "bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200"
                    : "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200"
                  : "bg-gradient-to-br from-teal-50 to-emerald-50 border-teal-200"
              }`}>
                <div className="flex items-start gap-4 flex-wrap">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm border ${
                    isFamilyPlanning
                      ? isConceive ? "bg-emerald-100 border-emerald-200" : "bg-white border-slate-200"
                      : "bg-teal-100 border-teal-200"
                  }`}>
                    {isFamilyPlanning
                      ? isConceive ? "🌟" : cycleInfo!.riskLevel === "high" ? "🔴" : cycleInfo!.riskLevel === "medium" ? "🟡" : "🟢"
                      : "✨"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-xl font-bold text-slate-900 mb-1">
                      {isFamilyPlanning
                        ? isConceive
                          ? cycleInfo!.fertilityLevel === "peak" ? "You're in your fertile window!" : cycleInfo!.fertilityLevel === "building" ? "Fertility is building up" : "Preparing for your fertile phase"
                          : cycleInfo!.riskLevel === "high" ? "High fertility — elevated risk" : cycleInfo!.riskLevel === "medium" ? "Moderate risk — approaching fertile window" : "Low pregnancy risk right now"
                        : "Your Cycle Intelligence"
                      }
                    </h1>
                    <p className="text-sm text-slate-600 font-medium">Day {cycleInfo!.dayInCycle} of {cycleInfo!.cycleLen} • {phaseCards.find(p => p.isCurrent)?.name ?? "Unknown Phase"}</p>
                    <p className="text-xs text-slate-500 mt-1 italic">💡 {wellnessScore.insight}</p>
                  </div>
                </div>
                {/* Key dates */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
                  {[
                    { label: isFamilyPlanning ? (isConceive ? "Fertile Window" : "High Risk Days") : "Fertile Window", value: `${fmtDate(cycleInfo!.fertileWindowStart)} – ${fmtDate(cycleInfo!.fertileWindowEnd)}`, icon: isConceive ? <Heart className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />, color: isConceive ? "text-emerald-600 bg-emerald-100" : "text-red-600 bg-red-100" },
                    { label: isConceive ? "Peak Fertility" : "Highest Risk", value: fmtDate(cycleInfo!.ovulationDate), icon: isConceive ? <TrendingUp className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />, color: isConceive ? "text-emerald-600 bg-emerald-100" : "text-orange-600 bg-orange-100" },
                    { label: "Next Period", value: fmtDate(cycleInfo!.nextPeriod), icon: <CalendarDays className="w-4 h-4" />, color: "text-pink-600 bg-pink-100" },
                    { label: "Wellness", value: `${wellnessScore.score}/100`, icon: <Sparkles className="w-4 h-4" />, color: `text-${wellnessScore.color}-600 bg-${wellnessScore.color}-100` },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white/80 rounded-2xl p-3 border border-black/[0.04] shadow-sm">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center mb-1.5 ${stat.color}`}>{stat.icon}</div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{stat.label}</p>
                      <p className="text-sm font-bold text-slate-900 mt-0.5">{stat.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl bg-white p-8 border border-slate-200 text-center">
                <div className="w-16 h-16 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center text-3xl mb-4">📅</div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">No Cycle Data Yet</h2>
                <p className="text-sm text-slate-500 font-medium max-w-md mx-auto">Log your period start date in the Calendar to see personalized cycle insights.</p>
              </div>
            )}
          </ScrollReveal>
        </div>
      </div>

      <div className="container py-6 space-y-8">
        {/* ═══ 2. ACTION CENTER ══════════════════════════════════════════ */}
        <section>
          <ScrollReveal>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Zap className={`w-5 h-5 ${isFamilyPlanning ? (isConceive ? "text-emerald-500" : "text-amber-500") : "text-teal-500"}`} />
                Today's Actions
              </h2>
              {completionStore.streak > 0 && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                  🔥 {completionStore.streak} day streak
                </span>
              )}
            </div>
            <div className="space-y-3">
              {allActions.map((action) => {
                const done = completionStore.completed.includes(action.id);
                return (
                  <button key={action.id} onClick={() => handleToggle(action.id)} className={`w-full flex items-start gap-4 p-4 rounded-2xl border-2 text-left transition-all active:scale-[0.99] ${
                    done ? "bg-emerald-50 border-emerald-200 opacity-70" : "bg-white border-border/60 hover:border-primary/30 hover:shadow-md"
                  }`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-xl ${done ? "bg-emerald-100" : "bg-slate-100"}`}>
                      {done ? "✅" : action.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold ${done ? "line-through text-slate-400" : "text-slate-800"}`}>{action.text}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{action.detail}</p>
                    </div>
                    {action.impact === "high" && !done && (
                      <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-100 text-rose-600 shrink-0 mt-1">Priority</span>
                    )}
                  </button>
                );
              })}
            </div>
          </ScrollReveal>
        </section>

        {/* ═══ 3. BODY SIGNALS ═══════════════════════════════════════════ */}
        <section>
          <ScrollReveal>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
              <Activity className={`w-5 h-5 ${isFamilyPlanning ? (isConceive ? "text-emerald-500" : "text-amber-500") : "text-teal-500"}`} />
              Body Signals
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {bodySignals.map((sig) => {
                const sc = signalColor(sig.status);
                return (
                  <div key={sig.id} className={`rounded-2xl p-4 border border-border/60 bg-white shadow-sm hover:shadow-md transition-all`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{sig.emoji}</span>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${sc.text}`}>
                        {trendIcon(sig.trend)} {sig.trend === "up" ? "↑" : sig.trend === "down" ? "↓" : "—"}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-700 mb-1">{sig.label}</p>
                    <p className={`text-lg font-black ${sc.text}`}>{sig.value}%</p>
                    <span className={`inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${sc.bg} ${sc.text}`}>{sc.label}</span>
                  </div>
                );
              })}
            </div>
          </ScrollReveal>
        </section>

        {/* ═══ 4. PREDICTION ENGINE ═══════════════════════════════════════ */}
        <section>
          <ScrollReveal>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
              <Sparkles className={`w-5 h-5 ${isFamilyPlanning ? (isConceive ? "text-emerald-500" : "text-amber-500") : "text-teal-500"}`} />
              Smart Predictions
            </h2>
            <div className="space-y-3">
              {predictions.map((pred) => (
                <div key={pred.id} className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-border/60 shadow-sm hover:shadow-md transition-all">
                  <div className="w-11 h-11 rounded-2xl bg-muted/30 flex items-center justify-center shrink-0">
                    <span className="text-xl">{pred.emoji}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <p className="text-sm font-bold text-slate-800">{pred.symptom}</p>
                        {pred.probability > 0 && (
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                            pred.probability >= 60 ? "bg-rose-100 text-rose-700" : pred.probability >= 35 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                          }`}>
                            <Clock className="w-3 h-3" /> Likely {pred.timeframe}
                          </span>
                        )}
                      </div>
                      {pred.probability > 0 && (
                        <span className={`text-sm font-black ${pred.probability >= 60 ? "text-rose-600" : pred.probability >= 35 ? "text-amber-600" : "text-emerald-600"}`}>
                          {pred.probability}%
                        </span>
                      )}
                    </div>
                    {pred.probability > 0 && (
                      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden mb-2">
                        <div className={`h-full rounded-full ${predBarColor(pred.probability)}`} style={{ width: `${pred.probability}%` }} />
                      </div>
                    )}
                    <p className="text-xs text-slate-500 font-medium">{pred.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </section>

        {/* ═══ 5. CYCLE STRATEGY (Phase Cards) ═══════════════════════════ */}
        <section>
          <ScrollReveal>
            <div className="mb-5">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Flower2 className={`w-5 h-5 ${isFamilyPlanning ? (isConceive ? "text-emerald-500" : "text-amber-500") : "text-teal-500"}`} />
                Cycle Phase Insights
              </h2>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                {isFamilyPlanning
                  ? isConceive ? "Understand each phase to optimize your chances." : "Know your risk level in each phase."
                  : "Understand your cycle phases and what to expect."}
              </p>
            </div>
            {/* Phase flow bar */}
            <div className="flex flex-wrap items-center gap-2 mb-5 bg-white p-3 rounded-2xl border border-black/5 shadow-sm">
              {phaseCards.map((p, i) => (
                <React.Fragment key={p.name}>
                  <div className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border shrink-0 transition-all ${
                    p.isCurrent
                      ? `${p.lightBg} ${p.textColor} ${p.border} ring-2 ring-offset-1 ${isConceive ? "ring-emerald-200" : "ring-amber-200"}`
                      : `${p.lightBg} ${p.textColor} ${p.border} opacity-60`
                  }`}>
                    <span className="text-base leading-none">{p.emoji}</span>
                    {p.name.split(" ")[0]}
                  </div>
                  {i < phaseCards.length - 1 && <span className="text-slate-300 font-bold shrink-0">→</span>}
                </React.Fragment>
              ))}
            </div>
            <div className="space-y-3">
              {phaseCards.map((p) => (
                <PhaseCard key={p.name} phase={p} goal={goal} isCurrent={p.isCurrent} />
              ))}
            </div>
          </ScrollReveal>
        </section>

        {/* ═══ 6. QUICK ACTIONS ══════════════════════════════════════════ */}
        <section>
          <ScrollReveal>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-slate-500" />
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { to: "/calendar", label: "Log Symptoms", icon: <Calendar className="w-5 h-5" />, emoji: "📋" },
                { to: "/calendar", label: "Open Calendar", icon: <CalendarDays className="w-5 h-5" />, emoji: "📅" },
                { to: "/phc-nearby", label: "Find PHC", icon: <MapPin className="w-5 h-5" />, emoji: "🏥" },
                { to: "/nutrition", label: "Nutrition Guide", icon: <Apple className="w-5 h-5" />, emoji: "🍎" },
              ].map((btn) => (
                <Link key={btn.label} to={btn.to} className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white border border-border/60 shadow-sm hover:shadow-md hover:border-primary/30 transition-all active:scale-[0.97]">
                  <span className="text-2xl">{btn.emoji}</span>
                  <span className="text-xs font-bold text-slate-700">{btn.label}</span>
                </Link>
              ))}
            </div>
          </ScrollReveal>
        </section>

        {/* ── IRREGULAR PERIOD ANALYTICS ────────────────────────────── */}
        {(() => {
          const isPeriodPhase = phase === "puberty" || phase === "family-planning";
          if (!isPeriodPhase) return null;
          const now = new Date(); now.setHours(12, 0, 0, 0);
          const cutoffMs = now.getTime() - 90 * 24 * 60 * 60 * 1000;
          const irregularEntries = Object.entries(logs)
            .filter(([date, e]) => {
              if (e.phase !== "puberty" && e.phase !== "family-planning") return false;
              if (!(e as any)._irregular) return false;
              const dateMs = new Date(date + "T12:00:00").getTime();
              return dateMs >= cutoffMs && dateMs <= now.getTime();
            }).map(([d]) => d).sort().reverse();
          const count = irregularEntries.length;
          if (count < 3) return null;
          const frequency = count >= 6 ? "Very Frequent" : count >= 3 ? "Frequent" : "Occasional";
          const frequencyColor = count >= 6 ? "text-red-600" : count >= 3 ? "text-orange-600" : "text-amber-600";
          const frequencyBg = count >= 6 ? "bg-red-50 border-red-200" : count >= 3 ? "bg-orange-50 border-orange-200" : "bg-amber-50 border-amber-200";
          return (
            <>
              <section>
                <ScrollReveal>
                  <div className={`rounded-3xl p-6 md:p-8 border-2 ${frequencyBg}`}>
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-14 h-14 rounded-2xl bg-orange-100 border border-orange-200 flex items-center justify-center text-2xl shadow-sm">⚠️</div>
                      <div className="flex-1">
                        <h2 className="text-xl font-bold text-slate-900 mb-1">Irregular Period Patterns Detected</h2>
                        <p className="text-sm text-slate-600 font-medium">{count} irregular entries in the last 90 days</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                      <div className="bg-white/80 rounded-2xl p-4 border border-black/[0.04] shadow-sm">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Count</p>
                        <p className="text-2xl font-bold text-slate-900 mt-0.5">{count}</p>
                      </div>
                      <div className="bg-white/80 rounded-2xl p-4 border border-black/[0.04] shadow-sm">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Frequency</p>
                        <p className={`text-lg font-bold mt-0.5 ${frequencyColor}`}>{frequency}</p>
                      </div>
                      <div className="bg-white/80 rounded-2xl p-4 border border-black/[0.04] shadow-sm col-span-2 md:col-span-1">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Period</p>
                        <p className="text-sm font-bold text-slate-900 mt-0.5">Last 90 days</p>
                      </div>
                    </div>
                    <div className="bg-white/60 rounded-xl p-4 border border-black/[0.04]">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Irregular Dates</p>
                      <div className="flex flex-wrap gap-2">
                        {irregularEntries.slice(0, 10).map((d) => (
                          <span key={d} className="px-2.5 py-1 rounded-lg bg-orange-100 text-orange-800 text-xs font-semibold border border-orange-200">
                            {new Date(d + "T12:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                          </span>
                        ))}
                        {irregularEntries.length > 10 && (
                          <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold">+{irregularEntries.length - 10} more</span>
                        )}
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              </section>
              <section>
                <ScrollReveal>
                  <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2.5">
                    <Heart className="w-5 h-5 text-orange-500" /> Managing Irregular Periods
                  </h2>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-purple-50 rounded-2xl p-5 border border-purple-100">
                      <div className="flex items-center gap-2.5 mb-4"><div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center text-lg shadow-sm">🧘</div><h3 className="font-bold text-sm text-purple-700">Lifestyle Changes</h3></div>
                      <ul className="space-y-2.5">
                        {["Aim for 7–8 hours of consistent sleep","Practice stress-relief: yoga, deep breathing","Exercise moderately — avoid overtraining","Maintain a consistent daily routine"].map((t,i)=>(<li key={i} className="flex items-start gap-2 text-sm font-medium text-purple-800/80"><CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-purple-600" />{t}</li>))}
                      </ul>
                    </div>
                    <div className="bg-green-50 rounded-2xl p-5 border border-green-100">
                      <div className="flex items-center gap-2.5 mb-4"><div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center text-lg shadow-sm">🥗</div><h3 className="font-bold text-sm text-green-700">Nutrition Tips</h3></div>
                      <ul className="space-y-2.5">
                        {["Iron-rich foods: spinach, lentils, dates","Omega-3: flaxseed, walnuts, fish","Whole grains for stable blood sugar","Reduce processed foods and excess sugar"].map((t,i)=>(<li key={i} className="flex items-start gap-2 text-sm font-medium text-green-800/80"><CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-green-600" />{t}</li>))}
                      </ul>
                    </div>
                    <div className="bg-rose-50 rounded-2xl p-5 border border-rose-100">
                      <div className="flex items-center gap-2.5 mb-4"><div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center text-lg shadow-sm">🏥</div><h3 className="font-bold text-sm text-rose-700">When to See a Doctor</h3></div>
                      <ul className="space-y-2.5">
                        {["Periods consistently closer than 21 days","Cycles longer than 35 days regularly","Heavy bleeding or spotting between periods","Irregular periods lasting over 3 months"].map((t,i)=>(<li key={i} className="flex items-start gap-2 text-sm font-medium text-rose-800/80"><AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-600" />{t}</li>))}
                      </ul>
                    </div>
                  </div>
                  <div className="mt-5 rounded-xl bg-amber-50 border border-amber-200 p-4">
                    <p className="text-xs text-amber-800 font-medium leading-relaxed">
                      <strong>Note:</strong> Irregular periods can be caused by stress, weight changes, hormonal fluctuations, or lifestyle factors.
                      This is general wellness guidance — please consult a healthcare professional for persistent irregularity.
                    </p>
                  </div>
                </ScrollReveal>
              </section>
            </>
          );
        })()}
      </div>
      <SafetyDisclaimer />
    </main>
  );
}
