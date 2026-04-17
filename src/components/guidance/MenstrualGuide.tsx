import React, { useState, useMemo } from "react";
import SafetyDisclaimer from "@/components/SafetyDisclaimer";
import ScrollReveal from "@/components/ScrollReveal";
import { useProfile } from "@/hooks/useProfile";
import { useHealthLog, calcFertileWindow, calcAverageCycleLength } from "@/hooks/useHealthLog";
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

// ─── Constants & Data ────────────────────────────────────────────────────────

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
function getCyclePhase(lastPeriodISO: string, cycleLen: number) {
  if (!lastPeriodISO) return null;
  const lp = new Date(lastPeriodISO + "T12:00:00");
  if (isNaN(lp.getTime())) return null;

  const today = new Date();
  today.setHours(12, 0, 0, 0);

  // Calculate days into current cycle
  let dayDiff = daysBetween(lp, today);
  // Wrap into current cycle
  if (dayDiff < 0) return null;
  const dayInCycle = (dayDiff % cycleLen) + 1;

  const ovulationDay = cycleLen - 14;
  const fertileStart = Math.max(1, ovulationDay - 5);
  const fertileEnd = ovulationDay + 1;
  const periodEnd = 5; // approx

  let phase: "menstrual" | "follicular" | "ovulation" | "luteal";
  if (dayInCycle <= periodEnd) phase = "menstrual";
  else if (dayInCycle < fertileStart) phase = "follicular";
  else if (dayInCycle <= fertileEnd) phase = "ovulation";
  else phase = "luteal";

  // Risk level for avoid mode
  let riskLevel: "low" | "medium" | "high" = "low";
  if (dayInCycle >= fertileStart - 2 && dayInCycle <= fertileEnd + 1) riskLevel = "high";
  else if (dayInCycle >= fertileStart - 4 && dayInCycle <= fertileEnd + 3) riskLevel = "medium";

  // Fertility level for conceive mode
  let fertilityLevel: "low" | "building" | "peak" | "declining" = "low";
  if (dayInCycle >= fertileStart && dayInCycle <= fertileEnd) fertilityLevel = "peak";
  else if (dayInCycle >= fertileStart - 3 && dayInCycle < fertileStart) fertilityLevel = "building";
  else if (dayInCycle > fertileEnd && dayInCycle <= fertileEnd + 2) fertilityLevel = "declining";

  return {
    phase,
    dayInCycle,
    cycleLen,
    ovulationDay,
    fertileStart,
    fertileEnd,
    periodEnd,
    riskLevel,
    fertilityLevel,
    nextPeriod: addDays(lp, cycleLen),
    ovulationDate: addDays(lp, ovulationDay - 1),
    fertileWindowStart: addDays(lp, fertileStart - 1),
    fertileWindowEnd: addDays(lp, fertileEnd - 1),
  };
}

// ─── Phase data with dual interpretations ────────────────────────────────────

function buildPhaseCards(cycleLen: number): CyclePhaseInfo[] {
  const ovDay = cycleLen - 14;
  const fs = Math.max(1, ovDay - 5);
  const fe = ovDay + 1;

  return [
    {
      name: "Menstrual Phase",
      days: `Days 1–5`,
      emoji: "🩸",
      isCurrent: false,
      gradient: "from-rose-500 to-pink-500",
      lightBg: "bg-rose-50",
      textColor: "text-rose-700",
      border: "border-rose-200",
      conceiveNote: "Your body is resetting. Rest and prepare for the coming fertile window.",
      avoidNote: "Low pregnancy risk during this phase. A good time to rest.",
      conceiveAction: "Start tracking basal body temperature. Take folic acid daily.",
      avoidAction: "Low risk period. Continue your regular contraception routine.",
    },
    {
      name: "Follicular Phase",
      days: `Days 6–${fs - 1}`,
      emoji: "🌱",
      isCurrent: false,
      gradient: "from-emerald-500 to-teal-500",
      lightBg: "bg-emerald-50",
      textColor: "text-emerald-700",
      border: "border-emerald-200",
      conceiveNote: "Estrogen is rising. Your body is preparing an egg for release. Energy increases!",
      avoidNote: "Fertility is building. Risk increases as you approach ovulation.",
      conceiveAction: "Prepare for your fertile window. Maintain a healthy diet and reduce stress.",
      avoidAction: "Plan ahead — your high-risk days are approaching within a few days.",
    },
    {
      name: "Fertile / Ovulation",
      days: `Days ${fs}–${fe}`,
      emoji: "🌟",
      isCurrent: false,
      gradient: "from-amber-400 to-orange-500",
      lightBg: "bg-amber-50",
      textColor: "text-amber-700",
      border: "border-amber-200",
      conceiveNote: "Peak fertility! Your egg is released. These are your best days to conceive.",
      avoidNote: "⚠️ Highest pregnancy risk. An egg is released and can be fertilized.",
      conceiveAction: "Best days for intercourse. Every other day maximizes chances.",
      avoidAction: "Use reliable contraception. Avoid unprotected intercourse during this window.",
    },
    {
      name: "Luteal Phase",
      days: `Days ${fe + 1}–${cycleLen}`,
      emoji: "🌙",
      isCurrent: false,
      gradient: "from-purple-500 to-indigo-500",
      lightBg: "bg-purple-50",
      textColor: "text-purple-700",
      border: "border-purple-200",
      conceiveNote: "If fertilized, implantation may occur. Avoid stress and maintain good nutrition.",
      avoidNote: "Risk decreases after the fertile window closes. PMS symptoms may appear.",
      conceiveAction: "Stay calm and positive. Avoid heavy exercise and alcohol.",
      avoidAction: "Lower risk period. Track symptoms for cycle awareness.",
    },
  ];
}

// Do's & Don'ts content
const CONTENT = {
  conceive: {
    dos: [
      { icon: "💊", text: "Take folic acid (400 mcg) daily" },
      { icon: "🥗", text: "Eat iron-rich and nutrient-dense foods" },
      { icon: "🧘", text: "Manage stress through yoga and meditation" },
      { icon: "📊", text: "Track ovulation with basal temperature or tests" },
      { icon: "💪", text: "Maintain a healthy BMI (18.5–25)" },
      { icon: "😴", text: "Get 7-8 hours of quality sleep" },
    ],
    donts: [
      { icon: "🚬", text: "Avoid smoking and tobacco" },
      { icon: "🍷", text: "Limit or avoid alcohol completely" },
      { icon: "☕", text: "Reduce caffeine to under 200mg/day" },
      { icon: "😰", text: "Avoid excessive physical or emotional stress" },
      { icon: "💊", text: "Don't self-medicate — check all drugs with doctor" },
    ],
    tips: [
      { emoji: "🎯", text: "Your chances are highest 1-2 days before ovulation", highlight: true },
      { emoji: "📅", text: "Regular cycles improve prediction accuracy — keep tracking", highlight: false },
      { emoji: "🤝", text: "Both partners should optimize health for best outcomes", highlight: false },
      { emoji: "⏰", text: "Consult a doctor if you haven't conceived after 12 months of trying", highlight: true },
      { emoji: "🌡️", text: "A slight temperature rise confirms ovulation has occurred", highlight: false },
    ],
  },
  avoid: {
    dos: [
      { icon: "🛡️", text: "Use reliable contraception during fertile days" },
      { icon: "📅", text: "Track your cycle regularly for awareness" },
      { icon: "👩‍⚕️", text: "Discuss contraception options with a doctor" },
      { icon: "📋", text: "Know about emergency contraception as a backup" },
      { icon: "🏥", text: "Visit ASHA workers for free government family planning" },
      { icon: "💬", text: "Communicate openly with your partner about choices" },
    ],
    donts: [
      { icon: "⚠️", text: "Don't rely solely on irregular cycle predictions" },
      { icon: "🚫", text: "Don't ignore the ovulation window — it's high risk" },
      { icon: "❌", text: "Don't skip contraception on 'probably safe' days" },
      { icon: "🤔", text: "Don't forget: withdrawal method is unreliable" },
      { icon: "📵", text: "Don't depend on apps alone — they are estimates" },
    ],
    tips: [
      { emoji: "🔴", text: "High risk of pregnancy during ovulation — take precautions", highlight: true },
      { emoji: "📊", text: "Cycle irregularity reduces prediction accuracy — track carefully", highlight: true },
      { emoji: "💡", text: "Dual protection (condom + hormonal) is the most effective", highlight: false },
      { emoji: "🏥", text: "IUDs and implants are 99%+ effective long-term options", highlight: false },
      { emoji: "📞", text: "ASHA workers can help access free contraception services", highlight: false },
    ],
  },
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function GoalToggle({ goal, onChange }: { goal: GoalMode; onChange: (g: GoalMode) => void }) {
  return (
    <div className="flex gap-3 w-full max-w-xl">
      <button
        onClick={() => onChange("conceive")}
        className={`flex-1 group relative rounded-2xl border-2 p-4 transition-all duration-300 ${
          goal === "conceive"
            ? "border-emerald-400 bg-emerald-50 shadow-lg shadow-emerald-100"
            : "border-slate-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/30"
        }`}
      >
        {goal === "conceive" && (
          <span className="absolute top-2.5 right-2.5 w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
        )}
        <div className="flex flex-col items-center gap-2">
          <span className="text-2xl">🤱</span>
          <span className={`text-sm font-bold ${goal === "conceive" ? "text-emerald-800" : "text-slate-600"}`}>
            Trying to Conceive
          </span>
        </div>
      </button>
      <button
        onClick={() => onChange("avoid")}
        className={`flex-1 group relative rounded-2xl border-2 p-4 transition-all duration-300 ${
          goal === "avoid"
            ? "border-amber-400 bg-amber-50 shadow-lg shadow-amber-100"
            : "border-slate-200 bg-white hover:border-amber-200 hover:bg-amber-50/30"
        }`}
      >
        {goal === "avoid" && (
          <span className="absolute top-2.5 right-2.5 w-3 h-3 rounded-full bg-amber-400 animate-pulse" />
        )}
        <div className="flex flex-col items-center gap-2">
          <span className="text-2xl">🛡️</span>
          <span className={`text-sm font-bold ${goal === "avoid" ? "text-amber-800" : "text-slate-600"}`}>
            Avoid Pregnancy
          </span>
        </div>
      </button>
    </div>
  );
}

function PhaseCard({
  phase,
  goal,
  isCurrent,
}: {
  phase: CyclePhaseInfo;
  goal: GoalMode;
  isCurrent: boolean;
}) {
  const [open, setOpen] = useState(isCurrent);
  const note = goal === "conceive" ? phase.conceiveNote : phase.avoidNote;
  const action = goal === "conceive" ? phase.conceiveAction : phase.avoidAction;

  return (
    <div
      className={`overflow-hidden rounded-2xl border-2 transition-all duration-300 ${
        isCurrent
          ? `${phase.border} shadow-md ring-2 ring-offset-2 ${goal === "conceive" ? "ring-emerald-200" : "ring-amber-200"}`
          : open
          ? phase.border
          : "border-transparent bg-white shadow-sm hover:shadow-md"
      }`}
    >
      <button
        onClick={() => setOpen(!open)}
        className={`w-full text-left p-4 flex items-center justify-between ${open ? phase.lightBg : ""}`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl bg-gradient-to-br ${phase.gradient} text-white shadow-inner`}
          >
            {phase.emoji}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className={`text-base font-bold ${open ? phase.textColor : "text-slate-900"}`}>
                {phase.name}
              </h3>
              {isCurrent && (
                <span
                  className={`text-[9px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full ${
                    goal === "conceive"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  You are here
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium">{phase.days}</p>
          </div>
        </div>
        <div
          className={`p-1.5 rounded-full transition-colors ${
            open ? `${phase.textColor} bg-white/60` : "bg-slate-100 text-slate-400"
          }`}
        >
          <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
        </div>
      </button>

      <div
        className={`grid transition-all duration-300 ease-in-out ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className={`p-5 pt-1 ${phase.lightBg} space-y-4`}>
            <div className="bg-white/70 rounded-xl p-4 border border-white/80 shadow-sm">
              <p className="text-sm font-medium text-slate-700 leading-relaxed">{note}</p>
            </div>
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

  const handleGoalChange = (g: GoalMode) => {
    setGoal(g);
    writeGoal(g);
  };

  const isConceive = goal === "conceive";

  // Derive cycle data from profile and logs
  const cycleLen = profile.cycleLength ?? 28;
  const lastPeriodDate = useMemo(() => {
    // Try to find last period from health logs first (most recent periodStarted entry)
    // IMPORTANT: Exclude future auto-marked predictions and only consider dates up to today
    const todayISO = new Date().toISOString().slice(0, 10);
    const starts = Object.entries(logs)
      .filter(([date, e]) => {
        // Skip future dates
        if (date > todayISO) return false;
        // Skip auto-marked prediction entries (only use manual period starts)
        if ((e as any)._periodAutoMarked) return false;
        // Accept period starts from puberty or family-planning
        if (e.phase === "puberty" && (e as any).periodStarted === true) return true;
        if (e.phase === "family-planning" && (e as any).periodStarted === true) return true;
        return false;
      })
      .map(([d]) => d)
      .sort()
      .reverse();
    if (starts.length > 0) return starts[0];
    // Fallback to profile
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

  const content = CONTENT[goal];

  return (
    <main className="min-h-screen bg-[#fafafa]">
      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-white border-b border-border/50">
        <div
          className={`absolute top-0 right-0 w-72 h-72 rounded-full blur-[100px] -mr-36 -mt-36 opacity-40 transition-colors duration-700 ${
            isConceive ? "bg-emerald-200" : "bg-amber-200"
          }`}
        />
        <div
          className={`absolute bottom-0 left-0 w-72 h-72 rounded-full blur-[100px] -ml-36 -mb-36 opacity-40 transition-colors duration-700 ${
            isConceive ? "bg-teal-200" : "bg-rose-200"
          }`}
        />

        <div className="container relative py-10 md:py-14">
          <ScrollReveal>
            <div className="max-w-2xl mb-8">
              <span
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-5 border transition-colors duration-300 ${
                  isConceive
                    ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                    : "bg-amber-50 text-amber-600 border-amber-100"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Personalized Guide
              </span>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 mb-3">
                Your Cycle, Your Goals
              </h1>
              <p className="text-base text-slate-600 leading-relaxed font-medium">
                Smart guidance tailored to your menstrual cycle and reproductive goals.
                Select your intent below to see personalized insights.
              </p>
            </div>

            {/* Goal Toggle */}
            <GoalToggle goal={goal} onChange={handleGoalChange} />
          </ScrollReveal>
        </div>
      </div>

      <div className="container py-10 space-y-12">
        {/* ── CYCLE STATUS HERO ────────────────────────────────────────────── */}
        <ScrollReveal>
          {hasData ? (
            <div
              className={`rounded-3xl p-6 md:p-8 border-2 transition-all duration-500 ${
                isConceive
                  ? "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200"
                  : cycleInfo!.riskLevel === "high"
                  ? "bg-gradient-to-br from-red-50 to-orange-50 border-red-200"
                  : cycleInfo!.riskLevel === "medium"
                  ? "bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200"
                  : "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200"
              }`}
            >
              <div className="flex items-start gap-4 flex-wrap">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm border ${
                    isConceive ? "bg-emerald-100 border-emerald-200" : "bg-white border-slate-200"
                  }`}
                >
                  {isConceive ? "🌟" : cycleInfo!.riskLevel === "high" ? "🔴" : cycleInfo!.riskLevel === "medium" ? "🟡" : "🟢"}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold text-slate-900 mb-1">
                    {isConceive
                      ? cycleInfo!.fertilityLevel === "peak"
                        ? "You're in your fertile window!"
                        : cycleInfo!.fertilityLevel === "building"
                        ? "Fertility is building up"
                        : "Preparing for your fertile phase"
                      : cycleInfo!.riskLevel === "high"
                      ? "High fertility — elevated pregnancy risk"
                      : cycleInfo!.riskLevel === "medium"
                      ? "Moderate risk — approaching fertile window"
                      : "Low pregnancy risk right now"}
                  </h2>
                  <p className="text-sm text-slate-600 font-medium">
                    Day {cycleInfo!.dayInCycle} of {cycleInfo!.cycleLen} • {
                      phaseCards.find((p) => p.isCurrent)?.name ?? "Unknown Phase"
                    }
                  </p>
                </div>
              </div>

              {/* Key dates */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
                {[
                  {
                    label: isConceive ? "Fertile Window" : "High Risk Days",
                    value: `${fmtDate(cycleInfo!.fertileWindowStart)} – ${fmtDate(cycleInfo!.fertileWindowEnd)}`,
                    icon: isConceive ? <Heart className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />,
                    color: isConceive ? "text-emerald-600 bg-emerald-100" : "text-red-600 bg-red-100",
                  },
                  {
                    label: isConceive ? "Peak Fertility" : "Highest Risk",
                    value: fmtDate(cycleInfo!.ovulationDate),
                    icon: isConceive ? <TrendingUp className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />,
                    color: isConceive ? "text-emerald-600 bg-emerald-100" : "text-orange-600 bg-orange-100",
                  },
                  {
                    label: "Next Period",
                    value: fmtDate(cycleInfo!.nextPeriod),
                    icon: <CalendarDays className="w-4 h-4" />,
                    color: "text-pink-600 bg-pink-100",
                  },
                  {
                    label: isConceive ? "Risk Level" : "Safety Level",
                    value: isConceive
                      ? cycleInfo!.fertilityLevel === "peak"
                        ? "Peak"
                        : cycleInfo!.fertilityLevel === "building"
                        ? "Building"
                        : "Low"
                      : cycleInfo!.riskLevel === "high"
                      ? "High Risk"
                      : cycleInfo!.riskLevel === "medium"
                      ? "Medium"
                      : "Low Risk",
                    icon: isConceive ? <Baby className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />,
                    color: isConceive
                      ? cycleInfo!.fertilityLevel === "peak"
                        ? "text-emerald-600 bg-emerald-100"
                        : "text-slate-600 bg-slate-100"
                      : cycleInfo!.riskLevel === "high"
                      ? "text-red-600 bg-red-100"
                      : cycleInfo!.riskLevel === "medium"
                      ? "text-amber-600 bg-amber-100"
                      : "text-green-600 bg-green-100",
                  },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className="bg-white/80 rounded-2xl p-4 border border-black/[0.04] shadow-sm"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${stat.color}`}>
                      {stat.icon}
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{stat.label}</p>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-3xl bg-white p-8 border border-slate-200 text-center">
              <div className="w-16 h-16 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center text-3xl mb-4">
                📅
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">No Cycle Data Yet</h2>
              <p className="text-sm text-slate-500 font-medium max-w-md mx-auto">
                Log your period start date in the Calendar to see personalized cycle insights and predictions here.
              </p>
            </div>
          )}
        </ScrollReveal>

        {/* ── CYCLE PHASES ─────────────────────────────────────────────────── */}
        <section>
          <ScrollReveal>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
                <Flower2 className={`w-5 h-5 ${isConceive ? "text-emerald-500" : "text-amber-500"}`} />
                Cycle Phase Insights
              </h2>
              <p className="text-sm text-slate-500 mt-1 font-medium">
                {isConceive
                  ? "Understand each phase to optimize your chances of conceiving."
                  : "Know your risk level in each phase to stay protected."}
              </p>
            </div>

            {/* Visual Phase Flow */}
            <div className="flex flex-wrap items-center gap-2 mb-6 bg-white p-3 rounded-2xl border border-black/5 shadow-sm">
              {phaseCards.map((p, i) => (
                <React.Fragment key={p.name}>
                  <div
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border shrink-0 transition-all ${
                      p.isCurrent
                        ? `${p.lightBg} ${p.textColor} ${p.border} ring-2 ring-offset-1 ${isConceive ? "ring-emerald-200" : "ring-amber-200"}`
                        : `${p.lightBg} ${p.textColor} ${p.border} opacity-60`
                    }`}
                  >
                    <span className="text-base leading-none">{p.emoji}</span>
                    {p.name.split(" ")[0]}
                  </div>
                  {i < phaseCards.length - 1 && <span className="text-slate-300 font-bold shrink-0">→</span>}
                </React.Fragment>
              ))}
            </div>

            <div className="space-y-3">
              {phaseCards.map((phase) => (
                <PhaseCard key={phase.name} phase={phase} goal={goal} isCurrent={phase.isCurrent} />
              ))}
            </div>
          </ScrollReveal>
        </section>

        {/* ── DAILY GUIDANCE ───────────────────────────────────────────────── */}
        {hasData && (
          <section>
            <ScrollReveal>
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2.5">
                <Activity className={`w-5 h-5 ${isConceive ? "text-emerald-500" : "text-amber-500"}`} />
                Today's Guidance
              </h2>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  {
                    title: isConceive ? "Conception Tips" : "Protection Tips",
                    icon: isConceive ? "🎯" : "🛡️",
                    bg: isConceive ? "bg-emerald-50" : "bg-amber-50",
                    color: isConceive ? "text-emerald-700" : "text-amber-700",
                    items: isConceive
                      ? cycleInfo!.fertilityLevel === "peak"
                        ? ["Optimal time for intercourse", "Every other day maximizes chances", "Stay relaxed and positive"]
                        : cycleInfo!.fertilityLevel === "building"
                        ? ["Fertile window approaching soon", "Maintain intimacy schedule", "Focus on nutrition and rest"]
                        : ["Use this time to prepare", "Track symptoms daily", "Maintain a healthy routine"]
                      : cycleInfo!.riskLevel === "high"
                      ? ["Use contraception — high risk", "Avoid unprotected intercourse", "Consider dual protection"]
                      : cycleInfo!.riskLevel === "medium"
                      ? ["Stay cautious — risk rising", "Keep contraception available", "Monitor discharge changes"]
                      : ["Lower risk period", "Continue regular protection", "Track cycle for accuracy"],
                  },
                  {
                    title: "Nutrition Today",
                    icon: "🥗",
                    bg: "bg-green-50",
                    color: "text-green-700",
                    items:
                      cycleInfo!.phase === "menstrual"
                        ? ["Iron-rich: spinach, lentils, dates", "Warm herbal teas for comfort", "Small frequent meals"]
                        : cycleInfo!.phase === "follicular"
                        ? ["Protein-rich foods for energy", "Fresh fruits and vegetables", "Whole grains and nuts"]
                        : cycleInfo!.phase === "ovulation"
                        ? ["Zinc: pumpkin seeds, chickpeas", "Anti-inflammatory: turmeric, ginger", "Stay well hydrated"]
                        : ["Magnesium: dark chocolate, bananas", "Reduce salt for less bloating", "Comfort foods in moderation"],
                  },
                  {
                    title: "Activity & Rest",
                    icon: "🧘",
                    bg: "bg-blue-50",
                    color: "text-blue-700",
                    items:
                      cycleInfo!.phase === "menstrual"
                        ? ["Light stretching and yoga", "Warm compress for cramps", "8+ hours of sleep"]
                        : cycleInfo!.phase === "follicular"
                        ? ["High-energy workouts ideal", "Try outdoor activities", "Build exercise routine"]
                        : cycleInfo!.phase === "ovulation"
                        ? ["Peak energy — ideal for cardio", "Group activities and sports", "Mindfulness for balance"]
                        : ["Moderate exercise preferred", "Gentle yoga and stretching", "Prioritize good sleep"],
                  },
                ].map((group, i) => (
                  <div key={i} className={`${group.bg} rounded-2xl p-5 border border-black/[0.04]`}>
                    <div className="flex items-center gap-2.5 mb-4">
                      <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center text-lg shadow-sm">
                        {group.icon}
                      </div>
                      <h3 className={`font-bold text-sm ${group.color}`}>{group.title}</h3>
                    </div>
                    <ul className="space-y-2.5">
                      {group.items.map((item, ii) => (
                        <li key={ii} className="flex items-start gap-2 text-sm font-medium opacity-80">
                          <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${group.color}`} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </section>
        )}

        {/* ── DO'S & DON'TS ────────────────────────────────────────────────── */}
        <section>
          <ScrollReveal>
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2.5">
              <Zap className={`w-5 h-5 ${isConceive ? "text-emerald-500" : "text-amber-500"}`} />
              Do's & Don'ts
            </h2>
            <div className="grid md:grid-cols-2 gap-5">
              {/* Do's */}
              <div
                className={`rounded-2xl p-5 border ${
                  isConceive ? "bg-emerald-50 border-emerald-100" : "bg-green-50 border-green-100"
                }`}
              >
                <h3
                  className={`font-bold text-base mb-4 flex items-center gap-2 ${
                    isConceive ? "text-emerald-800" : "text-green-800"
                  }`}
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Do's
                </h3>
                <ul className="space-y-2.5">
                  {content.dos.map((d, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 bg-white/70 p-3 rounded-xl border border-white/80 shadow-sm"
                    >
                      <span className="text-lg shrink-0">{d.icon}</span>
                      <span className="text-sm font-medium text-slate-700">{d.text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Don'ts */}
              <div className="rounded-2xl p-5 border bg-rose-50 border-rose-100">
                <h3 className="font-bold text-base mb-4 flex items-center gap-2 text-rose-800">
                  <Ban className="w-5 h-5" />
                  Don'ts
                </h3>
                <ul className="space-y-2.5">
                  {content.donts.map((d, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 bg-white/70 p-3 rounded-xl border border-rose-100 shadow-sm"
                    >
                      <span className="text-lg shrink-0">{d.icon}</span>
                      <span className="text-sm font-medium text-slate-700">{d.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* ── SMART TIPS / ALERTS ──────────────────────────────────────────── */}
        <section>
          <ScrollReveal>
            <div
              className={`rounded-3xl p-6 md:p-8 border transition-colors duration-500 ${
                isConceive
                  ? "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100"
                  : "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100"
              }`}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  <Lightbulb className={`w-5 h-5 ${isConceive ? "text-emerald-500" : "text-amber-500"}`} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {isConceive ? "Smart Tips" : "Smart Alerts"}
                  </h2>
                  <p className={`text-xs font-medium ${isConceive ? "text-emerald-600" : "text-amber-600"}`}>
                    {isConceive ? "Boost your chances with these insights" : "Stay informed and protected"}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {content.tips.map((tip, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-3 p-4 rounded-xl border shadow-sm ${
                      tip.highlight
                        ? isConceive
                          ? "bg-emerald-100/50 border-emerald-200"
                          : "bg-amber-100/50 border-amber-200"
                        : "bg-white/80 border-white/80"
                    }`}
                  >
                    <span className="text-xl shrink-0">{tip.emoji}</span>
                    <p
                      className={`text-sm font-medium ${
                        tip.highlight
                          ? isConceive
                            ? "text-emerald-900"
                            : "text-amber-900"
                          : "text-slate-700"
                      }`}
                    >
                      {tip.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </section>
      </div>
      <SafetyDisclaimer />
    </main>
  );
}
